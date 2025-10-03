// Advanced Particle Effects System
// Professional-grade visual effects for EchoRealms: Shadow Odyssey
// Optimized for performance and visual impact

class AdvancedParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeParticles = [];
        this.particlePool = [];
        this.maxParticles = 500;
        
        // Performance tracking
        this.particleCount = 0;
        this.lastCleanup = Date.now();
        
        // Effect presets
        this.effectPresets = this.initializeEffectPresets();
        
        console.log('✨ Advanced Particle System initialized');
    }
    
    initializeEffectPresets() {
        return {
            // Movement effects
            jumpRing: {
                count: 8,
                colors: [0x00FFFF, 0x66CCFF, 0x99DDFF],
                size: { min: 3, max: 6 },
                duration: 400,
                pattern: 'ring',
                physics: { gravity: false, velocity: { min: 50, max: 100 } }
            },
            
            dashTrail: {
                count: 12,
                colors: [0x00FFFF, 0x0099FF, 0x0066CC],
                size: { min: 4, max: 8 },
                duration: 600,
                pattern: 'trail',
                physics: { gravity: true, velocity: { min: 20, max: 50 } }
            },
            
            landingImpact: {
                count: 10,
                colors: [0xFFAA44, 0xFF8844, 0xFF6644],
                size: { min: 5, max: 12 },
                duration: 800,
                pattern: 'burst',
                physics: { gravity: true, velocity: { min: 80, max: 150 } }
            },
            
            // Combat effects
            hitSpark: {
                count: 6,
                colors: [0xFFFF00, 0xFFCC00, 0xFF9900],
                size: { min: 2, max: 5 },
                duration: 300,
                pattern: 'spark',
                physics: { gravity: false, velocity: { min: 100, max: 200 } }
            },
            
            explosion: {
                count: 20,
                colors: [0xFF4500, 0xFF6644, 0xFF8866],
                size: { min: 8, max: 15 },
                duration: 1000,
                pattern: 'explosion',
                physics: { gravity: true, velocity: { min: 50, max: 200 } }
            },
            
            // Collectible effects
            collectSparkle: {
                count: 8,
                colors: [0xFFD700, 0xFFF700, 0xFFFF88],
                size: { min: 3, max: 7 },
                duration: 600,
                pattern: 'sparkle',
                physics: { gravity: false, velocity: { min: 30, max: 80 } }
            },
            
            // Environmental effects
            shadowAmbient: {
                count: 2,
                colors: [0x8E44AD, 0x9B59B6, 0x663399],
                size: { min: 2, max: 4 },
                duration: 8000,
                pattern: 'ambient',
                physics: { gravity: false, velocity: { min: 10, max: 30 } }
            },
            
            forestAmbient: {
                count: 3,
                colors: [0x27AE60, 0x2ECC71, 0x58D68D],
                size: { min: 2, max: 5 },
                duration: 6000,
                pattern: 'ambient',
                physics: { gravity: false, velocity: { min: 15, max: 40 } }
            },
            
            crystalAmbient: {
                count: 2,
                colors: [0x3498DB, 0x5DADE2, 0x85C1E9],
                size: { min: 3, max: 6 },
                duration: 7000,
                pattern: 'ambient',
                physics: { gravity: false, velocity: { min: 12, max: 35 } }
            },
            
            // Special ability effects
            timeSlowAura: {
                count: 15,
                colors: [0x0066FF, 0x3388FF, 0x66AAFF],
                size: { min: 4, max: 8 },
                duration: 2000,
                pattern: 'aura',
                physics: { gravity: false, velocity: { min: 20, max: 60 } }
            },
            
            echoPhase: {
                count: 10,
                colors: [0x00FFFF, 0x44FFFF, 0x88FFFF],
                size: { min: 6, max: 12 },
                duration: 500,
                pattern: 'phase',
                physics: { gravity: false, velocity: { min: 80, max: 120 } }
            }
        };
    }
    
    // ==========================================
    // CORE EFFECT CREATION METHODS
    // ==========================================
    
    createEffect(type, x, y, options = {}) {
        const preset = this.effectPresets[type];
        if (!preset) {
            console.warn(`Unknown particle effect type: ${type}`);
            return;
        }
        
        // Merge options with preset
        const config = { ...preset, ...options };
        
        // Create particles based on pattern
        switch (config.pattern) {
            case 'ring':
                this.createRingPattern(x, y, config);
                break;
            case 'trail':
                this.createTrailPattern(x, y, config);
                break;
            case 'burst':
                this.createBurstPattern(x, y, config);
                break;
            case 'explosion':
                this.createExplosionPattern(x, y, config);
                break;
            case 'sparkle':
                this.createSparklePattern(x, y, config);
                break;
            case 'ambient':
                this.createAmbientPattern(x, y, config);
                break;
            case 'aura':
                this.createAuraPattern(x, y, config);
                break;
            case 'phase':
                this.createPhasePattern(x, y, config);
                break;
            case 'spark':
                this.createSparkPattern(x, y, config);
                break;
            default:
                this.createBurstPattern(x, y, config);
        }
    }
    
    createRingPattern(x, y, config) {
        const angleStep = (Math.PI * 2) / config.count;
        
        for (let i = 0; i < config.count; i++) {
            const angle = angleStep * i;
            const distance = 15 + Math.random() * 10;
            
            const particle = this.createParticle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                config
            );
            
            // Ring expansion animation
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * (distance + 40),
                y: y + Math.sin(angle) * (distance + 40),
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: config.duration,
                ease: 'Power2.easeOut',
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    createTrailPattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const particle = this.createParticle(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                config
            );
            
            // Trail fade animation
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: config.duration,
                delay: i * 50,
                ease: 'Power1.easeOut',
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    createBurstPattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Phaser.Math.Between(config.physics.velocity.min, config.physics.velocity.max);
            
            const particle = this.createParticle(x, y, config);
            
            const targetX = x + Math.cos(angle) * velocity;
            const targetY = y + Math.sin(angle) * velocity;
            
            this.animateParticle(particle, targetX, targetY, config);
        }
    }
    
    createExplosionPattern(x, y, config) {
        // Main explosion burst
        this.createBurstPattern(x, y, config);
        
        // Secondary shockwave
        this.scene.time.delayedCall(200, () => {
            const shockwave = this.scene.add.circle(x, y, 20, config.colors[0], 0.3);
            
            this.scene.tweens.add({
                targets: shockwave,
                scaleX: 4,
                scaleY: 4,
                alpha: 0,
                duration: 800,
                ease: 'Power2.easeOut',
                onComplete: () => shockwave.destroy()
            });
        });
    }
    
    createSparklePattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const particle = this.createParticle(
                x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-10, 10),
                config
            );
            
            // Sparkle rise animation
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 60,
                alpha: 0,
                scale: 1.8,
                rotation: Math.PI * 2,
                duration: config.duration,
                ease: 'Power2.easeOut',
                delay: i * 75,
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    createAmbientPattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const startX = Phaser.Math.Between(0, GAME_CONFIG.WORLD.WIDTH);
            const particle = this.createParticle(startX, -20, config);
            
            // Slow drift down
            this.scene.tweens.add({
                targets: particle,
                y: GAME_CONFIG.WORLD.HEIGHT + 50,
                x: startX + Phaser.Math.Between(-100, 100),
                alpha: 0,
                duration: config.duration,
                ease: 'Linear',
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    createAuraPattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const angle = (Math.PI * 2 / config.count) * i;
            const radius = 30 + Math.random() * 20;
            
            const particle = this.createParticle(
                x + Math.cos(angle) * radius,
                y + Math.sin(angle) * radius,
                config
            );
            
            // Orbital motion
            this.scene.tweens.add({
                targets: particle,
                rotation: Math.PI * 4,
                alpha: 0,
                duration: config.duration,
                ease: 'Power1.easeOut',
                onUpdate: () => {
                    // Keep particles orbiting around effect center
                    const progress = 1 - (particle.alpha || 0);
                    const currentRadius = radius + (progress * 40);
                    particle.x = x + Math.cos(angle + progress * Math.PI * 2) * currentRadius;
                    particle.y = y + Math.sin(angle + progress * Math.PI * 2) * currentRadius;
                },
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    createPhasePattern(x, y, config) {
        // Echo effect with multiple layers
        for (let layer = 0; layer < 3; layer++) {
            this.scene.time.delayedCall(layer * 100, () => {
                for (let i = 0; i < config.count; i++) {
                    const particle = this.createParticle(
                        x + Phaser.Math.Between(-25, 25),
                        y + Phaser.Math.Between(-25, 25),
                        config
                    );
                    
                    particle.setAlpha(0.8 - (layer * 0.2));
                    
                    this.scene.tweens.add({
                        targets: particle,
                        scaleX: 2 + layer,
                        scaleY: 2 + layer,
                        alpha: 0,
                        duration: config.duration + (layer * 200),
                        ease: 'Power2.easeOut',
                        onComplete: () => this.destroyParticle(particle)
                    });
                }
            });
        }
    }
    
    createSparkPattern(x, y, config) {
        for (let i = 0; i < config.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Phaser.Math.Between(100, 250);
            
            const particle = this.createParticle(x, y, config);
            
            // Spark trajectory
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * velocity * 0.3,
                y: y + Math.sin(angle) * velocity * 0.3,
                alpha: 0,
                scale: 0.2,
                rotation: Math.PI * 3,
                duration: config.duration,
                ease: 'Power3.easeOut',
                onComplete: () => this.destroyParticle(particle)
            });
        }
    }
    
    // ==========================================
    // PARTICLE CREATION & MANAGEMENT
    // ==========================================
    
    createParticle(x, y, config) {
        // Use pooled particle if available
        let particle = this.particlePool.pop();
        
        if (!particle) {
            // Create new particle
            const size = Phaser.Math.Between(config.size.min, config.size.max);
            const color = Phaser.Utils.Array.GetRandom(config.colors);
            
            particle = this.scene.add.circle(x, y, size, color, 0.9);
            particle.setDepth(1000);
        } else {
            // Reset pooled particle
            particle.setPosition(x, y);
            particle.setVisible(true);
            particle.setActive(true);
            particle.setAlpha(0.9);
            particle.setScale(1);
            particle.setRotation(0);
        }
        
        this.activeParticles.push(particle);
        this.particleCount++;
        
        return particle;
    }
    
    animateParticle(particle, targetX, targetY, config) {
        const duration = config.duration + Phaser.Math.Between(-100, 100);
        
        this.scene.tweens.add({
            targets: particle,
            x: targetX,
            y: targetY + (config.physics.gravity ? 20 : 0),
            alpha: 0,
            scale: Math.random() * 0.5 + 0.5,
            rotation: Math.random() * Math.PI * 2,
            duration: duration,
            ease: 'Power2.easeOut',
            onComplete: () => this.destroyParticle(particle)
        });
    }
    
    destroyParticle(particle) {
        if (!particle || !particle.active) return;
        
        // Remove from active list
        const index = this.activeParticles.indexOf(particle);
        if (index > -1) {
            this.activeParticles.splice(index, 1);
        }
        
        // Return to pool or destroy if pool is full
        if (this.particlePool.length < 100) {
            particle.setVisible(false);
            particle.setActive(false);
            this.particlePool.push(particle);
        } else {
            particle.destroy();
        }
        
        this.particleCount--;
    }
    
    // ==========================================
    // HIGH-LEVEL EFFECT METHODS
    // ==========================================
    
    playerJump(x, y, jumpCount = 1) {
        // Different effects based on jump number
        const effectIntensity = Math.min(jumpCount, 3);
        
        this.createEffect('jumpRing', x, y, {
            count: 6 + (effectIntensity * 2),
            colors: jumpCount === 1 ? [0x00FFFF] : 
                   jumpCount === 2 ? [0x00FFFF, 0x66CCFF] :
                   [0x00FFFF, 0x66CCFF, 0xFFFFFF]
        });
        
        // Add jump dust
        this.createEffect('landingImpact', x, y + 20, {
            count: 4,
            colors: [0x888888, 0x666666],
            size: { min: 2, max: 4 }
        });
    }
    
    playerDash(x, y, direction) {
        // Main dash trail
        this.createEffect('dashTrail', x, y);
        
        // Additional echo effects
        for (let i = 1; i <= 3; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                this.createEffect('echoPhase', x - (direction * i * 20), y, {
                    count: 5,
                    colors: [0x0099FF],
                    size: { min: 3, max: 6 }
                });
            });
        }
    }
    
    playerGroundSlam(x, y) {
        // Main impact explosion
        this.createEffect('explosion', x, y, {
            count: 25,
            colors: [0xFF4500, 0xFFAA00, 0xFFDD44]
        });
        
        // Shockwave rings
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                const ring = this.scene.add.circle(x, y, 10, 0xFF4500, 0.4);
                
                this.scene.tweens.add({
                    targets: ring,
                    scaleX: 4 + i,
                    scaleY: 2 + i * 0.5,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => ring.destroy()
                });
            });
        }
    }
    
    playerTimeSlow(x, y) {
        this.createEffect('timeSlowAura', x, y);
        
        // Time ripple effect
        const ripple = this.scene.add.circle(x, y, 50, 0x0066FF, 0.3);
        
        this.scene.tweens.add({
            targets: ripple,
            scaleX: 6,
            scaleY: 6,
            alpha: 0,
            duration: 1000,
            ease: 'Power1.easeOut',
            onComplete: () => ripple.destroy()
        });
    }
    
    enemyHit(x, y, enemyType = 'shadow') {
        const hitColors = {
            shadow: [0x8E44AD, 0xFFFFFF],
            forest: [0x27AE60, 0xFFFFFF],
            crystal: [0x3498DB, 0xFFFFFF],
            boss: [0xE74C3C, 0xFFD700]
        };
        
        this.createEffect('hitSpark', x, y, {
            colors: hitColors[enemyType] || hitColors.shadow
        });
    }
    
    enemyDeath(x, y, enemyType = 'shadow') {
        const deathColors = {
            shadow: [0x8E44AD, 0x9B59B6, 0x663399],
            forest: [0x27AE60, 0x2ECC71, 0x58D68D],
            crystal: [0x3498DB, 0x5DADE2, 0x85C1E9],
            boss: [0xE74C3C, 0xF1948A, 0xFFD700]
        };
        
        this.createEffect('explosion', x, y, {
            colors: deathColors[enemyType] || deathColors.shadow,
            count: 15
        });
    }
    
    collectItem(x, y, itemType) {
        const collectColors = {
            orb: [0x9B59B6, 0xD7BDE2],
            key: [0xF1C40F, 0xF7DC6F],
            crystal: [0x3498DB, 0x85C1E9],
            artifact: [0xE74C3C, 0xF1948A, 0xFFD700]
        };
        
        this.createEffect('collectSparkle', x, y, {
            colors: collectColors[itemType] || collectColors.orb
        });
        
        // Additional upward sparkles for special items
        if (itemType === 'artifact' || itemType === 'crystal') {
            this.createEffect('sparkle', x, y, {
                count: 12,
                colors: collectColors[itemType]
            });
        }
    }
    
    createEnvironmentalEffects(biomeType, intensity = 1) {
        const effectType = `${biomeType}Ambient`;
        
        if (this.effectPresets[effectType]) {
            // Create ambient particles across the screen
            for (let i = 0; i < intensity; i++) {
                const x = Phaser.Math.Between(0, GAME_CONFIG.WORLD.WIDTH);
                const y = Phaser.Math.Between(-100, 0);
                
                this.createEffect(effectType, x, y);
            }
        }
    }
    
    // ==========================================
    // CINEMATIC EFFECTS
    // ==========================================
    
    createBiomeTransitionEffect(fromBiome, toBiome) {
        console.log(`🌌 Biome transition: ${fromBiome} → ${toBiome}`);
        
        // Screen wipe effect
        const wipe = this.scene.add.rectangle(
            -this.scene.cameras.main.width,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.9
        ).setScrollFactor(0).setDepth(2500);
        
        this.scene.tweens.add({
            targets: wipe,
            x: this.scene.cameras.main.width * 1.5,
            duration: 1500,
            ease: 'Power2.easeInOut',
            onComplete: () => wipe.destroy()
        });
        
        // Transition particles
        this.createTransitionParticles(toBiome);
    }
    
    createTransitionParticles(biome) {
        const biomeColors = {
            shadow: [0x8E44AD, 0x9B59B6],
            forest: [0x27AE60, 0x2ECC71],
            crystal: [0x3498DB, 0x5DADE2],
            boss: [0xE74C3C, 0xF1948A]
        };
        
        const colors = biomeColors[biome] || biomeColors.shadow;
        
        for (let i = 0; i < 30; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const particle = this.createParticle(
                    Phaser.Math.Between(0, this.scene.cameras.main.width),
                    Phaser.Math.Between(0, this.scene.cameras.main.height),
                    {
                        colors: colors,
                        size: { min: 6, max: 12 },
                        duration: 2000
                    }
                );
                
                particle.setScrollFactor(0).setDepth(2400);
                
                this.scene.tweens.add({
                    targets: particle,
                    alpha: 0,
                    scale: 2,
                    rotation: Math.PI * 2,
                    duration: 2000,
                    onComplete: () => this.destroyParticle(particle)
                });
            });
        }
    }
    
    createVictoryExplosion(x, y) {
        // Epic victory fireworks
        const colors = [0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFED766];
        
        // Main explosion
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Phaser.Math.Between(100, 300);
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const particle = this.scene.add.circle(x, y, Phaser.Math.Between(6, 12), color, 0.9);
            particle.setDepth(2000);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * velocity,
                y: y + Math.sin(angle) * velocity - 50,
                alpha: 0,
                scale: 0.3,
                rotation: Math.PI * 4,
                duration: 2000 + Math.random() * 1000,
                ease: 'Power2.easeOut',
                onComplete: () => particle.destroy()
            });
        }
        
        // Secondary explosions
        for (let wave = 1; wave <= 4; wave++) {
            this.scene.time.delayedCall(wave * 300, () => {
                this.createEffect('explosion', 
                    x + Phaser.Math.Between(-100, 100),
                    y + Phaser.Math.Between(-50, 50),
                    {
                        count: 12,
                        colors: colors,
                        duration: 1500
                    }
                );
            });
        }
    }
    
    // ==========================================
    // PERFORMANCE & CLEANUP
    // ==========================================
    
    cleanup() {
        const now = Date.now();
        
        // Cleanup every 5 seconds
        if (now - this.lastCleanup > 5000) {
            this.performCleanup();
            this.lastCleanup = now;
        }
        
        // Emergency cleanup if too many particles
        if (this.particleCount > this.maxParticles) {
            this.emergencyCleanup();
        }
    }
    
    performCleanup() {
        // Remove inactive particles
        this.activeParticles = this.activeParticles.filter(particle => {
            if (!particle.active) {
                this.particleCount--;
                return false;
            }
            return true;
        });
        
        console.log(`🧯 Particle cleanup: ${this.particleCount} active particles`);
    }
    
    emergencyCleanup() {
        console.warn('⚠️ Emergency particle cleanup triggered!');
        
        // Destroy oldest particles
        const toDestroy = Math.min(100, this.activeParticles.length);
        
        for (let i = 0; i < toDestroy; i++) {
            const particle = this.activeParticles[i];
            if (particle && particle.active) {
                particle.destroy();
            }
        }
        
        this.activeParticles.splice(0, toDestroy);
        this.particleCount -= toDestroy;
    }
    
    getPerformanceStats() {
        return {
            activeParticles: this.particleCount,
            pooledParticles: this.particlePool.length,
            maxParticles: this.maxParticles,
            utilizationPercent: Math.round((this.particleCount / this.maxParticles) * 100)
        };
    }
    
    destroy() {
        // Clean up all particles
        this.activeParticles.forEach(particle => {
            if (particle && particle.active) {
                particle.destroy();
            }
        });
        
        this.particlePool.forEach(particle => {
            if (particle && particle.active) {
                particle.destroy();
            }
        });
        
        this.activeParticles = [];
        this.particlePool = [];
        this.particleCount = 0;
        
        console.log('✨ Particle system destroyed and cleaned up');
    }
}

// ==========================================
// SPECIALIZED EFFECT CLASSES
// ==========================================

class ScreenEffects {
    constructor(scene) {
        this.scene = scene;
    }
    
    flashScreen(color = 0xFFFFFF, intensity = 0.7, duration = 300) {
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            color, intensity
        ).setScrollFactor(0).setDepth(3000);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: duration,
            onComplete: () => flash.destroy()
        });
    }
    
    createColorOverlay(color, alpha, duration, fadeOut = true) {
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            color, alpha
        ).setScrollFactor(0).setDepth(2000);
        
        if (fadeOut) {
            this.scene.tweens.add({
                targets: overlay,
                alpha: 0,
                duration: duration,
                onComplete: () => overlay.destroy()
            });
        }
        
        return overlay;
    }
    
    shakeScreen(duration = 200, intensity = 0.03) {
        this.scene.cameras.main.shake(duration, intensity);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AdvancedParticleSystem, 
        ScreenEffects 
    };
}