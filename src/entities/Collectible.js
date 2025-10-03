// Collectibles system with different types and animations
class Collectible extends Phaser.GameObjects.Circle {
  constructor(scene, x, y, type = 'orb') {
    const config = GAME_CONFIG.COLLECTIBLES[type] || GAME_CONFIG.COLLECTIBLES.orb;
    
    super(scene, x, y, config.radius);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    
    this.collectType = type;
    this.value = config.value;
    this.points = config.points;
    this.setFillStyle(config.color, 0.8);
    this.setStrokeStyle(2, config.color, 1);
    
    // Add to collectibles group
    if (scene.collectibles) {
      scene.collectibles.add(this);
    }
    
    this.setupAnimations();
  }
  
  setupAnimations() {
    // Floating animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 15,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    
    // Pulsing glow
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    
    // Rotation for crystals and artifacts
    if (this.collectType === 'crystal' || this.collectType === 'artifact') {
      this.scene.tweens.add({
        targets: this,
        rotation: Math.PI * 2,
        duration: 4000,
        repeat: -1,
        ease: 'Linear'
      });
    }
    
    // Special effects for artifacts
    if (this.collectType === 'artifact') {
      this.createArtifactAura();
    }
  }
  
  createArtifactAura() {
    // Create pulsing aura effect for artifacts
    const aura = this.scene.add.circle(this.x, this.y, this.radius + 10, 0xE74C3C, 0.2);
    aura.setStrokeStyle(1, 0xE74C3C, 0.5);
    
    this.scene.tweens.add({
      targets: aura,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2.easeOut',
      repeat: -1
    });
    
    // Link aura to collectible movement
    this.aura = aura;
    this.scene.tweens.add({
      targets: aura,
      y: this.y - 15,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  collect(player) {
    player.collectItem(this.collectType, this.value);
    
    // Collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        if (this.aura) {
          this.aura.destroy();
        }
        this.destroy();
      }
    });
  }
  
  // Update position of aura if it exists
  preUpdate() {
    if (this.aura) {
      this.aura.x = this.x;
      this.aura.y = this.y;
    }
  }
}

// Health pickup - restores player health
class HealthPickup extends Collectible {
  constructor(scene, x, y, amount = 25) {
    super(scene, x, y, 'health');
    
    this.healAmount = amount;
    this.setFillStyle(0x00FF00, 0.8);
    this.setStrokeStyle(2, 0x00FF00, 1);
    
    // Create cross symbol
    const crossH = scene.add.rectangle(x, y, this.radius * 1.2, this.radius * 0.4, 0xFFFFFF);
    const crossV = scene.add.rectangle(x, y, this.radius * 0.4, this.radius * 1.2, 0xFFFFFF);
    
    this.crossH = crossH;
    this.crossV = crossV;
    
    // Link cross to floating animation
    scene.tweens.add({
      targets: [crossH, crossV],
      y: y - 15,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  collect(player) {
    if (player.health < player.maxHealth) {
      player.health = Math.min(player.maxHealth, player.health + this.healAmount);
      
      // Healing effect
      player.particleSystem.createScreenEffect('heal', 200);
      player.scene.audioSystem.playSound('collect', { volume: 1.5 });
      
      // Update UI
      player.scene.events.emit('player:health', player.health, player.maxHealth);
      
      // Collection animation
      this.scene.tweens.add({
        targets: [this, this.crossH, this.crossV],
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.crossH.destroy();
          this.crossV.destroy();
          this.destroy();
        }
      });
    }
  }
  
  preUpdate() {
    super.preUpdate();
    if (this.crossH && this.crossV) {
      this.crossH.x = this.x;
      this.crossH.y = this.y;
      this.crossV.x = this.x;
      this.crossV.y = this.y;
    }
  }
}

// Energy pickup - restores player energy
class EnergyPickup extends Collectible {
  constructor(scene, x, y, amount = 30) {
    super(scene, x, y, 'energy');
    
    this.energyAmount = amount;
    this.setFillStyle(0x0099FF, 0.8);
    this.setStrokeStyle(2, 0x0099FF, 1);
    
    // Create lightning bolt effect
    this.createLightningEffect();
  }
  
  createLightningEffect() {
    const points = [
      this.x - 3, this.y - 8,
      this.x + 1, this.y - 3,
      this.x - 2, this.y,
      this.x + 3, this.y + 3,
      this.x - 1, this.y + 8
    ];
    
    const lightning = this.scene.add.polygon(this.x, this.y, points, 0xFFFFFF);
    this.lightning = lightning;
    
    // Link to floating animation
    this.scene.tweens.add({
      targets: lightning,
      y: this.y - 15,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
    
    // Flickering effect
    this.scene.tweens.add({
      targets: lightning,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  collect(player) {
    if (player.energy < player.maxEnergy) {
      player.energy = Math.min(player.maxEnergy, player.energy + this.energyAmount);
      
      // Energy restoration effect
      for (let i = 0; i < 5; i++) {
        const spark = this.scene.add.circle(
          this.x + Phaser.Math.Between(-15, 15),
          this.y + Phaser.Math.Between(-15, 15),
          2, 0x0099FF, 1
        );
        
        this.scene.tweens.add({
          targets: spark,
          x: player.x,
          y: player.y,
          alpha: 0,
          duration: 400,
          onComplete: () => spark.destroy()
        });
      }
      
      player.scene.audioSystem.playSound('collect', { volume: 1.2, detune: 200 });
      
      // Collection animation
      this.scene.tweens.add({
        targets: [this, this.lightning],
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.lightning.destroy();
          this.destroy();
        }
      });
    }
  }
  
  preUpdate() {
    super.preUpdate();
    if (this.lightning) {
      this.lightning.x = this.x;
      this.lightning.y = this.y;
    }
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.Collectible = Collectible;
  window.HealthPickup = HealthPickup;
  window.EnergyPickup = EnergyPickup;
}