// Professional Audio System for EchoRealms: Shadow Odyssey
// Dynamic music, spatial SFX, and adaptive audio implementation
// Using Web Audio API for professional-grade sound design

class ProfessionalAudioSystem {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterGainNode = null;
        this.musicGainNode = null;
        this.sfxGainNode = null;
        
        // Volume controls (0.0 to 1.0)
        this.volumes = {
            master: 0.7,
            music: 0.6,
            sfx: 0.8,
            ambient: 0.4
        };
        
        // Audio state
        this.currentMusicTrack = null;
        this.musicState = 'exploration'; // exploration, combat, boss, victory
        this.currentBiome = 'shadow';
        
        // Sound pools for performance
        this.soundPools = new Map();
        this.activeSounds = new Set();
        this.maxActiveSounds = 32;
        
        // Music layers for dynamic composition
        this.musicLayers = {
            base: null,
            percussion: null,
            melody: null,
            harmony: null
        };
        
        this.initialize();
        
        console.log('🎵 Professional Audio System initialized!');
    }
    
    async initialize() {
        try {
            // Create Web Audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context if needed (browser autoplay policies)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Create gain nodes for volume control
            this.masterGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGainNode.connect(this.masterGainNode);
            this.sfxGainNode.connect(this.masterGainNode);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            // Initialize sound library
            this.initializeSoundLibrary();
            
            // Start ambient audio
            this.startAmbientAudio();
            
            console.log('🎧 Audio system fully initialized and ready!');
            
        } catch (error) {
            console.warn('⚠️ Web Audio API not available, using fallback audio:', error);
            this.initializeFallbackAudio();
        }
    }
    
    initializeSoundLibrary() {
        // Define all game sounds with their properties
        this.soundLibrary = {
            // Player movement sounds
            jump: {
                type: 'synthesized',
                frequency: 220,
                duration: 0.12,
                waveform: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
            },
            
            land: {
                type: 'synthesized',
                frequency: 180,
                duration: 0.08,
                waveform: 'square',
                envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.1 }
            },
            
            dash: {
                type: 'synthesized',
                frequency: 440,
                duration: 0.25,
                waveform: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3 }
            },
            
            wallSlide: {
                type: 'synthesized',
                frequency: 150,
                duration: 0.1,
                waveform: 'triangle',
                envelope: { attack: 0.02, decay: 0.05, sustain: 0.5, release: 0.1 }
            },
            
            // Ability sounds
            timeSlow: {
                type: 'synthesized',
                frequency: 110,
                duration: 0.4,
                waveform: 'sine',
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.3 },
                effects: ['reverb', 'lowpass']
            },
            
            groundSlam: {
                type: 'synthesized',
                frequency: 60,
                duration: 0.5,
                waveform: 'square',
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.4 },
                effects: ['distortion']
            },
            
            slamImpact: {
                type: 'synthesized',
                frequency: 45,
                duration: 0.3,
                waveform: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.2 }
            },
            
            // Combat sounds
            enemyHit: {
                type: 'synthesized',
                frequency: 200,
                duration: 0.1,
                waveform: 'triangle',
                envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.1 }
            },
            
            playerHit: {
                type: 'synthesized',
                frequency: 160,
                duration: 0.2,
                waveform: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.15 }
            },
            
            enemyDeath: {
                type: 'synthesized',
                frequency: 140,
                duration: 0.4,
                waveform: 'triangle',
                envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.3 }
            },
            
            // Collection sounds
            collectOrb: {
                type: 'synthesized',
                frequency: 660,
                duration: 0.2,
                waveform: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.15 }
            },
            
            collectKey: {
                type: 'synthesized',
                frequency: 880,
                duration: 0.3,
                waveform: 'triangle',
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.2 }
            },
            
            collectCrystal: {
                type: 'synthesized',
                frequency: 1100,
                duration: 0.25,
                waveform: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.18 }
            },
            
            collectArtifact: {
                type: 'synthesized',
                frequency: 1320,
                duration: 0.4,
                waveform: 'triangle',
                envelope: { attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.3 }
            },
            
            // Boss sounds
            bossAttack: {
                type: 'synthesized',
                frequency: 80,
                duration: 0.6,
                waveform: 'sawtooth',
                envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.4 },
                effects: ['reverb']
            },
            
            bossPhaseTransition: {
                type: 'synthesized',
                frequency: 55,
                duration: 1.0,
                waveform: 'sine',
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.6 },
                effects: ['reverb', 'delay']
            },
            
            // UI sounds
            menuSelect: {
                type: 'synthesized',
                frequency: 440,
                duration: 0.1,
                waveform: 'sine',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
            },
            
            menuConfirm: {
                type: 'synthesized',
                frequency: 550,
                duration: 0.15,
                waveform: 'triangle',
                envelope: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.12 }
            }
        };
        
        // Create sound pools
        this.createSoundPools();
    }
    
    createSoundPools() {
        // Pre-create sound instances for frequently used sounds
        const poolSizes = {
            jump: 5,
            land: 3,
            dash: 3,
            enemyHit: 8,
            collect: 6
        };
        
        Object.entries(poolSizes).forEach(([soundName, poolSize]) => {
            if (this.soundLibrary[soundName]) {
                this.soundPools.set(soundName, []);
                for (let i = 0; i < poolSize; i++) {
                    // Pool will be populated on-demand
                }
            }
        });
    }
    
    // ==========================================
    // DYNAMIC MUSIC SYSTEM
    // ==========================================
    
    playMusic(trackName, options = {}) {
        const musicTracks = {
            shadowRealm: {
                baseFreq: 110,
                harmony: [110, 165, 220],
                rhythm: '4/4',
                tempo: 90,
                mood: 'mysterious'
            },
            
            forestKingdom: {
                baseFreq: 146,
                harmony: [146, 220, 293],
                rhythm: '3/4',
                tempo: 105,
                mood: 'natural'
            },
            
            crystalCaves: {
                baseFreq: 174,
                harmony: [174, 261, 349],
                rhythm: '4/4',
                tempo: 100,
                mood: 'ethereal'
            },
            
            bossArena: {
                baseFreq: 130,
                harmony: [130, 195, 260],
                rhythm: '4/4',
                tempo: 120,
                mood: 'epic'
            },
            
            victory: {
                baseFreq: 262,
                harmony: [262, 330, 392, 523],
                rhythm: '4/4',
                tempo: 140,
                mood: 'triumphant'
            }
        };
        
        const track = musicTracks[trackName];
        if (!track) {
            console.warn(`Unknown music track: ${trackName}`);
            return;
        }
        
        this.stopMusic();
        this.currentMusicTrack = trackName;
        
        // Create layered music
        this.createMusicLayers(track, options);
        
        console.log(`🎼 Playing music: ${trackName}`);
    }
    
    createMusicLayers(track, options) {
        if (!this.audioContext) return;
        
        const volume = this.volumes.music * this.volumes.master;
        const fadeInTime = options.fadeIn || 2.0;
        
        // Base layer (drone/pad)
        this.musicLayers.base = this.createMusicLayer(
            track.baseFreq * 0.5,
            'sine',
            volume * 0.3,
            fadeInTime
        );
        
        // Harmony layer
        this.musicLayers.harmony = this.createHarmonyLayer(
            track.harmony,
            volume * 0.4,
            fadeInTime
        );
        
        // Rhythm layer (kicks in after 4 seconds for dramatic buildup)
        setTimeout(() => {
            if (this.currentMusicTrack === track) {
                this.musicLayers.percussion = this.createRhythmLayer(
                    track.tempo,
                    volume * 0.5,
                    1.0
                );
            }
        }, 4000);
    }
    
    createMusicLayer(frequency, waveform, volume, fadeInTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Configure oscillator
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveform;
        
        // Configure filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Configure gain with fade-in
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeInTime);
        
        // Connect nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.musicGainNode);
        
        // Start oscillator
        oscillator.start(this.audioContext.currentTime);
        
        return { oscillator, gainNode, filterNode };
    }
    
    createHarmonyLayer(frequencies, volume, fadeInTime) {
        const harmonyOscillators = [];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const panNode = this.audioContext.createStereoPanner();
            
            // Configure oscillator
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'triangle';
            
            // Pan harmonies across stereo field
            panNode.pan.setValueAtTime((index - 1) * 0.3, this.audioContext.currentTime);
            
            // Configure gain
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                volume / frequencies.length, 
                this.audioContext.currentTime + fadeInTime + (index * 0.5)
            );
            
            // Connect and start
            oscillator.connect(panNode);
            panNode.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            oscillator.start(this.audioContext.currentTime + (index * 0.2));
            
            harmonyOscillators.push({ oscillator, gainNode, panNode });
        });
        
        return harmonyOscillators;
    }
    
    createRhythmLayer(tempo, volume, fadeInTime) {
        // Create rhythmic pulse using noise and filtering
        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate rhythmic pattern
        const beatInterval = (60 / tempo) * this.audioContext.sampleRate;
        
        for (let i = 0; i < bufferSize; i++) {
            const beatPhase = (i % beatInterval) / beatInterval;
            if (beatPhase < 0.1) {
                data[i] = (Math.random() * 2 - 1) * 0.3; // Kick drum simulation
            } else if (beatPhase > 0.5 && beatPhase < 0.6) {
                data[i] = (Math.random() * 2 - 1) * 0.1; // Hi-hat simulation
            } else {
                data[i] = 0;
            }
        }
        
        // Play the rhythm buffer
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        
        filterNode.type = 'bandpass';
        filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeInTime);
        
        source.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.musicGainNode);
        
        source.start(this.audioContext.currentTime);
        
        return { source, gainNode, filterNode };
    }
    
    // ==========================================
    // SOUND EFFECTS SYSTEM
    // ==========================================
    
    playSound(soundName, options = {}) {
        if (!this.audioContext || !this.soundLibrary[soundName]) {
            this.playFallbackSound(soundName, options);
            return;
        }
        
        const soundConfig = this.soundLibrary[soundName];
        const volume = (options.volume || 1.0) * this.volumes.sfx * this.volumes.master;
        
        // Spatial audio options
        const spatialOptions = {
            x: options.x || 0,
            y: options.y || 0,
            distance: options.distance || 0,
            pan: options.pan || 0
        };
        
        // Create and play sound
        const soundInstance = this.createSoundInstance(soundConfig, volume, spatialOptions, options);
        
        if (soundInstance) {
            this.activeSounds.add(soundInstance);
            
            // Auto-cleanup after duration
            setTimeout(() => {
                this.cleanupSoundInstance(soundInstance);
            }, (soundConfig.duration * 1000) + 100);
        }
    }
    
    createSoundInstance(config, volume, spatial, options) {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const panNode = this.audioContext.createStereoPanner();
            const filterNode = this.audioContext.createBiquadFilter();
            
            // Configure oscillator
            const frequency = config.frequency + (options.detune || 0);
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = config.waveform;
            
            // Configure envelope
            const envelope = config.envelope;
            const startTime = this.audioContext.currentTime;
            const attackTime = startTime + envelope.attack;
            const decayTime = attackTime + envelope.decay;
            const releaseTime = startTime + config.duration - envelope.release;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, attackTime);
            gainNode.gain.linearRampToValueAtTime(volume * envelope.sustain, decayTime);
            gainNode.gain.setValueAtTime(volume * envelope.sustain, releaseTime);
            gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);
            
            // Spatial audio
            if (spatial.distance > 0) {
                const distanceVolume = Math.max(0.1, 1.0 - (spatial.distance / 500));
                gainNode.gain.value *= distanceVolume;
            }
            
            panNode.pan.setValueAtTime(Math.max(-1, Math.min(1, spatial.pan)), this.audioContext.currentTime);
            
            // Apply effects
            if (config.effects) {
                this.applyAudioEffects(filterNode, config.effects);
            }
            
            // Connect audio graph
            oscillator.connect(filterNode);
            filterNode.connect(panNode);
            panNode.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            // Start and schedule stop
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + config.duration);
            
            return { oscillator, gainNode, panNode, filterNode, startTime: Date.now() };
            
        } catch (error) {
            console.warn('Failed to create sound instance:', error);
            return null;
        }
    }
    
    applyAudioEffects(filterNode, effects) {
        effects.forEach(effect => {
            switch (effect) {
                case 'lowpass':
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(1200, this.audioContext.currentTime);
                    break;
                case 'highpass':
                    filterNode.type = 'highpass';
                    filterNode.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    break;
                case 'reverb':
                    // Simplified reverb simulation
                    filterNode.Q.setValueAtTime(8, this.audioContext.currentTime);
                    break;
                case 'distortion':
                    filterNode.type = 'peaking';
                    filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    filterNode.gain.setValueAtTime(20, this.audioContext.currentTime);
                    break;
            }
        });
    }
    
    // ==========================================
    // ADAPTIVE MUSIC SYSTEM
    // ==========================================
    
    updateMusicState(newState, intensity = 1.0) {
        if (this.musicState === newState) return;
        
        const previousState = this.musicState;
        this.musicState = newState;
        
        console.log(`🎵 Music state: ${previousState} → ${newState} (intensity: ${intensity})`);
        
        switch (newState) {
            case 'combat':
                this.intensifyMusic(intensity);
                break;
            case 'boss':
                this.transitionToBossMusic();
                break;
            case 'exploration':
                this.relaxMusic();
                break;
            case 'victory':
                this.playVictoryMusic();
                break;
        }
    }
    
    intensifyMusic(intensity) {
        // Increase volume and add layers during combat
        if (this.musicLayers.base && this.musicLayers.base.gainNode) {
            this.musicLayers.base.gainNode.gain.linearRampToValueAtTime(
                this.volumes.music * intensity,
                this.audioContext.currentTime + 1.0
            );
        }
        
        // Add percussion if not present
        if (!this.musicLayers.percussion && intensity > 0.7) {
            this.musicLayers.percussion = this.createRhythmLayer(120, this.volumes.music * 0.6, 1.0);
        }
    }
    
    transitionToBossMusic() {
        // Dramatic transition to boss music
        this.fadeOutCurrentMusic(1.0);
        
        setTimeout(() => {
            this.playMusic('bossArena', { fadeIn: 0.5, intensity: 1.5 });
        }, 1000);
    }
    
    relaxMusic() {
        // Return to calm exploration music
        if (this.musicLayers.percussion) {
            this.fadeOutLayer(this.musicLayers.percussion, 2.0);
            this.musicLayers.percussion = null;
        }
        
        if (this.musicLayers.base && this.musicLayers.base.gainNode) {
            this.musicLayers.base.gainNode.gain.linearRampToValueAtTime(
                this.volumes.music * 0.6,
                this.audioContext.currentTime + 2.0
            );
        }
    }
    
    playVictoryMusic() {
        this.fadeOutCurrentMusic(0.5);
        
        setTimeout(() => {
            this.playMusic('victory', { fadeIn: 0.3 });
            
            // Victory fanfare
            this.playVictoryFanfare();
        }, 500);
    }
    
    playVictoryFanfare() {
        const fanfareNotes = [262, 330, 392, 523, 659]; // C major scale
        
        fanfareNotes.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.4, 'triangle', this.volumes.sfx * 0.8);
            }, index * 150);
        });
    }
    
    // ==========================================
    // SPATIAL AUDIO SYSTEM
    // ==========================================
    
    playSpatialSound(soundName, worldX, worldY, options = {}) {
        if (!this.scene.player) return;
        
        // Calculate distance and pan from player position
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        
        const distance = Phaser.Math.Distance.Between(playerX, playerY, worldX, worldY);
        const angle = Phaser.Math.Angle.Between(playerX, playerY, worldX, worldY);
        
        // Convert to audio parameters
        const maxDistance = options.maxDistance || 400;
        const volume = Math.max(0, 1.0 - (distance / maxDistance));
        const pan = Math.sin(angle) * Math.min(1, distance / 200);
        
        // Play with spatial parameters
        this.playSound(soundName, {
            ...options,
            volume: volume * (options.volume || 1.0),
            pan: pan,
            distance: distance
        });
    }
    
    // ==========================================
    // BIOME-SPECIFIC AUDIO
    // ==========================================
    
    setBiome(biomeName) {
        if (this.currentBiome === biomeName) return;
        
        console.log(`🌍 Audio biome transition: ${this.currentBiome} → ${biomeName}`);
        
        const previousBiome = this.currentBiome;
        this.currentBiome = biomeName;
        
        // Transition music
        this.transitionBiomeMusic(previousBiome, biomeName);
        
        // Update ambient sounds
        this.updateAmbientAudio(biomeName);
    }
    
    transitionBiomeMusic(fromBiome, toBiome) {
        // Crossfade between biome music
        this.fadeOutCurrentMusic(2.0);
        
        setTimeout(() => {
            const musicTracks = {
                shadow: 'shadowRealm',
                forest: 'forestKingdom',
                crystal: 'crystalCaves',
                boss: 'bossArena'
            };
            
            const trackName = musicTracks[toBiome] || 'shadowRealm';
            this.playMusic(trackName, { fadeIn: 2.0 });
        }, 1000);
    }
    
    updateAmbientAudio(biomeName) {
        // Stop previous ambient sounds
        this.stopAmbientSounds();
        
        // Start new ambient sounds based on biome
        const ambientConfigs = {
            shadow: {
                sounds: ['whispers', 'echo'],
                volume: 0.3,
                interval: { min: 3000, max: 8000 }
            },
            forest: {
                sounds: ['leaves', 'birds', 'wind'],
                volume: 0.4,
                interval: { min: 2000, max: 6000 }
            },
            crystal: {
                sounds: ['chimes', 'resonance'],
                volume: 0.35,
                interval: { min: 4000, max: 10000 }
            },
            boss: {
                sounds: ['thunder', 'ominous'],
                volume: 0.5,
                interval: { min: 1000, max: 4000 }
            }
        };
        
        const config = ambientConfigs[biomeName];
        if (config) {
            this.startBiomeAmbient(config);
        }
    }
    
    startBiomeAmbient(config) {
        const playAmbientSound = () => {
            const soundName = Phaser.Utils.Array.GetRandom(config.sounds);
            this.playAmbientEffect(soundName, config.volume);
            
            // Schedule next ambient sound
            const nextInterval = Phaser.Math.Between(config.interval.min, config.interval.max);
            this.ambientTimer = setTimeout(playAmbientSound, nextInterval);
        };
        
        // Start ambient loop
        playAmbientSound();
    }
    
    playAmbientEffect(effectName, volume) {
        // Generate procedural ambient sounds
        const ambientEffects = {
            whispers: () => this.createTone(150 + Math.random() * 100, 1.0, 'sine', volume * 0.5),
            echo: () => this.createEchoEffect(volume),
            leaves: () => this.createTone(800 + Math.random() * 400, 0.3, 'triangle', volume * 0.3),
            birds: () => this.createTone(1200 + Math.random() * 800, 0.2, 'sine', volume * 0.4),
            wind: () => this.createWindEffect(volume),
            chimes: () => this.createChimeEffect(volume),
            resonance: () => this.createTone(440 + Math.random() * 220, 2.0, 'sine', volume * 0.4),
            thunder: () => this.createThunderEffect(volume),
            ominous: () => this.createTone(55 + Math.random() * 30, 1.5, 'sawtooth', volume * 0.6)
        };
        
        const effect = ambientEffects[effectName];
        if (effect) {
            effect();
        }
    }
    
    // ==========================================
    // SPECIALIZED AUDIO EFFECTS
    // ==========================================
    
    createEchoEffect(volume) {
        // Create echo by playing the same tone multiple times with decreasing volume
        const baseFreq = 330;
        const echoTimes = [0, 0.2, 0.4, 0.6];
        
        echoTimes.forEach((delay, index) => {
            setTimeout(() => {
                this.createTone(
                    baseFreq - (index * 20),
                    0.3,
                    'sine',
                    volume * (1 - index * 0.3)
                );
            }, delay * 1000);
        });
    }
    
    createWindEffect(volume) {
        // White noise filtered to sound like wind
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume * 0.3;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(400, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        
        source.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        source.start(this.audioContext.currentTime);
    }
    
    createChimeEffect(volume) {
        const chimeFrequencies = [523, 659, 784, 1047]; // C major chord
        
        chimeFrequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 1.2, 'sine', volume * 0.7);
            }, index * 100);
        });
    }
    
    createThunderEffect(volume) {
        // Low frequency rumble for thunder
        this.createTone(40, 1.0, 'sawtooth', volume * 0.8);
        
        // Add crack sound
        setTimeout(() => {
            this.createTone(2000 + Math.random() * 1000, 0.1, 'square', volume * 0.6);
        }, 200);
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    createTone(frequency, duration, waveform = 'sine', volume = 0.5) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGainNode);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveform;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Failed to create tone:', error);
        }
    }
    
    updateVolumes() {
        if (!this.masterGainNode) return;
        
        this.masterGainNode.gain.setValueAtTime(this.volumes.master, this.audioContext.currentTime);
        this.musicGainNode.gain.setValueAtTime(this.volumes.music, this.audioContext.currentTime);
        this.sfxGainNode.gain.setValueAtTime(this.volumes.sfx, this.audioContext.currentTime);
    }
    
    setVolume(category, volume) {
        this.volumes[category] = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        console.log(`🔊 Volume ${category}: ${Math.round(this.volumes[category] * 100)}%`);
    }
    
    stopMusic() {
        if (this.musicLayers.base) {
            this.fadeOutLayer(this.musicLayers.base, 1.0);
        }
        if (this.musicLayers.harmony) {
            this.musicLayers.harmony.forEach(layer => this.fadeOutLayer(layer, 1.0));
        }
        if (this.musicLayers.percussion) {
            this.fadeOutLayer(this.musicLayers.percussion, 1.0);
        }
        
        // Clear layers
        setTimeout(() => {
            this.musicLayers = { base: null, percussion: null, melody: null, harmony: null };
        }, 1000);
    }
    
    fadeOutCurrentMusic(fadeTime = 2.0) {
        Object.values(this.musicLayers).forEach(layer => {
            if (layer) {
                this.fadeOutLayer(layer, fadeTime);
            }
        });
    }
    
    fadeOutLayer(layer, fadeTime) {
        if (layer && layer.gainNode) {
            layer.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        }
    }
    
    stopAmbientSounds() {
        if (this.ambientTimer) {
            clearTimeout(this.ambientTimer);
            this.ambientTimer = null;
        }
    }
    
    cleanupSoundInstance(soundInstance) {
        this.activeSounds.delete(soundInstance);
        
        // The oscillator automatically cleans up when it stops
        // But we could add additional cleanup here if needed
    }
    
    // ==========================================
    // FALLBACK AUDIO SYSTEM
    // ==========================================
    
    initializeFallbackAudio() {
        console.log('🔊 Using fallback audio system');
        // Simplified audio for browsers without Web Audio API support
    }
    
    playFallbackSound(soundName, options) {
        // Simplified sound using HTML5 audio or console output
        console.log(`🔊 Playing sound: ${soundName}`, options);
    }
    
    // ==========================================
    // CLEANUP & PERFORMANCE
    // ==========================================
    
    cleanup() {
        // Clean up old sound instances
        const now = Date.now();
        
        this.activeSounds.forEach(sound => {
            if (now - sound.startTime > 5000) {
                this.cleanupSoundInstance(sound);
            }
        });
        
        // Limit concurrent sounds
        if (this.activeSounds.size > this.maxActiveSounds) {
            const oldestSound = Array.from(this.activeSounds)[0];
            this.cleanupSoundInstance(oldestSound);
        }
    }
    
    getAudioStats() {
        return {
            activeSounds: this.activeSounds.size,
            maxSounds: this.maxActiveSounds,
            currentTrack: this.currentMusicTrack,
            musicState: this.musicState,
            biome: this.currentBiome,
            volumes: { ...this.volumes }
        };
    }
    
    destroy() {
        console.log('🎵 Destroying audio system...');
        
        // Stop all music
        this.stopMusic();
        this.stopAmbientSounds();
        
        // Clean up Web Audio nodes
        if (this.audioContext) {
            this.activeSounds.forEach(sound => {
                if (sound.oscillator) {
                    try {
                        sound.oscillator.stop();
                    } catch (e) {
                        // Oscillator may already be stopped
                    }
                }
            });
            
            // Close audio context
            this.audioContext.close();
        }
        
        // Clear all references
        this.activeSounds.clear();
        this.soundPools.clear();
        
        console.log('🔇 Audio system destroyed');
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfessionalAudioSystem };
}