// EchoRealms: Shadow Odyssey - Particle System
// Professional particle effects for enhanced visual feedback

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.particlePool = [];
    this.maxParticles = GAME_CONFIG.PARTICLES.MAX_PARTICLES;
    this.poolSize = GAME_CONFIG.PARTICLES.POOL_SIZE;
    
    // Initialize particle pool
    this.initializePool();
    
    // Cleanup timer
    this.cleanupTimer = scene.time.addEvent({
      delay: GAME_CONFIG.PARTICLES.CLEANUP_INTERVAL || 1000,
      callback: this.cleanup,
      callbackScope: this,
      loop: true
    });
  }
  
  initializePool() {
    // Pre-create particle objects for performance
    for (let i = 0; i < this.poolSize; i++) {
      const particle = this.scene.add.circle(0, 0, 3, 0xFFFFFF, 0);
      particle.setVisible(false);
      this.particlePool.push(particle);
    }
  }
  
  getParticle() {
    if (this.particlePool.length > 0) {
      return this.particlePool.pop();
    }
    // If pool is empty, create new particle
    return this.scene.add.circle(0, 0, 3, 0xFFFFFF, 0);
  }
  
  returnParticle(particle) {
    if (particle && particle.active) {
      particle.setVisible(false);
      particle.setActive(false);
      particle.alpha = 1;
      particle.scaleX = 1;
      particle.scaleY = 1;
      
      if (this.particlePool.length < this.poolSize) {
        this.particlePool.push(particle);
      } else {
        particle.destroy();
      }
    }
  }
  
  createJumpEffect(x, y) {
    const particleCount = GAME_CONFIG.PARTICLES.JUMP_PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const distance = 15;
      
      const particle = this.getParticle();
      if (!particle) continue;
      
      particle.setPosition(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance
      );
      particle.setFillStyle(GAME_CONFIG.PLAYER.COLOR, 0.8);
      particle.setRadius(4);
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      // Animate particle
      this.scene.tweens.add({
        targets: particle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  createDashTrail(x, y, direction = 1) {
    for (let i = 0; i < 5; i++) {
      const particle = this.getParticle();
      if (!particle) continue;
      
      particle.setPosition(
        x - (direction * i * 8),
        y + Phaser.Math.Between(-5, 5)
      );
      particle.setFillStyle(GAME_CONFIG.PLAYER.COLOR, 0.6);
      particle.setRadius(6);
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        delay: i * 50,
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  createImpactExplosion(x, y, color = 0xFF4500) {
    const particleCount = GAME_CONFIG.PARTICLES.IMPACT_PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      if (!particle) continue;
      
      const startX = x + Phaser.Math.Between(-20, 20);
      const startY = y + Phaser.Math.Between(-20, 20);
      const endX = startX + Phaser.Math.Between(-60, 60);
      const endY = startY + Phaser.Math.Between(-60, 60);
      
      particle.setPosition(startX, startY);
      particle.setFillStyle(color, 0.9);
      particle.setRadius(Phaser.Math.Between(3, 7));
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 600,
        ease: 'Power2.easeOut',
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  createCollectEffect(x, y, color) {
    const particleCount = GAME_CONFIG.PARTICLES.COLLECT_PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      if (!particle) continue;
      
      const startX = x + Phaser.Math.Between(-8, 8);
      const startY = y + Phaser.Math.Between(-8, 8);
      
      particle.setPosition(startX, startY);
      particle.setFillStyle(color, 0.9);
      particle.setRadius(3);
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      this.scene.tweens.add({
        targets: particle,
        y: startY - 40,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 800,
        ease: 'Power2.easeOut',
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  createMovementDust(x, y) {
    const particle = this.getParticle();
    if (!particle) return;
    
    particle.setPosition(
      x + Phaser.Math.Between(-10, 10),
      y + 20
    );
    particle.setFillStyle(0x555555, 0.6);
    particle.setRadius(2);
    particle.setVisible(true);
    particle.setActive(true);
    
    this.particles.push(particle);
    
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      y: particle.y + 10,
      duration: 300,
      onComplete: () => {
        this.removeParticle(particle);
      }
    });
  }
  
  createAmbientParticles(biomeType) {
    if (this.particles.length > this.maxParticles * 0.8) {
      return; // Don't create if too many particles
    }
    
    const biomeConfig = this.getBiomeParticleConfig(biomeType);
    const colors = biomeConfig.colors;
    
    for (let i = 0; i < 2; i++) {
      const particle = this.getParticle();
      if (!particle) continue;
      
      const color = Phaser.Utils.Array.GetRandom(colors);
      const startY = Phaser.Math.Between(-50, 0);
      const endY = startY + GAME_CONFIG.WORLD.HEIGHT + 100;
      
      particle.setPosition(
        Phaser.Math.Between(0, GAME_CONFIG.WORLD.WIDTH),
        startY
      );
      particle.setFillStyle(color, 0.4);
      particle.setRadius(Phaser.Math.Between(2, 4));
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      this.scene.tweens.add({
        targets: particle,
        y: endY,
        alpha: 0,
        duration: Phaser.Math.Between(6000, 10000),
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  createTimeSlowEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = this.getParticle();
      if (!particle) continue;
      
      const angle = (Math.PI * 2 / 8) * i;
      const radius = 30;
      
      particle.setPosition(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      particle.setFillStyle(0x0066FF, 0.7);
      particle.setRadius(5);
      particle.setVisible(true);
      particle.setActive(true);
      
      this.particles.push(particle);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (radius + 50),
        y: y + Math.sin(angle) * (radius + 50),
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 1000,
        onComplete: () => {
          this.removeParticle(particle);
        }
      });
    }
  }
  
  getBiomeParticleConfig(biomeType) {
    const configs = {
      shadow: { colors: [0x8E44AD, 0x9B59B6, 0x663399] },
      forest: { colors: [0x27AE60, 0x2ECC71, 0x58D68D] },
      crystal: { colors: [0x3498DB, 0x5DADE2, 0x85C1E9] },
      boss: { colors: [0xE74C3C, 0xF1948A, 0xCD6155] }
    };
    
    return configs[biomeType] || configs.shadow;
  }
  
  removeParticle(particle) {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
    }
    this.returnParticle(particle);
  }
  
  cleanup() {
    // Remove inactive particles
    this.particles = this.particles.filter(particle => {
      if (!particle.active || !particle.visible) {
        this.returnParticle(particle);
        return false;
      }
      return true;
    });
    
    // If too many particles, remove oldest ones
    while (this.particles.length > this.maxParticles) {
      const particle = this.particles.shift();
      this.returnParticle(particle);
    }
  }
  
  destroy() {
    // Clean up all particles
    this.particles.forEach(particle => {
      if (particle && particle.destroy) {
        particle.destroy();
      }
    });
    
    this.particlePool.forEach(particle => {
      if (particle && particle.destroy) {
        particle.destroy();
      }
    });
    
    if (this.cleanupTimer) {
      this.cleanupTimer.destroy();
    }
    
    this.particles = [];
    this.particlePool = [];
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleSystem;
}

// Global access
window.ParticleSystem = ParticleSystem;