// Master Level Design System
// Hand-crafted levels with progressive difficulty and organic skill teaching
// Designed for both casual exploration and speedrun mastery

class MasterLevelDesigner {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.totalLevels = 16;
        
        // Level design principles
        this.designPrinciples = {
            PROGRESSIVE_DIFFICULTY: true,
            ORGANIC_TEACHING: true,
            MULTIPLE_SOLUTIONS: true,
            RISK_REWARD_BALANCE: true,
            EXPLORATION_REWARDS: true,
            SPEEDRUN_FRIENDLY: true
        };
        
        // Shared level elements
        this.levelElements = {
            platforms: [],
            enemies: [],
            collectibles: [],
            secrets: [],
            checkpoints: [],
            hazards: []
        };
        
        console.log('🏰 Master Level Designer initialized - Creating memorable experiences!');
    }
    
    // ==========================================
    // MAIN LEVEL LOADING SYSTEM
    // ==========================================
    
    loadLevel(levelId, biome) {
        console.log(`🎮 Loading Level ${levelId} in ${biome} biome`);
        
        // Clear previous level
        this.clearLevel();
        
        // Load specific level design
        switch (biome) {
            case 'shadow':
                this.loadShadowRealmLevel(levelId);
                break;
            case 'forest':
                this.loadForestKingdomLevel(levelId);
                break;
            case 'crystal':
                this.loadCrystalCavesLevel(levelId);
                break;
            case 'boss':
                this.loadBossArenaLevel(levelId);
                break;
        }
        
        // Apply level-specific enhancements
        this.applyLevelEnhancements(levelId, biome);
        
        // Create physics collisions
        this.setupPhysics();
        
        console.log(`✨ Level ${levelId} loaded with ${this.levelElements.platforms.length} platforms, ${this.levelElements.enemies.length} enemies`);
    }
    
    // ==========================================
    // SHADOW REALM LEVELS (Tutorial + Atmosphere)
    // ==========================================
    
    loadShadowRealmLevel(levelId) {
        switch (levelId) {
            case 1:
                this.createShadowLevel1_Introduction();
                break;
            case 2:
                this.createShadowLevel2_TripleJump();
                break;
            case 3:
                this.createShadowLevel3_EchoDash();
                break;
            case 4:
                this.createShadowLevel4_CombinedSkills();
                break;
        }
    }
    
    createShadowLevel1_Introduction() {
        // LEVEL 1: Basic movement and world introduction
        // Teaching: Walking, jumping, basic enemy avoidance
        
        // Ground and basic platforms
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2C3E50);
        
        // Gentle introduction platforms - perfectly spaced for learning
        this.addPlatform(200, 680, 120, 20, 'basic', 0x34495E);
        this.addPlatform(400, 630, 140, 20, 'basic', 0x34495E);
        this.addPlatform(600, 580, 120, 20, 'basic', 0x34495E);
        this.addPlatform(800, 530, 160, 20, 'basic', 0x34495E);
        
        // Safe teaching enemy (slow, predictable)
        this.addEnemy(350, 650, 'shadowTutorial', {
            speed: 40,
            attackDamage: 10,
            detectionRange: 80,
            patrolRange: 60
        });
        
        // Reward progression with collectibles
        this.addCollectible(250, 650, 'orb');
        this.addCollectible(450, 600, 'orb');
        this.addCollectible(650, 550, 'orb');
        this.addCollectible(850, 500, 'key'); // Key = significant reward
        
        // Hidden secret area (teaches exploration)
        this.addSecretArea(100, 600, [
            { x: 100, y: 650, width: 80, height: 20 },
            { x: 50, y: 600, width: 60, height: 15 }
        ], 'orb');
        
        // Checkpoint
        this.addCheckpoint(500, 600);
    }
    
    createShadowLevel2_TripleJump() {
        // LEVEL 2: Teaching triple jump through necessity
        // Teaching: Multi-jump timing, vertical navigation
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2C3E50);
        
        // Platforms that REQUIRE triple jump (impossible with single jump)
        this.addPlatform(150, 680, 100, 20, 'basic', 0x34495E);
        this.addPlatform(350, 580, 120, 20, 'basic', 0x34495E); // Gap forces double jump
        this.addPlatform(600, 460, 100, 20, 'basic', 0x34495E);  // Gap forces triple jump
        this.addPlatform(850, 380, 140, 20, 'basic', 0x34495E);
        
        // Vertical tower section
        this.addPlatform(1200, 650, 80, 15, 'small', 0x34495E);
        this.addPlatform(1300, 550, 80, 15, 'small', 0x34495E);
        this.addPlatform(1200, 450, 80, 15, 'small', 0x34495E);
        this.addPlatform(1300, 350, 80, 15, 'small', 0x34495E);
        
        // Enemies positioned to teach jump timing
        this.addEnemy(380, 560, 'shadow', { patrolRange: 40 });
        this.addEnemy(630, 440, 'shadow', { patrolRange: 30 });
        
        // Rewards at challenging positions
        this.addCollectible(180, 650, 'orb');
        this.addCollectible(380, 550, 'orb');
        this.addCollectible(630, 430, 'crystal'); // High-value reward for skill
        this.addCollectible(1330, 320, 'key');
        
        // Secret requires mastery of triple jump
        this.addSecretArea(1500, 200, [
            { x: 1500, y: 300, width: 60, height: 15 },
            { x: 1450, y: 250, width: 40, height: 15 },
            { x: 1520, y: 200, width: 80, height: 15 }
        ], 'artifact');
        
        this.addCheckpoint(700, 440);
        this.addCheckpoint(1350, 330);
    }
    
    createShadowLevel3_EchoDash() {
        // LEVEL 3: Teaching echo dash through designed challenges
        // Teaching: Dash timing, dash-jump combinations, advanced mobility
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2C3E50);
        
        // Gaps that require dash to cross
        this.addPlatform(150, 650, 100, 20, 'basic', 0x34495E);
        this.addPlatform(400, 650, 120, 20, 'basic', 0x34495E); // 150px gap - needs dash
        
        // Dash-jump combination required
        this.addPlatform(700, 550, 100, 20, 'basic', 0x34495E);
        this.addPlatform(950, 450, 120, 20, 'basic', 0x34495E); // Dash + jump required
        
        // Vertical dash challenge
        this.addPlatform(1200, 600, 80, 15, 'small', 0x34495E);
        this.addPlatform(1350, 550, 60, 15, 'small', 0x34495E);
        this.addPlatform(1500, 500, 80, 15, 'small', 0x34495E);
        
        // Dash through enemies (invulnerability frames teaching)
        this.addEnemy(470, 620, 'shadow');
        this.addEnemy(800, 520, 'shadow');
        this.addEnemy(1000, 420, 'shadow');
        
        // Collectibles positioned to reward good dashing
        this.addCollectible(460, 620, 'orb');
        this.addCollectible(760, 520, 'orb');
        this.addCollectible(1010, 420, 'crystal');
        
        // Advanced secret - dash sequence required
        this.addSecretArea(1600, 350, [
            { x: 1600, y: 400, width: 40, height: 10 },
            { x: 1720, y: 380, width: 40, height: 10 },
            { x: 1840, y: 360, width: 40, height: 10 },
            { x: 1960, y: 340, width: 60, height: 15 }
        ], 'artifact');
        
        this.addCheckpoint(500, 630);
        this.addCheckpoint(1100, 430);
    }
    
    createShadowLevel4_CombinedSkills() {
        // LEVEL 4: Shadow Realm finale - combines all learned skills
        // Teaching: Skill combinations, advanced techniques, preparation for Forest
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2C3E50);
        
        // Complex platforming sequence
        this.addPlatform(180, 680, 80, 15, 'small', 0x34495E);
        this.addPlatform(350, 600, 60, 15, 'small', 0x34495E); // Triple jump gap
        this.addPlatform(580, 520, 80, 15, 'small', 0x34495E); // Dash required
        this.addPlatform(780, 440, 60, 15, 'small', 0x34495E); // Dash-jump combo
        this.addPlatform(1000, 380, 100, 20, 'basic', 0x34495E);
        
        // Advanced enemy positioning
        this.addEnemy(220, 650, 'shadowAdvanced', {
            speed: 80,
            detectionRange: 150,
            attackDamage: 20
        });
        this.addEnemy(620, 490, 'shadowAdvanced');
        this.addEnemy(1050, 350, 'shadowAdvanced');
        
        // Time-slow teaching section
        this.addHazard(1200, 600, 'movingSpikes', {
            width: 200,
            height: 20,
            speed: 100,
            damage: 30
        });
        
        // Final challenge before forest
        this.addPlatform(1500, 300, 100, 20, 'basic', 0x34495E);
        this.addPlatform(1750, 250, 120, 20, 'basic', 0x34495E);
        
        // Boss-level enemy as preview
        this.addEnemy(1800, 220, 'shadowElite', {
            health: 80,
            speed: 100,
            attackDamage: 25,
            abilities: ['shadowBolt']
        });
        
        // Rewards for mastery
        this.addCollectible(200, 650, 'orb');
        this.addCollectible(400, 570, 'crystal');
        this.addCollectible(820, 410, 'orb');
        this.addCollectible(1550, 270, 'key');
        this.addCollectible(2000, 220, 'artifact'); // Level completion reward
        
        // Master secret (requires all abilities)
        this.addMasterSecret(1300, 150, 'artifact');
        
        this.addCheckpoint(600, 500);
        this.addCheckpoint(1100, 360);
        this.addCheckpoint(1600, 280);
    }
    
    // ==========================================
    // FOREST KINGDOM LEVELS (Vertical Challenges)
    // ==========================================
    
    loadForestKingdomLevel(levelId) {
        switch (levelId) {
            case 5:
                this.createForestLevel1_VerticalIntroduction();
                break;
            case 6:
                this.createForestLevel2_TimingChallenges();
                break;
            case 7:
                this.createForestLevel3_EnvironmentalPuzzles();
                break;
            case 8:
                this.createForestLevel4_GuardianGauntlet();
                break;
        }
    }
    
    createForestLevel1_VerticalIntroduction() {
        // Teaching: Vertical navigation, new biome mechanics
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2D5A2D);
        
        // Tree trunk climbing section
        this.addPlatform(200, 680, 40, 80, 'trunk', 0x8B4513);
        this.addPlatform(180, 640, 80, 15, 'branch', 0x3D6A3D);
        this.addPlatform(220, 580, 80, 15, 'branch', 0x3D6A3D);
        this.addPlatform(180, 520, 80, 15, 'branch', 0x3D6A3D);
        
        // Canopy platforming
        this.addPlatform(350, 460, 100, 15, 'branch', 0x3D6A3D);
        this.addPlatform(520, 400, 120, 15, 'branch', 0x3D6A3D);
        this.addPlatform(720, 340, 100, 15, 'branch', 0x3D6A3D);
        
        // Forest Guardians (new enemy type)
        this.addEnemy(400, 440, 'forestGuardian', {
            health: 60,
            armor: 2,
            speed: 50,
            attackPattern: 'charge'
        });
        
        this.addEnemy(750, 320, 'forestGuardian');
        
        // Nature-themed collectibles
        this.addCollectible(210, 610, 'orb');
        this.addCollectible(380, 430, 'orb');
        this.addCollectible(550, 370, 'crystal');
        this.addCollectible(750, 310, 'key');
        
        this.addCheckpoint(300, 640);
        this.addCheckpoint(600, 380);
    }
    
    createForestLevel2_TimingChallenges() {
        // Teaching: Precise timing, moving platforms
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2D5A2D);
        
        // Moving platform section
        this.addMovingPlatform(200, 650, 100, 20, 'vertical', {
            distance: 100,
            speed: 60,
            delay: 0
        });
        
        this.addMovingPlatform(450, 550, 80, 20, 'horizontal', {
            distance: 150,
            speed: 80,
            delay: 1000
        });
        
        this.addMovingPlatform(700, 450, 100, 20, 'circular', {
            radius: 80,
            speed: 50,
            centerX: 700,
            centerY: 400
        });
        
        // Timing-based enemy challenges
        this.addEnemy(500, 520, 'forestPatroller', {
            patrolRange: 120,
            speed: 70,
            timing: 'predictable'
        });
        
        // Swinging vine mechanics (advanced)
        this.addVine(900, 200, 400, 30); // Vine swing point
        
        // Collectibles reward good timing
        this.addCollectible(250, 620, 'orb');
        this.addCollectible(500, 520, 'crystal');
        this.addCollectible(750, 420, 'orb');
        this.addCollectible(950, 350, 'artifact');
        
        this.addCheckpoint(400, 600);
        this.addCheckpoint(800, 430);
    }
    
    // ==========================================
    // CRYSTAL CAVES LEVELS (Precision Platforming)
    // ==========================================
    
    loadCrystalCavesLevel(levelId) {
        switch (levelId) {
            case 9:
                this.createCrystalLevel1_PrecisionIntro();
                break;
            case 10:
                this.createCrystalLevel2_AbilityCombos();
                break;
            case 11:
                this.createCrystalLevel3_CrystalMaze();
                break;
            case 12:
                this.createCrystalLevel4_PreBossChallenges();
                break;
        }
    }
    
    createCrystalLevel1_PrecisionIntro() {
        // Teaching: Precision movement, crystal mechanics
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x2D1B3D);
        
        // Narrow precision platforms
        this.addPlatform(200, 680, 60, 15, 'crystal', 0x3E2B4E);
        this.addPlatform(320, 620, 50, 15, 'crystal', 0x3E2B4E);
        this.addPlatform(430, 560, 60, 15, 'crystal', 0x3E2B4E);
        
        // Crystal formations (interactive elements)
        this.addCrystalFormation(500, 500, 'resonance', {
            effect: 'jump_boost',
            duration: 3000
        });
        
        // Precision enemy placement
        this.addEnemy(350, 600, 'crystalSentinel', {
            attackPattern: 'laser',
            precision: true
        });
        
        this.addCollectible(230, 650, 'crystal');
        this.addCollectible(350, 590, 'crystal');
        this.addCollectible(460, 530, 'orb');
        
        this.addCheckpoint(400, 540);
    }
    
    // ==========================================
    // BOSS ARENA LEVELS (Ultimate Challenges)
    // ==========================================
    
    loadBossArenaLevel(levelId) {
        switch (levelId) {
            case 13:
                this.createBossLevel1_ArenaApproach();
                break;
            case 14:
                this.createBossLevel2_MiniBosses();
                break;
            case 15:
                this.createBossLevel3_ShadowKingPrep();
                break;
            case 16:
                this.createBossLevel4_FinalShowdown();
                break;
        }
    }
    
    createBossLevel4_FinalShowdown() {
        // THE ULTIMATE BOSS ARENA
        // Multi-tiered arena designed for epic Shadow King battle
        
        this.addPlatform(0, 750, 2400, 50, 'ground', 0x3D1A1A);
        
        // Arena structure - multiple levels for dynamic combat
        // Lower arena
        this.addPlatform(300, 650, 200, 20, 'arena', 0x4E2B2B);
        this.addPlatform(800, 650, 200, 20, 'arena', 0x4E2B2B);
        
        // Mid-level platforms
        this.addPlatform(150, 550, 120, 20, 'arena', 0x4E2B2B);
        this.addPlatform(600, 550, 140, 20, 'arena', 0x4E2B2B);
        this.addPlatform(1050, 550, 120, 20, 'arena', 0x4E2B2B);
        
        // Upper sanctuary platforms  
        this.addPlatform(400, 450, 100, 20, 'arena', 0x4E2B2B);
        this.addPlatform(800, 350, 120, 20, 'arena', 0x4E2B2B);
        
        // The Shadow King boss spawn point
        this.addBossSpawnPoint(600, 300, 'shadowKing');
        
        // Strategic collectibles for boss fight
        this.addCollectible(200, 520, 'key');    // Health restore
        this.addCollectible(1100, 520, 'key');   // Health restore
        this.addCollectible(450, 420, 'crystal'); // Energy restore
        this.addCollectible(850, 320, 'artifact'); // Victory reward
        
        // Checkpoints for boss fight
        this.addCheckpoint(300, 630);
        this.addCheckpoint(1000, 630);
        
        console.log('👑 Shadow King arena prepared for epic final battle!');
    }
    
    // ==========================================
    // LEVEL ELEMENT CREATION METHODS
    // ==========================================
    
    addPlatform(x, y, width, height, type, color) {
        const platform = this.scene.add.rectangle(x + width/2, y + height/2, width, height, color);
        this.scene.physics.add.existing(platform, true);
        this.scene.platforms.add(platform);
        
        // Add visual enhancements based on type
        this.enhancePlatform(platform, type);
        
        this.levelElements.platforms.push({
            object: platform,
            type: type,
            x: x, y: y, width: width, height: height
        });
        
        return platform;
    }
    
    enhancePlatform(platform, type) {
        switch (type) {
            case 'crystal':
                // Add crystal glow
                platform.setStrokeStyle(2, 0x3498DB, 0.8);
                this.scene.tweens.add({
                    targets: platform,
                    alpha: 0.8,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
                break;
                
            case 'branch':
                // Add organic texture simulation
                platform.setStrokeStyle(1, 0x8B4513, 0.6);
                break;
                
            case 'arena':
                // Boss arena platforms have special properties
                platform.setStrokeStyle(3, 0xE74C3C, 0.7);
                break;
        }
    }
    
    addEnemy(x, y, type, config = {}) {
        let enemy;
        
        switch (type) {
            case 'shadowTutorial':
                enemy = new BaseEnemy(this.scene, x, y, {
                    ...config,
                    type: 'shadow',
                    health: 30,
                    color: 0x8E44AD
                });
                break;
                
            case 'forestGuardian':
                enemy = new ForestGuardian(this.scene, x, y);
                break;
                
            case 'crystalSentinel':
                enemy = new BaseEnemy(this.scene, x, y, {
                    ...config,
                    type: 'crystal',
                    health: 70,
                    color: 0x3498DB,
                    abilities: ['crystal_laser']
                });
                break;
                
            default:
                enemy = new ShadowWraith(this.scene, x, y);
        }
        
        this.levelElements.enemies.push(enemy);
        return enemy;
    }
    
    addCollectible(x, y, type) {
        const collectible = new Collectible(this.scene, x, y, type);
        this.levelElements.collectibles.push(collectible);
        return collectible;
    }
    
    addMovingPlatform(x, y, width, height, moveType, config) {
        const platform = this.addPlatform(x, y, width, height, 'moving', 0x556677);
        
        // Add movement behavior
        switch (moveType) {
            case 'vertical':
                this.scene.tweens.add({
                    targets: platform,
                    y: y + config.distance,
                    duration: (config.distance / config.speed) * 1000,
                    ease: 'Sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    delay: config.delay || 0
                });
                break;
                
            case 'horizontal':
                this.scene.tweens.add({
                    targets: platform,
                    x: x + config.distance,
                    duration: (config.distance / config.speed) * 1000,
                    ease: 'Sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    delay: config.delay || 0
                });
                break;
                
            case 'circular':
                let angle = 0;
                this.scene.tweens.add({
                    targets: { angle: 0 },
                    angle: Math.PI * 2,
                    duration: (360 / config.speed) * 1000,
                    repeat: -1,
                    onUpdate: (tween, target) => {
                        platform.x = config.centerX + Math.cos(target.angle) * config.radius;
                        platform.y = config.centerY + Math.sin(target.angle) * config.radius;
                    }
                });
                break;
        }
        
        return platform;
    }
    
    addSecretArea(x, y, platformData, rewardType) {
        const secret = {
            entrance: { x: x, y: y },
            platforms: [],
            reward: null
        };
        
        // Create secret platforms
        platformData.forEach(pData => {
            const platform = this.addPlatform(pData.x, pData.y, pData.width, pData.height, 'secret', 0x444444);
            platform.setAlpha(0.7); // Semi-transparent to indicate secret
            secret.platforms.push(platform);
        });
        
        // Add reward
        const lastPlatform = platformData[platformData.length - 1];
        secret.reward = this.addCollectible(
            lastPlatform.x + lastPlatform.width/2, 
            lastPlatform.y - 30, 
            rewardType
        );
        
        // Add entrance indicator
        const indicator = this.scene.add.circle(x, y - 20, 4, 0xFFFF00, 0.6);
        this.scene.tweens.add({
            targets: indicator,
            alpha: 0.3,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        this.levelElements.secrets.push(secret);
        return secret;
    }
    
    addMasterSecret(x, y, rewardType) {
        // Ultimate secret requiring mastery of ALL abilities
        const masterPlatforms = [
            { x: x, y: y + 50, width: 40, height: 10 },      // Dash required
            { x: x + 100, y: y, width: 40, height: 10 },      // Triple jump required  
            { x: x + 200, y: y - 50, width: 40, height: 10 },  // Dash-jump combo
            { x: x + 350, y: y - 30, width: 60, height: 15 }   // Final platform
        ];
        
        // Add timing challenge
        this.addHazard(x + 150, y - 100, 'laser', {
            width: 200,
            height: 5,
            timing: 2000, // 2-second cycle
            damage: 40
        });
        
        return this.addSecretArea(x, y + 70, masterPlatforms, rewardType);
    }
    
    addCheckpoint(x, y) {
        const checkpoint = this.scene.add.circle(x, y - 30, 12, 0x00FF88, 0.7);
        
        // Checkpoint glow animation
        this.scene.tweens.add({
            targets: checkpoint,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        // Checkpoint collision detection
        this.scene.physics.add.existing(checkpoint, true);
        this.scene.physics.add.overlap(checkpoint, this.scene.player, () => {
            this.activateCheckpoint(checkpoint, x, y);
        });
        
        this.levelElements.checkpoints.push({
            object: checkpoint,
            x: x, y: y,
            activated: false
        });
        
        return checkpoint;
    }
    
    activateCheckpoint(checkpointObj, x, y) {
        // Find checkpoint data
        const checkpoint = this.levelElements.checkpoints.find(cp => cp.object === checkpointObj);
        if (!checkpoint || checkpoint.activated) return;
        
        checkpoint.activated = true;
        
        // Visual feedback
        checkpointObj.setTint(0x00FF00);
        this.scene.cameras.main.flash(200, 0, 255, 0);
        
        // Particle effect
        this.scene.player.particleSystem.createCollectEffect(x, y - 30, 0x00FF88);
        
        // Save player state
        this.scene.saveCheckpoint(x, y);
        
        console.log(`✅ Checkpoint activated at (${x}, ${y})`);
    }
    
    addBossSpawnPoint(x, y, bossType) {
        const spawnPoint = this.scene.add.circle(x, y, 50, 0x000000, 0.8);
        spawnPoint.setStrokeStyle(4, 0xFF0000, 1);
        
        // Ominous pulsing
        this.scene.tweens.add({
            targets: spawnPoint,
            alpha: 0.4,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        // Boss spawn trigger
        this.scene.physics.add.existing(spawnPoint, true);
        this.scene.physics.add.overlap(spawnPoint, this.scene.player, () => {
            this.triggerBossSpawn(x, y, bossType, spawnPoint);
        });
        
        return spawnPoint;
    }
    
    triggerBossSpawn(x, y, bossType, spawnPoint) {
        spawnPoint.destroy();
        
        // Dramatic boss entrance
        this.scene.cameras.main.shake(500, 0.05);
        
        // Spawn the boss
        const boss = new ShadowKing(this.scene, x, y);
        
        // Boss entrance effect
        this.scene.player.particleSystem.createEffect('explosion', x, y, {
            count: 30,
            colors: [0x8E44AD, 0xFF0000, 0x000000],
            duration: 1500
        });
        
        console.log('👑 SHADOW KING HAS AWAKENED!');
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    clearLevel() {
        // Clear all level elements
        Object.values(this.levelElements).forEach(elementArray => {
            elementArray.forEach(element => {
                if (element.object && element.object.destroy) {
                    element.object.destroy();
                } else if (element.destroy) {
                    element.destroy();
                }
            });
            elementArray.length = 0;
        });
        
        // Clear physics groups
        if (this.scene.platforms) this.scene.platforms.clear(true, true);
        if (this.scene.enemies) this.scene.enemies.clear(true, true);
        if (this.scene.collectibles) this.scene.collectibles.clear(true, true);
    }
    
    setupPhysics() {
        // Ensure proper physics setup for all elements
        this.scene.physics.add.collider(this.scene.player, this.scene.platforms);
        this.scene.physics.add.collider(this.scene.enemies, this.scene.platforms);
        
        console.log('⚙️ Physics setup complete for current level');
    }
    
    applyLevelEnhancements(levelId, biome) {
        // Apply biome-specific visual enhancements
        this.addBiomeSpecificEffects(biome);
        
        // Adjust difficulty based on level
        this.scaleDifficulty(levelId);
        
        // Add level-specific mechanics
        this.addLevelMechanics(levelId, biome);
    }
    
    addBiomeSpecificEffects(biome) {
        // Add environmental effects
        switch (biome) {
            case 'shadow':
                this.addShadowEffects();
                break;
            case 'forest':
                this.addForestEffects();
                break;
            case 'crystal':
                this.addCrystalEffects();
                break;
            case 'boss':
                this.addBossEffects();
                break;
        }
    }
    
    addShadowEffects() {
        // Floating shadow particles
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.player.particleSystem.createEnvironmentalEffects('shadow', 2);
            },
            loop: true
        });
    }
    
    scaleDifficulty(levelId) {
        // Gradually increase difficulty
        const difficultyMultiplier = 1 + ((levelId - 1) * 0.1);
        
        // Apply to existing enemies
        this.levelElements.enemies.forEach(enemy => {
            if (enemy.health) {
                enemy.health *= difficultyMultiplier;
                enemy.maxHealth *= difficultyMultiplier;
            }
            if (enemy.attackDamage) {
                enemy.attackDamage = Math.floor(enemy.attackDamage * difficultyMultiplier);
            }
        });
    }
    
    addLevelMechanics(levelId, biome) {
        // Add special mechanics based on progression
        if (levelId >= 3) {
            // Add dash-required elements
            this.addDashChallenges();
        }
        
        if (levelId >= 6) {
            // Add time-slow elements
            this.addTimeSlowChallenges();
        }
        
        if (levelId >= 10) {
            // Add advanced combination challenges
            this.addAdvancedChallenges();
        }
    }
    
    addDashChallenges() {
        // Add elements that specifically teach/require dash
        // This would include dash-through enemies, dash gaps, etc.
        console.log('⚡ Dash challenges added to level');
    }
    
    addTimeSlowChallenges() {
        // Add timing-based obstacles that benefit from time slow
        console.log('⏰ Time slow challenges added to level');
    }
    
    addAdvancedChallenges() {
        // Add complex challenges requiring multiple abilities
        console.log('🎯 Advanced challenges added to level');
    }
    
    // ==========================================
    // LEVEL ANALYSIS & METRICS
    // ==========================================
    
    analyzeLevelDifficulty() {
        const analysis = {
            jumpChallenges: 0,
            combatChallenges: 0,
            timingChallenges: 0,
            secretAreas: this.levelElements.secrets.length,
            checkpoints: this.levelElements.checkpoints.length,
            estimatedCompletionTime: 0
        };
        
        // Analyze platform gaps for jump difficulty
        for (let i = 0; i < this.levelElements.platforms.length - 1; i++) {
            const current = this.levelElements.platforms[i];
            const next = this.levelElements.platforms[i + 1];
            
            const gap = Math.abs(next.x - (current.x + current.width));
            const heightDiff = Math.abs(next.y - current.y);
            
            if (gap > 100 || heightDiff > 100) {
                analysis.jumpChallenges++;
            }
        }
        
        analysis.combatChallenges = this.levelElements.enemies.length;
        analysis.estimatedCompletionTime = this.calculateCompletionTime(analysis);
        
        return analysis;
    }
    
    calculateCompletionTime(analysis) {
        // Estimate based on challenges
        let baseTime = 60; // 1 minute base
        baseTime += analysis.jumpChallenges * 10;
        baseTime += analysis.combatChallenges * 15;
        baseTime += analysis.secretAreas * 30;
        
        return baseTime;
    }
    
    getLevelStats() {
        return {
            currentLevel: this.currentLevel,
            totalElements: Object.values(this.levelElements).reduce((sum, arr) => sum + arr.length, 0),
            difficulty: this.analyzeLevelDifficulty(),
            completionProgress: {
                platforms: this.levelElements.platforms.length,
                enemies: this.levelElements.enemies.length,
                collectibles: this.levelElements.collectibles.length,
                secrets: this.levelElements.secrets.length
            }
        };
    }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MasterLevelDesigner };
}