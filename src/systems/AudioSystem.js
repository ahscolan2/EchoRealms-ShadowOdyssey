// Audio System for generating game sounds
class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = null;
    this.masterVolume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    
    this.initializeSounds();
  }
  
  initializeSounds() {
    // Initialize Web Audio API for sound generation
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.audioContext = null;
    }
  }
  
  playSound(soundName, options = {}) {
    if (!this.audioContext) return;
    
    const soundConfigs = {
      jump: { frequency: 220, duration: 0.1, type: 'sine' },
      dash: { frequency: 440, duration: 0.2, type: 'square' },
      collect: { frequency: 660, duration: 0.15, type: 'triangle' },
      timeSlow: { frequency: 110, duration: 0.3, type: 'sawtooth' },
      groundSlam: { frequency: 55, duration: 0.4, type: 'square' },
      impact: { frequency: 80, duration: 0.2, type: 'square' },
      enemyHit: { frequency: 150, duration: 0.1, type: 'triangle' },
      playerHit: { frequency: 200, duration: 0.2, type: 'sawtooth' },
      levelComplete: { frequency: 440, duration: 0.5, type: 'sine' },
      gameOver: { frequency: 110, duration: 1.0, type: 'sawtooth' }
    };
    
    const config = soundConfigs[soundName];
    if (!config) return;
    
    this.createTone(
      config.frequency + (options.detune || 0),
      config.duration,
      config.type,
      this.sfxVolume * (options.volume || 1)
    );
  }
  
  createTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Failed to create audio tone:', e);
    }
  }
  
  playMusic(trackName) {
    console.log(`🎵 Playing background music: ${trackName}`);
    // In a full implementation, you would load and play actual music files
  }
  
  setVolume(masterVolume) {
    this.masterVolume = Math.max(0, Math.min(1, masterVolume));
  }
  
  setSFXVolume(sfxVolume) {
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
  }
  
  setMusicVolume(musicVolume) {
    this.musicVolume = Math.max(0, Math.min(1, musicVolume));
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.AudioSystem = AudioSystem;
}