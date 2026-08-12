// sound-manager.js
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.musicalMode = false;
    this.waveform = 'triangle';
    this.scaleName = 'pentatonic';
    this.octave = 'normal';
    this.volume = 0.6;

    this.octaves = {
      low: 0.5,
      normal: 1.0,
      high: 1.5,
      ultra: 2.0,
    };

    this.producerKits = {
      default:   { wave: 'triangle', scale: 'pentatonic', octave: 'normal' },
      chiptune:  { wave: 'square',   scale: 'pentatonic', octave: 'high' },
      lofi:      { wave: 'sine',     scale: 'dorian',     octave: 'normal' },
      marimba:   { wave: 'marimba',  scale: 'major',      octave: 'normal' },
      synthwave: { wave: 'sawtooth', scale: 'blues',      octave: 'low' },
      scifi:     { wave: 'fm_laser', scale: 'minor',      octave: 'high' },
      organ:     { wave: 'organ',    scale: 'harmonic_minor', octave: 'normal' },
    };

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

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("Studio Audio Context Initialized");
    } catch (error) {
      console.error("Audio not supported:", error);
      this.enabled = false;
    }
  }

  setMusicalMode(on) {
    this.musicalMode = on;
    if (on && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setProducerKit(kitName) {
    const kit = this.producerKits[kitName];
    if (kit) {
      this.waveform = kit.wave;
      this.scaleName = kit.scale;
      this.octave = kit.octave;
      return kit;
    }
    return null;
  }

  setScale(name) {
    if (this.scales[name]) this.scaleName = name;
  }

  setWaveform(wave) {
    const allowed = ['triangle', 'sine', 'square', 'sawtooth', 'organ', 'marimba', 'fm_laser'];
    if (allowed.includes(wave)) this.waveform = wave;
  }

  setOctave(oct) {
    if (this.octaves[oct] !== undefined) this.octave = oct;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, parseFloat(vol)));
  }

  _resume() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
  }

  _getOctaveMult() {
    return this.octaves[this.octave] || 1.0;
  }

  play(type) {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();

    if (type === 'complete' && this.musicalMode) {
      this.playArpeggio();
      return;
    }

    const baseOct = this._getOctaveMult();
    const sounds = {
      compare:  { freq: 800 * baseOct, duration: 0.08, wave: this.waveform },
      swap:     { freq: 400 * baseOct, duration: 0.15, wave: this.waveform },
      complete: { freq: 600 * baseOct, duration: 0.25, wave: this.waveform },
      generate: { freq: 1000 * baseOct, duration: 0.08, wave: this.waveform },
    };
    const s = sounds[type];
    if (!s) return;
    this.playSound(s.freq, s.duration, s.wave);
  }

  playMusical(val1, val2, arr) {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();

    const maxVal = Math.max(...arr, 1);
    const minVal = Math.min(...arr, 0);
    const range = maxVal - minVal || 1;
    const scale = this.scales[this.scaleName] || this.scales.pentatonic;
    const mult = this._getOctaveMult();

    const idx1 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val1 - minVal) / range) * (scale.length - 1))));
    const idx2 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val2 - minVal) / range) * (scale.length - 1))));
    
    this.playChord([scale[idx1] * mult, scale[idx2] * mult], 0.15, this.waveform);
  }

  playChord(frequencies, duration, type = 'triangle') {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    try {
      this._resume();
      const now = this.audioContext.currentTime;
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);
      
      const targetGain = 0.7 * this.volume;
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      frequencies.forEach(freq => {
        this._createSynthNote(freq, now, duration, type, masterGain);
      });
    } catch (e) {
      console.error("playChord error:", e);
    }
  }

  _createSynthNote(freq, now, duration, type, destinationNode) {
    if (type === 'organ') {
      [1, 2, 3].forEach((harmonic, idx) => {
        const osc = this.audioContext.createOscillator();
        const hGain = this.audioContext.createGain();
        osc.type = 'sine';
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
      const osc = this.audioContext.createOscillator();
      const mGain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      mGain.gain.setValueAtTime(0.0001, now);
      mGain.gain.linearRampToValueAtTime(0.8, now + 0.004);
      mGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(duration, 0.14));
      osc.connect(mGain);
      mGain.connect(destinationNode);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } else if (type === 'fm_laser') {
      const carrier = this.audioContext.createOscillator();
      const modulator = this.audioContext.createOscillator();
      const modGain = this.audioContext.createGain();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(freq * 1.3, now);
      carrier.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);

      modulator.type = 'sine';
      modulator.frequency.value = freq * 0.5;
      modGain.gain.value = freq * 0.4;

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(destinationNode);

      modulator.start(now);
      carrier.start(now);
      modulator.stop(now + duration + 0.02);
      carrier.stop(now + duration + 0.02);
    } else {
      const osc = this.audioContext.createOscillator();
      const allowedStd = ['triangle', 'sine', 'square', 'sawtooth'];
      osc.type = allowedStd.includes(type) ? type : 'triangle';
      osc.frequency.value = freq;
      osc.connect(destinationNode);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }
  }

  playArpeggio() {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    this._resume();
    try {
      const now = this.audioContext.currentTime;
      const scale = this.scales[this.scaleName] || this.scales.pentatonic;
      const mult = this._getOctaveMult();
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
        const noteGain = this.audioContext.createGain();
        const noteStart = now + i * 0.08;
        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.8 * this.volume, noteStart + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.3);
        
        this._createSynthNote(freq, noteStart, 0.3, this.waveform, noteGain);
        noteGain.connect(masterGain);
      });
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + notes.length * 0.08 + 0.35);
    } catch (e) {
      console.error("playArpeggio error:", e);
    }
  }

  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext || this.volume <= 0) return;
    try {
      this._resume();
      const now = this.audioContext.currentTime;
      const gain = this.audioContext.createGain();
      gain.connect(this.audioContext.destination);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.7 * this.volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      this._createSynthNote(frequency, now, duration, type, gain);
    } catch (error) {
      console.error("playSound error:", error);
    }
  }

  playTestSound() {
    if (!this.enabled) this.enabled = true;
    this._resume();
    const scale = this.scales[this.scaleName] || this.scales.pentatonic;
    const mult = this._getOctaveMult();
    this.playChord([scale[0] * mult, scale[2] * mult, scale[4] * mult], 0.3, this.waveform);
  }

  playProducerDemo() {
    if (!this.enabled) this.enabled = true;
    this._resume();
    try {
      const now = this.audioContext.currentTime;
      const scale = this.scales[this.scaleName] || this.scales.pentatonic;
      const mult = this._getOctaveMult();
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
    } catch (e) {
      console.error("playProducerDemo error:", e);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
