// Base Enemy class and specialized enemy types
class BaseEnemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Base properties
    this.enemyType = config.type || 'shadow';
    this.maxHealth = config.health || 60;
    this.health = this.maxHealth;
    this.speed = config.speed || 80;
    this.attackDamage = config.damage || 25;
    this.detectionRange = config.detectionRange || 150;
    this.attackRange = config.attackRange || 40;
    
    // AI State
    this.state = 'patrol'; // patrol, chase, attack, stunned
    this.direction = 1;
    this.patrolStartX = x;
    this.patrolRange = config.patrolRange || 120;
    this.lastAttack = 0;
    this.attackCooldown = config.attackCooldown || 1000;
    
    // Visual properties
    this.setSize(config.width || 24, config.height || 30);
    this.setTint(config.color || 0x8E44AD);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.2);
    
    // Add to enemies group
    if (scene.enemies) {
      scene.enemies.add(this);
    }
    
    this.setupBehavior();
  }
  
  setupBehavior() {
    // Override in subclasses
  }
  
  update() {
    this.updateAI();
    this.updateMovement();
    this.updateVisuals();
  }
  
  updateAI() {
    if (!this.scene.player) return;
    
    const player = this.scene.player;
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
    // Basic patrol behavior
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
    // Basic attack - override in subclasses
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true
    });
  }
  
  updateMovement() {
    // Turn around at walls
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
    }
  }
  
  updateVisuals() {
    // Face movement direction
    this.setFlipX(this.direction < 0);
    
    // Health-based tinting
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 0.3) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 142, g: 68, b: 173 },
        { r: 255, g: 0, b: 0 },
        1, (1 - healthPercent) * 2
      );
      this.setTint(Phaser.Display.Color.GetColor32(color.r, color.g, color.b, 255));
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
    
    // Knockback
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
    
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSound('enemyHit');
    }
  }
  
  onDestroy() {
    // Death particles
    if (this.scene.player && this.scene.player.particleSystem) {
      this.scene.player.particleSystem.createImpactExplosion(this.x, this.y, this.tintTopLeft);
    }
    
    // Drop chance for collectibles
    if (Math.random() < 0.3) {
      new Collectible(this.scene, this.x, this.y, 'orb');
    }
    
    this.destroy();
  }
}

// Shadow Wraith - floating enemy with ranged attacks
class ShadowWraith extends BaseEnemy {
  constructor(scene, x, y) {
    const config = GAME_CONFIG.ENEMIES.SHADOW_WRAITH;
    super(scene, x, y, {
      type: 'shadow',
      health: config.health,
      speed: config.speed,
      damage: config.damage,
      color: config.color,
      detectionRange: config.detectionRange,
      attackRange: config.attackRange
    });
    
    this.floatOffset = 0;
    this.canFly = true;
  }
  
  update() {
    super.update();
    
    // Floating animation
    this.floatOffset += 0.05;
    this.y += Math.sin(this.floatOffset) * 0.5;
  }
  
  performAttack(player) {
    super.performAttack(player);
    
    // Shadow bolt attack
    this.createShadowBolt(player);
  }
  
  createShadowBolt(target) {
    const bolt = this.scene.add.circle(this.x, this.y, 6, 0x663399, 0.8);
    this.scene.physics.add.existing(bolt);
    
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    bolt.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
    
    // Damage on contact with player
    this.scene.physics.add.overlap(bolt, target, () => {
      if (!target.invulnerable) {
        target.takeDamage(this.attackDamage);
      }
      bolt.destroy();
    });
    
    // Auto-destroy after time
    this.scene.time.delayedCall(2000, () => {
      if (bolt.active) bolt.destroy();
    });
  }
}

// Forest Guardian - armored enemy with area attacks
class ForestGuardian extends BaseEnemy {
  constructor(scene, x, y) {
    const config = GAME_CONFIG.ENEMIES.FOREST_GUARDIAN;
    super(scene, x, y, {
      type: 'forest',
      health: config.health,
      speed: config.speed,
      damage: config.damage,
      color: config.color,
      detectionRange: config.detectionRange,
      attackRange: config.attackRange,
      width: 32,
      height: 40
    });
    
    this.armor = config.armor || 2; // Damage reduction
  }
  
  takeDamage(amount) {
    const reducedDamage = Math.max(1, amount - this.armor);
    super.takeDamage(reducedDamage);
  }
  
  performAttack(player) {
    super.performAttack(player);
    
    // Ground slam attack
    this.scene.cameras.main.shake(150, 0.02);
    
    // Create thorns
    this.createThorns();
  }
  
  createThorns() {
    for (let i = 0; i < 5; i++) {
      const thorn = this.scene.add.triangle(
        this.x + (i - 2) * 20,
        this.y + 25,
        0, 15, 8, -5, -8, -5,
        0x2ECC71
      );
      
      this.scene.physics.add.existing(thorn, true);
      
      // Damage player on contact
      this.scene.physics.add.overlap(thorn, this.scene.player, (thorn, player) => {
        if (!player.invulnerable) {
          player.takeDamage(15);
        }
      });
      
      // Remove thorns after time
      this.scene.time.delayedCall(3000, () => {
        if (thorn.active) thorn.destroy();
      });
    }
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.BaseEnemy = BaseEnemy;
  window.ShadowWraith = ShadowWraith;
  window.ForestGuardian = ForestGuardian;
}