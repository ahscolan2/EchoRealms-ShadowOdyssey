// EchoRealms: Shadow Odyssey - Player Entity
// Advanced player with full ability system and responsive controls

class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.scene = scene;
    this.initializePlayer();
    this.setupPhysics();
    this.setupAbilities();
    this.setupControls();
    this.setupStats();
    
    // Initialize particle system
    this.particleSystem = new ParticleSystem(scene);
  }
  
  initializePlayer() {
    // Visual properties
    this.setSize(GAME_CONFIG.PLAYER.WIDTH, GAME_CONFIG.PLAYER.HEIGHT);
    this.setTint(GAME_CONFIG.PLAYER.COLOR);
    this.setOrigin(0.5, 0.5);
    
    // Create a simple rectangle as player sprite
    this.graphics = this.scene.add.graphics();
    this.graphics.fillStyle(GAME_CONFIG.PLAYER.COLOR);
    this.graphics.fillRect(-14, -21, 28, 42);
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }
  
  setupPhysics() {
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(GAME_CONFIG.PLAYER.DRAG, 0);
    this.body.setMaxVelocity(GAME_CONFIG.PLAYER.SPEED * 1.5, 1000);
  }
  
  setupAbilities() {
    this.abilities = {
      tripleJump: {
        enabled: GAME_CONFIG.ABILITIES.TRIPLE_JUMP.ENABLED,
        jumpsUsed: 0,
        maxJumps: GAME_CONFIG.ABILITIES.TRIPLE_JUMP.MAX_JUMPS,
        powerDecrease: GAME_CONFIG.ABILITIES.TRIPLE_JUMP.POWER_DECREASE
      },
      echoDash: {
        enabled: GAME_CONFIG.ABILITIES.ECHO_DASH.ENABLED,
        cooldown: 0,
        maxCooldown: GAME_CONFIG.ABILITIES.ECHO_DASH.COOLDOWN,
        distance: GAME_CONFIG.ABILITIES.ECHO_DASH.DISTANCE,
        energyCost: GAME_CONFIG.ABILITIES.ECHO_DASH.ENERGY_COST,
        invulnerabilityTime: GAME_CONFIG.ABILITIES.ECHO_DASH.INVULNERABILITY_TIME
      },
      timeSlow: {
        enabled: GAME_CONFIG.ABILITIES.TIME_SLOW.ENABLED,
        active: false,
        duration: 0,
        maxDuration: GAME_CONFIG.ABILITIES.TIME_SLOW.DURATION,
        cooldown: 0,
        maxCooldown: GAME_CONFIG.ABILITIES.TIME_SLOW.COOLDOWN,
        energyCost: GAME_CONFIG.ABILITIES.TIME_SLOW.ENERGY_COST,
        timeScale: GAME_CONFIG.ABILITIES.TIME_SLOW.TIME_SCALE
      },
      groundSlam: {
        enabled: GAME_CONFIG.ABILITIES.GROUND_SLAM.ENABLED,
        slamming: false,
        power: GAME_CONFIG.ABILITIES.GROUND_SLAM.POWER,
        radius: GAME_CONFIG.ABILITIES.GROUND_SLAM.DAMAGE_RADIUS,
        damage: GAME_CONFIG.ABILITIES.GROUND_SLAM.DAMAGE_AMOUNT,
        energyCost: GAME_CONFIG.ABILITIES.GROUND_SLAM.ENERGY_COST
      }
    };
  }
  
  setupControls() {
    // Create cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // WASD keys
    this.keys = this.scene.input.keyboard.addKeys('W,A,S,D,X,C,Z,P,R');
    
    // Advanced input tracking
    this.inputState = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      lastJumpTime: 0,
      coyoteTime: 0,
      jumpBuffer: 0
    };
  }
  
  setupStats() {
    // Core stats
    this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.health = this.maxHealth;
    this.maxEnergy = GAME_CONFIG.PLAYER.MAX_ENERGY;
    this.energy = this.maxEnergy;
    this.speed = GAME_CONFIG.PLAYER.SPEED;
    
    // State tracking
    this.facingRight = true;
    this.grounded = false;
    this.lastGroundedTime = 0;
    this.invulnerable = false;
    this.invulnerabilityTime = 0;
    
    // Progression
    this.inventory = {
      orbs: 0,
      keys: 0,
      crystals: 0,
      artifacts: 0,
      score: 0
    };
  }
  
  update(time, delta) {
    this.updateInput();
    this.updatePhysics();
    this.updateAbilities();
    this.updateVisuals();
    this.updateTimers(delta);
    
    // Update graphics position
    if (this.graphics) {
      this.graphics.x = this.x;
      this.graphics.y = this.y;
    }
  }
  
  updateInput() {
    // Update input state
    this.inputState.left = this.cursors.left.isDown || this.keys.A.isDown;
    this.inputState.right = this.cursors.right.isDown || this.keys.D.isDown;
    
    const jumpKeys = this.cursors.up.isDown || this.keys.W.isDown || this.cursors.space?.isDown;
    
    // Jump buffering
    if (jumpKeys && !this.inputState.jump) {
      this.inputState.jumpPressed = true;
      this.inputState.jumpBuffer = GAME_CONFIG.INPUT.JUMP_BUFFER_TIME;
      this.inputState.lastJumpTime = this.scene.time.now;
    }
    
    this.inputState.jump = jumpKeys;
    
    // Handle movement
    this.handleMovement();
    
    // Handle jumping with coyote time and buffering
    this.handleJumping();
  }
  
  handleMovement() {
    if (this.inputState.left) {
      this.body.setVelocityX(-this.speed);
      this.facingRight = false;
      this.setFlipX(true);
      
      // Movement particles
      if (this.grounded && Math.random() < 0.05) {
        this.particleSystem.createMovementDust(this.x, this.y);
      }
    } else if (this.inputState.right) {
      this.body.setVelocityX(this.speed);
      this.facingRight = true;
      this.setFlipX(false);
      
      // Movement particles
      if (this.grounded && Math.random() < 0.05) {
        this.particleSystem.createMovementDust(this.x, this.y);
      }
    }
  }
  
  handleJumping() {
    // Update grounded state
    const wasGrounded = this.grounded;
    this.grounded = this.body.touching.down || this.body.blocked.down;
    
    if (this.grounded && !wasGrounded) {
      this.abilities.tripleJump.jumpsUsed = 0;
      this.lastGroundedTime = this.scene.time.now;
      
      // Handle ground slam impact
      if (this.abilities.groundSlam.slamming) {
        this.handleGroundSlamImpact();
      }
    }
    
    // Coyote time - grace period after leaving ground
    if (!this.grounded && wasGrounded) {
      this.inputState.coyoteTime = GAME_CONFIG.INPUT.COYOTE_TIME;
    }
    
    // Check if can jump (grounded, coyote time, or air jumps available)
    const canJump = this.grounded || 
                   this.inputState.coyoteTime > 0 || 
                   this.abilities.tripleJump.jumpsUsed < this.abilities.tripleJump.maxJumps;
    
    // Jump execution
    if (this.inputState.jumpBuffer > 0 && canJump) {
      this.performJump();
      this.inputState.jumpBuffer = 0;
      this.inputState.coyoteTime = 0;
    }
  }
  
  performJump() {
    if (!this.abilities.tripleJump.enabled) return;
    
    // Calculate jump power based on jump number
    const jumpPower = GAME_CONFIG.PLAYER.JUMP_POWER - 
                     (this.abilities.tripleJump.jumpsUsed * this.abilities.tripleJump.powerDecrease);
    
    this.body.setVelocityY(-jumpPower);
    this.abilities.tripleJump.jumpsUsed++;
    this.grounded = false;
    
    // Visual and audio feedback
    this.particleSystem.createJumpEffect(this.x, this.y + 20);
    this.scene.audioSystem?.playJumpSound(this.abilities.tripleJump.jumpsUsed);
    
    // Screen shake for higher jumps
    if (this.abilities.tripleJump.jumpsUsed > 1) {
      this.scene.cameras.main.shake(50, 0.005);
    }
  }
  
  updatePhysics() {
    // Air control
    if (!this.grounded) {
      const airControl = 0.6;
      if (this.inputState.left) {
        this.body.setAccelerationX(-this.speed * 3 * airControl);
      } else if (this.inputState.right) {
        this.body.setAccelerationX(this.speed * 3 * airControl);
      } else {
        this.body.setAccelerationX(0);
      }
    } else {
      this.body.setAccelerationX(0);
    }
  }
  
  updateAbilities() {
    // Update ability cooldowns
    if (this.abilities.echoDash.cooldown > 0) {
      this.abilities.echoDash.cooldown--;
    }
    
    if (this.abilities.timeSlow.cooldown > 0) {
      this.abilities.timeSlow.cooldown--;
    }
    
    // Update time slow
    if (this.abilities.timeSlow.active) {
      this.abilities.timeSlow.duration--;
      if (this.abilities.timeSlow.duration <= 0) {
        this.deactivateTimeSlow();
      }
    }
    
    // Energy regeneration
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + GAME_CONFIG.PLAYER.ENERGY_REGEN_RATE);
    }
  }
  
  updateVisuals() {
    // Invulnerability flashing
    if (this.invulnerable) {
      this.setAlpha(0.5 + Math.sin(this.scene.time.now * 0.02) * 0.3);
    } else {
      this.setAlpha(1);
    }
    
    // Ability visual effects
    if (this.abilities.echoDash.cooldown > this.abilities.echoDash.maxCooldown - 30) {
      this.createDashEffect();
    }
  }
  
  updateTimers(delta) {
    // Update input timers
    if (this.inputState.coyoteTime > 0) {
      this.inputState.coyoteTime -= delta;
    }
    
    if (this.inputState.jumpBuffer > 0) {
      this.inputState.jumpBuffer -= delta;
    }
    
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime -= delta;
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false;
        this.setAlpha(1);
      }
    }
  }
  
  // Ability Methods
  tryEchoDash() {
    if (!this.abilities.echoDash.enabled ||
        this.abilities.echoDash.cooldown > 0 ||
        this.energy < this.abilities.echoDash.energyCost) {
      return false;
    }
    
    this.performEchoDash();
    return true;
  }
  
  performEchoDash() {
    const direction = this.facingRight ? 1 : -1;
    
    // Dash movement
    this.body.setVelocity(this.abilities.echoDash.distance * direction, -50);
    
    // Consume energy and set cooldown
    this.energy -= this.abilities.echoDash.energyCost;
    this.abilities.echoDash.cooldown = this.abilities.echoDash.maxCooldown;
    
    // Invulnerability frames
    this.makeInvulnerable(this.abilities.echoDash.invulnerabilityTime);
    
    // Visual effects
    this.particleSystem.createDashTrail(this.x, this.y, direction);
    this.createDashEffect();
    
    // Screen effect and audio
    this.scene.cameras.main.shake(100, 0.01);
    this.scene.audioSystem?.playDashSound();
  }
  
  tryTimeSlow() {
    if (!this.abilities.timeSlow.enabled ||
        this.abilities.timeSlow.cooldown > 0 ||
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
    
    // Apply time scale to physics
    this.scene.physics.world.timeScale = this.abilities.timeSlow.timeScale;
    
    // Visual and audio effects
    this.particleSystem.createTimeSlowEffect(this.x, this.y);
    this.createTimeSlowOverlay();
    this.scene.audioSystem?.playTimeSlowSound();
  }
  
  deactivateTimeSlow() {
    this.abilities.timeSlow.active = false;
    this.abilities.timeSlow.cooldown = this.abilities.timeSlow.maxCooldown;
    
    // Restore normal time
    this.scene.physics.world.timeScale = 1;
    
    // Remove visual overlay
    if (this.timeSlowOverlay) {
      this.timeSlowOverlay.destroy();
      this.timeSlowOverlay = null;
    }
  }
  
  tryGroundSlam() {
    if (!this.abilities.groundSlam.enabled ||
        this.grounded ||
        this.energy < this.abilities.groundSlam.energyCost) {
      return false;
    }
    
    this.performGroundSlam();
    return true;
  }
  
  performGroundSlam() {
    this.abilities.groundSlam.slamming = true;
    this.body.setVelocity(0, this.abilities.groundSlam.power);
    this.energy -= this.abilities.groundSlam.energyCost;
    
    // Rotation animation
    this.scene.tweens.add({
      targets: this,
      angle: this.angle + 720,
      duration: 800,
      ease: 'Power2.easeIn'
    });
    
    this.scene.audioSystem?.playGroundSlamSound();
  }
  
  handleGroundSlamImpact() {
    this.abilities.groundSlam.slamming = false;
    this.setAngle(0);
    
    // Screen shake and particles
    this.scene.cameras.main.shake(300, 0.06);
    this.particleSystem.createImpactExplosion(this.x, this.y + 20);
    
    // Damage nearby enemies
    this.scene.damageEnemiesInRadius?.(this.x, this.y, this.abilities.groundSlam.radius, this.abilities.groundSlam.damage);
  }
  
  // Combat and Health
  takeDamage(amount) {
    if (this.invulnerable) return;
    
    this.health = Math.max(0, this.health - amount);
    this.makeInvulnerable(1200);
    
    // Visual feedback
    this.scene.tweens.add({
      targets: this,
      tint: 0xFF0000,
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.setTint(GAME_CONFIG.PLAYER.COLOR)
    });
    
    // Screen shake and audio
    this.scene.cameras.main.shake(200, 0.03);
    this.scene.audioSystem?.playPlayerHitSound(amount);
    
    // Emit health update event
    this.scene.events.emit('player:health', this.health, this.maxHealth);
    
    // Check for death
    if (this.health <= 0) {
      this.handleDeath();
    }
  }
  
  makeInvulnerable(duration) {
    this.invulnerable = true;
    this.invulnerabilityTime = duration;
  }
  
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.events.emit('player:health', this.health, this.maxHealth);
  }
  
  restoreEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }
  
  // Collectibles
  collectItem(type, amount = 1) {
    if (this.inventory[type] !== undefined) {
      this.inventory[type] += amount;
      
      const points = GAME_CONFIG.COLLECTIBLES[type.toUpperCase()]?.points || 25;
      this.inventory.score += amount * points;
      
      // Visual and audio feedback
      const color = GAME_CONFIG.COLLECTIBLES[type.toUpperCase()]?.color || 0x9B59B6;
      this.particleSystem.createCollectEffect(this.x, this.y, color);
      this.scene.audioSystem?.playCollectSound(type);
      
      // Emit inventory update
      this.scene.events.emit('ui:inventory', this.inventory);
    }
  }
  
  // Visual Effects
  createDashEffect() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true
    });
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
  
  // Death and Respawn
  handleDeath() {
    this.scene.events.emit('player:death');
  }
  
  respawn(x = GAME_CONFIG.PLAYER.SPAWN_X, y = GAME_CONFIG.PLAYER.SPAWN_Y) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.invulnerable = false;
    this.abilities.tripleJump.jumpsUsed = 0;
    this.abilities.groundSlam.slamming = false;
    
    if (this.abilities.timeSlow.active) {
      this.deactivateTimeSlow();
    }
    
    this.setAngle(0);
    this.setTint(GAME_CONFIG.PLAYER.COLOR);
    this.setAlpha(1);
  }
  
  // Cleanup
  destroy(fromScene) {
    if (this.particleSystem) {
      this.particleSystem.destroy();
    }
    
    if (this.graphics) {
      this.graphics.destroy();
    }
    
    if (this.timeSlowOverlay) {
      this.timeSlowOverlay.destroy();
    }
    
    super.destroy(fromScene);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}

// Global access
window.Player = Player;