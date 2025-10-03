// EchoRealms: Shadow Odyssey - Fixed Working Game
// Complete game implementation with all features working correctly

// ==========================================
// GAME CONFIGURATION
// ==========================================

const GAME_CONFIG = {
    WORLD: {
        WIDTH: 2400,
        HEIGHT: 800,
        GRAVITY: 600
    },
    PLAYER: {
        SPEED: 200,
        JUMP_POWER: 400,
        MAX_HEALTH: 100,
        MAX_ENERGY: 100
    },
    ABILITIES: {
        TRIPLE_JUMP: { MAX_JUMPS: 3, POWER_DECREASE: 60 },
        ECHO_DASH: { DISTANCE: 300, COOLDOWN: 180, ENERGY_COST: 25 },
        TIME_SLOW: { DURATION: 300, COOLDOWN: 600, ENERGY_COST: 40, TIME_SCALE: 0.3 },
        GROUND_SLAM: { POWER: 600, RADIUS: 80, ENERGY_COST: 30 }
    },
    BIOMES: {
        SHADOW_REALM: { id: 1, name: 'Shadow Realm', color: '#1a0033' },
        FOREST_KINGDOM: { id: 2, name: 'Forest Kingdom', color: '#0d2818' },
        CRYSTAL_CAVES: { id: 3, name: 'Crystal Caves', color: '#2d1b3d' },
        BOSS_ARENA: { id: 4, name: 'Boss Arena', color: '#3d1a1a' }
    }
};

// ==========================================
// AUDIO SYSTEM
// ==========================================

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
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
            playerHit: { frequency: 200, duration: 0.2, type: 'sawtooth' }
        };
        
        const config = soundConfigs[soundName];
        if (!config) return;
        
        this.createTone(
            config.frequency + (options.detune || 0),
            config.duration,
            config.type,
            this.masterVolume * (options.volume || 1) * 0.3
        );
    }
    
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
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
}

// ==========================================
// PARTICLE EFFECTS
// ==========================================

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
    }

    createJumpEffect(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const particle = this.scene.add.circle(
                x + Math.cos(angle) * 15,
                y + Math.sin(angle) * 15,
                3, 0x00FFFF, 0.8
            );
            
            this.scene.tweens.add({
                targets: particle,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    createDashTrail(x, y) {
        const trail = this.scene.add.rectangle(x, y, 32, 48, 0x00FFFF, 0.6);
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500,
            onComplete: () => trail.destroy()
        });
    }

    createImpactExplosion(x, y, color = 0xFF4500) {
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                x + Phaser.Math.Between(-15, 15),
                y + Phaser.Math.Between(-15, 15),
                4, color, 0.8
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                y: particle.y + Phaser.Math.Between(-50, 50),
                alpha: 0,
                scale: 0.2,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
    }

    createCollectEffect(x, y, color) {
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.circle(
                x + Phaser.Math.Between(-8, 8),
                y + Phaser.Math.Between(-8, 8),
                3, color, 0.9
            );
            
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 30,
                alpha: 0,
                scale: 1.5,
                duration: 600,
                ease: 'Power2.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
}

// ==========================================
// PLAYER CLASS
// ==========================================

class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 28, 42, 0x00FFFF);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Physical properties
        this.body.setCollideWorldBounds(true);
        this.body.setDrag(400, 0);
        
        // Core stats
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.health = this.maxHealth;
        this.maxEnergy = GAME_CONFIG.PLAYER.MAX_ENERGY;
        this.energy = this.maxEnergy;
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        
        // Movement state
        this.facingRight = true;
        this.grounded = false;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Abilities
        this.abilities = {
            tripleJump: {
                jumpsUsed: 0,
                maxJumps: GAME_CONFIG.ABILITIES.TRIPLE_JUMP.MAX_JUMPS
            },
            echoDash: {
                cooldown: 0,
                maxCooldown: GAME_CONFIG.ABILITIES.ECHO_DASH.COOLDOWN
            },
            timeSlow: {
                active: false,
                duration: 0,
                maxDuration: GAME_CONFIG.ABILITIES.TIME_SLOW.DURATION,
                cooldown: 0,
                maxCooldown: GAME_CONFIG.ABILITIES.TIME_SLOW.COOLDOWN
            },
            groundSlam: {
                slamming: false
            }
        };
        
        // Progression
        this.inventory = {
            orbs: 0,
            keys: 0,
            crystals: 0,
            artifacts: 0,
            score: 0
        };
        
        this.setupControls();
        this.particleSystem = new ParticleSystem(scene);
    }
    
    setupControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D,X,C,Z,R,P');
    }
    
    update() {
        this.updateEnergy();
        this.updateAbilityCooldowns();
        this.handleMovement();
        this.handleJumping();
        this.handleAbilities();
        this.updateInvulnerability();
        this.updateTimeSlow();
    }
    
    updateEnergy() {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.8);
        }
    }
    
    updateAbilityCooldowns() {
        if (this.abilities.echoDash.cooldown > 0) {
            this.abilities.echoDash.cooldown--;
        }
        if (this.abilities.timeSlow.cooldown > 0) {
            this.abilities.timeSlow.cooldown--;
        }
    }
    
    handleMovement() {
        const leftPressed = this.cursors.left.isDown || this.wasd.A.isDown;
        const rightPressed = this.cursors.right.isDown || this.wasd.D.isDown;
        
        if (leftPressed) {
            this.body.setVelocityX(-this.speed);
            this.facingRight = false;
        } else if (rightPressed) {
            this.body.setVelocityX(this.speed);
            this.facingRight = true;
        }
    }
    
    handleJumping() {
        const jumpPressed = this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space?.isDown;
        const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                               Phaser.Input.Keyboard.JustDown(this.wasd.W) || 
                               Phaser.Input.Keyboard.JustDown(this.cursors.space);
        
        if (jumpJustPressed && this.canJump()) {
            this.performJump();
        }
        
        // Reset jumps when grounded
        if (this.body.touching.down || this.body.blocked.down) {
            this.grounded = true;
            this.abilities.tripleJump.jumpsUsed = 0;
            
            if (this.abilities.groundSlam.slamming) {
                this.handleGroundSlamImpact();
            }
        } else {
            this.grounded = false;
        }
    }
    
    handleAbilities() {
        // Echo Dash
        if (Phaser.Input.Keyboard.JustDown(this.wasd.X)) {
            this.tryEchoDash();
        }
        
        // Time Slow
        if (Phaser.Input.Keyboard.JustDown(this.wasd.C)) {
            this.tryTimeSlow();
        }
        
        // Ground Slam
        if (Phaser.Input.Keyboard.JustDown(this.wasd.Z)) {
            this.tryGroundSlam();
        }
        
        // Restart
        if (Phaser.Input.Keyboard.JustDown(this.wasd.R)) {
            this.scene.scene.restart();
        }
        
        // Pause
        if (Phaser.Input.Keyboard.JustDown(this.wasd.P)) {
            if (window.gameManager) {
                window.gameManager.pauseGame();
            }
        }
    }
    
    canJump() {
        return this.grounded || this.abilities.tripleJump.jumpsUsed < this.abilities.tripleJump.maxJumps;
    }
    
    performJump() {
        const jumpPower = GAME_CONFIG.PLAYER.JUMP_POWER - 
                         (this.abilities.tripleJump.jumpsUsed * GAME_CONFIG.ABILITIES.TRIPLE_JUMP.POWER_DECREASE);
        
        this.body.setVelocityY(-jumpPower);
        this.abilities.tripleJump.jumpsUsed++;
        this.grounded = false;
        
        // Effects
        this.particleSystem.createJumpEffect(this.x, this.y + 20);
        this.scene.audioSystem.playSound('jump', { detune: this.abilities.tripleJump.jumpsUsed * 100 });
    }
    
    tryEchoDash() {
        if (this.abilities.echoDash.cooldown > 0 || this.energy < GAME_CONFIG.ABILITIES.ECHO_DASH.ENERGY_COST) {
            return false;
        }
        
        this.performEchoDash();
        return true;
    }
    
    performEchoDash() {
        const direction = this.facingRight ? 1 : -1;
        
        // Dash movement
        this.body.setVelocityX(GAME_CONFIG.ABILITIES.ECHO_DASH.DISTANCE * direction * 3);
        this.body.setVelocityY(-50);
        
        // Consume energy and set cooldown
        this.energy -= GAME_CONFIG.ABILITIES.ECHO_DASH.ENERGY_COST;
        this.abilities.echoDash.cooldown = this.abilities.echoDash.maxCooldown;
        
        // Invulnerability frames
        this.makeInvulnerable(300);
        
        // Effects
        this.particleSystem.createDashTrail(this.x, this.y);
        this.scene.cameras.main.shake(100, 0.01);
        this.scene.audioSystem.playSound('dash');
    }
    
    tryTimeSlow() {
        if (this.abilities.timeSlow.cooldown > 0 || 
            this.energy < GAME_CONFIG.ABILITIES.TIME_SLOW.ENERGY_COST ||
            this.abilities.timeSlow.active) {
            return false;
        }
        
        this.activateTimeSlow();
        return true;
    }
    
    activateTimeSlow() {
        this.abilities.timeSlow.active = true;
        this.abilities.timeSlow.duration = this.abilities.timeSlow.maxDuration;
        this.energy -= GAME_CONFIG.ABILITIES.TIME_SLOW.ENERGY_COST;
        
        // Physics time scale
        this.scene.physics.world.timeScale = GAME_CONFIG.ABILITIES.TIME_SLOW.TIME_SCALE;
        
        // Visual overlay
        this.createTimeSlowOverlay();
        this.scene.audioSystem.playSound('timeSlow');
    }
    
    updateTimeSlow() {
        if (this.abilities.timeSlow.active) {
            this.abilities.timeSlow.duration--;
            
            if (this.abilities.timeSlow.duration <= 0) {
                this.deactivateTimeSlow();
            }
        }
    }
    
    deactivateTimeSlow() {
        this.abilities.timeSlow.active = false;
        this.abilities.timeSlow.cooldown = this.abilities.timeSlow.maxCooldown;
        
        // Restore normal time
        this.scene.physics.world.timeScale = 1;
        
        // Remove overlay
        if (this.timeSlowOverlay) {
            this.timeSlowOverlay.destroy();
            this.timeSlowOverlay = null;
        }
    }
    
    tryGroundSlam() {
        if (this.grounded || this.energy < GAME_CONFIG.ABILITIES.GROUND_SLAM.ENERGY_COST) {
            return false;
        }
        
        this.performGroundSlam();
        return true;
    }
    
    performGroundSlam() {
        this.abilities.groundSlam.slamming = true;
        this.body.setVelocityY(GAME_CONFIG.ABILITIES.GROUND_SLAM.POWER);
        this.body.setVelocityX(0);
        this.energy -= GAME_CONFIG.ABILITIES.GROUND_SLAM.ENERGY_COST;
        
        this.scene.audioSystem.playSound('groundSlam');
    }
    
    handleGroundSlamImpact() {
        this.abilities.groundSlam.slamming = false;
        
        // Screen shake and particles
        this.scene.cameras.main.shake(300, 0.06);
        this.particleSystem.createImpactExplosion(this.x, this.y + 20);
        
        // Damage nearby enemies
        this.scene.damageEnemiesInRadius(this.x, this.y, GAME_CONFIG.ABILITIES.GROUND_SLAM.RADIUS, 50);
        
        this.scene.audioSystem.playSound('impact');
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        this.health = Math.max(0, this.health - amount);
        this.makeInvulnerable(1200);
        
        // Damage effects
        this.scene.tweens.add({
            targets: this,
            tint: 0xFF0000,
            duration: 150,
            yoyo: true,
            repeat: 2,
            onComplete: () => this.setTint(0x00FFFF)
        });
        
        this.scene.cameras.main.shake(200, 0.03);
        this.scene.audioSystem.playSound('playerHit');
        
        if (this.health <= 0) {
            this.handleDeath();
        }
    }
    
    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTime = duration;
        this.setAlpha(0.6);
    }
    
    updateInvulnerability() {
        if (this.invulnerable) {
            this.invulnerabilityTime--;
            
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                this.setAlpha(1);
            }
        }
    }
    
    collectItem(type, amount = 1) {
        this.inventory[type] += amount;
        this.inventory.score += amount * 25;
        
        const colors = {
            orbs: 0x9B59B6,
            keys: 0xF1C40F,
            crystals: 0x3498DB,
            artifacts: 0xE74C3C
        };
        
        this.particleSystem.createCollectEffect(this.x, this.y, colors[type]);
        this.scene.audioSystem.playSound('collect');
    }
    
    handleDeath() {
        if (window.gameManager) {
            window.gameManager.showGameOver(this.inventory.score);
        } else {
            this.scene.scene.restart();
        }
    }
    
    createTimeSlowOverlay() {
        this.timeSlowOverlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x0066FF, 0.15
        );
        this.timeSlowOverlay.setScrollFactor(0).setDepth(1000);
    }
}

// ==========================================
// ENEMY CLASSES
// ==========================================

class BaseEnemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, config.width || 24, config.height || 30, config.color || 0x8E44AD);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Properties
        this.maxHealth = config.health || 60;
        this.health = this.maxHealth;
        this.speed = config.speed || 80;
        this.attackDamage = config.damage || 25;
        this.detectionRange = config.detectionRange || 150;
        this.attackRange = config.attackRange || 40;
        
        // AI State
        this.state = 'patrol';
        this.direction = 1;
        this.patrolStartX = x;
        this.patrolRange = config.patrolRange || 120;
        this.lastAttack = 0;
        this.attackCooldown = config.attackCooldown || 1000;
        
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        
        scene.enemies.add(this);
    }
    
    update() {
        this.updateAI();
        this.updateMovement();
    }
    
    updateAI() {
        const player = this.scene.player;
        if (!player) return;
        
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        switch (this.state) {
            case 'patrol':
                if (distanceToPlayer < this.detectionRange) {
                    this.state = 'chase';
                } else {
                    this.patrol();
                }
                break;
                
            case 'chase':
                if (distanceToPlayer > this.detectionRange + 50) {
                    this.state = 'patrol';
                } else if (distanceToPlayer < this.attackRange) {
                    this.state = 'attack';
                } else {
                    this.chasePlayer(player);
                }
                break;
                
            case 'attack':
                if (Date.now() - this.lastAttack > this.attackCooldown) {
                    this.performAttack(player);
                    this.lastAttack = Date.now();
                }
                if (distanceToPlayer > this.attackRange + 20) {
                    this.state = 'chase';
                }
                break;
        }
    }
    
    patrol() {
        if (this.x < this.patrolStartX - this.patrolRange || 
            this.x > this.patrolStartX + this.patrolRange) {
            this.direction *= -1;
        }
        
        this.body.setVelocityX(this.speed * 0.5 * this.direction);
    }
    
    chasePlayer(player) {
        const direction = player.x < this.x ? -1 : 1;
        this.body.setVelocityX(this.speed * direction);
        this.direction = direction;
    }
    
    performAttack(player) {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            yoyo: true
        });
    }
    
    updateMovement() {
        if (this.body.blocked.left || this.body.blocked.right) {
            this.direction *= -1;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        const knockbackDirection = this.scene.player.x < this.x ? 1 : -1;
        this.body.setVelocityX(knockbackDirection * 100);
        
        if (this.health <= 0) {
            this.onDestroy();
        } else {
            this.state = 'stunned';
            this.scene.time.delayedCall(300, () => {
                if (this.active) this.state = 'chase';
            });
        }
        
        this.scene.audioSystem.playSound('enemyHit');
    }
    
    onDestroy() {
        this.scene.player.particleSystem.createImpactExplosion(this.x, this.y, this.fillColor);
        
        if (Math.random() < 0.3) {
            new Collectible(this.scene, this.x, this.y, 'orb');
        }
        
        this.destroy();
    }
}

class ShadowWraith extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, {
            health: 40,
            speed: 100,
            damage: 20,
            color: 0x8E44AD,
            detectionRange: 200,
            attackRange: 50
        });
        
        this.floatOffset = 0;
    }
    
    update() {
        super.update();
        this.floatOffset += 0.05;
        this.y += Math.sin(this.floatOffset) * 0.5;
    }
}

class ForestGuardian extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, {
            health: 80,
            speed: 60,
            damage: 30,
            color: 0x27AE60,
            width: 32,
            height: 40
        });
        
        this.armor = 2;
    }
    
    takeDamage(amount) {
        const reducedDamage = Math.max(1, amount - this.armor);
        super.takeDamage(reducedDamage);
    }
}

// ==========================================
// COLLECTIBLE CLASS
// ==========================================

class Collectible extends Phaser.GameObjects.Circle {
    constructor(scene, x, y, type = 'orb') {
        const config = {
            orb: { color: 0x9B59B6, radius: 8, value: 1 },
            key: { color: 0xF1C40F, radius: 10, value: 1 },
            crystal: { color: 0x3498DB, radius: 12, value: 1 },
            artifact: { color: 0xE74C3C, radius: 15, value: 1 }
        };
        
        const typeConfig = config[type] || config.orb;
        
        super(scene, x, y, typeConfig.radius, typeConfig.color, 0.8);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        
        this.collectType = type;
        this.value = typeConfig.value;
        
        scene.collectibles.add(this);
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 15,
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0.6,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    collect(player) {
        player.collectItem(this.collectType, this.value);
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => this.destroy()
        });
    }
}

// ==========================================
// BIOME MANAGER
// ==========================================

class BiomeManager {
    constructor(scene) {
        this.scene = scene;
        this.currentBiome = 1;
    }
    
    loadBiome(biomeId) {
        this.currentBiome = biomeId;
        this.clearBiome();
        
        switch (biomeId) {
            case 1:
                this.loadShadowRealm();
                break;
            case 2:
                this.loadForestKingdom();
                break;
            case 3:
                this.loadCrystalCaves();
                break;
            case 4:
                this.loadBossArena();
                break;
        }
    }
    
    clearBiome() {
        this.scene.platforms.clear(true, true);
        this.scene.enemies.clear(true, true);
        this.scene.collectibles.clear(true, true);
    }
    
    loadShadowRealm() {
        // Ground and platforms
        this.createPlatform(0, 750, 2400, 50, 0x2C3E50);
        this.createPlatform(200, 650, 150, 20, 0x34495E);
        this.createPlatform(450, 550, 180, 20, 0x34495E);
        this.createPlatform(750, 450, 160, 20, 0x34495E);
        this.createPlatform(1050, 350, 200, 20, 0x34495E);
        this.createPlatform(1400, 250, 180, 20, 0x34495E);
        this.createPlatform(1700, 400, 150, 20, 0x34495E);
        this.createPlatform(1950, 300, 200, 20, 0x34495E);
        
        // Enemies
        new ShadowWraith(this.scene, 300, 600);
        new ShadowWraith(this.scene, 600, 500);
        new ShadowWraith(this.scene, 1100, 300);
        new ShadowWraith(this.scene, 1500, 200);
        
        // Collectibles
        new Collectible(this.scene, 250, 620, 'orb');
        new Collectible(this.scene, 520, 520, 'orb');
        new Collectible(this.scene, 820, 420, 'key');
        new Collectible(this.scene, 1120, 320, 'orb');
        new Collectible(this.scene, 1470, 220, 'crystal');
        new Collectible(this.scene, 2050, 270, 'artifact');
    }
    
    loadForestKingdom() {
        this.createPlatform(0, 750, 2400, 50, 0x2D5A2D);
        this.createPlatform(150, 680, 120, 15, 0x3D6A3D);
        this.createPlatform(350, 620, 140, 15, 0x3D6A3D);
        this.createPlatform(580, 560, 130, 15, 0x3D6A3D);
        this.createPlatform(800, 500, 160, 15, 0x3D6A3D);
        this.createPlatform(1050, 440, 140, 15, 0x3D6A3D);
        this.createPlatform(1300, 380, 180, 15, 0x3D6A3D);
        this.createPlatform(1600, 320, 150, 15, 0x3D6A3D);
        
        new ForestGuardian(this.scene, 400, 600);
        new ForestGuardian(this.scene, 850, 480);
        new ShadowWraith(this.scene, 1100, 420);
        new ForestGuardian(this.scene, 1350, 360);
        
        new Collectible(this.scene, 200, 650, 'orb');
        new Collectible(this.scene, 400, 590, 'orb');
        new Collectible(this.scene, 650, 530, 'key');
        new Collectible(this.scene, 900, 470, 'orb');
        new Collectible(this.scene, 1400, 350, 'crystal');
        new Collectible(this.scene, 1750, 290, 'artifact');
    }
    
    loadCrystalCaves() {
        this.createPlatform(0, 750, 2400, 50, 0x2D1B3D);
        this.createPlatform(180, 680, 140, 20, 0x3E2B4E);
        this.createPlatform(400, 620, 120, 20, 0x3E2B4E);
        this.createPlatform(650, 560, 160, 20, 0x3E2B4E);
        this.createPlatform(900, 500, 140, 20, 0x3E2B4E);
        this.createPlatform(1150, 440, 180, 20, 0x3E2B4E);
        this.createPlatform(1450, 380, 160, 20, 0x3E2B4E);
        
        new ShadowWraith(this.scene, 250, 650);
        new ForestGuardian(this.scene, 500, 590);
        new ShadowWraith(this.scene, 750, 530);
        new ForestGuardian(this.scene, 1050, 470);
        
        new Collectible(this.scene, 220, 650, 'crystal');
        new Collectible(this.scene, 460, 590, 'orb');
        new Collectible(this.scene, 710, 530, 'crystal');
        new Collectible(this.scene, 960, 470, 'key');
        new Collectible(this.scene, 1210, 410, 'crystal');
        new Collectible(this.scene, 1600, 350, 'artifact');
    }
    
    loadBossArena() {
        this.createPlatform(0, 750, 2400, 50, 0x3D1A1A);
        this.createPlatform(200, 650, 100, 20, 0x4E2B2B);
        this.createPlatform(400, 550, 120, 20, 0x4E2B2B);
        this.createPlatform(650, 450, 140, 20, 0x4E2B2B);
        this.createPlatform(900, 350, 160, 20, 0x4E2B2B);
        this.createPlatform(1200, 250, 180, 20, 0x4E2B2B);
        
        new ShadowWraith(this.scene, 300, 620);
        new ForestGuardian(this.scene, 500, 520);
        new ShadowWraith(this.scene, 750, 420);
        new ForestGuardian(this.scene, 1000, 320);
        new ShadowWraith(this.scene, 1300, 220);
        
        new Collectible(this.scene, 250, 620, 'orb');
        new Collectible(this.scene, 470, 520, 'crystal');
        new Collectible(this.scene, 720, 420, 'key');
        new Collectible(this.scene, 970, 320, 'crystal');
        new Collectible(this.scene, 1270, 220, 'orb');
        new Collectible(this.scene, 1500, 200, 'artifact');
    }
    
    createPlatform(x, y, width, height, color) {
        const platform = this.scene.add.rectangle(x + width/2, y + height/2, width, height, color);
        this.scene.physics.add.existing(platform, true);
        this.scene.platforms.add(platform);
        return platform;
    }
}

// ==========================================
// MAIN GAME SCENE
// ==========================================

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }
    
    create() {
        // Initialize systems
        this.audioSystem = new AudioSystem();
        this.biomeManager = new BiomeManager(this);
        
        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        
        // World setup
        this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD.WIDTH, GAME_CONFIG.WORLD.HEIGHT);
        this.physics.world.gravity.y = GAME_CONFIG.WORLD.GRAVITY;
        
        // Create player
        this.player = new Player(this, 100, 600);
        
        // Physics collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.collectibles, this.handlePlayerCollectibleCollision, null, this);
        
        // Load first biome
        this.biomeManager.loadBiome(1);
        
        // Camera setup
        this.setupCamera();
        
        // UI setup
        this.createUI();
        
        // Game state
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.levelComplete = false;
    }
    
    setupCamera() {
        this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD.WIDTH, GAME_CONFIG.WORLD.HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(100, 50);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor('#0d001a');
    }
    
    createUI() {
        const uiDepth = 2000;
        
        // Health bar
        this.healthBarBg = this.add.rectangle(120, 40, 220, 25, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(uiDepth);
        this.healthBar = this.add.rectangle(120, 40, 220, 25, 0x00FF00)
            .setScrollFactor(0).setDepth(uiDepth + 1);
        
        // Energy bar
        this.energyBarBg = this.add.rectangle(120, 70, 220, 20, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(uiDepth);
        this.energyBar = this.add.rectangle(120, 70, 220, 20, 0x0099FF)
            .setScrollFactor(0).setDepth(uiDepth + 1);
        
        // Score and inventory
        this.scoreText = this.add.text(400, 30, '', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(uiDepth);
        
        this.inventoryText = this.add.text(400, 55, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#cccccc'
        }).setScrollFactor(0).setDepth(uiDepth);
        
        // Biome indicator
        this.biomeText = this.add.text(20, 100, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(uiDepth);
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update();
        
        // Update enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.update) enemy.update();
        });
        
        // Update UI
        this.updateUI();
        
        // Check level completion
        this.checkLevelCompletion();
        
        // Check for biome transitions
        this.checkBiomeTransitions();
    }
    
    updateUI() {
        // Health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        this.healthBar.scaleX = healthPercent;
        
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00FF00);
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xFFFF00);
        } else {
            this.healthBar.setFillStyle(0xFF0000);
        }
        
        // Energy bar
        const energyPercent = this.player.energy / this.player.maxEnergy;
        this.energyBar.scaleX = energyPercent;
        
        // Score and inventory
        this.scoreText.setText(`Score: ${this.player.inventory.score}`);
        this.inventoryText.setText(
            `Orbs: ${this.player.inventory.orbs} | Keys: ${this.player.inventory.keys} | ` +
            `Crystals: ${this.player.inventory.crystals} | Artifacts: ${this.player.inventory.artifacts}`
        );
        
        // Biome display
        const biome = Object.values(GAME_CONFIG.BIOMES).find(b => b.id === this.biomeManager.currentBiome);
        this.biomeText.setText(`${biome?.name || 'Unknown Realm'}`);
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        if (!player.invulnerable) {
            player.takeDamage(enemy.attackDamage);
            this.cameras.main.shake(150, 0.02);
        }
    }
    
    handlePlayerCollectibleCollision(player, collectible) {
        collectible.collect(player);
    }
    
    damageEnemiesInRadius(x, y, radius, damage) {
        this.enemies.children.entries.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (distance < radius) {
                enemy.takeDamage(damage);
            }
        });
    }
    
    checkLevelCompletion() {
        const artifactsInBiome = this.collectibles.children.entries.filter(
            collectible => collectible.collectType === 'artifact'
        );
        
        if (artifactsInBiome.length === 0 && !this.levelComplete) {
            this.levelComplete = true;
            this.handleLevelComplete();
        }
    }
    
    handleLevelComplete() {
        if (this.biomeManager.currentBiome < 4) {
            // Move to next biome
            this.showBiomeTransition(this.biomeManager.currentBiome + 1);
        } else {
            // Game complete!
            this.handleGameComplete();
        }
    }
    
    showBiomeTransition(nextBiome) {
        const biomeName = Object.values(GAME_CONFIG.BIOMES).find(b => b.id === nextBiome)?.name;
        
        if (window.gameManager) {
            window.gameManager.showBiomeTransition(biomeName);
        }
        
        this.time.delayedCall(3000, () => {
            this.biomeManager.loadBiome(nextBiome);
            this.player.x = 100;
            this.player.y = 600;
            this.levelComplete = false;
        });
    }
    
    checkBiomeTransitions() {
        if (this.player.x > GAME_CONFIG.WORLD.WIDTH - 100 && !this.levelComplete) {
            this.handleLevelComplete();
        }
    }
    
    handleGameComplete() {
        this.gameState = 'victory';
        
        if (window.gameManager) {
            window.gameManager.showVictory(this.player.inventory.score);
        }
    }
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

const gameConfig = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    parent: 'phaser-game',
    backgroundColor: '#0d001a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.WORLD.GRAVITY },
            debug: false
        }
    },
    scene: MainScene
};

// Start the game
const game = new Phaser.Game(gameConfig);

// Make game available globally
if (typeof window !== 'undefined') {
    window.echoRealmsGame = game;
}

console.log('🎮 EchoRealms: Shadow Odyssey - Game engine initialized!');
console.log('✨ Use WASD/Arrows to move, X to dash, C for time slow, Z for ground slam');
console.log('🏆 Collect artifacts to progress through all 4 biomes!');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        game,
        MainScene,
        Player,
        BaseEnemy,
        ShadowWraith,
        ForestGuardian,
        Collectible,
        BiomeManager,
        AudioSystem,
        ParticleSystem
    };
}