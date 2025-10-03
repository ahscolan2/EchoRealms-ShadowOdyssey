// EchoRealms: Shadow Odyssey - Audio System
// Professional audio management with Web Audio API

class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.sounds = new Map();
    this.music = null;
    this.masterVolume = GAME_CONFIG.AUDIO.MASTER_VOLUME;
    this.musicVolume = GAME_CONFIG.AUDIO.MUSIC_VOLUME;
    this.sfxVolume = GAME_CONFIG.AUDIO.SFX_VOLUME;
    this.soundConfigs = GAME_CONFIG.AUDIO.SOUND_CONFIGS;
    
    this.audioContext = null;
    this.gainNode = null;
    this.initialized = false;
    
    this.initializeAudio();
  }
  
  async initializeAudio() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
      
      this.initialized = true;
      console.log('✅ Audio system initialized successfully');
    } catch (error) {
      console.warn('⚠️ Web Audio API not supported:', error);
      this.initialized = false;
    }
  }
  
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('🔊 Audio context resumed');
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }
  
  playSound(soundName, options = {}) {
    if (!this.initialized || !this.audioContext) {
      return;
    }
    
    this.resumeAudioContext();
    
    const config = this.soundConfigs[soundName];
    if (!config) {
      console.warn(`Sound '${soundName}' not found in configuration`);
      return;
    }
    
    const frequency = config.frequency + (options.detune || 0);
    const duration = config.duration * (options.duration || 1);
    const volume = this.sfxVolume * (options.volume || 1);
    const type = options.type || config.type;
    
    this.createTone(frequency, duration, type, volume);
  }
  
  createTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.audioContext || !this.initialized) {
      return;
    }
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      // Set oscillator properties
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      // Set volume envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      // Start and stop oscillator
      oscillator.start(now);
      oscillator.stop(now + duration);
      
      // Cleanup
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
      
    } catch (error) {
      console.warn('Failed to create audio tone:', error);
    }
  }
  
  playSoundWithDelay(soundName, delay, options = {}) {
    if (delay <= 0) {
      this.playSound(soundName, options);
      return;
    }
    
    this.scene.time.delayedCall(delay, () => {
      this.playSound(soundName, options);
    });
  }
  
  createSoundSequence(sounds, interval = 100) {
    sounds.forEach((sound, index) => {
      const delay = index * interval;
      
      if (typeof sound === 'string') {
        this.playSoundWithDelay(sound, delay);
      } else if (typeof sound === 'object') {
        this.playSoundWithDelay(sound.name, delay, sound.options || {});
      }
    });
  }
  
  // Specific sound effect methods
  playJumpSound(jumpNumber = 1) {
    this.playSound('jump', {
      detune: jumpNumber * 150,
      volume: Math.max(0.3, 1 - (jumpNumber * 0.2))
    });
  }
  
  playDashSound() {
    this.createSoundSequence([
      { name: 'dash', options: { volume: 0.8 } },
      { name: 'dash', options: { detune: 200, volume: 0.4, duration: 0.5 } }
    ], 50);
  }
  
  playCollectSound(collectibleType = 'orb') {
    const options = {
      orb: { detune: 0, volume: 0.6 },
      key: { detune: 200, volume: 0.7 },
      crystal: { detune: 400, volume: 0.8 },
      artifact: { detune: 600, volume: 1.0, duration: 1.5 }
    };
    
    const soundOptions = options[collectibleType] || options.orb;
    this.playSound('collect', soundOptions);
    
    // Add harmonic for special collectibles
    if (collectibleType === 'crystal' || collectibleType === 'artifact') {
      this.playSoundWithDelay('collect', 100, {
        detune: soundOptions.detune + 300,
        volume: soundOptions.volume * 0.5,
        type: 'triangle'
      });
    }
  }
  
  playTimeSlowSound() {
    this.createSoundSequence([
      { name: 'timeSlow', options: { volume: 0.7 } },
      { name: 'timeSlow', options: { detune: -100, volume: 0.5, duration: 2 } }
    ], 200);
  }
  
  playGroundSlamSound() {
    this.createSoundSequence([
      { name: 'groundSlam', options: { volume: 0.9 } },
      { name: 'impact', options: { volume: 0.7, duration: 0.6 } }
    ], 100);
  }
  
  playPlayerHitSound(damage = 25) {
    const intensity = Math.min(damage / 50, 1);
    this.playSound('playerHit', {
      volume: 0.6 + (intensity * 0.4),
      detune: -(intensity * 100),
      duration: 1 + intensity
    });
  }
  
  playEnemyHitSound(enemyType = 'default') {
    const options = {
      shadow: { detune: -50, volume: 0.6 },
      forest: { detune: 0, volume: 0.7 },
      crystal: { detune: 150, volume: 0.5 },
      boss: { detune: -200, volume: 0.9, duration: 1.5 }
    };
    
    const soundOptions = options[enemyType] || options.default || {};
    this.playSound('enemyHit', soundOptions);
  }
  
  // Music system (placeholder for future implementation)
  playMusic(trackName, options = {}) {
    console.log(`🎵 Playing background music: ${trackName}`);
    // Future: Load and play actual music files
    this.currentTrack = trackName;
  }
  
  stopMusic() {
    if (this.music) {
      // Future: Stop current music
      this.music = null;
    }
    this.currentTrack = null;
  }
  
  fadeOutMusic(duration = 1000) {
    // Future: Fade out current music
    console.log(`🎵 Fading out music over ${duration}ms`);
  }
  
  crossfadeMusic(newTrack, duration = 2000) {
    // Future: Crossfade between tracks
    console.log(`🎵 Crossfading to ${newTrack} over ${duration}ms`);
    this.currentTrack = newTrack;
  }
  
  // Volume control
  setMasterVolume(volume) {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
    }
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    // Future: Apply to music tracks
  }
  
  // Utility methods
  muteAll() {
    this.previousMasterVolume = this.masterVolume;
    this.setMasterVolume(0);
  }
  
  unmuteAll() {
    if (this.previousMasterVolume !== undefined) {
      this.setMasterVolume(this.previousMasterVolume);
    }
  }
  
  // Environmental audio effects
  playBiomeAmbient(biomeType) {
    const ambientConfigs = {
      shadow: {
        sounds: ['timeSlow'],
        options: { volume: 0.2, duration: 3, detune: -400 }
      },
      forest: {
        sounds: ['collect'],
        options: { volume: 0.15, duration: 2, detune: -200, type: 'sawtooth' }
      },
      crystal: {
        sounds: ['collect'],
        options: { volume: 0.25, duration: 1.5, detune: 300, type: 'triangle' }
      },
      boss: {
        sounds: ['groundSlam'],
        options: { volume: 0.1, duration: 5, detune: -600 }
      }
    };
    
    const config = ambientConfigs[biomeType];
    if (config && Math.random() < 0.1) {
      const sound = Phaser.Utils.Array.GetRandom(config.sounds);
      this.playSound(sound, config.options);
    }
  }
  
  // Cleanup
  destroy() {
    this.stopMusic();
    
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.warn('Error closing audio context:', error);
      }
    }
    
    this.sounds.clear();
    this.initialized = false;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioSystem;
}

// Global access
window.AudioSystem = AudioSystem;