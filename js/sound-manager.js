// sound-manager.js
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
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
  
  playSound(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;
    
    try {
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
