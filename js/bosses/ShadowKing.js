// Shadow King - Ultimate Boss Battle System
// Epic multi-phase final boss with advanced AI and cinematic presentation

class ShadowKing extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Boss core properties
        this.scene = scene;
        this.maxHealth = 400;
        this.health = this.maxHealth;
        this.width = 80;
        this.height = 120;
        this.attackDamage = 35;
        
        // Phase system
        this.phase = 1;
        this.maxPhase = 4;
        this.phaseTransitioning = false;
        this.invulnerable = false;
        
        // Combat state
        this.state = 'idle'; // idle, attacking, teleporting, summoning, enraged
        this.attackTimer = 0;
        this.attackCooldown = 2000; // ms between attacks
        this.lastAttackTime = 0;
        
        // Movement and positioning
        this.floatOffset = 0;
        this.baseY = y;
        this.teleportCooldown = 0;
        this.canTeleport = true;
        
        // Attack patterns
        this.attackQueue = [];
        this.currentAttack = null;
        this.comboCounter = 0;
        
        // Visual effects
        this.shadowAura = null;
        this.crownGlow = null;
        this.healthBar = null;
        
        // Minions
        this.minions = [];
        this.maxMinions = 3;
        this.minionSpawnCooldown = 0;
        
        this.createVisuals();
        this.setupPhaseSystem();
        this.setupAttackPatterns();
        this.initializeBossUI();
        
        // Add to physics
        this.body.setSize(this.width, this.height);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);
        
        console.log('👑 Shadow King awakens for the ultimate battle!');
    }
    
    createVisuals() {
        // Main body
        this.bossBody = this.scene.add.rectangle(0, 0, this.width, this.height, 0x2C1810);
        this.bossBody.setStrokeStyle(3, 0x1A0D1A);
        this.add(this.bossBody);
        
        // Crown
        this.crown = this.scene.add.container(0, -this.height/2 - 20);
        
        // Crown base
        const crownBase = this.scene.add.rectangle(0, 0, 50, 15, 0xFFD700);
        this.crown.add(crownBase);
        
        // Crown spikes
        for (let i = 0; i < 5; i++) {
            const spike = this.scene.add.triangle(
                (i - 2) * 10, -7,
                0, -15, 5, 0, -5, 0,
                0xFFD700
            );
            this.crown.add(spike);
        }
        
        this.add(this.crown);
        
        // Eyes
        this.leftEye = this.scene.add.circle(-15, -20, 6, 0xFF0000);
        this.rightEye = this.scene.add.circle(15, -20, 6, 0xFF0000);
        this.add([this.leftEye, this.rightEye]);
        
        // Shadow aura
        this.createShadowAura();
        
        // Add to enemies group
        this.scene.enemies.add(this);
    }
    
    createShadowAura() {
        this.shadowAura = this.scene.add.circle(0, 0, 120, 0x8E44AD, 0.2);
        this.add(this.shadowAura);
        
        // Pulsing aura animation
        this.scene.tweens.add({
            targets: this.shadowAura,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.1,
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    setupPhaseSystem() {
        this.phaseConfig = {
            1: {
                name: 'Awakening',
                healthThreshold: 1.0,
                attackSpeed: 1.0,
                abilities: ['shadowBolt', 'teleport'],
                color: 0x8E44AD,
                description: 'The Shadow King emerges from eternal slumber...'
            },
            2: {
                name: 'Rising Fury',
                healthThreshold: 0.75,
                attackSpeed: 1.3,
                abilities: ['shadowBolt', 'teleport', 'shadowWave'],
                color: 0xA569BD,
                description: 'Ancient power courses through the Shadow King!'
            },
            3: {
                name: 'Dimensional Rage',
                healthThreshold: 0.5,
                attackSpeed: 1.6,
                abilities: ['shadowBolt', 'teleport', 'shadowWave', 'summonMinions'],
                color: 0xBB8FCE,
                description: 'Reality bends to the Shadow King\'s will!'
            },
            4: {
                name: 'Final Desperation',
                healthThreshold: 0.25,
                attackSpeed: 2.0,
                abilities: ['shadowBolt', 'teleport', 'shadowWave', 'summonMinions', 'realityRift'],
                color: 0xD7BDE2,
                description: 'The Shadow King unleashes everything!'
            }
        };
    }
    
    setupAttackPatterns() {
        this.attacks = {
            shadowBolt: {
                name: 'Shadow Bolt',
                cooldown: 1500,
                energyCost: 0,
                execute: () => this.castShadowBolt()
            },
            shadowWave: {
                name: 'Shadow Wave', 
                cooldown: 3000,
                energyCost: 0,
                execute: () => this.castShadowWave()
            },
            teleport: {
                name: 'Shadow Teleport',
                cooldown: 4000,
                energyCost: 0,
                execute: () => this.performTeleport()
            },
            summonMinions: {
                name: 'Summon Shadows',
                cooldown: 8000,
                energyCost: 0,
                execute: () => this.summonMinions()
            },
            realityRift: {
                name: 'Reality Rift',
                cooldown: 12000,
                energyCost: 0,
                execute: () => this.createRealityRift()
            }
        };
    }
    
    initializeBossUI() {
        // Boss health bar
        const barY = 50;
        this.healthBarBg = this.scene.add.rectangle(
            this.scene.cameras.main.centerX, barY, 400, 25, 0x000000, 0.8
        ).setScrollFactor(0).setDepth(1500);
        
        this.healthBarFill = this.scene.add.rectangle(
            this.scene.cameras.main.centerX, barY, 400, 25, 0xE74C3C
        ).setScrollFactor(0).setDepth(1501);
        
        // Boss name
        this.nameText = this.scene.add.text(
            this.scene.cameras.main.centerX, barY - 35,
            '👑 SHADOW KING 👑',
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1502);
        
        // Phase indicator
        this.phaseText = this.scene.add.text(
            this.scene.cameras.main.centerX, barY + 35,
            '',
            {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1502);
        
        this.updateBossUI();
    }
    
    update() {
        // Floating animation
        this.floatOffset += 0.03;
        this.y = this.baseY + Math.sin(this.floatOffset) * 8;
        
        // Update timers
        this.updateCooldowns();
        
        // Check phase transitions
        this.checkPhaseTransition();
        
        // AI behavior
        this.updateAI();
        
        // Update minions
        this.updateMinions();
        
        // Update visuals
        this.updateVisuals();
        
        // Update UI
        this.updateBossUI();
    }
    
    updateCooldowns() {
        const deltaTime = this.scene.game.loop.delta;
        
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= deltaTime;
        }
        
        if (this.minionSpawnCooldown > 0) {
            this.minionSpawnCooldown -= deltaTime;
        }
        
        // Update attack cooldowns
        Object.values(this.attacks).forEach(attack => {
            if (attack.lastUsed && Date.now() - attack.lastUsed < attack.cooldown) {
                // Attack on cooldown
            }
        });
    }
    
    checkPhaseTransition() {
        const healthPercent = this.health / this.maxHealth;
        let newPhase = 1;
        
        if (healthPercent <= 0.25) newPhase = 4;
        else if (healthPercent <= 0.5) newPhase = 3;
        else if (healthPercent <= 0.75) newPhase = 2;
        
        if (newPhase > this.phase && !this.phaseTransitioning) {
            this.initiatePhaseTransition(newPhase);
        }
    }
    
    initiatePhaseTransition(newPhase) {
        this.phaseTransitioning = true;
        this.invulnerable = true;
        this.state = 'transitioning';
        
        const phaseInfo = this.phaseConfig[newPhase];
        
        // Phase transition effects
        this.scene.cameras.main.shake(500, 0.04);
        this.createPhaseTransitionEffect();
        
        // Show phase message
        this.showPhaseMessage(phaseInfo);
        
        // Update appearance
        this.scene.tweens.add({
            targets: this.bossBody,
            tint: phaseInfo.color,
            duration: 1000,
            ease: 'Power2.easeOut'
        });
        
        // Complete transition after effects
        this.scene.time.delayedCall(3000, () => {
            this.phase = newPhase;
            this.phaseTransitioning = false;
            this.invulnerable = false;
            this.state = 'idle';
            this.attackCooldown *= (1 / phaseInfo.attackSpeed); // Faster attacks
        });
        
        console.log(`👑 Shadow King enters Phase ${newPhase}: ${phaseInfo.name}`);
    }
    
    createPhaseTransitionEffect() {
        // Explosion of shadow particles
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const distance = 100;
            const particle = this.scene.add.circle(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                8, 0x8E44AD, 0.8
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 200,
                y: this.y + Math.sin(angle) * 200,
                alpha: 0,
                scale: 0.2,
                duration: 1500,
                onComplete: () => particle.destroy()
            });
        }
        
        // Screen flash
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xFFFFFF, 0.8
        ).setScrollFactor(0).setDepth(2000);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
    }
    
    showPhaseMessage(phaseInfo) {
        const messageText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 100,
            `${phaseInfo.name.toUpperCase()}\n${phaseInfo.description}`,
            {
                fontFamily: 'Arial',
                fontSize: 28,
                color: '#FF6B6B',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        // Message animation
        this.scene.tweens.add({
            targets: messageText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            ease: 'Elastic.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: messageText,
                    alpha: 0,
                    duration: 1500,
                    delay: 500,
                    onComplete: () => messageText.destroy()
                });
            }
        });
    }
    
    updateAI() {
        if (this.phaseTransitioning) return;
        
        const player = this.scene.player;
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const currentTime = Date.now();
        
        // Choose attack based on distance, phase, and timing
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            this.chooseAndExecuteAttack(player, distanceToPlayer);
        }
        
        // Special phase-based behaviors
        this.executePhaseSpecificBehavior(player, distanceToPlayer);
    }
    
    chooseAndExecuteAttack(player, distance) {
        const phaseInfo = this.phaseConfig[this.phase];
        const availableAttacks = phaseInfo.abilities;
        
        let selectedAttack;
        
        // Intelligent attack selection based on situation
        if (distance > 200 && availableAttacks.includes('teleport') && this.canTeleport) {
            selectedAttack = 'teleport';
        } else if (distance < 100 && availableAttacks.includes('shadowWave')) {
            selectedAttack = 'shadowWave';
        } else if (this.minions.length < this.maxMinions && availableAttacks.includes('summonMinions')) {
            selectedAttack = 'summonMinions';
        } else if (this.phase === 4 && availableAttacks.includes('realityRift') && Math.random() < 0.3) {
            selectedAttack = 'realityRift';
        } else {
            selectedAttack = 'shadowBolt';
        }
        
        // Execute the chosen attack
        if (this.attacks[selectedAttack]) {
            this.attacks[selectedAttack].execute();
            this.attacks[selectedAttack].lastUsed = Date.now();
            this.lastAttackTime = Date.now();
        }
    }
    
    executePhaseSpecificBehavior(player, distance) {
        // Phase-specific passive behaviors
        switch (this.phase) {
            case 1:
                // Basic floating movement
                break;
            case 2:
                // Aggressive positioning
                this.moveTowardsPlayer(player, 0.5);
                break;
            case 3:
                // Erratic movement
                this.moveTowardsPlayer(player, 0.8);
                break;
            case 4:
                // Desperate final phase
                this.moveTowardsPlayer(player, 1.2);
                if (Math.random() < 0.1) {
                    this.createChaosEffect();
                }
                break;
        }
    }
    
    moveTowardsPlayer(player, intensity) {
        const targetX = player.x + (Math.sin(this.floatOffset) * 100);
        const directionX = targetX > this.x ? 1 : -1;
        
        this.x += directionX * intensity * 0.5;
    }
    
    // ==========================================
    // ATTACK IMPLEMENTATIONS
    // ==========================================
    
    castShadowBolt() {
        const player = this.scene.player;
        const boltCount = this.phase; // More bolts in later phases
        
        for (let i = 0; i < boltCount; i++) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const spreadAngle = angle + (i - boltCount/2) * 0.3;
            
            this.createShadowBolt(spreadAngle, 300 + (this.phase * 50));
        }
        
        // Visual feedback
        this.scene.tweens.add({
            targets: this.bossBody,
            scaleX: 1.2,
            scaleY: 0.8,
            duration: 300,
            yoyo: true
        });
        
        this.scene.playSound('enemyAttack', { volume: 1.5 });
    }
    
    createShadowBolt(angle, speed) {
        const bolt = this.scene.add.circle(this.x, this.y, 8, 0x663399, 0.9);
        this.scene.physics.add.existing(bolt);
        
        // Movement
        bolt.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        bolt.body.setCollideWorldBounds(false);
        
        // Visual trail
        const trail = this.scene.add.rectangle(this.x, this.y, 20, 6, 0x663399, 0.6);
        trail.rotation = angle;
        
        // Trail follows bolt
        this.scene.tweens.add({
            targets: trail,
            x: bolt.x,
            y: bolt.y,
            duration: 2000,
            onComplete: () => trail.destroy()
        });
        
        // Collision with player
        this.scene.physics.add.overlap(bolt, this.scene.player, (bolt, player) => {
            if (!player.invulnerable) {
                player.takeDamage(this.attackDamage);
                this.createImpactEffect(bolt.x, bolt.y);
            }
            bolt.destroy();
        });
        
        // Auto-destroy after time
        this.scene.time.delayedCall(3000, () => {
            if (bolt.active) {
                bolt.destroy();
                if (trail.active) trail.destroy();
            }
        });
    }
    
    castShadowWave() {
        // Circular wave attack
        const waveCount = 8 + (this.phase * 2);
        
        for (let i = 0; i < waveCount; i++) {
            const angle = (Math.PI * 2 / waveCount) * i;
            
            this.scene.time.delayedCall(i * 100, () => {
                this.createShadowBolt(angle, 250);
            });
        }
        
        // Screen effect
        this.scene.cameras.main.shake(200, 0.03);
        
        console.log('🌊 Shadow King casts Shadow Wave!');
    }
    
    performTeleport() {
        if (!this.canTeleport) return;
        
        this.canTeleport = false;
        this.teleportCooldown = 5000;
        
        // Disappear effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 500,
            onComplete: () => {
                // Teleport to new position
                const player = this.scene.player;
                const teleportOptions = [
                    { x: player.x + 200, y: player.y - 100 },
                    { x: player.x - 200, y: player.y - 100 },
                    { x: player.x, y: player.y - 200 },
                    { x: player.x + 150, y: player.y - 150 },
                    { x: player.x - 150, y: player.y - 150 }
                ];
                
                const newPos = Phaser.Utils.Array.GetRandom(teleportOptions);
                this.x = Phaser.Math.Clamp(newPos.x, 100, GAME_CONFIG.WORLD.WIDTH - 100);
                this.y = Phaser.Math.Clamp(newPos.y, 100, 400);
                this.baseY = this.y;
                
                // Reappear effect
                this.createTeleportEffect();
                
                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 500,
                    onComplete: () => {
                        // Immediate attack after teleport
                        this.castShadowBolt();
                    }
                });
            }
        });
        
        console.log('✨ Shadow King teleports!');
    }
    
    createTeleportEffect() {
        // Teleport arrival particles
        for (let i = 0; i < 20; i++) {
            const particle = this.scene.add.circle(
                this.x + Phaser.Math.Between(-60, 60),
                this.y + Phaser.Math.Between(-60, 60),
                6, 0x8E44AD, 0.8
            );
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 2,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    summonMinions() {
        const minionCount = Math.min(this.maxMinions - this.minions.length, 2 + this.phase);
        
        for (let i = 0; i < minionCount; i++) {
            this.scene.time.delayedCall(i * 500, () => {
                const minion = new ShadowMinion(
                    this.scene,
                    this.x + Phaser.Math.Between(-100, 100),
                    this.y + 50
                );
                this.minions.push(minion);
            });
        }
        
        this.minionSpawnCooldown = 10000;
        
        console.log(`👥 Shadow King summons ${minionCount} minions!`);
    }
    
    createRealityRift() {
        // Ultimate phase 4 attack
        console.log('🌌 Shadow King tears reality itself!');
        
        // Create multiple rifts
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 800, () => {
                this.createSingleRift();
            });
        }
        
        // Screen distortion effect
        this.scene.cameras.main.shake(1000, 0.08);
    }
    
    createSingleRift() {
        const riftX = Phaser.Math.Between(100, GAME_CONFIG.WORLD.WIDTH - 100);
        const riftY = Phaser.Math.Between(200, 500);
        
        // Rift visual
        const rift = this.scene.add.ellipse(riftX, riftY, 60, 120, 0x000000, 0.9);
        rift.setStrokeStyle(4, 0x8E44AD, 1);
        
        // Rift particles
        for (let i = 0; i < 15; i++) {
            const particle = this.scene.add.circle(
                riftX + Phaser.Math.Between(-30, 30),
                riftY + Phaser.Math.Between(-60, 60),
                4, 0x663399, 0.7
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: riftX,
                y: riftY,
                alpha: 0,
                duration: 2000,
                onComplete: () => particle.destroy()
            });
        }
        
        // Damage zone
        this.scene.physics.add.overlap(rift, this.scene.player, (rift, player) => {
            if (!player.invulnerable) {
                player.takeDamage(25);
            }
        });
        
        // Rift lifetime
        this.scene.time.delayedCall(5000, () => {
            if (rift.active) rift.destroy();
        });
    }
    
    updateMinions() {
        // Remove destroyed minions from tracking
        this.minions = this.minions.filter(minion => minion.active);
        
        // Reset teleport cooldown if timer expired
        if (this.teleportCooldown <= 0 && !this.canTeleport) {
            this.canTeleport = true;
        }
    }
    
    updateVisuals() {
        // Eye glow based on phase
        const glowIntensity = 0.3 + (this.phase * 0.2);
        this.leftEye.setAlpha(0.7 + Math.sin(this.floatOffset * 2) * glowIntensity);
        this.rightEye.setAlpha(0.7 + Math.sin(this.floatOffset * 2) * glowIntensity);
        
        // Crown glow
        this.crown.list.forEach(piece => {
            if (piece.type === 'Rectangle' || piece.type === 'Triangle') {
                piece.setAlpha(0.8 + Math.sin(this.floatOffset) * 0.2);
            }
        });
    }
    
    updateBossUI() {
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFill.scaleX = healthPercent;
        
        // Health bar color based on phase
        const healthColors = {
            1: 0xE74C3C, // Red
            2: 0xF39C12, // Orange  
            3: 0x8E44AD, // Purple
            4: 0x2C3E50  // Dark blue
        };
        this.healthBarFill.setFillStyle(healthColors[this.phase]);
        
        // Phase display
        const phaseInfo = this.phaseConfig[this.phase];
        this.phaseText.setText(`Phase ${this.phase}: ${phaseInfo.name}`);
    }
    
    createImpactEffect(x, y) {
        // Impact particles
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                x + Phaser.Math.Between(-15, 15),
                y + Phaser.Math.Between(-15, 15),
                5, 0xFF6B6B, 0.9
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-40, 40),
                y: particle.y + Phaser.Math.Between(-40, 40),
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    createChaosEffect() {
        // Phase 4 chaos effect
        const chaosParticles = 10;
        
        for (let i = 0; i < chaosParticles; i++) {
            const particle = this.scene.add.circle(
                this.x + Phaser.Math.Between(-50, 50),
                this.y + Phaser.Math.Between(-50, 50),
                4, Phaser.Display.Color.RandomRGB().color, 0.7
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-100, 100),
                y: particle.y + Phaser.Math.Between(-100, 100),
                alpha: 0,
                rotation: Math.PI * 4,
                duration: 1000,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        this.health = Math.max(0, this.health - amount);
        
        // Damage flash
        this.scene.tweens.add({
            targets: this.bossBody,
            tint: 0xFFFFFF,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                const phaseInfo = this.phaseConfig[this.phase];
                this.bossBody.setTint(phaseInfo.color);
            }
        });
        
        // Damage particles
        this.createImpactEffect(this.x, this.y);
        
        if (this.health <= 0) {
            this.onDefeat();
        }
    }
    
    onDefeat() {
        console.log('👑 The Shadow King has been defeated!');
        
        // Epic death sequence
        this.invulnerable = true;
        this.state = 'defeated';
        
        // Remove UI
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBarFill) this.healthBarFill.destroy();
        if (this.nameText) this.nameText.destroy();
        if (this.phaseText) this.phaseText.destroy();
        
        // Death animation
        this.createDeathEffect();
        
        // Trigger victory after death animation
        this.scene.time.delayedCall(3000, () => {
            this.scene.handleGameComplete();
        });
    }
    
    createDeathEffect() {
        // Epic explosion
        this.scene.cameras.main.shake(1000, 0.1);
        
        // Multiple explosion waves
        for (let wave = 0; wave < 5; wave++) {
            this.scene.time.delayedCall(wave * 400, () => {
                for (let i = 0; i < 15; i++) {
                    const angle = (Math.PI * 2 / 15) * i;
                    const distance = 50 + (wave * 30);
                    
                    const particle = this.scene.add.circle(
                        this.x + Math.cos(angle) * distance,
                        this.y + Math.sin(angle) * distance,
                        10, 0xFFD700, 0.9
                    );
                    
                    this.scene.tweens.add({
                        targets: particle,
                        scale: 3,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => particle.destroy()
                    });
                }
            });
        }
        
        // Boss disappears
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            rotation: Math.PI * 4,
            duration: 2000,
            onComplete: () => this.destroy()
        });
    }
}

// ==========================================
// SHADOW MINION CLASS
// ==========================================

class ShadowMinion extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, {
            type: 'minion',
            health: 25,
            speed: 120,
            damage: 15,
            color: 0x663399,
            width: 20,
            height: 24,
            detectionRange: 180
        });
        
        this.lifetime = 15000; // Auto-destroy after 15 seconds
        this.spawnTime = Date.now();
        
        // Spawn effect
        this.createSpawnEffect();
        
        console.log('👤 Shadow Minion spawned!');
    }
    
    createSpawnEffect() {
        // Spawn particles
        for (let i = 0; i < 10; i++) {
            const particle = this.scene.add.circle(
                this.x + Phaser.Math.Between(-20, 20),
                this.y + Phaser.Math.Between(-20, 20),
                3, 0x663399, 0.8
            );
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 2,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    update() {
        super.update();
        
        // Auto-destroy after lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.onDestroy();
        }
    }
    
    performAttack(player) {
        super.performAttack(player);
        
        // Quick lunge attack
        const direction = player.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * 200);
        this.body.setVelocityY(-100);
        
        // Attack particles
        this.scene.player.particleSystem.createImpactExplosion(
            this.x, this.y, 0x663399
        );
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShadowKing, ShadowMinion };
}