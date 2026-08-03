// sound-manager.js
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.musicalMode = false;
    this.waveform = 'triangle';
    this.scaleName = 'pentatonic';
    this.scales = {
      pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
      major:      [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99],
      minor:      [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25, 587.33, 622.25, 698.46, 783.99],
      blues:      [261.63, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25, 622.25, 698.46, 739.99, 783.99, 932.33],
      dorian:     [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50],
    };
    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("Audio context initialized");
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

  setScale(name) {
    if (this.scales[name]) this.scaleName = name;
  }

  setWaveform(wave) {
    const allowed = ['triangle', 'sine', 'square', 'sawtooth'];
    if (allowed.includes(wave)) this.waveform = wave;
  }

  _resume() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
  }

  play(type) {
    if (!this.enabled || !this.audioContext) return;

    if (type === 'complete' && this.musicalMode) {
      this.playArpeggio();
      return;
    }

    const sounds = {
      compare:  { freq: 800, duration: 0.1,  wave: 'sine' },
      swap:     { freq: 400, duration: 0.2,  wave: 'square' },
      complete: { freq: 600, duration: 0.3,  wave: 'triangle' },
      generate: { freq: 1000, duration: 0.1, wave: 'sine' },
    };
    const s = sounds[type];
    if (!s) return;
    this.playSound(s.freq, s.duration, s.wave);
  }

  playMusical(val1, val2, arr) {
    if (!this.enabled || !this.audioContext) return;
    this._resume();

    const maxVal = Math.max(...arr, 1);
    const minVal = Math.min(...arr, 0);
    const range = maxVal - minVal || 1;
    const scale = this.scales[this.scaleName] || this.scales.pentatonic;

    const idx1 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val1 - minVal) / range) * (scale.length - 1))));
    const idx2 = Math.min(scale.length - 1, Math.max(0, Math.floor(((val2 - minVal) / range) * (scale.length - 1))));
    this.playChord([scale[idx1], scale[idx2]], 0.18, this.waveform);
  }

  playChord(frequencies, duration, type = 'triangle') {
    if (!this.enabled || !this.audioContext) return;
    try {
      const now = this.audioContext.currentTime;
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);
      masterGain.gain.setValueAtTime(0.0, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      frequencies.forEach(freq => {
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      });
    } catch (e) {
      console.error("playChord error:", e);
    }
  }

  playArpeggio() {
    if (!this.enabled || !this.audioContext) return;
    this._resume();
    try {
      const now = this.audioContext.currentTime;
      const scale = this.scales[this.scaleName] || this.scales.pentatonic;
      const notes = [scale[0], scale[2], scale[4], scale[Math.min(scale.length - 1, 7)], scale[Math.min(scale.length - 1, 9)]];
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.22, now + 0.02);

      notes.forEach((freq, i) => {
        const osc = this.audioContext.createOscillator();
        osc.type = this.waveform;
        osc.frequency.value = freq;
        const noteGain = this.audioContext.createGain();
        noteGain.gain.setValueAtTime(0.0001, now + i * 0.09);
        noteGain.gain.exponentialRampToValueAtTime(0.6, now + i * 0.09 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.35);
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.37);
      });
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + notes.length * 0.09 + 0.4);
    } catch (e) {
      console.error("playArpeggio error:", e);
    }
  }

  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    try {
      this._resume();
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.frequency.value = frequency;
      osc.type = type;
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("playSound error:", error);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
