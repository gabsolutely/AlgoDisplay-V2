/**
 * sound-manager.js — Web Audio API synthesizer for step sound effects.
 *
 * No external audio files — everything is generated live with OscillatorNodes.
 * Supports:
 *   • 7 "producer kits" → {waveform, scale, octave} presets.
 *   • 8 musical scales (pentatonic, major, minor, blues, dorian, harmonic_minor, insen, chromatic).
 *   • 4 custom waveforms beyond the standard 4: organ (3 harmonics), marimba (fast-decay sine),
 *     fm_laser (carrier + modulator FM pair), plus standard triangle/sine/square/sawtooth.
 *
 * Volume envelopes always use exponential ramp from 0.0001 (never exactly 0, which throws) to
 * target gain, then back down — this prevents clicks on start/stop.
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled      = true;
    this.musicalMode  = false;
    this.waveform     = 'triangle';
    this.scaleName    = 'pentatonic';
    this.octave       = 'normal';
    this.volume       = 0.6;

    // Frequency multipliers mapped from UI octave selector.
    this.octaves = { low: 0.5, normal: 1.0, high: 1.5, ultra: 2.0 };

    // Preset bundles: waveform + scale + octave selected together.
    this.producerKits = {
      default:   { wave: 'triangle', scale: 'pentatonic',     octave: 'normal' },
      chiptune:  { wave: 'square',   scale: 'pentatonic',     octave: 'high'   },
      lofi:      { wave: 'sine',     scale: 'dorian',         octave: 'normal' },
      marimba:   { wave: 'marimba',  scale: 'major',          octave: 'normal' },
      synthwave: { wave: 'sawtooth', scale: 'blues',          octave: 'low'    },
      scifi:     { wave: 'fm_laser', scale: 'minor',          octave: 'high'   },
      organ:     { wave: 'organ',    scale: 'harmonic_minor', octave: 'normal' },
    };

    // Scale frequencies in Hz (C4 = 261.63 as middle-C reference).
    this.scales = {
      pentatonic:     [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
      major:          [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99],
      minor:          [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25, 587.33, 622.25, 698.46, 783.99],
      blues:          [261.63, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25, 622.25, 698.46, 739.99, 783.99, 932.33],
      dorian:         [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50],
      harmonic_minor: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 493.88, 523.25, 587.33, 622.25, 698.46, 783.99],
      insen:          [261.63, 277.18, 349.23, 392.00, 466.16, 523.25, 554.37, 698.46, 783.99, 932.33],
      chromatic:      [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25],
    };

    this.init();
  }

  /** Construct AudioContext. Called once from ctor. Fails silently if unsupported. */
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("Studio Audio Context Initialized");
    } catch (error) {
      console.error("Audio not supported:", error);
      this.enabled = false;
    }
  }

  // ==== UI setters ====

  setMusicalMode(on) {
    this.musicalMode = on;
    if (on && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();   // Browsers block autoplay until user gesture.
    }
  }

  /** Apply a full kit (waveform + scale + octave). Returns the applied kit. */
  setProducerKit(kitName) {
    const kit = this.producerKits[kitName];
    if (kit) {
      this.waveform  = kit.wave;
      this.scaleName = kit.scale;
      this.octave    = kit.octave;
      return kit;
    }
    return null;
  }

  setScale(name)     { if (this.scales[name])                          this.scaleName = name; }
  setWaveform(wave)  { if (['triangle','sine','square','sawtooth','organ','marimba','fm_laser'].includes(wave)) this.waveform = wave; }
  setOctave(oct)     { if (this.octaves[oct] !== undefined)            this.octave    = oct;  }
  setVolume(vol)     { this.volume = Math.max(0, Math.min(1, parseFloat(vol))); }
  setEnabled(en)     { this.enabled = en; }

  // ==== Internals ====

  _resume()      { if (!this.audioContext) return; if (this.audioContext.state === 'suspended') this.audioContext.resume(); }
  _getOctaveMult(){ return this.octaves[this.octave] || 1.0; }

  // ==== Public playback API ====

  /**
   * Play a discrete step SFX. Compare = high quick blip, swap = low thud,
   * generate = chirp, complete = (if musicalMode) arpeggio fanfare else single tone.
   */
  play(type) {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();

    if (type === 'complete' && this.musicalMode) {
      this.playArpeggio();
      return;
    }

    const baseOct = this._getOctaveMult();
    const sounds = {
      compare:  { freq: 800  * baseOct, duration: 0.08,  wave: this.waveform },
      swap:     { freq: 400  * baseOct, duration: 0.15,  wave: this.waveform },
      complete: { freq: 600  * baseOct, duration: 0.25,  wave: this.waveform },
      generate: { freq: 1000 * baseOct, duration: 0.08,  wave: this.waveform },
      // Softer, shorter blip for graph node visits and grid cell traversal
      visit:    { freq: 500  * baseOct, duration: 0.055, wave: 'sine' },
    };
    const s = sounds[type];
    if (!s) return;
    this.playSound(s.freq, s.duration, s.wave);
  }

  /**
   * "Musical" compare: maps two array values into scale indices by normalized
   * range, then plays them as a dyad (chord of two notes). This is what makes
   * sort algos sound like actual music.
   */
  playMusical(val1, val2, arr) {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();

    const maxVal = Math.max(...arr, 1);
    const minVal = Math.min(...arr, 0);
    const range  = maxVal - minVal || 1;
    const scale  = this.scales[this.scaleName] || this.scales.pentatonic;
    const mult   = this._getOctaveMult();

    const idx1 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val1 - minVal) / range) * (scale.length - 1))));
    const idx2 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val2 - minVal) / range) * (scale.length - 1))));

    this.playChord([scale[idx1] * mult, scale[idx2] * mult], 0.15, this.waveform);
  }

  /** Simultaneous multi-voice note. Used by playMusical and playTestSound. */
  playChord(frequencies, duration, type = 'triangle') {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    try {
      this._resume();
      const now        = this.audioContext.currentTime;
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);

      const targetGain = 0.7 * this.volume;
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      frequencies.forEach(freq => {
        this._createSynthNote(freq, now, duration, type, masterGain);
      });
    } catch (e) { console.error("playChord error:", e); }
  }

  /**
   * Create one oscillator (or oscillator stack) and route it into `destinationNode`.
   * Custom waveforms branch here:
   *   organ     → 3 stacked sines (1×, 2×, 3× fundamental), decreasing gain per harmonic.
   *   marimba   → single sine, fast attack + very short decay (percussive).
   *   fm_laser  → 2-osc FM: modulator (sine) → carrier (sawtooth freq input).
   *   {standard}→ plain OscillatorNode of the given type.
   */
  _createSynthNote(freq, now, duration, type, destinationNode) {
    if (type === 'organ') {
      [1, 2, 3].forEach((harmonic, idx) => {
        const osc   = this.audioContext.createOscillator();
        const hGain = this.audioContext.createGain();
        osc.type  = 'sine';
        osc.frequency.value = freq * harmonic;
        hGain.gain.setValueAtTime(0.0001, now);
        hGain.gain.linearRampToValueAtTime((0.4 / (idx + 1)), now + 0.01);
        hGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(hGain);
        hGain.connect(destinationNode);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      });
    } else if (type === 'marimba') {
      const osc   = this.audioContext.createOscillator();
      const mGain = this.audioContext.createGain();
      osc.type  = 'sine';
      osc.frequency.value = freq;
      mGain.gain.setValueAtTime(0.0001, now);
      mGain.gain.linearRampToValueAtTime(0.8, now + 0.004);
      mGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(duration, 0.14));
      osc.connect(mGain);
      mGain.connect(destinationNode);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } else if (type === 'fm_laser') {
      const carrier    = this.audioContext.createOscillator();
      const modulator  = this.audioContext.createOscillator();
      const modGain    = this.audioContext.createGain();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(freq * 1.3, now);
      carrier.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);

      modulator.type  = 'sine';
      modulator.frequency.value = freq * 0.5;
      modGain.gain.value         = freq * 0.4;

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);     // FM: modGain amplitude modulates carrier's frequency param.
      carrier.connect(destinationNode);

      modulator.start(now);
      carrier.start(now);
      modulator.stop(now + duration + 0.02);
      carrier.stop(now + duration + 0.02);
    } else {
      const osc = this.audioContext.createOscillator();
      osc.type  = ['triangle','sine','square','sawtooth'].includes(type) ? type : 'triangle';
      osc.frequency.value = freq;
      osc.connect(destinationNode);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }
  }

  /** Completion fanfare: 5-note ascending arpeggio (I-III-V-VII-IX-ish). */
  playArpeggio() {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();
    try {
      const now   = this.audioContext.currentTime;
      const scale = this.scales[this.scaleName] || this.scales.pentatonic;
      const mult  = this._getOctaveMult();
      const notes = [
        scale[0] * mult,
        scale[2] * mult,
        scale[4] * mult,
        scale[Math.min(scale.length - 1, 7)] * mult,
        scale[Math.min(scale.length - 1, 9)] * mult
      ];

      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);

      const targetGain = 0.8 * this.volume;
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.01);

      notes.forEach((freq, i) => {
        const noteGain  = this.audioContext.createGain();
        const noteStart = now + i * 0.08;
        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.8 * this.volume, noteStart + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.3);

        this._createSynthNote(freq, noteStart, 0.3, this.waveform, noteGain);
        noteGain.connect(masterGain);
      });
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + notes.length * 0.08 + 0.35);
    } catch (e) { console.error("playArpeggio error:", e); }
  }

  /** Single-tone playback with ADSR-ish envelope. Workhorse for compare/swap/generate. */
  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    try {
      this._resume();
      const now  = this.audioContext.currentTime;
      const gain = this.audioContext.createGain();
      gain.connect(this.audioContext.destination);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.7 * this.volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      this._createSynthNote(frequency, now, duration, type, gain);
    } catch (error) { console.error("playSound error:", error); }
  }

  /** UI "Test" button: tonic triad chord so user can hear current kit + scale. */
  playTestSound() {
    if (!this.enabled) this.enabled = true;
    this._resume();
    const scale = this.scales[this.scaleName] || this.scales.pentatonic;
    const mult  = this._getOctaveMult();
    this.playChord([scale[0] * mult, scale[2] * mult, scale[4] * mult], 0.3, this.waveform);
  }

  /** Kit-selector preview: quick 4-note ascending staccato phrase. */
  playProducerDemo() {
    if (!this.enabled) this.enabled = true;
    this._resume();
    try {
      const now   = this.audioContext.currentTime;
      const scale = this.scales[this.scaleName] || this.scales.pentatonic;
      const mult  = this._getOctaveMult();
      const demoNotes = [scale[0], scale[2], scale[4], scale[Math.min(scale.length - 1, 7)]];

      demoNotes.forEach((freq, idx) => {
        const noteGain = this.audioContext.createGain();
        noteGain.connect(this.audioContext.destination);
        const startTime = now + idx * 0.1;
        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.7 * this.volume, startTime + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);
        this._createSynthNote(freq * mult, startTime, 0.22, this.waveform, noteGain);
      });
    } catch (e) { console.error("playProducerDemo error:", e); }
  }
}
