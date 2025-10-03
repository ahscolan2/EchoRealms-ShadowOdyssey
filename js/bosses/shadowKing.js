// Shadow King - Final Boss Battle
// Multi-phase boss encounter with environmental destruction and complex attack patterns

class ShadowKing extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    
    this.scene = scene;
    this.maxHealth = 300;
    this.health = this.maxHealth;
    this.phase = 1;
    this.maxPhases = 3;
    
    // Combat state
    this.isInvulnerable = false;
    this.attackCooldown = 0;
    this.currentAttack = null;
    this.patternIndex = 0;
    
    // Movement
    this.homePosition = { x: x, y: y };
    this.targetPosition = { x: x, y: y };
    this.moveSpeed = 80;
    
    // Visual components
    this.crown = null;
    this.body = null;
    this.shadows = [];
    this.aura = null;
    
    // Attack patterns per phase
    this.attackPatterns = {
      1: ['shadowBolt', 'shadowWave', 'teleport'],
      2: ['shadowBolt', 'shadowWave', 'shadowClones', 'shadowRain', 'teleport'],
      3: ['shadowBolt', 'shadowWave', 'shadowClones', 'shadowRain', 'shadowVortex', 'environmentDestroy', 'teleport']
    };
    
    // Environmental destruction targets
    this.destructiblePlatforms = [];
    
    this.create();
    this.setupPhysics();
    this.setupHealthBar();
    
    scene.add.existing(this);
  }

  create() {
    // Main body - large imposing figure
    this.body = this.scene.add.rectangle(0, 0, 60, 80, 0x2C2C54, 0.9);
    this.add(this.body);
    
    // Crown - symbol of power
    this.crown = this.scene.add.polygon(0, -50, [
      0, -20, -15, -10, -8, 0, 8, 0, 15, -10
    ], 0xFFD700, 1);
    this.add(this.crown);
    
    // Glowing eyes
    const leftEye = this.scene.add.circle(-12, -15, 4, 0xFF0000, 0.8);
    const rightEye = this.scene.add.circle(12, -15, 4, 0xFF0000, 0.8);
    this.add([leftEye, rightEye]);
    
    // Pulsing aura
    this.aura = this.scene.add.circle(0, 0, 80, 0x8E44AD, 0.2);
    this.add(this.aura);
    
    // Floating shadow wisps
    this.createShadowWisps();
    
    // Animations
    this.setupAnimations();
  }

  createShadowWisps() {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 100;
      const wisp = this.scene.add.circle(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        5, 0x9B59B6, 0.7
      );
      
      this.shadows.push(wisp);
      this.add(wisp);
      
      // Individual wisp rotation
      this.scene.tweens.add({
        targets: wisp,
        angle: 360,
        duration: 3000 + (i * 200),
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  setupAnimations() {
    // Breathing effect
    this.scene.tweens.add({
      targets: this.body,
      scaleY: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    
    // Crown glow
    this.scene.tweens.add({
      targets: this.crown,
      alpha: 1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    
    // Aura pulse
    this.scene.tweens.add({
      targets: this.aura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.4,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  setupPhysics() {
    this.scene.physics.add.existing(this);
    this.body.setSize(60, 80);
    this.body.setImmovable(true);
    
    // Collision with player attacks
    this.scene.physics.add.overlap(
      this.scene.player,
      this,
      () => this.handlePlayerCollision(),
      null,
      this.scene
    );
  }

  setupHealthBar() {
    // Boss health bar at top of screen
    this.healthBarBg = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      50,
      400, 20,
      0x000000, 0.8
    ).setScrollFactor(0).setDepth(1000);
    
    this.healthBar = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      50,
      400, 20,
      0xFF0000, 1
    ).setScrollFactor(0).setDepth(1001);
    
    this.bossNameText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      25,
      'Shadow King',
      {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
  }

  handlePlayerCollision() {
    if (!this.scene.player.invulnerable) {
      this.scene.player.takeDamage(2);
      this.scene.cameras.main.shake(150, 0.03);
    }
  }

  takeDamage(amount) {
    if (this.isInvulnerable) return;
    
    this.health -= amount;
    this.updateHealthBar();
    
    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
    
    // Check for phase transition
    const healthPercent = this.health / this.maxHealth;
    const newPhase = Math.ceil((1 - healthPercent) * this.maxPhases) + 1;
    
    if (newPhase > this.phase && newPhase <= this.maxPhases) {
      this.transitionToPhase(newPhase);
    }
    
    // Check for death
    if (this.health <= 0) {
      this.onDefeat();
    }
  }

  updateHealthBar() {
    const healthPercent = this.health / this.maxHealth;
    this.healthBar.scaleX = healthPercent;
    
    // Change color based on health
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00FF00);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xFFFF00);
    } else {
      this.healthBar.setFillStyle(0xFF0000);
    }
  }

  transitionToPhase(newPhase) {
    this.phase = newPhase;
    this.isInvulnerable = true;
    
    // Phase transition animation
    this.scene.cameras.main.flash(500, 0x8E44AD);
    
    // Announce new phase
    this.announcePhase();
    
    // Phase-specific changes
    switch (newPhase) {
      case 2:
        this.increaseSize();
        this.changeColor(0x663399);
        break;
      case 3:
        this.increaseSize();
        this.changeColor(0x4A148C);
        this.createDestructiblePlatforms();
        break;
    }
    
    // End invulnerability after transition
    this.scene.time.delayedCall(2000, () => {
      this.isInvulnerable = false;
    });
  }

  announcePhase() {
    const phaseNames = {
      2: 'SHADOW DOMINION',
      3: 'REALM DESTROYER'
    };
    
    const announcement = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      phaseNames[this.phase] || `PHASE ${this.phase}`,
      {
        fontFamily: 'Arial',
        fontSize: 36,
        color: '#FF0000',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Animation
    announcement.setScale(0);
    this.scene.tweens.add({
      targets: announcement,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    this.scene.time.delayedCall(2000, () => {
      this.scene.tweens.add({
        targets: announcement,
        alpha: 0,
        y: announcement.y - 50,
        duration: 500,
        onComplete: () => announcement.destroy()
      });
    });
  }

  increaseSize() {
    this.scene.tweens.add({
      targets: this,
      scaleX: this.scaleX + 0.3,
      scaleY: this.scaleY + 0.3,
      duration: 1000,
      ease: 'Power2.easeOut'
    });
  }

  changeColor(color) {
    this.body.setFillStyle(color);
    this.aura.setFillStyle(color, 0.3);
  }

  createDestructiblePlatforms() {
    // Mark certain platforms as destructible in phase 3
    const platforms = this.scene.platforms.children.entries;
    this.destructiblePlatforms = platforms.slice(2, 5); // Example selection
    
    this.destructiblePlatforms.forEach(platform => {
      platform.destructible = true;
      platform.setTint(0xFF6B6B); // Red tint to indicate destructible
    });
  }

  update() {
    if (this.health <= 0) return;
    
    // Move towards target position
    this.moveTowardTarget();
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Execute attacks
    if (this.attackCooldown <= 0 && !this.isInvulnerable) {
      this.executeAttack();
    }
    
    // Update shadow wisps rotation
    this.shadows.forEach((wisp, i) => {
      const angle = (Date.now() * 0.001) + (i * Math.PI / 3);
      const distance = 100 * this.scaleX;
      wisp.x = Math.cos(angle) * distance;
      wisp.y = Math.sin(angle) * distance;
    });
  }

  moveTowardTarget() {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.targetPosition.x, this.targetPosition.y
    );
    
    if (distance > 5) {
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.targetPosition.x, this.targetPosition.y
      );
      
      this.x += Math.cos(angle) * this.moveSpeed * (1/60);
      this.y += Math.sin(angle) * this.moveSpeed * (1/60);
    }
  }

  executeAttack() {
    const patterns = this.attackPatterns[this.phase];
    const attack = patterns[this.patternIndex % patterns.length];
    this.patternIndex++;
    
    switch (attack) {
      case 'shadowBolt':
        this.attackShadowBolt();
        break;
      case 'shadowWave':
        this.attackShadowWave();
        break;
      case 'shadowClones':
        this.attackShadowClones();
        break;
      case 'shadowRain':
        this.attackShadowRain();
        break;
      case 'shadowVortex':
        this.attackShadowVortex();
        break;
      case 'environmentDestroy':
        this.attackEnvironmentDestroy();
        break;
      case 'teleport':
        this.attackTeleport();
        break;
    }
  }

  attackShadowBolt() {
    this.attackCooldown = 120;
    
    // Create shadow bolt projectile
    const player = this.scene.player;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    
    const bolt = this.scene.physics.add.sprite(this.x, this.y, null);
    bolt.setSize(20, 20);
    bolt.setTint(0x8E44AD);
    bolt.body.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );
    
    // Trail effect
    this.createBoltTrail(bolt);
    
    // Collision with player
    this.scene.physics.add.overlap(player, bolt, () => {
      if (!player.invulnerable) {
        player.takeDamage(3);
        this.scene.cameras.main.shake(100, 0.02);
      }
      bolt.destroy();
    });
    
    // Auto-destroy after time
    this.scene.time.delayedCall(3000, () => {
      if (bolt.active) bolt.destroy();
    });
  }

  attackShadowWave() {
    this.attackCooldown = 180;
    
    // Create expanding wave
    const wave = this.scene.add.circle(this.x, this.y, 20, 0x663399, 0.5);
    
    this.scene.tweens.add({
      targets: wave,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 2000,
      onUpdate: () => {
        // Damage player if caught in wave
        const distance = Phaser.Math.Distance.Between(
          wave.x, wave.y,
          this.scene.player.x, this.scene.player.y
        );
        
        const waveRadius = 20 * wave.scaleX;
        if (distance < waveRadius && distance > waveRadius - 30) {
          if (!this.scene.player.invulnerable) {
            this.scene.player.takeDamage(2);
            this.scene.player.invulnerable = true;
            this.scene.time.delayedCall(500, () => {
              this.scene.player.invulnerable = false;
            });
          }
        }
      },
      onComplete: () => wave.destroy()
    });
  }

  attackShadowClones() {
    if (this.phase < 2) return;
    
    this.attackCooldown = 300;
    
    // Create shadow clones
    for (let i = 0; i < 3; i++) {
      const clone = new ShadowClone(
        this.scene,
        this.x + (i - 1) * 100,
        this.y,
        this
      );
    }
  }

  attackShadowRain() {
    if (this.phase < 2) return;
    
    this.attackCooldown = 240;
    
    // Rain shadow projectiles from above
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const x = Phaser.Math.Between(100, 1100);
        const projectile = this.scene.physics.add.sprite(x, 0, null);
        projectile.setSize(15, 15);
        projectile.setTint(0x4A148C);
        projectile.body.setVelocityY(250);
        
        // Collision with player
        this.scene.physics.add.overlap(this.scene.player, projectile, () => {
          if (!this.scene.player.invulnerable) {
            this.scene.player.takeDamage(1);
          }
          projectile.destroy();
        });
        
        // Collision with ground
        this.scene.physics.add.collider(this.scene.platforms, projectile, () => {
          projectile.destroy();
        });
      });
    }
  }

  attackShadowVortex() {
    if (this.phase < 3) return;
    
    this.attackCooldown = 360;
    
    // Create pulling vortex at player location
    const vortex = this.scene.add.circle(
      this.scene.player.x,
      this.scene.player.y,
      100, 0x2C2C54, 0.3
    );
    
    let vortexTime = 180;
    const vortexEffect = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        vortexTime--;
        
        // Pull player toward center
        const distance = Phaser.Math.Distance.Between(
          vortex.x, vortex.y,
          this.scene.player.x, this.scene.player.y
        );
        
        if (distance < 100) {
          const angle = Phaser.Math.Angle.Between(
            this.scene.player.x, this.scene.player.y,
            vortex.x, vortex.y
          );
          
          const pullForce = (100 - distance) * 2;
          this.scene.player.body.setVelocity(
            this.scene.player.body.velocity.x + Math.cos(angle) * pullForce * 0.1,
            this.scene.player.body.velocity.y + Math.sin(angle) * pullForce * 0.1
          );
        }
        
        if (vortexTime <= 0) {
          vortexEffect.destroy();
          vortex.destroy();
        }
      },
      loop: true
    });
  }

  attackEnvironmentDestroy() {
    if (this.phase < 3) return;
    
    this.attackCooldown = 480;
    
    // Destroy random platforms
    const platformsToDestroy = Phaser.Utils.Array.GetRandom(
      this.destructiblePlatforms, 2
    );
    
    platformsToDestroy.forEach((platform, i) => {
      if (platform && platform.active) {
        this.scene.time.delayedCall(i * 500, () => {
          // Warning flash
          this.scene.tweens.add({
            targets: platform,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              // Destruction effect
              this.scene.particleSystem.createGroundSlamExplosion(
                platform.x, platform.y
              );
              platform.destroy();
            }
          });
        });
      }
    });
  }

  attackTeleport() {
    this.attackCooldown = 60;
    
    // Teleport effect
    const fadeOut = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => {
        // Choose new position
        const positions = [
          { x: 200, y: 300 },
          { x: 600, y: 200 },
          { x: 1000, y: 350 },
          { x: 400, y: 450 }
        ];
        
        const newPos = Phaser.Utils.Array.GetRandom(positions);
        this.x = newPos.x;
        this.y = newPos.y;
        this.targetPosition = newPos;
        
        // Fade back in
        this.scene.tweens.add({
          targets: this,
          alpha: 1,
          scaleX: this.scaleX < 1 ? 1 : this.scaleX,
          scaleY: this.scaleY < 1 ? 1 : this.scaleY,
          duration: 300
        });
      }
    });
  }

  createBoltTrail(bolt) {
    const trailEffect = this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (bolt.active) {
          const trail = this.scene.add.circle(
            bolt.x, bolt.y, 8, 0x8E44AD, 0.5
          );
          
          this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 300,
            onComplete: () => trail.destroy()
          });
        } else {
          trailEffect.destroy();
        }
      },
      loop: true
    });
  }

  onDefeat() {
    // Victory sequence
    this.scene.cameras.main.flash(1000, 0xFFD700);
    
    // Destruction animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      angle: 720,
      duration: 2000,
      onComplete: () => {
        this.destroy();
        this.scene.onBossDefeated();
      }
    });
    
    // Cleanup health bar
    this.healthBarBg.destroy();
    this.healthBar.destroy();
    this.bossNameText.destroy();
  }

  destroy() {
    this.shadows.forEach(shadow => {
      if (shadow.active) shadow.destroy();
    });
    
    if (this.healthBarBg && this.healthBarBg.active) {
      this.healthBarBg.destroy();
    }
    if (this.healthBar && this.healthBar.active) {
      this.healthBar.destroy();
    }
    if (this.bossNameText && this.bossNameText.active) {
      this.bossNameText.destroy();
    }
    
    super.destroy();
  }
}

// Shadow Clone support class
class ShadowClone extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, parent) {
    super(scene, x, y, 40, 60, 0x663399, 0.6);
    
    this.scene = scene;
    this.parent = parent;
    this.lifetime = 300;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setImmovable(true);
    
    // Attack pattern
    this.attackTimer = 60;
    
    // Auto-destroy after lifetime
    scene.time.delayedCall(5000, () => {
      if (this.active) {
        this.fadeOut();
      }
    });
  }

  update() {
    this.lifetime--;
    this.attackTimer--;
    
    if (this.attackTimer <= 0) {
      this.attackPlayer();
      this.attackTimer = 120;
    }
    
    if (this.lifetime <= 0) {
      this.fadeOut();
    }
  }

  attackPlayer() {
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.scene.player.x, this.scene.player.y
    );
    
    const projectile = this.scene.physics.add.sprite(this.x, this.y, null);
    projectile.setSize(12, 12);
    projectile.setTint(0x663399);
    projectile.body.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );
    
    // Collision with player
    this.scene.physics.add.overlap(this.scene.player, projectile, () => {
      if (!this.scene.player.invulnerable) {
        this.scene.player.takeDamage(1);
      }
      projectile.destroy();
    });
    
    // Auto-destroy
    this.scene.time.delayedCall(2000, () => {
      if (projectile.active) projectile.destroy();
    });
  }

  fadeOut() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      onComplete: () => this.destroy()
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShadowKing, ShadowClone };
}