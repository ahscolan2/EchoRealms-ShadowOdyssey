// 🎮 EchoRealms: Shadow Odyssey - Professional Game Engine
// Complete rewrite with advanced features, multiple levels, and polished gameplay

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 1200;
    this.height = 700;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Game state management
    this.state = 'menu'; // menu, playing, paused, victory, gameOver
    this.currentLevel = 1;
    this.maxLevel = 12;
    this.currentBiome = 'shadow'; // shadow, forest, crystal, boss
    
    // Performance tracking
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsTime = Date.now();
    
    // Input system
    this.input = new InputManager();
    
    // Game objects
    this.player = null;
    this.camera = new Camera(this.width, this.height);
    this.levelManager = new LevelManager(this);
    this.particleSystem = new ParticleSystem();
    this.audioManager = new AudioManager();
    this.ui = new UIManager(this);
    
    // Game systems
    this.saveSystem = new SaveSystem();
    this.achievementSystem = new AchievementSystem();
    this.screenEffects = new ScreenEffects();
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.loadAssets();
    this.setupEventListeners();
    this.gameLoop();
  }
  
  setupCanvas() {
    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  loadAssets() {
    // Create dynamic sprites (ASCII art style for retro feel)
    this.sprites = {
      player: this.createPlayerSprite(),
      enemies: this.createEnemySprites(),
      tiles: this.createTileSprites(),
      effects: this.createEffectSprites()
    };
  }
  
  createPlayerSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    // Modern pixel art player
    ctx.fillStyle = '#00CCFF';
    ctx.fillRect(8, 8, 16, 32); // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 12, 4, 4); // Left eye
    ctx.fillRect(18, 12, 4, 4); // Right eye
    ctx.fillStyle = '#0099CC';
    ctx.fillRect(6, 40, 20, 8); // Feet
    
    return canvas;
  }
  
  createEnemySprites() {
    const sprites = {};
    
    // Shadow Wraith
    sprites.wraith = this.createEnemySprite('#8B00FF', true);
    // Forest Guardian
    sprites.guardian = this.createEnemySprite('#228B22', false);
    // Crystal Golem
    sprites.golem = this.createEnemySprite('#4169E1', false);
    // Shadow King
    sprites.king = this.createBossSprite();
    
    return sprites;
  }
  
  createEnemySprite(color, floating = false) {
    const canvas = document.createElement('canvas');
    canvas.width = floating ? 28 : 36;
    canvas.height = floating ? 28 : 42;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color;
    if (floating) {
      // Floating enemy (wraith)
      ctx.beginPath();
      ctx.arc(14, 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(8, 10, 3, 3); // Eyes
      ctx.fillRect(17, 10, 3, 3);
    } else {
      // Ground enemy
      ctx.fillRect(6, 6, 24, 30);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(12, 12, 4, 4); // Eyes
      ctx.fillRect(20, 12, 4, 4);
    }
    
    return canvas;
  }
  
  createBossSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Shadow King design
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(10, 20, 60, 70); // Body
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(25, 5, 30, 15); // Crown
    ctx.fillRect(30, 0, 4, 10); // Crown spikes
    ctx.fillRect(40, 0, 4, 15);
    ctx.fillRect(46, 0, 4, 10);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(28, 30, 6, 6); // Eyes
    ctx.fillRect(46, 30, 6, 6);
    
    return canvas;
  }
  
  createTileSprites() {
    const sprites = {};
    const biomes = ['shadow', 'forest', 'crystal', 'boss'];
    
    biomes.forEach(biome => {
      sprites[biome] = this.createBiomeTiles(biome);
    });
    
    return sprites;
  }
  
  createBiomeTiles(biome) {
    const tiles = {};
    const colors = {
      shadow: { primary: '#2C3E50', secondary: '#34495E', accent: '#8E44AD' },
      forest: { primary: '#27AE60', secondary: '#2ECC71', accent: '#F39C12' },
      crystal: { primary: '#3498DB', secondary: '#5DADE2', accent: '#E74C3C' },
      boss: { primary: '#8B0000', secondary: '#A52A2A', accent: '#FFD700' }
    };
    
    const biomeColors = colors[biome];
    
    // Platform tile
    tiles.platform = this.createTileSprite(biomeColors.primary, biomeColors.secondary);
    // Hazard tile
    tiles.hazard = this.createTileSprite(biomeColors.accent, '#FF0000');
    // Collectible
    tiles.orb = this.createOrbSprite(biomeColors.accent);
    
    return tiles;
  }
  
  createTileSprite(primary, secondary) {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, 40, 40);
    ctx.fillStyle = secondary;
    ctx.fillRect(0, 0, 40, 4); // Top highlight
    ctx.fillRect(0, 0, 4, 40); // Left highlight
    
    return canvas;
  }
  
  createOrbSprite(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(10, 10, 10, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
  }
  
  createEffectSprites() {
    return {
      explosion: this.createExplosionFrames(),
      pickup: this.createPickupFrames(),
      dash: this.createDashFrames()
    };
  }
  
  createExplosionFrames() {
    const frames = [];
    for (let i = 0; i < 8; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      
      const size = (i + 1) * 7;
      const alpha = 1 - (i / 8);
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(30, 30, size, 0, Math.PI * 2);
      ctx.fill();
      
      frames.push(canvas);
    }
    return frames;
  }
  
  createPickupFrames() {
    const frames = [];
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      
      const sparkles = 8;
      for (let j = 0; j < sparkles; j++) {
        const angle = (j / sparkles) * Math.PI * 2 + (i * 0.3);
        const distance = 15 + Math.sin(i * 0.5) * 5;
        const x = 20 + Math.cos(angle) * distance;
        const y = 20 + Math.sin(angle) * distance;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      frames.push(canvas);
    }
    return frames;
  }
  
  createDashFrames() {
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = `rgba(0, 204, 255, ${0.8 - i * 0.2})`;
      ctx.fillRect(i * 15, 8, 50 - i * 10, 4);
      
      frames.push(canvas);
    }
    return frames;
  }
  
  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
    
    // Focus/blur handlers for pause
    window.addEventListener('blur', () => {
      if (this.state === 'playing') {
        this.pauseGame();
      }
    });
  }
  
  startNewGame() {
    this.currentLevel = 1;
    this.currentBiome = 'shadow';
    this.player = new AdvancedPlayer(100, 300, this);
    this.camera.setTarget(this.player);
    this.levelManager.loadLevel(1);
    this.state = 'playing';
    this.audioManager.playBiomeMusic(this.currentBiome);
  }
  
  pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.audioManager.pauseMusic();
    }
  }
  
  resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.audioManager.resumeMusic();
    }
  }
  
  nextLevel() {
    this.currentLevel++;
    
    // Determine biome based on level
    if (this.currentLevel <= 3) {
      this.currentBiome = 'shadow';
    } else if (this.currentLevel <= 6) {
      this.currentBiome = 'forest';
    } else if (this.currentLevel <= 9) {
      this.currentBiome = 'crystal';
    } else {
      this.currentBiome = 'boss';
    }
    
    this.levelManager.loadLevel(this.currentLevel);
    this.audioManager.playBiomeMusic(this.currentBiome);
    this.saveSystem.saveProgress({
      level: this.currentLevel,
      biome: this.currentBiome,
      playerStats: this.player.getStats()
    });
  }
  
  gameOver() {
    this.state = 'gameOver';
    this.audioManager.stopMusic();
    this.audioManager.playSFX('gameOver');
    this.ui.showGameOverScreen();
  }
  
  victory() {
    this.state = 'victory';
    this.audioManager.stopMusic();
    this.audioManager.playSFX('victory');
    this.achievementSystem.unlock('GAME_COMPLETED');
    this.ui.showVictoryScreen();
  }
  
  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update game objects
    if (this.player) {
      this.player.update(deltaTime);
      
      // Check if player fell off the world
      if (this.player.y > this.height + 100) {
        this.player.takeDamage(999); // Instant death
      }
    }
    
    this.levelManager.update(deltaTime);
    this.camera.update(deltaTime);
    this.particleSystem.update(deltaTime);
    this.screenEffects.update(deltaTime);
    
    // Check level completion
    if (this.levelManager.isLevelComplete()) {
      if (this.currentLevel >= this.maxLevel) {
        this.victory();
      } else {
        this.nextLevel();
      }
    }
    
    // Update FPS counter
    this.updateFPS();
  }
  
  updateFPS() {
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFpsTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
  }
  
  render() {
    // Clear with biome-appropriate background
    this.renderBackground();
    
    if (this.state === 'playing' || this.state === 'paused') {
      // Apply camera transformation
      this.ctx.save();
      this.camera.applyTransform(this.ctx);
      
      // Render game world
      this.levelManager.render(this.ctx);
      
      if (this.player) {
        this.player.render(this.ctx);
      }
      
      this.particleSystem.render(this.ctx);
      
      this.ctx.restore();
      
      // Screen effects (no camera transform)
      this.screenEffects.render(this.ctx);
    }
    
    // UI rendering (always on top)
    this.ui.render(this.ctx);
    
    // Debug info
    if (this.showDebug) {
      this.renderDebugInfo();
    }
  }
  
  renderBackground() {
    const colors = {
      shadow: ['#0A0A0A', '#1A1A2E'],
      forest: ['#0D2818', '#1E5631'],
      crystal: ['#1A1A3A', '#2E2E5E'],
      boss: ['#2A0A0A', '#4A1A1A']
    };
    
    const biomeColors = colors[this.currentBiome] || colors.shadow;
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, biomeColors[0]);
    gradient.addColorStop(1, biomeColors[1]);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add atmospheric particles
    this.renderAtmosphere();
  }
  
  renderAtmosphere() {
    // Simple floating particles for atmosphere
    const particleCount = 20;
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i * 67) % this.width;
      const y = (Math.sin(time + i) * 50 + i * 31) % this.height;
      const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  renderDebugInfo() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 100);
    
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.fps}`, 20, 30);
    this.ctx.fillText(`Level: ${this.currentLevel}`, 20, 45);
    this.ctx.fillText(`Biome: ${this.currentBiome}`, 20, 60);
    if (this.player) {
      this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 20, 75);
      this.ctx.fillText(`Health: ${this.player.health}/${this.player.maxHealth}`, 20, 90);
    }
  }
  
  gameLoop() {
    const now = performance.now();
    const deltaTime = Math.min((now - (this.lastTime || now)) / 1000, 0.1);
    this.lastTime = now;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize the game when the page loads
let gameEngine;

window.addEventListener('load', () => {
  gameEngine = new GameEngine();
  
  // Expose to global scope for debugging
  window.game = gameEngine;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}