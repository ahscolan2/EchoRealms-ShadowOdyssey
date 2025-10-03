// Advanced Player class with all abilities
class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Physical properties
    this.setSize(GAME_CONFIG.PLAYER.SIZE.width, GAME_CONFIG.PLAYER.SIZE.height);
    this.setTint(0x00FFFF);
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
        unlocked: true,
        jumpsUsed: 0,
        maxJumps: GAME_CONFIG.ABILITIES.TRIPLE_JUMP.MAX_JUMPS
      },
      echoDash: {
        unlocked: true,
        cooldown: 0,
        maxCooldown: GAME_CONFIG.ABILITIES.ECHO_DASH.COOLDOWN,
        energyCost: GAME_CONFIG.ABILITIES.ECHO_DASH.ENERGY_COST
      },
      timeSlow: {
        unlocked: true,
        active: false,
        duration: 0,
        maxDuration: GAME_CONFIG.ABILITIES.TIME_SLOW.DURATION,
        cooldown: 0,
        maxCooldown: GAME_CONFIG.ABILITIES.TIME_SLOW.COOLDOWN,
        energyCost: GAME_CONFIG.ABILITIES.TIME_SLOW.ENERGY_COST
      },
      groundSlam: {
        unlocked: true,
        slamming: false,
        energyCost: GAME_CONFIG.ABILITIES.GROUND_SLAM.ENERGY_COST
      }
    };
    
    // Progression
    this.inventory = {
      orbs: 0,
      keys: 0,
      crystals: 0,
      artifacts: 0,
      score: 0,
      level: 1
    };
    
    this.setupControls();
    this.particleSystem = new ParticleSystem(scene);
  }
  
  setupControls() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D,X,C,Z,R');
    
    // Ability hotkeys
    this.scene.input.keyboard.on('keydown-X', () => this.tryEchoDash());
    this.scene.input.keyboard.on('keydown-C', () => this.tryTimeSlow());
    this.scene.input.keyboard.on('keydown-Z', () => this.tryGroundSlam());
    this.scene.input.keyboard.on('keydown-R', () => this.scene.scene.restart());
  }
  
  update() {
    this.updateEnergy();
    this.updateAbilityCooldowns();
    this.handleMovement();
    this.handleJumping();
    this.updateInvulnerability();
    this.updateTimeSlow();
    
    // Visual effects for abilities
    if (this.abilities.echoDash.cooldown > this.abilities.echoDash.maxCooldown - 30) {
      this.createDashEffect();
    }
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
      this.setFlipX(true);
    } else if (rightPressed) {
      this.body.setVelocityX(this.speed);
      this.facingRight = true;
      this.setFlipX(false);
    }
    
    // Create movement particles
    if ((leftPressed || rightPressed) && this.grounded && Math.random() < 0.1) {
      this.particleSystem.createMovementParticles(this.x, this.y);
    }
  }
  
  handleJumping() {
    const jumpPressed = this.cursors.up.isDown || this.wasd.W.isDown;
    
    if (jumpPressed && this.canJump()) {
      this.performJump();
    }
    
    // Reset jumps when grounded
    if (this.body.touching.down) {
      this.grounded = true;
      this.abilities.tripleJump.jumpsUsed = 0;
      
      if (this.abilities.groundSlam.slamming) {
        this.handleGroundSlamImpact();
      }
    } else {
      this.grounded = false;
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
    
    // Visual and audio feedback
    this.particleSystem.createJumpEffect(this.x, this.y + 20);
    this.scene.audioSystem.playSound('jump', { detune: this.abilities.tripleJump.jumpsUsed * 200 });
  }
  
  tryEchoDash() {
    if (this.abilities.echoDash.cooldown > 0 || this.energy < this.abilities.echoDash.energyCost) {
      return false;
    }
    
    this.performEchoDash();
    return true;
  }
  
  performEchoDash() {
    const direction = this.facingRight ? 1 : -1;
    
    // Dash movement
    this.body.setVelocityX(GAME_CONFIG.ABILITIES.ECHO_DASH.DISTANCE * direction);
    this.body.setVelocityY(-80);
    
    // Consume energy and set cooldown
    this.energy -= this.abilities.echoDash.energyCost;
    this.abilities.echoDash.cooldown = this.abilities.echoDash.maxCooldown;
    
    // Invulnerability frames
    this.makeInvulnerable(300);
    
    // Visual effects
    this.particleSystem.createDashTrail(this.x, this.y);
    this.createDashEffect();
    
    // Screen effect
    this.scene.cameras.main.shake(100, 0.01);
    this.scene.audioSystem.playSound('dash');
  }
  
  tryTimeSlow() {
    if (this.abilities.timeSlow.cooldown > 0 || 
        this.energy < this.abilities.timeSlow.energyCost ||
        this.abilities.timeSlow.active) {
      return false;
    }
    
    this.activateTimeSlow();
    return true;
  }
  
  activateTimeSlow() {
    this.abilities.timeSlow.active = true;
    this.abilities.timeSlow.duration = this.abilities.timeSlow.maxDuration;
    this.energy -= this.abilities.timeSlow.energyCost;
    
    // Physics time scale
    this.scene.physics.world.timeScale = GAME_CONFIG.ABILITIES.TIME_SLOW.TIME_SCALE;
    
    // Visual overlay
    this.timeSlowOverlay = this.particleSystem.createTimeSlowOverlay();
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
    if (this.grounded || this.energy < this.abilities.groundSlam.energyCost) {
      return false;
    }
    
    this.performGroundSlam();
    return true;
  }
  
  performGroundSlam() {
    this.abilities.groundSlam.slamming = true;
    this.body.setVelocityY(GAME_CONFIG.ABILITIES.GROUND_SLAM.POWER);
    this.body.setVelocityX(0);
    this.energy -= this.abilities.groundSlam.energyCost;
    
    // Rotation effect
    this.scene.tweens.add({
      targets: this,
      angle: this.angle + 720,
      duration: 800,
      ease: 'Power2.easeIn'
    });
    
    this.scene.audioSystem.playSound('groundSlam');
  }
  
  handleGroundSlamImpact() {
    this.abilities.groundSlam.slamming = false;
    this.setAngle(0);
    
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
    this.scene.events.emit('player:health', this.health, this.maxHealth);
    this.scene.audioSystem.playSound('playerHit');
    
    // Screen effect
    this.particleSystem.createScreenEffect('damage', 200);
    
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
    const points = GAME_CONFIG.COLLECTIBLES[type]?.points || 25;
    this.inventory.score += amount * points;
    
    const color = GAME_CONFIG.COLLECTIBLES[type]?.color || 0x9B59B6;
    this.particleSystem.createCollectEffect(this.x, this.y, color);
    this.scene.events.emit('ui:inventory', this.inventory);
    this.scene.audioSystem.playSound('collect');
  }
  
  handleDeath() {
    this.scene.events.emit('player:death');
  }
  
  // Visual effect methods
  createDashEffect() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.Player = Player;
}