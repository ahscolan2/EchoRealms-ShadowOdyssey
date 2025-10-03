// EchoRealms: Shadow Odyssey - Complete Integrated Game
// Full working game with all new features properly integrated

// Player class with advanced movement
class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Basic properties
    this.setSize(24, 32);
    this.setTint(0x00FFFF);
    this.body.setCollideWorldBounds(true);
    
    // Stats
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 160;
    this.jumpPower = 300;
    this.facingRight = true;
    this.invulnerable = false;
    
    // Inventory
    this.inventory = {
      keys: 0,
      orbs: 0,
      shards: 0,
      score: 0
    };
    
    // Advanced movement abilities
    this.abilities = {
      tripleJump: { unlocked: true, jumpsUsed: 0, maxJumps: 3 },
      echoPhaseDash: { unlocked: true, cooldown: 0, maxCooldown: 120 },
      timeSlow: { unlocked: true, active: false, duration: 0, maxDuration: 180, cooldown: 0 },
      groundSlam: { unlocked: true, slamming: false }
    };
    
    // Visual effects
    this.echoTrails = [];
    
    this.setupControls();
  }
  
  setupControls() {
    // Movement keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
    
    // Ability keys
    this.scene.input.keyboard.on('keydown-X', () => this.handleEchoPhaseDash());
    this.scene.input.keyboard.on('keydown-C', () => this.handleTimeSlow());
  }
  
  update() {
    // Basic movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.body.setVelocityX(-this.speed);
      this.facingRight = false;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.body.setVelocityX(this.speed);
      this.facingRight = true;
    } else {
      this.body.setVelocityX(0);
    }
    
    // Jumping (including triple jump)
    if ((this.cursors.up.isDown || this.wasd.W.isDown) && 
        (this.body.touching.down || this.abilities.tripleJump.jumpsUsed < this.abilities.tripleJump.maxJumps)) {
      
      if (this.body.touching.down) {
        this.abilities.tripleJump.jumpsUsed = 0;
      }
      
      if (this.abilities.tripleJump.jumpsUsed < this.abilities.tripleJump.maxJumps) {
        const jumpPower = this.jumpPower - (this.abilities.tripleJump.jumpsUsed * 50);
        this.body.setVelocityY(-jumpPower);
        this.abilities.tripleJump.jumpsUsed++;
        
        // Jump effect
        this.createJumpEffect();
        
        if (this.scene.sfx && this.scene.sfx.jump) {
          this.scene.sfx.jump.play({ 
            detune: this.abilities.tripleJump.jumpsUsed * 200,
            volume: 0.6 
          });
        }
      }
    }
    
    // Ground slam
    if ((this.cursors.down.isDown || this.wasd.S.isDown) && 
        !this.body.touching.down && this.body.velocity.y > 0) {
      this.handleGroundSlam();
    }
    
    // Update ability cooldowns
    this.updateAbilities();
    
    // Reset triple jump when touching ground
    if (this.body.touching.down) {
      this.abilities.tripleJump.jumpsUsed = 0;
      if (this.abilities.groundSlam.slamming) {
        this.handleGroundSlamImpact();
      }
    }
  }
  
  handleEchoPhaseDash() {
    if (this.abilities.echoPhaseDash.cooldown > 0) return;
    
    const direction = this.facingRight ? 1 : -1;
    
    // Create echo trail
    this.createEchoTrail();
    
    // Perform dash
    this.body.setVelocityX(400 * direction);
    this.body.setVelocityY(-50);
    
    // Invincibility frames
    this.invulnerable = true;
    this.setAlpha(0.5);
    
    this.scene.time.delayedCall(200, () => {
      this.invulnerable = false;
      this.setAlpha(1);
      this.abilities.echoPhaseDash.cooldown = this.abilities.echoPhaseDash.maxCooldown;
    });
    
    // Dash particles
    this.createDashParticles();
  }
  
  handleTimeSlow() {
    if (this.abilities.timeSlow.cooldown > 0 || this.abilities.timeSlow.active) return;
    
    this.abilities.timeSlow.active = true;
    this.abilities.timeSlow.duration = this.abilities.timeSlow.maxDuration;
    
    // Slow down physics
    this.scene.physics.world.timeScale = 0.3;
    
    // Visual overlay
    this.createTimeSlowOverlay();
  }
  
  handleGroundSlam() {
    if (this.abilities.groundSlam.slamming) return;
    
    this.abilities.groundSlam.slamming = true;
    this.body.setVelocityY(500);
    this.body.setVelocityX(0);
    
    // Rotation effect
    this.scene.tweens.add({
      targets: this,
      angle: this.angle + 720,
      duration: 800,
      ease: 'Power2.easeIn'
    });
  }
  
  handleGroundSlamImpact() {
    this.abilities.groundSlam.slamming = false;
    this.setAngle(0);
    
    // Screen shake
    this.scene.cameras.main.shake(200, 0.05);
    
    // Impact particles
    this.createSlamImpact();
  }
  
  updateAbilities() {
    // Echo dash cooldown
    if (this.abilities.echoPhaseDash.cooldown > 0) {
      this.abilities.echoPhaseDash.cooldown--;
    }
    
    // Time slow
    if (this.abilities.timeSlow.active) {
      this.abilities.timeSlow.duration--;
      
      if (this.abilities.timeSlow.duration <= 0) {
        this.deactivateTimeSlow();
      }
    } else if (this.abilities.timeSlow.cooldown > 0) {
      this.abilities.timeSlow.cooldown--;
    }
  }
  
  deactivateTimeSlow() {
    this.abilities.timeSlow.active = false;
    this.abilities.timeSlow.cooldown = 300;
    
    // Restore normal time
    this.scene.physics.world.timeScale = 1;
    
    // Remove overlay
    if (this.timeSlowOverlay) {
      this.timeSlowOverlay.destroy();
      this.timeSlowOverlay = null;
    }
  }
  
  createJumpEffect() {
    const ring = this.scene.add.circle(this.x, this.y + 16, 5, 0x00FFFF, 0.8);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy()
    });
  }
  
  createEchoTrail() {
    const echo = this.scene.add.rectangle(this.x, this.y, 24, 32, 0x00FFFF, 0.6);
    
    this.scene.tweens.add({
      targets: echo,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      onComplete: () => echo.destroy()
    });
  }
  
  createDashParticles() {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-15, 15),
        this.y + Phaser.Math.Between(-15, 15),
        3, 0x00FFFF, 0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-30, 30),
        y: particle.y + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 300,
        onComplete: () => particle.destroy()
      });
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
  
  createSlamImpact() {
    // Shockwave rings
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(this.x, this.y + 16, 10, 0xFF4500, 0.6);
      
      this.scene.tweens.add({
        targets: ring,
        scaleX: 3 + i,
        scaleY: 1.5 + i * 0.5,
        alpha: 0,
        duration: 400 + i * 100,
        delay: i * 50,
        onComplete: () => ring.destroy()
      });
    }
  }
  
  takeDamage(amount) {
    if (this.invulnerable) return;
    
    this.health -= amount;
    this.scene.events.emit('player:health', this.health, this.maxHealth);
    
    // Damage effect
    this.scene.tweens.add({
      targets: this,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      onComplete: () => this.setTint(0x00FFFF)
    });
    
    if (this.health <= 0) {
      this.scene.onPlayerDeath();
    }
  }
  
  collectItem(type, amount = 1) {
    this.inventory[type] += amount;
    this.inventory.score += amount * 10;
    this.scene.events.emit('ui:inventory', this.inventory);
    
    // Collect effect
    this.createCollectEffect(type);
  }
  
  createCollectEffect(type) {
    const colors = {
      orbs: 0x9B59B6,
      keys: 0xF1C40F,
      shards: 0x3498DB
    };
    
    const color = colors[type] || 0xFFFFFF;
    
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        4, color, 0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }
}

// Enemy class
class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type = 'shadow') {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.enemyType = type;
    this.health = 50;
    this.speed = 60;
    this.direction = 1;
    this.attackCooldown = 0;
    
    this.setSize(20, 20);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.2);
    
    // Set color based on type
    const colors = {
      shadow: 0x8E44AD,
      forest: 0x228B22,
      crystal: 0x3498DB
    };
    this.setTint(colors[type] || 0x8E44AD);
    
    this.setupBehavior();
  }
  
  setupBehavior() {
    // Basic AI patrol
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.direction *= -1;
        this.body.setVelocityX(this.speed * this.direction);
      },
      loop: true
    });
  }
  
  update() {
    // Basic movement
    this.body.setVelocityX(this.speed * this.direction);
    
    // Turn around at edges
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
    }
    
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    // Damage flash
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    if (this.health <= 0) {
      this.onDestroy();
    }
  }
  
  onDestroy() {
    // Death effect
    this.createDeathEffect();
    this.destroy();
  }
  
  createDeathEffect() {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        3, this.tintTopLeft, 0.7
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }
}

// Collectible class
class Collectible extends Phaser.GameObjects.Circle {
  constructor(scene, x, y, type = 'orb') {
    super(scene, x, y, 8);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    
    this.collectType = type;
    
    // Set color and properties based on type
    const config = {
      orb: { color: 0x9B59B6, value: 1 },
      key: { color: 0xF1C40F, value: 1 },
      shard: { color: 0x3498DB, value: 1 }
    };
    
    const typeConfig = config[type] || config.orb;
    this.setFillStyle(typeConfig.color, 0.8);
    this.value = typeConfig.value;
    
    // Floating animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    
    // Rotation
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }
  
  collect(player) {
    player.collectItem(this.collectType, this.value);
    this.destroy();
  }
}

// Main game scene
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }
  
  preload() {
    // Create colored rectangles for sprites since we don't have image assets
    this.load.image('platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }
  
  create() {
    // World bounds
    this.physics.world.setBounds(0, 0, 1200, 600);
    
    // Create platforms
    this.platforms = this.physics.add.staticGroup();
    
    // Ground
    const ground = this.add.rectangle(600, 580, 1200, 40, 0x654321);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
    
    // Floating platforms
    const platform1 = this.add.rectangle(200, 450, 120, 20, 0x8B4513);
    this.physics.add.existing(platform1, true);
    this.platforms.add(platform1);
    
    const platform2 = this.add.rectangle(500, 350, 120, 20, 0x8B4513);
    this.physics.add.existing(platform2, true);
    this.platforms.add(platform2);
    
    const platform3 = this.add.rectangle(800, 280, 120, 20, 0x8B4513);
    this.physics.add.existing(platform3, true);
    this.platforms.add(platform3);
    
    const platform4 = this.add.rectangle(1000, 400, 120, 20, 0x8B4513);
    this.physics.add.existing(platform4, true);
    this.platforms.add(platform4);
    
    // Create player
    this.player = new Player(this, 80, 460);
    
    // Player physics
    this.physics.add.collider(this.player, this.platforms);
    
    // Create enemies
    this.enemies = this.physics.add.group();
    
    const enemy1 = new Enemy(this, 300, 400, 'shadow');
    const enemy2 = new Enemy(this, 600, 200, 'shadow');
    const enemy3 = new Enemy(this, 900, 230, 'forest');
    
    this.enemies.add([enemy1, enemy2, enemy3]);
    
    // Enemy physics
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!player.invulnerable) {
        player.takeDamage(20);
        this.cameras.main.shake(100, 0.02);
      }
    });
    
    // Create collectibles
    this.collectibles = this.physics.add.group();
    
    const orb1 = new Collectible(this, 200, 400, 'orb');
    const orb2 = new Collectible(this, 500, 300, 'orb');
    const key1 = new Collectible(this, 800, 230, 'key');
    const shard1 = new Collectible(this, 1000, 350, 'shard');
    
    this.collectibles.add([orb1, orb2, key1, shard1]);
    
    // Collectible physics
    this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
      collectible.collect(player);
    });
    
    // Create UI
    this.createUI();
    
    // Camera
    this.cameras.main.setBounds(0, 0, 1200, 600);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    
    // Create audio system (placeholder)
    this.sfx = {
      jump: { play: (config) => console.log('Jump sound', config) },
      dash: { play: (config) => console.log('Dash sound', config) },
      collect: { play: (config) => console.log('Collect sound', config) }
    };
    
    // Background particles
    this.createBackgroundParticles();
    
    // Debug info
    this.add.text(10, 10, 'Controls: Arrow Keys/WASD + X (Dash) + C (Time Slow)', {
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#ffffff'
    }).setScrollFactor(0).setDepth(1000);
  }
  
  createUI() {
    // Health bar
    this.healthBarBg = this.add.rectangle(100, 30, 200, 20, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(1000);
    this.healthBar = this.add.rectangle(100, 30, 200, 20, 0x00FF00, 1)
      .setScrollFactor(0).setDepth(1001);
    
    // Inventory display
    this.inventoryText = this.add.text(220, 20, '', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff'
    }).setScrollFactor(0).setDepth(1002);
    
    // Ability cooldown indicators
    this.dashCooldownBg = this.add.rectangle(300, 30, 60, 15, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(1000);
    this.dashCooldown = this.add.rectangle(300, 30, 60, 15, 0x00FFFF, 1)
      .setScrollFactor(0).setDepth(1001);
    
    // Event listeners for UI updates
    this.events.on('player:health', (health, maxHealth) => {
      const healthPercent = health / maxHealth;
      this.healthBar.scaleX = healthPercent;
      
      if (healthPercent > 0.6) {
        this.healthBar.setFillStyle(0x00FF00);
      } else if (healthPercent > 0.3) {
        this.healthBar.setFillStyle(0xFFFF00);
      } else {
        this.healthBar.setFillStyle(0xFF0000);
      }
    });
    
    this.events.on('ui:inventory', (inventory) => {
      this.inventoryText.setText(
        `Orbs: ${inventory.orbs} Keys: ${inventory.keys} Score: ${inventory.score}`
      );
    });
    
    // Initial UI update
    this.events.emit('player:health', this.player.health, this.player.maxHealth);
    this.events.emit('ui:inventory', this.player.inventory);
  }
  
  createBackgroundParticles() {
    // Ambient shadow particles
    this.time.addEvent({
      delay: 500,
      callback: () => {
        const particle = this.add.circle(
          Phaser.Math.Between(0, 1200),
          Phaser.Math.Between(0, 100),
          2, 0x8E44AD, 0.3
        );
        
        this.tweens.add({
          targets: particle,
          y: particle.y + 600,
          alpha: 0,
          duration: 8000,
          onComplete: () => particle.destroy()
        });
      },
      loop: true
    });
  }
  
  update() {
    // Update player
    this.player.update();
    
    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.update) enemy.update();
    });
    
    // Update ability cooldown UI
    if (this.player.abilities.echoPhaseDash.cooldown > 0) {
      const cooldownPercent = this.player.abilities.echoPhaseDash.cooldown / this.player.abilities.echoPhaseDash.maxCooldown;
      this.dashCooldown.scaleX = 1 - cooldownPercent;
    } else {
      this.dashCooldown.scaleX = 1;
    }
    
    // Win condition (collect all orbs)
    if (this.player.inventory.orbs >= 2) {
      this.showVictory();
    }
  }
  
  onPlayerDeath() {
    // Death overlay
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      400, 200, 0x000000, 0.8
    ).setScrollFactor(0).setDepth(2000);
    
    const deathText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 20,
      'Shadows consumed you...\n\nPress R to restart',
      {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ff6b6b',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    
    // Restart on R key
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }
  
  showVictory() {
    if (this.gameWon) return;
    this.gameWon = true;
    
    const overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      400, 200, 0x2C3E50, 0.9
    ).setScrollFactor(0).setDepth(2000);
    
    const victoryText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 20,
      'Victory!\n\nYou mastered the Shadow Realm!\n\nPress R to play again',
      {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#f1c40f',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    
    // Restart on R key
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: MainScene
};

// Start the game
const game = new Phaser.Game(config);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, MainScene, Player, Enemy, Collectible };
}