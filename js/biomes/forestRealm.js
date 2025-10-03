// Forest Realm - New Biome Implementation
// Enhanced environmental mechanics, nature-themed enemies, and visual effects

class ForestRealm {
  constructor(scene) {
    this.scene = scene;
    this.treeSprites = [];
    this.leafParticles = null;
    this.forestEnemies = [];
  }

  create() {
    this.createForestPlatforms();
    this.setupLeafParticles();
    this.spawnForestEnemies();
    this.addEnvironmentalHazards();
    this.setupForestAmbience();
  }

  createForestPlatforms() {
    const platforms = this.scene.platforms;
    
    // Tree trunk platforms with organic shapes
    const treeTrunks = [
      { x: 200, y: 400, width: 80, height: 200 },
      { x: 500, y: 350, width: 100, height: 250 },
      { x: 800, y: 450, width: 90, height: 150 },
      { x: 1100, y: 300, width: 120, height: 300 }
    ];

    treeTrunks.forEach(trunk => {
      const platform = platforms.create(trunk.x, trunk.y, null);
      platform.setSize(trunk.width, trunk.height);
      platform.setTint(0x4a4a2a); // Dark brown
      platform.refreshBody();
      this.treeSprites.push(platform);
    });

    // Vine bridges (moving platforms)
    this.createVineBridges();
  }

  createVineBridges() {
    const vine1 = this.scene.platforms.create(350, 250, null);
    vine1.setSize(120, 20);
    vine1.setTint(0x228B22);
    vine1.refreshBody();
    
    // Swaying motion
    this.scene.tweens.add({
      targets: vine1,
      y: vine1.y + 15,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });

    const vine2 = this.scene.platforms.create(650, 200, null);
    vine2.setSize(100, 20);
    vine2.setTint(0x228B22);
    vine2.refreshBody();
    
    this.scene.tweens.add({
      targets: vine2,
      x: vine2.x + 30,
      duration: 3000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  setupLeafParticles() {
    this.leafParticles = this.scene.add.particles(0, 0, 'leaf', {
      x: { min: 0, max: 1200 },
      y: { min: -50, max: 0 },
      speedX: { min: -20, max: -60 },
      speedY: { min: 10, max: 50 },
      scale: { min: 0.3, max: 0.8 },
      alpha: { start: 0.8, end: 0.3 },
      rotate: { min: 0, max: 360 },
      lifespan: { min: 3000, max: 6000 },
      frequency: 200,
      tint: [0x90EE90, 0x228B22, 0x32CD32, 0x9ACD32]
    });
    
    this.leafParticles.setDepth(-1);
  }

  spawnForestEnemies() {
    // Forest Sprite - Fast, jumping enemy
    const forestSprite1 = new ForestSprite(this.scene, 400, 320);
    const forestSprite2 = new ForestSprite(this.scene, 900, 280);
    
    this.forestEnemies.push(forestSprite1, forestSprite2);
    
    // Thorn Crawler - Ground-based spiky enemy
    const thornCrawler = new ThornCrawler(this.scene, 600, 500);
    this.forestEnemies.push(thornCrawler);
  }

  addEnvironmentalHazards() {
    // Poisonous mushrooms
    this.createPoisonMushrooms();
    
    // Falling acorns
    this.setupFallingAcorns();
  }

  createPoisonMushrooms() {
    const mushroomPositions = [
      { x: 150, y: 480 },
      { x: 750, y: 520 },
      { x: 1050, y: 460 }
    ];

    mushroomPositions.forEach(pos => {
      const mushroom = this.scene.physics.add.sprite(pos.x, pos.y, null);
      mushroom.setSize(30, 30);
      mushroom.setTint(0x8B008B); // Purple
      mushroom.body.setImmovable(true);
      
      // Pulsing effect
      this.scene.tweens.add({
        targets: mushroom,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1500,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1
      });
      
      // Damage on contact
      this.scene.physics.add.overlap(this.scene.player, mushroom, () => {
        this.scene.player.takeDamage(1);
        this.scene.cameras.main.shake(100, 0.02);
      });
    });
  }

  setupFallingAcorns() {
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => this.dropAcorn(),
      loop: true
    });
  }

  dropAcorn() {
    const x = Phaser.Math.Between(100, 1100);
    const acorn = this.scene.physics.add.sprite(x, 0, null);
    acorn.setSize(15, 15);
    acorn.setTint(0x8B4513); // Brown
    acorn.setBounce(0.3);
    acorn.setVelocityY(200);
    
    // Rotation while falling
    this.scene.tweens.add({
      targets: acorn,
      angle: 360,
      duration: 1000,
      repeat: -1
    });
    
    // Remove after hitting ground
    this.scene.physics.add.collider(acorn, this.scene.platforms, () => {
      this.scene.time.delayedCall(2000, () => {
        if (acorn.active) acorn.destroy();
      });
    });
    
    // Damage player on contact
    this.scene.physics.add.overlap(this.scene.player, acorn, () => {
      this.scene.player.takeDamage(1);
      acorn.destroy();
    });
  }

  setupForestAmbience() {
    // Wind sound effect
    if (this.scene.sound.get('forest_wind')) {
      this.scene.sound.get('forest_wind').play({ loop: true, volume: 0.3 });
    }
    
    // Occasional bird chirps
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 8000),
      callback: () => {
        if (this.scene.sound.get('bird_chirp')) {
          this.scene.sound.get('bird_chirp').play({ volume: 0.4 });
        }
      },
      loop: true
    });
  }

  update() {
    this.forestEnemies.forEach(enemy => {
      if (enemy.update) enemy.update();
    });
  }

  destroy() {
    if (this.leafParticles) {
      this.leafParticles.destroy();
    }
    
    this.forestEnemies.forEach(enemy => {
      if (enemy.destroy) enemy.destroy();
    });
    
    this.forestEnemies = [];
  }
}

// Forest-specific enemy classes
class ForestSprite extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setSize(25, 25);
    this.setTint(0x90EE90);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.8);
    
    this.speed = 80;
    this.jumpCooldown = 0;
    this.health = 2;
    
    this.setupBehavior();
  }

  setupBehavior() {
    // Random jumping movement
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
      callback: () => this.randomJump(),
      loop: true
    });
  }

  randomJump() {
    if (this.jumpCooldown <= 0) {
      this.body.setVelocityY(-150);
      this.body.setVelocityX(Phaser.Math.Between(-100, 100));
      this.jumpCooldown = 60;
    }
  }

  update() {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown--;
    }
    
    // Sparkle effect
    if (Math.random() < 0.02) {
      this.scene.add.circle(this.x + Phaser.Math.Between(-10, 10), 
                           this.y + Phaser.Math.Between(-10, 10), 
                           2, 0xFFFFFF, 0.8)
        .setDepth(10);
    }
  }
}

class ThornCrawler extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setSize(35, 20);
    this.setTint(0x556B2F);
    this.body.setCollideWorldBounds(true);
    
    this.speed = 40;
    this.direction = 1;
    this.health = 3;
    
    this.setupSpikes();
  }

  setupSpikes() {
    // Create spike visual effect
    const spikes = [];
    for (let i = 0; i < 5; i++) {
      const spike = this.scene.add.circle(
        this.x + (i * 7) - 14, 
        this.y - 8, 
        3, 
        0x8B0000
      );
      spikes.push(spike);
    }
    this.spikes = spikes;
  }

  update() {
    // Patrol movement
    this.body.setVelocityX(this.speed * this.direction);
    
    // Turn around at edges or obstacles
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
    }
    
    // Update spike positions
    if (this.spikes) {
      this.spikes.forEach((spike, i) => {
        spike.x = this.x + (i * 7) - 14;
        spike.y = this.y - 8;
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ForestRealm, ForestSprite, ThornCrawler };
}