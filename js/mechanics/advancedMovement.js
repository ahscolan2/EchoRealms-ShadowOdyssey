// Advanced Movement Mechanics
// Triple Jump, Echo Phase-Dash, Time Slow, and Ground Slam abilities

class AdvancedMovement {
  constructor(player, scene) {
    this.player = player;
    this.scene = scene;
    
    // Ability states
    this.abilities = {
      tripleJump: { unlocked: false, jumpsUsed: 0, maxJumps: 3 },
      echoPhaseDash: { unlocked: false, cooldown: 0, maxCooldown: 120 },
      timeSlow: { unlocked: false, active: false, duration: 0, maxDuration: 180, cooldown: 0 },
      groundSlam: { unlocked: false, slamming: false, chargeTime: 0 }
    };
    
    // Visual effects
    this.echoTrails = [];
    this.timeSlowOverlay = null;
    
    this.setupInputHandlers();
    this.createVisualEffects();
  }

  setupInputHandlers() {
    const cursors = this.scene.cursors;
    const wasd = this.scene.wasd;
    
    // Triple Jump - enhanced jump key handling
    this.scene.input.keyboard.on('keydown-SPACE', () => this.handleTripleJump());
    this.scene.input.keyboard.on('keydown-W', () => this.handleTripleJump());
    this.scene.input.keyboard.on('keydown-UP', () => this.handleTripleJump());
    
    // Echo Phase-Dash - X key or Shift
    this.scene.input.keyboard.on('keydown-X', () => this.handleEchoPhaseDash());
    this.scene.input.keyboard.on('keydown-SHIFT', () => this.handleEchoPhaseDash());
    
    // Time Slow - C key
    this.scene.input.keyboard.on('keydown-C', () => this.handleTimeSlow());
    
    // Ground Slam - S + Down or Down + Down
    this.scene.input.keyboard.on('keydown-S', () => this.handleGroundSlam());
    this.scene.input.keyboard.on('keydown-DOWN', () => this.handleGroundSlam());
  }

  handleTripleJump() {
    if (!this.abilities.tripleJump.unlocked) return;
    
    const canJump = this.player.body.touching.down || 
                   this.abilities.tripleJump.jumpsUsed < this.abilities.tripleJump.maxJumps;
    
    if (canJump) {
      // Reset jump count if touching ground
      if (this.player.body.touching.down) {
        this.abilities.tripleJump.jumpsUsed = 0;
      }
      
      // Perform jump with decreasing power
      const jumpPower = 300 - (this.abilities.tripleJump.jumpsUsed * 50);
      this.player.body.setVelocityY(-jumpPower);
      this.abilities.tripleJump.jumpsUsed++;
      
      // Visual effects based on jump number
      this.createJumpEffect(this.abilities.tripleJump.jumpsUsed);
      
      // Audio with pitch variation
      if (this.scene.sfx && this.scene.sfx.jump) {
        this.scene.sfx.jump.play({
          detune: this.abilities.tripleJump.jumpsUsed * 200,
          volume: 0.6
        });
      }
    }
  }

  handleEchoPhaseDash() {
    if (!this.abilities.echoPhaseDash.unlocked || this.abilities.echoPhaseDash.cooldown > 0) return;
    
    const direction = this.player.facingRight ? 1 : -1;
    const dashDistance = 150;
    
    // Create echo trail before dash
    this.createEchoTrail();
    
    // Perform dash
    this.player.body.setVelocityX(dashDistance * direction * 3);
    this.player.body.setVelocityY(-50); // Slight upward boost
    
    // Invincibility frames
    this.player.invulnerable = true;
    this.player.setAlpha(0.5);
    
    // Phase effect
    this.scene.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // End dash effect
    this.scene.time.delayedCall(200, () => {
      this.player.invulnerable = false;
      this.player.setAlpha(1);
      this.abilities.echoPhaseDash.cooldown = this.abilities.echoPhaseDash.maxCooldown;
    });
    
    // Audio and particle effects
    if (this.scene.sfx && this.scene.sfx.dash) {
      this.scene.sfx.dash.play({ volume: 0.7 });
    }
    
    this.createDashParticles();
  }

  handleTimeSlow() {
    if (!this.abilities.timeSlow.unlocked || this.abilities.timeSlow.cooldown > 0) return;
    
    if (!this.abilities.timeSlow.active) {
      // Activate time slow
      this.abilities.timeSlow.active = true;
      this.abilities.timeSlow.duration = this.abilities.timeSlow.maxDuration;
      
      // Slow down physics
      this.scene.physics.world.timeScale = 0.3;
      
      // Visual effects
      this.createTimeSlowOverlay();
      
      // Audio effect
      if (this.scene.sound.get('timeSlow')) {
        this.scene.sound.get('timeSlow').play({ volume: 0.5 });
      }
    }
  }

  handleGroundSlam() {
    if (!this.abilities.groundSlam.unlocked || this.player.body.touching.down) return;
    
    // Only allow if player is in air and moving downward
    if (this.player.body.velocity.y > 0) {
      this.abilities.groundSlam.slamming = true;
      this.abilities.groundSlam.chargeTime = 0;
      
      // Increase downward velocity
      this.player.body.setVelocityY(500);
      this.player.body.setVelocityX(0);
      
      // Visual charging effect
      this.scene.tweens.add({
        targets: this.player,
        angle: this.player.angle + 720,
        duration: 800,
        ease: 'Power2.easeIn'
      });
      
      // Particle trail while slamming
      this.createSlamTrail();
    }
  }

  createJumpEffect(jumpNumber) {
    const colors = [0xFFFFFF, 0x00FFFF, 0xFF00FF]; // White, cyan, magenta
    const color = colors[jumpNumber - 1] || 0xFFFF00;
    
    // Ring expansion effect
    const ring = this.scene.add.circle(this.player.x, this.player.y + 20, 5, color, 0.8);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy()
    });
    
    // Sparkle particles
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.circle(
        this.player.x + Phaser.Math.Between(-20, 20),
        this.player.y + Phaser.Math.Between(-10, 10),
        2, color, 0.9
      );
      
      this.scene.tweens.add({
        targets: sparkle,
        y: sparkle.y - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => sparkle.destroy()
      });
    }
  }

  createEchoTrail() {
    const echo = this.scene.add.rectangle(this.player.x, this.player.y, 
                                         this.player.width, this.player.height, 
                                         0x00FFFF, 0.6);
    echo.setRotation(this.player.rotation);
    
    this.echoTrails.push(echo);
    
    this.scene.tweens.add({
      targets: echo,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      onComplete: () => {
        echo.destroy();
        const index = this.echoTrails.indexOf(echo);
        if (index > -1) this.echoTrails.splice(index, 1);
      }
    });
  }

  createDashParticles() {
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(
        this.player.x + Phaser.Math.Between(-15, 15),
        this.player.y + Phaser.Math.Between(-15, 15),
        Phaser.Math.Between(2, 4),
        0x00FFFF,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
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
      0x0066FF,
      0.15
    );
    this.timeSlowOverlay.setScrollFactor(0);
    this.timeSlowOverlay.setDepth(1000);
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: this.timeSlowOverlay,
      alpha: 0.25,
      duration: 500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  createSlamTrail() {
    if (this.abilities.groundSlam.slamming) {
      const trail = this.scene.add.circle(
        this.player.x + Phaser.Math.Between(-5, 5),
        this.player.y + 15,
        Phaser.Math.Between(3, 6),
        0xFF4500,
        0.7
      );
      
      this.scene.tweens.add({
        targets: trail,
        scaleX: 0.3,
        scaleY: 0.3,
        alpha: 0,
        duration: 300,
        onComplete: () => trail.destroy()
      });
      
      // Continue creating trail while slamming
      if (this.abilities.groundSlam.slamming) {
        this.scene.time.delayedCall(50, () => this.createSlamTrail());
      }
    }
  }

  handleGroundSlamImpact() {
    if (!this.abilities.groundSlam.slamming) return;
    
    this.abilities.groundSlam.slamming = false;
    
    // Impact effect
    this.scene.cameras.main.shake(200, 0.05);
    
    // Shockwave rings
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(this.player.x, this.player.y + 20, 10, 0xFF4500, 0.6);
      
      this.scene.tweens.add({
        targets: ring,
        scaleX: 4 + i,
        scaleY: 2 + i * 0.5,
        alpha: 0,
        duration: 400 + i * 100,
        delay: i * 50,
        onComplete: () => ring.destroy()
      });
    }
    
    // Damage nearby enemies (implement collision detection)
    // Break certain platforms (implement destructible platforms)
    
    // Audio
    if (this.scene.sfx && this.scene.sfx.slam) {
      this.scene.sfx.slam.play({ volume: 0.8 });
    }
  }

  update() {
    // Update cooldowns
    if (this.abilities.echoPhaseDash.cooldown > 0) {
      this.abilities.echoPhaseDash.cooldown--;
    }
    
    // Update time slow
    if (this.abilities.timeSlow.active) {
      this.abilities.timeSlow.duration--;
      
      if (this.abilities.timeSlow.duration <= 0) {
        this.deactivateTimeSlow();
      }
    } else if (this.abilities.timeSlow.cooldown > 0) {
      this.abilities.timeSlow.cooldown--;
    }
    
    // Check for ground slam impact
    if (this.abilities.groundSlam.slamming && this.player.body.touching.down) {
      this.handleGroundSlamImpact();
    }
    
    // Reset triple jump when touching ground
    if (this.player.body.touching.down) {
      this.abilities.tripleJump.jumpsUsed = 0;
    }
  }

  deactivateTimeSlow() {
    this.abilities.timeSlow.active = false;
    this.abilities.timeSlow.cooldown = 300; // 5 second cooldown
    
    // Restore normal time
    this.scene.physics.world.timeScale = 1;
    
    // Remove overlay
    if (this.timeSlowOverlay) {
      this.timeSlowOverlay.destroy();
      this.timeSlowOverlay = null;
    }
  }

  unlockAbility(abilityName) {
    if (this.abilities[abilityName]) {
      this.abilities[abilityName].unlocked = true;
      
      // Visual unlock notification
      this.showUnlockNotification(abilityName);
    }
  }

  showUnlockNotification(abilityName) {
    const abilityNames = {
      tripleJump: 'Triple Jump Unlocked!',
      echoPhaseDash: 'Echo Phase-Dash Unlocked!',
      timeSlow: 'Time Slow Unlocked!',
      groundSlam: 'Ground Slam Unlocked!'
    };
    
    const notification = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 100,
      abilityNames[abilityName] || 'New Ability Unlocked!',
      {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Animation
    notification.setScale(0);
    this.scene.tweens.add({
      targets: notification,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.scene.time.delayedCall(2000, () => {
      this.scene.tweens.add({
        targets: notification,
        alpha: 0,
        y: notification.y - 30,
        duration: 500,
        onComplete: () => notification.destroy()
      });
    });
  }

  getAbilityStatus(abilityName) {
    return this.abilities[abilityName] || null;
  }

  destroy() {
    this.echoTrails.forEach(trail => trail.destroy());
    this.echoTrails = [];
    
    if (this.timeSlowOverlay) {
      this.timeSlowOverlay.destroy();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedMovement;
}