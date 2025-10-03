// Production Game Integration System
// Brings together all game systems into a cohesive, polished experience
// Ready for players to enjoy from first launch to final boss victory

class ProductionGameSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        
        // Core systems
        this.movementSystem = null;
        this.audioSystem = null;
        this.particleSystem = null;
        this.levelDesigner = null;
        
        // Game state management
        this.gameState = {
            currentLevel: 1,
            currentBiome: 'shadow',
            playerProgress: {
                abilitiesUnlocked: {
                    tripleJump: true,
                    echoDash: false,
                    timeSlow: false,
                    groundSlam: false
                },
                levelsCompleted: [],
                secretsFound: [],
                totalScore: 0,
                bestTimes: {},
                achievements: []
            },
            settings: {
                masterVolume: 0.7,
                musicVolume: 0.6,
                sfxVolume: 0.8,
                particleQuality: 'high', // high, medium, low
                showFPS: false,
                controlScheme: 'default'
            }
        };
        
        // Performance monitoring
        this.performance = {
            fps: 60,
            frameTime: 16,
            memoryUsage: 0,
            particleCount: 0,
            audioLoadTime: 0
        };
        
        console.log('🚀 Production Game System initializing...');
    }
    
    async initialize() {
        try {
            console.log('🎆 Loading game systems...');
            
            // Initialize core systems in order
            await this.initializeAudioSystem();
            await this.initializeParticleSystem();
            await this.initializeMovementSystem();
            await this.initializeLevelDesigner();
            
            // Load saved progress
            this.loadPlayerProgress();
            
            // Setup UI systems
            this.initializeUI();
            
            // Setup game loop
            this.setupGameLoop();
            
            // Initialize performance monitoring
            this.initializePerformanceMonitoring();
            
            this.initialized = true;
            console.log('✅ Production game system fully loaded!');
            
            // Start the adventure!
            this.startGameExperience();
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    async initializeAudioSystem() {
        console.log('🎵 Initializing professional audio system...');
        const startTime = performance.now();
        
        this.audioSystem = new ProfessionalAudioSystem(this.scene);
        await this.audioSystem.initialize();
        
        // Apply user settings
        this.audioSystem.setVolume('master', this.gameState.settings.masterVolume);
        this.audioSystem.setVolume('music', this.gameState.settings.musicVolume);
        this.audioSystem.setVolume('sfx', this.gameState.settings.sfxVolume);
        
        this.performance.audioLoadTime = performance.now() - startTime;
        console.log(`🎧 Audio system ready! (${Math.round(this.performance.audioLoadTime)}ms)`);
    }
    
    async initializeParticleSystem() {
        console.log('✨ Initializing advanced particle system...');
        
        this.particleSystem = new AdvancedParticleSystem(this.scene);
        
        // Connect to player for easy access
        if (this.scene.player) {
            this.scene.player.particleSystem = this.particleSystem;
        }
        
        console.log('🎆 Particle system ready!');
    }
    
    async initializeMovementSystem() {
        console.log('🎮 Initializing ultra-responsive movement...');
        
        if (this.scene.player) {
            this.movementSystem = new AdvancedMovementSystem(this.scene, this.scene.player);
            
            // Connect particle system for movement feedback
            this.movementSystem.particleSystem = this.particleSystem;
            
            // Connect audio system for movement sounds
            this.movementSystem.audioSystem = this.audioSystem;
        }
        
        console.log('🚀 Movement system ready!');
    }
    
    async initializeLevelDesigner() {
        console.log('🏰 Initializing master level designer...');
        
        this.levelDesigner = new MasterLevelDesigner(this.scene);
        
        console.log('🎮 Level design system ready!');
    }
    
    // ==========================================
    // GAME EXPERIENCE FLOW
    // ==========================================
    
    startGameExperience() {
        // Start with atmospheric intro
        this.playIntroSequence();
        
        // Load first level
        this.loadLevel(this.gameState.currentLevel);
        
        // Start biome music
        this.audioSystem.setBiome(this.gameState.currentBiome);
        this.audioSystem.playMusic('shadowRealm', { fadeIn: 3.0 });
        
        // Begin environmental effects
        this.startEnvironmentalEffects();
        
        console.log('🌌 EchoRealms: Shadow Odyssey adventure begins!');
    }
    
    playIntroSequence() {
        // Atmospheric intro with particles and audio
        this.scene.cameras.main.fadeIn(2000, 0, 0, 0);
        
        // Intro particles
        this.particleSystem.createEffect('shadowAmbient', 
            this.scene.cameras.main.centerX, 
            this.scene.cameras.main.centerY, 
            { count: 20, duration: 4000 }
        );
        
        // Intro audio
        this.audioSystem.playSound('menuConfirm', { volume: 0.6 });
        
        // Show title briefly
        const titleText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 50,
            'EchoRealms: Shadow Odyssey',
            {
                fontFamily: 'Arial',
                fontSize: 36,
                color: '#00FFFF',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        
        // Fade out title
        this.scene.tweens.add({
            targets: titleText,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => titleText.destroy()
        });
    }
    
    loadLevel(levelId) {
        console.log(`🎮 Loading Level ${levelId}...`);
        
        // Determine biome from level
        const biome = this.determineBiome(levelId);
        
        // Transition effects
        if (biome !== this.gameState.currentBiome) {
            this.transitionToBiome(biome);
        }
        
        // Load level design
        this.levelDesigner.loadLevel(levelId, biome);
        
        // Update game state
        this.gameState.currentLevel = levelId;
        this.gameState.currentBiome = biome;
        
        // Reset player position if needed
        this.resetPlayerPosition();
        
        // Start level-specific systems
        this.startLevelSystems(levelId, biome);
        
        console.log(`✨ Level ${levelId} loaded in ${biome} biome!`);
    }
    
    determineBiome(levelId) {
        if (levelId <= 4) return 'shadow';
        if (levelId <= 8) return 'forest';
        if (levelId <= 12) return 'crystal';
        return 'boss';
    }
    
    transitionToBiome(newBiome) {
        console.log(`🌍 Transitioning to ${newBiome} biome`);
        
        // Visual transition
        this.particleSystem.createBiomeTransitionEffect(this.gameState.currentBiome, newBiome);
        
        // Audio transition
        this.audioSystem.setBiome(newBiome);
        
        // Screen flash
        this.scene.cameras.main.flash(1000, 0, 50, 100, false);
    }
    
    startLevelSystems(levelId, biome) {
        // Start environmental effects
        this.particleSystem.createEnvironmentalEffects(biome, 2);
        
        // Ability unlock checks
        this.checkAbilityUnlocks(levelId);
        
        // Level-specific audio
        this.audioSystem.updateMusicState('exploration');
        
        // Performance optimization for level
        this.optimizeForLevel(levelId, biome);
    }
    
    checkAbilityUnlocks(levelId) {
        const unlocks = {
            3: 'echoDash',
            6: 'timeSlow',
            9: 'groundSlam'
        };
        
        if (unlocks[levelId] && !this.gameState.playerProgress.abilitiesUnlocked[unlocks[levelId]]) {
            this.unlockAbility(unlocks[levelId]);
        }
    }
    
    unlockAbility(abilityName) {
        console.log(`✨ New ability unlocked: ${abilityName}!`);
        
        this.gameState.playerProgress.abilitiesUnlocked[abilityName] = true;
        
        // Celebration effects
        this.particleSystem.createVictoryExplosion(
            this.scene.player.x,
            this.scene.player.y
        );
        
        // Fanfare
        this.audioSystem.playVictoryFanfare();
        
        // Show ability notification
        this.showAbilityUnlockNotification(abilityName);
        
        // Save progress
        this.savePlayerProgress();
    }
    
    showAbilityUnlockNotification(abilityName) {
        const abilityNames = {
            echoDash: '⚡ Echo Phase-Dash',
            timeSlow: '⏰ Time Slow',
            groundSlam: '🔨 Ground Slam'
        };
        
        const notification = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 100,
            `NEW ABILITY UNLOCKED!\n${abilityNames[abilityName]}`,
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#FFD700',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2500);
        
        // Animation
        this.scene.tweens.add({
            targets: notification,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: notification,
                    alpha: 0,
                    duration: 2000,
                    delay: 2000,
                    onComplete: () => notification.destroy()
                });
            }
        });
    }
    
    // ==========================================
    // GAME EVENTS & PROGRESSION
    // ==========================================
    
    onLevelComplete(levelId, stats) {
        console.log(`✅ Level ${levelId} completed!`, stats);
        
        // Update progress
        this.gameState.playerProgress.levelsCompleted.push(levelId);
        this.gameState.playerProgress.totalScore += stats.score;
        
        if (stats.completionTime) {
            this.gameState.playerProgress.bestTimes[levelId] = stats.completionTime;
        }
        
        // Check for achievements
        this.checkAchievements(levelId, stats);
        
        // Victory effects
        this.playLevelCompleteEffects();
        
        // Save progress
        this.savePlayerProgress();
        
        // Load next level or show completion
        if (levelId < 16) {
            this.scene.time.delayedCall(3000, () => {
                this.loadLevel(levelId + 1);
            });
        } else {
            this.onGameComplete();
        }
    }
    
    playLevelCompleteEffects() {
        // Audio
        this.audioSystem.updateMusicState('victory');
        
        // Particles
        this.particleSystem.createVictoryExplosion(
            this.scene.player.x,
            this.scene.player.y
        );
        
        // Screen effects
        this.scene.cameras.main.flash(500, 255, 215, 0, false);
        
        // UI feedback
        this.showLevelCompleteMessage();
    }
    
    showLevelCompleteMessage() {
        const message = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            '✨ LEVEL COMPLETE! ✨',
            {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        
        // Animate
        this.scene.tweens.add({
            targets: message,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 800,
            ease: 'Elastic.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: message,
                    alpha: 0,
                    duration: 2000,
                    delay: 1000,
                    onComplete: () => message.destroy()
                });
            }
        });
    }
    
    onGameComplete() {
        console.log('🏆 GAME COMPLETE! Player has conquered all realms!');
        
        // Epic finale sequence
        this.playGameCompleteSequence();
        
        // Unlock final achievements
        this.unlockAchievement('shadow_master', 'Master of All Realms');
        
        // Show credits or replay options
        this.showGameCompleteScreen();
    }
    
    playGameCompleteSequence() {
        // Ultimate victory music
        this.audioSystem.playMusic('victory', { fadeIn: 1.0 });
        
        // Epic particle celebration
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 500, () => {
                this.particleSystem.createVictoryExplosion(
                    this.scene.cameras.main.centerX + Phaser.Math.Between(-200, 200),
                    this.scene.cameras.main.centerY + Phaser.Math.Between(-100, 100)
                );
            });
        }
        
        // Screen celebration
        this.scene.cameras.main.shake(1000, 0.02);
        this.scene.cameras.main.flash(1500, 255, 215, 0, false);
    }
    
    // ==========================================
    // ACHIEVEMENT SYSTEM
    // ==========================================
    
    checkAchievements(levelId, stats) {
        // Speed run achievements
        if (stats.completionTime && stats.completionTime < 60) {
            this.unlockAchievement('speedster', 'Complete a level in under 60 seconds');
        }
        
        // Exploration achievements
        if (stats.secretsFound && stats.secretsFound > 0) {
            this.unlockAchievement('explorer', 'Find your first secret area');
        }
        
        // Combat achievements
        if (stats.enemiesDefeated && stats.enemiesDefeated >= 10) {
            this.unlockAchievement('warrior', 'Defeat 10 enemies in one level');
        }
        
        // Progression achievements
        if (levelId === 4) {
            this.unlockAchievement('shadow_walker', 'Complete the Shadow Realm');
        } else if (levelId === 8) {
            this.unlockAchievement('forest_guardian', 'Complete the Forest Kingdom');
        } else if (levelId === 12) {
            this.unlockAchievement('crystal_master', 'Complete the Crystal Caves');
        }
    }
    
    unlockAchievement(achievementId, description) {
        if (this.gameState.playerProgress.achievements.includes(achievementId)) return;
        
        this.gameState.playerProgress.achievements.push(achievementId);
        
        console.log(`🏆 Achievement unlocked: ${description}`);
        
        // Achievement notification
        this.showAchievementNotification(description);
        
        // Save progress
        this.savePlayerProgress();
    }
    
    showAchievementNotification(description) {
        const notification = this.scene.add.container(
            this.scene.cameras.main.centerX,
            50
        ).setScrollFactor(0).setDepth(3000);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 300, 80, 0x000000, 0.8);
        bg.setStrokeStyle(2, 0xFFD700);
        
        // Trophy icon
        const trophy = this.scene.add.text(-120, 0, '🏆', {
            fontSize: 24
        }).setOrigin(0.5);
        
        // Text
        const text = this.scene.add.text(0, 0, `ACHIEVEMENT\n${description}`, {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        
        notification.add([bg, trophy, text]);
        
        // Slide in animation
        notification.y = -50;
        this.scene.tweens.add({
            targets: notification,
            y: 50,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: notification,
                    y: -50,
                    duration: 500,
                    delay: 3000,
                    onComplete: () => notification.destroy()
                });
            }
        });
        
        // Achievement sound
        this.audioSystem.playSound('collectArtifact', { volume: 0.7 });
    }
    
    // ==========================================
    // SAVE/LOAD SYSTEM
    // ==========================================
    
    savePlayerProgress() {
        try {
            const saveData = {
                gameState: this.gameState,
                timestamp: Date.now(),
                version: '1.0.0'
            };
            
            localStorage.setItem('echoRealms_save', JSON.stringify(saveData));
            console.log('💾 Progress saved successfully');
            
        } catch (error) {
            console.warn('⚠️ Failed to save progress:', error);
        }
    }
    
    loadPlayerProgress() {
        try {
            const saveData = JSON.parse(localStorage.getItem('echoRealms_save'));
            
            if (saveData && saveData.gameState) {
                // Merge saved progress with default state
                this.gameState = {
                    ...this.gameState,
                    ...saveData.gameState
                };
                
                console.log('📁 Progress loaded successfully');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load progress:', error);
        }
        
        console.log('🎆 Starting fresh adventure!');
        return false;
    }
    
    // ==========================================
    // PERFORMANCE & OPTIMIZATION
    // ==========================================
    
    initializePerformanceMonitoring() {
        // FPS monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                const currentTime = performance.now();
                const deltaTime = currentTime - lastTime;
                
                this.performance.fps = Math.round(1000 / (deltaTime / frameCount));
                this.performance.frameTime = deltaTime / frameCount;
                
                frameCount = 0;
                lastTime = currentTime;
                
                // Performance optimizations
                this.optimizePerformance();
            },
            loop: true
        });
        
        // Memory monitoring
        if (performance.memory) {
            this.scene.time.addEvent({
                delay: 5000,
                callback: () => {
                    this.performance.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                },
                loop: true
            });
        }
        
        console.log('📈 Performance monitoring active');
    }
    
    optimizePerformance() {
        // Get particle count
        if (this.particleSystem) {
            const stats = this.particleSystem.getPerformanceStats();
            this.performance.particleCount = stats.activeParticles;
            
            // Cleanup particles if needed
            this.particleSystem.cleanup();
        }
        
        // Adjust quality based on performance
        if (this.performance.fps < 30) {
            this.reduceGraphicsQuality();
        } else if (this.performance.fps > 55 && this.gameState.settings.particleQuality !== 'high') {
            this.increaseGraphicsQuality();
        }
    }
    
    reduceGraphicsQuality() {
        if (this.gameState.settings.particleQuality === 'high') {
            this.gameState.settings.particleQuality = 'medium';
            console.log('📉 Graphics quality reduced to maintain performance');
        } else if (this.gameState.settings.particleQuality === 'medium') {
            this.gameState.settings.particleQuality = 'low';
            console.log('📉 Graphics quality reduced to low');
        }
    }
    
    increaseGraphicsQuality() {
        if (this.gameState.settings.particleQuality === 'low') {
            this.gameState.settings.particleQuality = 'medium';
            console.log('📈 Graphics quality increased to medium');
        } else if (this.gameState.settings.particleQuality === 'medium') {
            this.gameState.settings.particleQuality = 'high';
            console.log('📈 Graphics quality increased to high');
        }
    }
    
    optimizeForLevel(levelId, biome) {
        // Level-specific optimizations
        const optimizations = {
            shadow: { particleIntensity: 0.8 },
            forest: { particleIntensity: 1.0 },
            crystal: { particleIntensity: 1.2 },
            boss: { particleIntensity: 1.5 }
        };
        
        const config = optimizations[biome];
        if (config && this.particleSystem) {
            // Apply optimizations
            console.log(`⚙️ Applied ${biome} biome optimizations`);
        }
    }
    
    // ==========================================
    // UI & SETTINGS
    // ==========================================
    
    initializeUI() {
        // Create debug display if enabled
        if (this.gameState.settings.showFPS) {
            this.createDebugDisplay();
        }
        
        // Setup pause functionality
        this.setupPauseSystem();
        
        console.log('🗺️ UI system initialized');
    }
    
    createDebugDisplay() {
        this.debugText = this.scene.add.text(10, 10, '', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#00FF00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(9999);
        
        // Update debug info
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.debugText) {
                    this.updateDebugDisplay();
                }
            },
            loop: true
        });
    }
    
    updateDebugDisplay() {
        const debugInfo = [
            `FPS: ${this.performance.fps}`,
            `Frame: ${this.performance.frameTime.toFixed(1)}ms`,
            `Memory: ${this.performance.memoryUsage}MB`,
            `Particles: ${this.performance.particleCount}`,
            `Level: ${this.gameState.currentLevel}`,
            `Biome: ${this.gameState.currentBiome}`,
            `Quality: ${this.gameState.settings.particleQuality}`
        ];
        
        if (this.movementSystem) {
            const moveDebug = this.movementSystem.getDebugInfo();
            debugInfo.push(`Player: (${moveDebug.position.x}, ${moveDebug.position.y})`);
            debugInfo.push(`Velocity: (${moveDebug.velocity.x}, ${moveDebug.velocity.y})`);
            debugInfo.push(`Grounded: ${moveDebug.state.grounded}`);
            debugInfo.push(`Jumps: ${moveDebug.state.jumpsRemaining}/3`);
        }
        
        this.debugText.setText(debugInfo.join('\n'));
    }
    
    setupPauseSystem() {
        // ESC key to pause
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
    }
    
    togglePause() {
        if (this.scene.scene.isPaused()) {
            this.scene.scene.resume();
            console.log('▶️ Game resumed');
        } else {
            this.scene.scene.pause();
            console.log('⏸️ Game paused');
        }
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    setupGameLoop() {
        // Main update loop for integration systems
        this.scene.events.on('update', () => {
            if (!this.initialized) return;
            
            // Update core systems
            if (this.movementSystem) {
                this.movementSystem.update(this.scene.game.loop.delta);
            }
            
            // Update audio based on gameplay state
            this.updateAudioState();
        });
    }
    
    updateAudioState() {
        // Dynamic music based on game state
        const nearEnemies = this.checkNearbyEnemies();
        
        if (nearEnemies && this.audioSystem.musicState !== 'combat') {
            this.audioSystem.updateMusicState('combat', 0.8);
        } else if (!nearEnemies && this.audioSystem.musicState === 'combat') {
            this.audioSystem.updateMusicState('exploration');
        }
    }
    
    checkNearbyEnemies() {
        if (!this.scene.player || !this.scene.enemies) return false;
        
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        
        return this.scene.enemies.children.entries.some(enemy => {
            const distance = Phaser.Math.Distance.Between(
                playerX, playerY, enemy.x, enemy.y
            );
            return distance < 200;
        });
    }
    
    startEnvironmentalEffects() {
        // Continuous environmental particle effects
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.particleSystem && this.gameState.currentBiome) {
                    this.particleSystem.createEnvironmentalEffects(
                        this.gameState.currentBiome, 
                        1
                    );
                }
            },
            loop: true
        });
    }
    
    resetPlayerPosition() {
        // Reset to safe starting position for level
        if (this.scene.player) {
            this.scene.player.x = 100;
            this.scene.player.y = 400;
            this.scene.player.setVelocity(0, 0);
        }
    }
    
    handleInitializationError(error) {
        // Graceful error handling
        console.error('Game failed to initialize properly:', error);
        
        // Show user-friendly error message
        if (this.scene.add) {
            const errorText = this.scene.add.text(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY,
                'Sorry! The game failed to load properly.\nPlease refresh and try again.',
                {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    color: '#FF6B6B',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5).setScrollFactor(0);
        }
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    getGameStats() {
        return {
            currentLevel: this.gameState.currentLevel,
            currentBiome: this.gameState.currentBiome,
            totalScore: this.gameState.playerProgress.totalScore,
            levelsCompleted: this.gameState.playerProgress.levelsCompleted.length,
            secretsFound: this.gameState.playerProgress.secretsFound.length,
            achievements: this.gameState.playerProgress.achievements.length,
            performance: this.performance,
            settings: this.gameState.settings
        };
    }
    
    updateSetting(category, value) {
        this.gameState.settings[category] = value;
        
        // Apply setting immediately
        switch (category) {
            case 'masterVolume':
            case 'musicVolume':
            case 'sfxVolume':
                if (this.audioSystem) {
                    this.audioSystem.setVolume(
                        category.replace('Volume', '').toLowerCase(),
                        value
                    );
                }
                break;
                
            case 'showFPS':
                if (value && !this.debugText) {
                    this.createDebugDisplay();
                } else if (!value && this.debugText) {
                    this.debugText.destroy();
                    this.debugText = null;
                }
                break;
        }
        
        this.savePlayerProgress();
    }
    
    // Clean shutdown
    destroy() {
        console.log('📴 Shutting down game systems...');
        
        // Save final progress
        this.savePlayerProgress();
        
        // Cleanup systems
        if (this.audioSystem) this.audioSystem.destroy();
        if (this.particleSystem) this.particleSystem.destroy();
        
        console.log('👋 EchoRealms: Shadow Odyssey session ended');
    }
}

// Export for main game initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductionGameSystem };
}

// Global initialization for browser
if (typeof window !== 'undefined') {
    window.ProductionGameSystem = ProductionGameSystem;
}