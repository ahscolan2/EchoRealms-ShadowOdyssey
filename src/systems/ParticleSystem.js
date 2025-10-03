// Particle System for visual effects
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createJumpEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.scene.add.circle(
        x + Math.cos(angle) * 15,
        y + Math.sin(angle) * 15,
        4, 0x00FFFF, 0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
  }

  createDashTrail(x, y) {
    const trail = this.scene.add.rectangle(x, y, 32, 48, 0x00FFFF, 0.6);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      onComplete: () => trail.destroy()
    });
  }

  createImpactExplosion(x, y, color = 0xFF4500) {
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        5, color, 0.9
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-60, 60),
        y: particle.y + Phaser.Math.Between(-60, 60),
        alpha: 0,
        scale: 0.2,
        duration: 600,
        onComplete: () => particle.destroy()
      });
    }
  }

  createCollectEffect(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-8, 8),
        y + Phaser.Math.Between(-8, 8),
        3, color, 0.9
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 40,
        alpha: 0,
        scale: 1.5,
        duration: 800,
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  createAmbientParticles(biomeType) {
    const colors = {
      shadow: [0x8E44AD, 0x9B59B6, 0x663399],
      forest: [0x27AE60, 0x2ECC71, 0x58D68D],
      crystal: [0x3498DB, 0x5DADE2, 0x85C1E9],
      boss: [0xE74C3C, 0xF1948A, 0xCD6155]
    };
    
    const biomeColors = colors[biomeType] || colors.shadow;
    
    for (let i = 0; i < 3; i++) {
      const color = Phaser.Utils.Array.GetRandom(biomeColors);
      const particle = this.scene.add.circle(
        Phaser.Math.Between(0, GAME_CONFIG.WORLD.WIDTH),
        Phaser.Math.Between(-50, 0),
        Phaser.Math.Between(2, 4),
        color, 0.4
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + GAME_CONFIG.WORLD.HEIGHT + 100,
        alpha: 0,
        duration: Phaser.Math.Between(6000, 10000),
        onComplete: () => particle.destroy()
      });
    }
  }

  createMovementParticles(x, y) {
    const particle = this.scene.add.circle(
      x + Phaser.Math.Between(-10, 10),
      y + 20,
      2, 0x555555, 0.6
    );
    
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      y: particle.y + 10,
      duration: 300,
      onComplete: () => particle.destroy()
    });
  }

  createTimeSlowOverlay() {
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x0066FF, 0.15
    );
    overlay.setScrollFactor(0).setDepth(1000);
    return overlay;
  }

  createScreenEffect(type, duration = 300) {
    const colors = {
      damage: 0xFF0000,
      heal: 0x00FF00,
      levelComplete: 0x00FF88,
      gameOver: 0x000000
    };
    
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      colors[type] || 0xFFFFFF,
      0.3
    );
    
    overlay.setScrollFactor(0).setDepth(2000);
    
    this.scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: duration,
      onComplete: () => overlay.destroy()
    });
    
    return overlay;
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.ParticleSystem = ParticleSystem;
}