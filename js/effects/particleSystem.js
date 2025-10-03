// Enhanced Particle System
// Advanced particle effects for visual polish and atmospheric enhancement

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.emitters = new Map();
    this.oneTimeEffects = [];
    
    // Particle textures (created programmatically)
    this.createParticleTextures();
    
    // Environment particle systems
    this.ambientSystems = {
      shadows: null,
      energy: null,
      dust: null,
      sparkles: null
    };
    
    this.setupAmbientParticles();
  }

  createParticleTextures() {
    // Create basic particle textures using graphics
    const graphics = this.scene.add.graphics();
    
    // Circular particle
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_circle', 8, 8);
    
    // Star particle
    graphics.clear();
    graphics.fillStyle(0xFFFFFF);
    graphics.beginPath();
    graphics.moveTo(4, 0);
    graphics.lineTo(5, 3);
    graphics.lineTo(8, 3);
    graphics.lineTo(6, 5);
    graphics.lineTo(7, 8);
    graphics.lineTo(4, 6);
    graphics.lineTo(1, 8);
    graphics.lineTo(2, 5);
    graphics.lineTo(0, 3);
    graphics.lineTo(3, 3);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('particle_star', 8, 8);
    
    // Square particle
    graphics.clear();
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(2, 2, 4, 4);
    graphics.generateTexture('particle_square', 8, 8);
    
    // Diamond particle
    graphics.clear();
    graphics.fillStyle(0xFFFFFF);
    graphics.beginPath();
    graphics.moveTo(4, 0);
    graphics.lineTo(8, 4);
    graphics.lineTo(4, 8);
    graphics.lineTo(0, 4);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('particle_diamond', 8, 8);
    
    graphics.destroy();
  }

  setupAmbientParticles() {
    // Floating shadow particles
    this.ambientSystems.shadows = this.scene.add.particles(0, 0, 'particle_circle', {
      x: { min: 0, max: this.scene.cameras.main.width },
      y: { min: 0, max: this.scene.cameras.main.height },
      speedX: { min: -10, max: 10 },
      speedY: { min: -15, max: -5 },
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.1, end: 0.05 },
      tint: [0x2C2C54, 0x40407A, 0x706FD3],
      lifespan: { min: 3000, max: 8000 },
      frequency: 400,
      blendMode: 'MULTIPLY'
    });
    this.ambientSystems.shadows.setDepth(-10);
    
    // Energy orb sparkles
    this.ambientSystems.energy = this.scene.add.particles(0, 0, 'particle_star', {
      x: { min: 50, max: this.scene.cameras.main.width - 50 },
      y: { min: 50, max: this.scene.cameras.main.height - 50 },
      speedX: { min: -5, max: 5 },
      speedY: { min: -20, max: -10 },
      scale: { start: 0.2, end: 0.5 },
      alpha: { start: 0.8, end: 0.2 },
      tint: [0x9B59B6, 0x8E44AD, 0xBB8FCE],
      rotate: { start: 0, end: 360 },
      lifespan: { min: 2000, max: 4000 },
      frequency: 800,
      blendMode: 'ADD'
    });
    this.ambientSystems.energy.setDepth(-5);
    
    // Atmospheric dust
    this.ambientSystems.dust = this.scene.add.particles(0, 0, 'particle_square', {
      x: { min: -50, max: this.scene.cameras.main.width + 50 },
      y: { min: -20, max: 0 },
      speedX: { min: -15, max: 15 },
      speedY: { min: 5, max: 25 },
      scale: { start: 0.05, end: 0.15 },
      alpha: { start: 0.05, end: 0.02 },
      tint: [0x95A5A6, 0x7F8C8D, 0xBDC3C7],
      lifespan: { min: 5000, max: 10000 },
      frequency: 300,
      blendMode: 'NORMAL'
    });
    this.ambientSystems.dust.setDepth(-15);
  }

  // Player-specific effects
  createPlayerTrail(player, color = 0x00FFFF, intensity = 1.0) {
    const trailKey = 'playerTrail';
    
    if (this.emitters.has(trailKey)) {
      this.emitters.get(trailKey).destroy();
    }
    
    const trail = this.scene.add.particles(player.x, player.y, 'particle_circle', {
      speedX: { min: -30, max: 30 },
      speedY: { min: -30, max: 30 },
      scale: { start: 0.3 * intensity, end: 0.1 },
      alpha: { start: 0.8 * intensity, end: 0 },
      tint: color,
      lifespan: 300,
      quantity: 2,
      blendMode: 'ADD'
    });
    
    trail.startFollow(player);
    this.emitters.set(trailKey, trail);
    
    return trail;
  }

  createJumpExplosion(x, y, intensity = 1.0) {
    const particles = this.scene.add.particles(x, y, 'particle_star', {
      speedX: { min: -100, max: 100 },
      speedY: { min: -150, max: -50 },
      scale: { start: 0.4 * intensity, end: 0.1 },
      alpha: { start: 1, end: 0 },
      tint: [0xFFFFFF, 0x00FFFF, 0xFF00FF],
      rotate: { start: 0, end: 360 },
      lifespan: 500,
      quantity: 15,
      blendMode: 'ADD'
    });
    
    this.oneTimeEffects.push(particles);
    
    // Auto-destroy after lifespan
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
      const index = this.oneTimeEffects.indexOf(particles);
      if (index > -1) this.oneTimeEffects.splice(index, 1);
    });
    
    return particles;
  }

  createDashEffect(x, y, direction = 1) {
    const particles = this.scene.add.particles(x, y, 'particle_diamond', {
      speedX: { min: -150 * direction, max: -50 * direction },
      speedY: { min: -50, max: 50 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 0.9, end: 0 },
      tint: [0x00FFFF, 0x0099CC, 0x33CCFF],
      lifespan: 400,
      quantity: 20,
      blendMode: 'ADD'
    });
    
    this.oneTimeEffects.push(particles);
    
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
      const index = this.oneTimeEffects.indexOf(particles);
      if (index > -1) this.oneTimeEffects.splice(index, 1);
    });
    
    return particles;
  }

  createGroundSlamExplosion(x, y) {
    // Main explosion
    const explosion = this.scene.add.particles(x, y, 'particle_circle', {
      speedX: { min: -200, max: 200 },
      speedY: { min: -200, max: -100 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 1, end: 0 },
      tint: [0xFF4500, 0xFF6600, 0xFFAA00],
      lifespan: 600,
      quantity: 30,
      blendMode: 'ADD'
    });
    
    // Ground debris
    const debris = this.scene.add.particles(x, y, 'particle_square', {
      speedX: { min: -150, max: 150 },
      speedY: { min: -100, max: -30 },
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x8B4513, 0xA0522D, 0xD2691E],
      rotate: { start: 0, end: 360 },
      lifespan: 800,
      quantity: 20,
      blendMode: 'NORMAL'
    });
    
    this.oneTimeEffects.push(explosion, debris);
    
    this.scene.time.delayedCall(1200, () => {
      explosion.destroy();
      debris.destroy();
      const explosionIndex = this.oneTimeEffects.indexOf(explosion);
      const debrisIndex = this.oneTimeEffects.indexOf(debris);
      if (explosionIndex > -1) this.oneTimeEffects.splice(explosionIndex, 1);
      if (debrisIndex > -1) this.oneTimeEffects.splice(debrisIndex, 1);
    });
    
    return { explosion, debris };
  }

  createCollectibleEffect(x, y, type = 'orb') {
    const configs = {
      orb: {
        texture: 'particle_star',
        tint: [0x9B59B6, 0x8E44AD, 0xE74C3C],
        scale: { start: 0.5, end: 0.8 },
        quantity: 12
      },
      key: {
        texture: 'particle_diamond',
        tint: [0xF1C40F, 0xF39C12, 0xFFD700],
        scale: { start: 0.4, end: 0.6 },
        quantity: 8
      },
      shard: {
        texture: 'particle_square',
        tint: [0x3498DB, 0x2980B9, 0x85C1E9],
        scale: { start: 0.3, end: 0.5 },
        quantity: 10
      }
    };
    
    const config = configs[type] || configs.orb;
    
    const particles = this.scene.add.particles(x, y, config.texture, {
      speedX: { min: -80, max: 80 },
      speedY: { min: -120, max: -60 },
      scale: config.scale,
      alpha: { start: 1, end: 0 },
      tint: config.tint,
      rotate: { start: 0, end: 360 },
      lifespan: 700,
      quantity: config.quantity,
      blendMode: 'ADD'
    });
    
    this.oneTimeEffects.push(particles);
    
    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
      const index = this.oneTimeEffects.indexOf(particles);
      if (index > -1) this.oneTimeEffects.splice(index, 1);
    });
    
    return particles;
  }

  createEnemyDeathExplosion(x, y, enemyType = 'shadow') {
    const configs = {
      shadow: {
        tint: [0x2C2C54, 0x40407A, 0x706FD3],
        scale: { start: 0.6, end: 0.2 }
      },
      forest: {
        tint: [0x228B22, 0x32CD32, 0x90EE90],
        scale: { start: 0.5, end: 0.3 }
      },
      crystal: {
        tint: [0x3498DB, 0x5DADE2, 0x85C1E9],
        scale: { start: 0.7, end: 0.1 }
      }
    };
    
    const config = configs[enemyType] || configs.shadow;
    
    const particles = this.scene.add.particles(x, y, 'particle_circle', {
      speedX: { min: -120, max: 120 },
      speedY: { min: -120, max: 120 },
      scale: config.scale,
      alpha: { start: 0.9, end: 0 },
      tint: config.tint,
      lifespan: 500,
      quantity: 18,
      blendMode: 'ADD'
    });
    
    this.oneTimeEffects.push(particles);
    
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
      const index = this.oneTimeEffects.indexOf(particles);
      if (index > -1) this.oneTimeEffects.splice(index, 1);
    });
    
    return particles;
  }

  createPortalEffect(x, y, radius = 50) {
    // Swirling portal particles
    const portal = this.scene.add.particles(x, y, 'particle_diamond', {
      speedX: { min: -30, max: 30 },
      speedY: { min: -30, max: 30 },
      scale: { start: 0.2, end: 0.5 },
      alpha: { start: 0.8, end: 0.3 },
      tint: [0x9B59B6, 0x8E44AD, 0x663399],
      rotate: { start: 0, end: 360 },
      lifespan: 2000,
      frequency: 50,
      blendMode: 'ADD',
      emitZone: { 
        source: new Phaser.Geom.Circle(0, 0, radius),
        type: 'edge',
        quantity: 1
      }
    });
    
    // Orbital motion
    let angle = 0;
    const orbitEffect = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        angle += 0.05;
        portal.setPosition(
          x + Math.cos(angle) * 5,
          y + Math.sin(angle) * 5
        );
      },
      loop: true
    });
    
    return { particles: portal, orbit: orbitEffect };
  }

  createWeatherEffect(type = 'rain', intensity = 1.0) {
    const weatherKey = `weather_${type}`;
    
    // Remove existing weather
    if (this.emitters.has(weatherKey)) {
      this.emitters.get(weatherKey).destroy();
    }
    
    let weather;
    
    switch (type) {
      case 'rain':
        weather = this.scene.add.particles(0, 0, 'particle_square', {
          x: { min: -100, max: this.scene.cameras.main.width + 100 },
          y: { min: -50, max: -20 },
          speedX: { min: -20, max: -10 },
          speedY: { min: 200, max: 400 },
          scale: { start: 0.1, end: 0.1 },
          alpha: { start: 0.6 * intensity, end: 0.3 * intensity },
          tint: 0x87CEEB,
          lifespan: 2000,
          frequency: 20 / intensity,
          blendMode: 'NORMAL'
        });
        break;
        
      case 'snow':
        weather = this.scene.add.particles(0, 0, 'particle_circle', {
          x: { min: -50, max: this.scene.cameras.main.width + 50 },
          y: { min: -30, max: -10 },
          speedX: { min: -15, max: 15 },
          speedY: { min: 30, max: 80 },
          scale: { start: 0.15, end: 0.25 },
          alpha: { start: 0.8 * intensity, end: 0.4 * intensity },
          tint: 0xFFFFFF,
          lifespan: 8000,
          frequency: 100 / intensity,
          blendMode: 'NORMAL'
        });
        break;
        
      case 'fog':
        weather = this.scene.add.particles(0, 0, 'particle_circle', {
          x: { min: -100, max: this.scene.cameras.main.width + 100 },
          y: { min: this.scene.cameras.main.height * 0.7, max: this.scene.cameras.main.height + 50 },
          speedX: { min: -10, max: 10 },
          speedY: { min: -5, max: 5 },
          scale: { start: 2, end: 4 },
          alpha: { start: 0.1 * intensity, end: 0.05 * intensity },
          tint: 0xCCCCCC,
          lifespan: 10000,
          frequency: 200,
          blendMode: 'MULTIPLY'
        });
        break;
    }
    
    if (weather) {
      weather.setDepth(-8);
      this.emitters.set(weatherKey, weather);
    }
    
    return weather;
  }

  stopWeatherEffect(type = 'rain') {
    const weatherKey = `weather_${type}`;
    if (this.emitters.has(weatherKey)) {
      this.emitters.get(weatherKey).destroy();
      this.emitters.delete(weatherKey);
    }
  }

  setAmbientIntensity(intensity = 1.0) {
    Object.values(this.ambientSystems).forEach(system => {
      if (system) {
        system.setAlpha(system.alpha * intensity);
      }
    });
  }

  pauseAll() {
    this.emitters.forEach(emitter => emitter.pause());
    Object.values(this.ambientSystems).forEach(system => {
      if (system) system.pause();
    });
  }

  resumeAll() {
    this.emitters.forEach(emitter => emitter.resume());
    Object.values(this.ambientSystems).forEach(system => {
      if (system) system.resume();
    });
  }

  cleanup() {
    // Clean up one-time effects that may have lingered
    this.oneTimeEffects.forEach(effect => {
      if (effect && effect.active) effect.destroy();
    });
    this.oneTimeEffects = [];
  }

  destroy() {
    this.emitters.forEach(emitter => emitter.destroy());
    this.emitters.clear();
    
    Object.values(this.ambientSystems).forEach(system => {
      if (system) system.destroy();
    });
    
    this.cleanup();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleSystem;
}