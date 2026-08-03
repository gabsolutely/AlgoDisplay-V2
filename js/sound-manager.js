// sound-manager.js
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.musicalMode = false;
    this.musicalScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
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
  
  play(type) {
    if (!this.enabled || !this.audioContext) return;
    
    const sounds = {
      compare: { freq: 800, duration: 0.1, wave: 'sine' },
      swap: { freq: 400, duration: 0.2, wave: 'square' },
      complete: { freq: 600, duration: 0.3, wave: 'triangle' },
      generate: { freq: 1000, duration: 0.1, wave: 'sine' }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    this.playSound(sound.freq, sound.duration, sound.wave);
  }
  
  playMusical(val1, val2, arr) {
    if (!this.enabled || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const maxVal = Math.max(...arr, 1);
    const minVal = Math.min(...arr, 0);
    const range = maxVal - minVal || 1;
    const scale = this.musicalScale;

    const idx1 = Math.min(scale.length - 1, Math.floor(((val1 - minVal) / range) * (scale.length - 1)));
    const idx2 = Math.min(scale.length - 1, Math.floor(((val2 - minVal) / range) * (scale.length - 1)));

    const f1 = scale[Math.max(0, idx1)];
    const f2 = scale[Math.max(0, idx2)];

    this.playChord([f1, f2], 0.18, 'triangle');
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
    } catch (error) {
      console.error("Error playing chord:", error);
    }
  }
  
  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log("Sound enabled:", enabled);
  }
}