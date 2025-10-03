// EchoRealms: Shadow Odyssey - Main Game Scene
// Core gameplay scene with all game mechanics

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.gameState = GAME_CONFIG.STATES.LOADING;
  }
  
  create() {
    console.log('🎮 Initializing Main Game Scene');
    
    try {
      this.initializeSystems();
      this.createWorld();
      this.createPlayer();
      this.createGroups();
      this.setupPhysics();
      this.setupCamera();
      this.createUI();
      this.setupEvents();
      this.loadCurrentBiome();
      
      this.gameState = GAME_CONFIG.STATES.PLAYING;
      console.log('✅ Game initialized successfully');
      
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      this.handleError(error);
    }
  }
  
  initializeSystems() {
    // Initialize audio system
    this.audioSystem = new AudioSystem(this);
    
    // Initialize biome manager
    this.currentBiome = 1;
    this.biomeData = GAME_CONFIG.BIOMES;
    
    // Game timers
    this.gameStartTime = this.time.now;
    this.lastAmbientParticle = 0;
    
    // Performance tracking
    this.performanceStats = {
      frameCount: 0,
      lastFPSCheck: 0
    };
  }
  
  createWorld() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD.WIDTH, GAME_CONFIG.WORLD.HEIGHT);
    this.physics.world.gravity.y = GAME_CONFIG.WORLD.GRAVITY;
    
    // Create background
    this.createBackground();
  }
  
  createBackground() {
    const biome = Object.values(this.biomeData).find(b => b.id === this.currentBiome);
    const bgColor = biome?.backgroundColor || '#0d001a';
    this.cameras.main.setBackgroundColor(bgColor);
  }
  
  createPlayer() {
    this.player = new Player(this, GAME_CONFIG.PLAYER.SPAWN_X, GAME_CONFIG.PLAYER.SPAWN_Y);
    
    // Bind ability keys
    this.bindAbilityKeys();
  }
  
  bindAbilityKeys() {
    // Echo Dash
    this.input.keyboard.on('keydown-X', () => {
      this.player.tryEchoDash();
    });
    
    // Time Slow
    this.input.keyboard.on('keydown-C', () => {
      this.player.tryTimeSlow();
    });
    
    // Ground Slam
    this.input.keyboard.on('keydown-Z', () => {
      this.player.tryGroundSlam();
    });
    
    // Pause
    this.input.keyboard.on('keydown-P', () => {
      this.pauseGame();
    });
    
    // Restart (for debugging)
    this.input.keyboard.on('keydown-R', () => {
      if (GAME_CONFIG.PERFORMANCE.DEBUG_MODE) {
        this.restartLevel();
      }
    });
  }
  
  createGroups() {
    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.projectiles = this.physics.add.group();
  }
  
  setupPhysics() {
    // Player-Platform collision
    this.physics.add.collider(this.player, this.platforms);
    
    // Enemy-Platform collision
    this.physics.add.collider(this.enemies, this.platforms);
    
    // Player-Enemy overlap
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
    
    // Player-Collectible overlap
    this.physics.add.overlap(this.player, this.collectibles, this.handlePlayerCollectibleCollision, null, this);
    
    // Projectile collisions
    this.physics.add.overlap(this.player, this.projectiles, this.handlePlayerProjectileCollision, null, this);
    this.physics.add.collider(this.projectiles, this.platforms, this.handleProjectilePlatformCollision, null, this);
  }
  
  setupCamera() {
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD.WIDTH, GAME_CONFIG.WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(120, 60);
    this.cameras.main.setZoom(1);
  }
  
  createUI() {
    const uiDepth = 2000;
    
    // Health bar
    this.createHealthBar(uiDepth);
    
    // Energy bar
    this.createEnergyBar(uiDepth);
    
    // Ability cooldown indicators
    this.createAbilityCooldowns(uiDepth);
    
    // Score and inventory
    this.createScoreDisplay(uiDepth);
    
    // Biome indicator
    this.createBiomeIndicator(uiDepth);
  }
  
  createHealthBar(depth) {
    const x = 120;
    const y = 40;
    const width = GAME_CONFIG.UI.HEALTH_BAR_WIDTH;
    const height = GAME_CONFIG.UI.HEALTH_BAR_HEIGHT;
    
    this.healthBarBg = this.add.rectangle(x, y, width + 4, height + 4, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(depth);
      
    this.healthBar = this.add.rectangle(x, y, width, height, 0x00FF00)
      .setScrollFactor(0).setDepth(depth + 1);
      
    this.add.text(x - width/2 - 10, y, 'HP', {
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#ffffff'
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(depth);
  }
  
  createEnergyBar(depth) {
    const x = 120;
    const y = 70;
    const width = GAME_CONFIG.UI.ENERGY_BAR_WIDTH;
    const height = GAME_CONFIG.UI.ENERGY_BAR_HEIGHT;
    
    this.energyBarBg = this.add.rectangle(x, y, width + 4, height + 4, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(depth);
      
    this.energyBar = this.add.rectangle(x, y, width, height, 0x0099FF)
      .setScrollFactor(0).setDepth(depth + 1);
      
    this.add.text(x - width/2 - 10, y, 'EN', {
      fontFamily: 'Arial',
      fontSize: 12,
      color: '#ffffff'
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(depth);
  }
  
  createAbilityCooldowns(depth) {
    const startX = 350;
    const y = 40;
    const width = GAME_CONFIG.UI.COOLDOWN_BAR_WIDTH;
    const height = GAME_CONFIG.UI.COOLDOWN_BAR_HEIGHT;
    const spacing = 70;
    
    // Dash cooldown
    this.dashCooldownBg = this.add.rectangle(startX, y, width + 2, height + 2, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(depth);
    this.dashCooldownBar = this.add.rectangle(startX, y, width, height, 0x00FFFF)
      .setScrollFactor(0).setDepth(depth + 1);
    this.add.text(startX, y + 20, 'DASH', {
      fontFamily: 'Arial',
      fontSize: 10,
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth);
    
    // Time slow cooldown
    this.timeSlowCooldownBg = this.add.rectangle(startX + spacing, y, width + 2, height + 2, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(depth);
    this.timeSlowCooldownBar = this.add.rectangle(startX + spacing, y, width, height, 0x0066FF)
      .setScrollFactor(0).setDepth(depth + 1);
    this.add.text(startX + spacing, y + 20, 'TIME', {
      fontFamily: 'Arial',
      fontSize: 10,
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth);
  }
  
  createScoreDisplay(depth) {
    this.scoreText = this.add.text(500, 30, '', {
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(depth);
    
    this.inventoryText = this.add.text(500, 55, '', {
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#cccccc'
    }).setScrollFactor(0).setDepth(depth);
  }
  
  createBiomeIndicator(depth) {
    this.biomeText = this.add.text(20, 100, '', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(depth);
  }
  
  setupEvents() {
    // Player events
    this.events.on('player:health', this.updateHealthBar, this);
    this.events.on('ui:inventory', this.updateInventoryDisplay, this);
    this.events.on('player:death', this.handlePlayerDeath, this);
    
    // Biome events
    this.events.on('biome:complete', this.handleBiomeComplete, this);
    
    // Game events
    this.events.on('game:pause', this.pauseGame, this);
    this.events.on('game:resume', this.resumeGame, this);
  }
  
  loadCurrentBiome() {
    this.clearBiome();
    
    switch (this.currentBiome) {
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
      default:
        this.loadShadowRealm();
    }
    
    this.updateBackgroundForBiome();
    this.audioSystem.playMusic(`biome${this.currentBiome}`);
  }
  
  clearBiome() {
    this.platforms.clear(true, true);
    this.enemies.clear(true, true);
    this.collectibles.clear(true, true);
    this.projectiles.clear(true, true);
  }
  
  loadShadowRealm() {
    // Ground and platforms
    this.createPlatform(0, 750, 2400, 50, GAME_CONFIG.PLATFORMS.DEFAULT_COLOR);
    this.createPlatform(200, 650, 150, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(450, 550, 180, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(750, 450, 160, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(1050, 350, 200, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(1400, 250, 180, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(1700, 400, 150, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    this.createPlatform(1950, 300, 200, 20, GAME_CONFIG.PLATFORMS.HIGHLIGHT_COLOR);
    
    // Collectibles
    this.createCollectible(250, 620, 'orb');
    this.createCollectible(520, 520, 'orb');
    this.createCollectible(820, 420, 'key');
    this.createCollectible(1120, 320, 'orb');
    this.createCollectible(1470, 220, 'crystal');
    this.createCollectible(2050, 270, 'artifact'); // Required for progression
  }
  
  loadForestKingdom() {
    // Forest platforms
    this.createPlatform(0, 750, 2400, 50, 0x2D5A2D);
    this.createPlatform(150, 680, 120, 15, 0x3D6A3D);
    this.createPlatform(350, 620, 140, 15, 0x3D6A3D);
    this.createPlatform(580, 560, 130, 15, 0x3D6A3D);
    this.createPlatform(800, 500, 160, 15, 0x3D6A3D);
    this.createPlatform(1050, 440, 140, 15, 0x3D6A3D);
    this.createPlatform(1300, 380, 180, 15, 0x3D6A3D);
    this.createPlatform(1600, 320, 150, 15, 0x3D6A3D);
    this.createPlatform(1900, 260, 200, 15, 0x3D6A3D);
    
    // Tree trunk platforms
    this.createPlatform(700, 350, 30, 150, GAME_CONFIG.PLATFORMS.SPECIAL_COLOR);
    this.createPlatform(1200, 200, 30, 180, GAME_CONFIG.PLATFORMS.SPECIAL_COLOR);
    
    // Collectibles
    this.createCollectible(200, 650, 'orb');
    this.createCollectible(400, 590, 'orb');
    this.createCollectible(650, 530, 'key');
    this.createCollectible(900, 470, 'orb');
    this.createCollectible(1150, 410, 'crystal');
    this.createCollectible(1950, 230, 'artifact');
  }
  
  loadCrystalCaves() {
    // Crystal cave platforms
    this.createPlatform(0, 750, 2400, 50, 0x2D1B3D);
    this.createPlatform(180, 680, 140, 20, 0x3E2B4E);
    this.createPlatform(400, 620, 120, 20, 0x3E2B4E);
    this.createPlatform(650, 560, 160, 20, 0x3E2B4E);
    this.createPlatform(900, 500, 140, 20, 0x3E2B4E);
    this.createPlatform(1150, 440, 180, 20, 0x3E2B4E);
    this.createPlatform(1450, 380, 160, 20, 0x3E2B4E);
    this.createPlatform(1750, 320, 200, 20, 0x3E2B4E);
    
    // Crystal formations
    this.createPlatform(500, 400, 20, 60, GAME_CONFIG.PLATFORMS.CRYSTAL_COLOR);
    this.createPlatform(1000, 300, 25, 80, GAME_CONFIG.PLATFORMS.CRYSTAL_COLOR);
    this.createPlatform(1600, 200, 20, 100, GAME_CONFIG.PLATFORMS.CRYSTAL_COLOR);
    
    // Collectibles
    this.createCollectible(220, 650, 'crystal');
    this.createCollectible(460, 590, 'orb');
    this.createCollectible(710, 530, 'crystal');
    this.createCollectible(960, 470, 'key');
    this.createCollectible(1210, 410, 'crystal');
    this.createCollectible(1850, 290, 'artifact');
  }
  
  loadBossArena() {
    // Boss arena platforms
    this.createPlatform(0, 750, 2400, 50, 0x3D1A1A);
    this.createPlatform(200, 650, 100, 20, 0x4E2B2B);
    this.createPlatform(400, 550, 120, 20, 0x4E2B2B);
    this.createPlatform(650, 450, 140, 20, 0x4E2B2B);
    this.createPlatform(900, 350, 160, 20, 0x4E2B2B);
    this.createPlatform(1200, 250, 180, 20, 0x4E2B2B);
    this.createPlatform(1500, 150, 200, 20, 0x4E2B2B);
    this.createPlatform(1800, 400, 120, 20, 0x4E2B2B);
    this.createPlatform(2000, 300, 140, 20, 0x4E2B2B);
    
    // Final collectibles
    this.createCollectible(250, 620, 'orb');
    this.createCollectible(470, 520, 'crystal');
    this.createCollectible(720, 420, 'key');
    this.createCollectible(970, 320, 'crystal');
    this.createCollectible(1270, 220, 'orb');
    this.createCollectible(2100, 270, 'artifact');
  }
  
  createPlatform(x, y, width, height, color) {
    const platform = this.add.rectangle(x + width/2, y + height/2, width, height, color);
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);
    return platform;
  }
  
  createCollectible(x, y, type) {
    const config = GAME_CONFIG.COLLECTIBLES[type.toUpperCase()];
    if (!config) return;
    
    const collectible = this.add.circle(x, y, config.radius, config.color, 0.8);
    collectible.collectType = type;
    collectible.value = config.value;
    
    this.physics.add.existing(collectible, true);
    this.collectibles.add(collectible);
    
    // Add floating animation
    this.tweens.add({
      targets: collectible,
      y: y - 10,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    
    return collectible;
  }
  
  update(time, delta) {
    if (this.gameState !== GAME_CONFIG.STATES.PLAYING) return;
    
    try {
      // Update player
      this.player.update(time, delta);
      
      // Update UI
      this.updateUI();
      
      // Update background effects
      this.updateBackgroundEffects(time);
      
      // Check level completion
      this.checkLevelCompletion();
      
      // Performance monitoring
      this.updatePerformanceStats(time);
      
    } catch (error) {
      console.error('Update error:', error);
      this.handleError(error);
    }
  }
  
  updateUI() {
    // Health bar
    const healthPercent = this.player.health / this.player.maxHealth;
    this.healthBar.scaleX = healthPercent;
    
    // Color coding for health
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
    
    // Ability cooldowns
    const dashPercent = this.player.abilities.echoDash.cooldown > 0 ? 
      1 - (this.player.abilities.echoDash.cooldown / this.player.abilities.echoDash.maxCooldown) : 1;
    this.dashCooldownBar.scaleX = dashPercent;
    
    const timeSlowPercent = this.player.abilities.timeSlow.cooldown > 0 ? 
      1 - (this.player.abilities.timeSlow.cooldown / this.player.abilities.timeSlow.maxCooldown) : 1;
    this.timeSlowCooldownBar.scaleX = timeSlowPercent;
    
    // Score and inventory
    this.scoreText.setText(`Score: ${this.player.inventory.score}`);
    this.inventoryText.setText(
      `Orbs: ${this.player.inventory.orbs} | Keys: ${this.player.inventory.keys} | ` +
      `Crystals: ${this.player.inventory.crystals} | Artifacts: ${this.player.inventory.artifacts}`
    );
    
    // Biome display
    const biome = Object.values(this.biomeData).find(b => b.id === this.currentBiome);
    this.biomeText.setText(`${biome?.name || 'Unknown Realm'}`);
  }
  
  updateBackgroundEffects(time) {
    // Ambient particles
    if (time - this.lastAmbientParticle > GAME_CONFIG.PARTICLES.AMBIENT_SPAWN_RATE) {
      this.createAmbientParticles();
      this.lastAmbientParticle = time;
    }
    
    // Biome-specific ambient audio
    if (Math.random() < 0.001) {
      const biomeTypes = ['shadow', 'forest', 'crystal', 'boss'];
      const currentBiomeType = biomeTypes[this.currentBiome - 1] || 'shadow';
      this.audioSystem.playBiomeAmbient(currentBiomeType);
    }
  }
  
  createAmbientParticles() {
    if (this.player.particleSystem) {
      const biomeTypes = ['shadow', 'forest', 'crystal', 'boss'];
      const currentBiomeType = biomeTypes[this.currentBiome - 1] || 'shadow';
      this.player.particleSystem.createAmbientParticles(currentBiomeType);
    }
  }
  
  updatePerformanceStats(time) {
    this.performanceStats.frameCount++;
    
    if (time - this.performanceStats.lastFPSCheck > 1000) {
      const fps = this.performanceStats.frameCount;
      this.performanceStats.frameCount = 0;
      this.performanceStats.lastFPSCheck = time;
      
      if (GAME_CONFIG.PERFORMANCE.DEBUG_MODE) {
        console.log(`FPS: ${fps}`);
      }
    }
  }
  
  checkLevelCompletion() {
    // Check if all artifacts in current biome are collected
    const artifactsRemaining = this.collectibles.children.entries.filter(
      collectible => collectible.collectType === 'artifact'
    ).length;
    
    if (artifactsRemaining === 0) {
      if (this.currentBiome < 4) {
        this.nextBiome();
      } else {
        this.handleGameComplete();
      }
    }
  }
  
  nextBiome() {
    this.currentBiome++;
    this.showBiomeTransition();
  }
  
  showBiomeTransition() {
    const biomeName = Object.values(this.biomeData).find(b => b.id === this.currentBiome)?.name;
    
    // Emit transition event for UI
    window.showBiomeTransition?.(biomeName);
    
    this.time.delayedCall(3000, () => {
      this.loadCurrentBiome();
      this.player.x = GAME_CONFIG.PLAYER.SPAWN_X;
      this.player.y = GAME_CONFIG.PLAYER.SPAWN_Y;
    });
  }
  
  updateBackgroundForBiome() {
    const biome = Object.values(this.biomeData).find(b => b.id === this.currentBiome);
    if (biome) {
      this.cameras.main.setBackgroundColor(biome.backgroundColor);
    }
  }
  
  // Collision Handlers
  handlePlayerEnemyCollision(player, enemy) {
    if (!player.invulnerable) {
      const damage = enemy.attackDamage || 25;
      player.takeDamage(damage);
      this.cameras.main.shake(150, 0.02);
    }
  }
  
  handlePlayerCollectibleCollision(player, collectible) {
    player.collectItem(collectible.collectType, collectible.value);
    
    // Remove collectible
    this.tweens.add({
      targets: collectible,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.collectibles.remove(collectible);
        collectible.destroy();
      }
    });
  }
  
  handlePlayerProjectileCollision(player, projectile) {
    if (!player.invulnerable) {
      const damage = projectile.damage || 15;
      player.takeDamage(damage);
    }
    
    projectile.destroy();
  }
  
  handleProjectilePlatformCollision(projectile, platform) {
    projectile.destroy();
  }
  
  // Utility Methods
  damageEnemiesInRadius(x, y, radius, damage) {
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance < radius && enemy.takeDamage) {
        enemy.takeDamage(damage);
      }
    });
  }
  
  // Game State Handlers
  handlePlayerDeath() {
    this.gameState = GAME_CONFIG.STATES.GAME_OVER;
    window.showGameOver?.(this.player.inventory.score);
  }
  
  handleGameComplete() {
    this.gameState = GAME_CONFIG.STATES.VICTORY;
    window.showVictory?.(this.player.inventory.score);
  }
  
  pauseGame() {
    if (this.gameState === GAME_CONFIG.STATES.PLAYING) {
      this.gameState = GAME_CONFIG.STATES.PAUSED;
      this.physics.pause();
      window.pauseGame?.();
    }
  }
  
  resumeGame() {
    if (this.gameState === GAME_CONFIG.STATES.PAUSED) {
      this.gameState = GAME_CONFIG.STATES.PLAYING;
      this.physics.resume();
    }
  }
  
  restartLevel() {
    this.player.respawn();
    this.loadCurrentBiome();
    this.gameState = GAME_CONFIG.STATES.PLAYING;
  }
  
  handleError(error) {
    console.error('🚫 Game Error:', error);
    this.gameState = GAME_CONFIG.STATES.ERROR;
    window.showError?.(error.message || 'An unexpected error occurred');
  }
  
  // Event Handlers
  updateHealthBar(health, maxHealth) {
    // Handled in updateUI()
  }
  
  updateInventoryDisplay(inventory) {
    // Handled in updateUI()
  }
  
  handleBiomeComplete() {
    this.nextBiome();
  }
  
  // Cleanup
  destroy() {
    if (this.audioSystem) {
      this.audioSystem.destroy();
    }
    
    if (this.player) {
      this.player.destroy();
    }
    
    super.destroy();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainScene;
}

// Global access
window.MainScene = MainScene;