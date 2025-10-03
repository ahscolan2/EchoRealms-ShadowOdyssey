// Biome Manager for handling different game worlds
class BiomeManager {
  constructor(scene) {
    this.scene = scene;
    this.currentBiome = 1;
    this.biomes = GAME_CONFIG.BIOMES;
  }
  
  loadBiome(biomeId) {
    this.currentBiome = biomeId;
    this.clearBiome();
    
    switch (biomeId) {
      case 1:
        this.loadShadowRealm();
        break;
      case 2:
        this.loadForestKingdom();
        break;
      case 3:
        this.loadCrystalCaves();
        break;
      case 4:
        this.loadBossArena();
        break;
    }
    
    this.scene.events.emit('biome:changed', biomeId);
  }
  
  clearBiome() {
    // Clear existing platforms, enemies, and collectibles
    if (this.scene.platforms) this.scene.platforms.clear(true, true);
    if (this.scene.enemies) this.scene.enemies.clear(true, true);
    if (this.scene.collectibles) this.scene.collectibles.clear(true, true);
  }
  
  loadShadowRealm() {
    console.log('🌌 Loading Shadow Realm...');
    
    // Ground and platforms
    this.createPlatform(0, 750, 2400, 50, 0x2C3E50);
    this.createPlatform(200, 650, 150, 20, 0x34495E);
    this.createPlatform(450, 550, 180, 20, 0x34495E);
    this.createPlatform(750, 450, 160, 20, 0x34495E);
    this.createPlatform(1050, 350, 200, 20, 0x34495E);
    this.createPlatform(1400, 250, 180, 20, 0x34495E);
    this.createPlatform(1700, 400, 150, 20, 0x34495E);
    this.createPlatform(1950, 300, 200, 20, 0x34495E);
    
    // Enemies
    new ShadowWraith(this.scene, 300, 600);
    new ShadowWraith(this.scene, 600, 500);
    new ShadowWraith(this.scene, 1100, 300);
    new ShadowWraith(this.scene, 1500, 200);
    new ShadowWraith(this.scene, 1800, 350);
    
    // Collectibles
    new Collectible(this.scene, 250, 620, 'orb');
    new Collectible(this.scene, 520, 520, 'orb');
    new Collectible(this.scene, 820, 420, 'key');
    new Collectible(this.scene, 1120, 320, 'orb');
    new Collectible(this.scene, 1470, 220, 'crystal');
    new Collectible(this.scene, 2050, 270, 'artifact');
    
    // Health and energy pickups
    new HealthPickup(this.scene, 400, 500);
    new EnergyPickup(this.scene, 1200, 300);
  }
  
  loadForestKingdom() {
    console.log('🌲 Loading Forest Kingdom...');
    
    // Forest platforms with organic shapes
    this.createPlatform(0, 750, 2400, 50, 0x2D5A2D);
    this.createPlatform(150, 680, 120, 15, 0x3D6A3D);
    this.createPlatform(350, 620, 140, 15, 0x3D6A3D);
    this.createPlatform(580, 560, 130, 15, 0x3D6A3D);
    this.createPlatform(800, 500, 160, 15, 0x3D6A3D);
    this.createPlatform(1050, 440, 140, 15, 0x3D6A3D);
    this.createPlatform(1300, 380, 180, 15, 0x3D6A3D);
    this.createPlatform(1600, 320, 150, 15, 0x3D6A3D);
    this.createPlatform(1900, 260, 200, 15, 0x3D6A3D);
    
    // Tree trunk platforms
    this.createPlatform(700, 350, 30, 150, 0x8B4513);
    this.createPlatform(1200, 200, 30, 180, 0x8B4513);
    
    // Forest enemies
    new ForestGuardian(this.scene, 400, 600);
    new ForestGuardian(this.scene, 850, 480);
    new ShadowWraith(this.scene, 1100, 420);
    new ForestGuardian(this.scene, 1350, 360);
    new ShadowWraith(this.scene, 1650, 300);
    
    // Forest collectibles
    new Collectible(this.scene, 200, 650, 'orb');
    new Collectible(this.scene, 400, 590, 'orb');
    new Collectible(this.scene, 650, 530, 'key');
    new Collectible(this.scene, 900, 470, 'orb');
    new Collectible(this.scene, 1150, 410, 'crystal');
    new Collectible(this.scene, 1400, 350, 'orb');
    new Collectible(this.scene, 1950, 230, 'artifact');
    
    // Pickups
    new HealthPickup(this.scene, 550, 520);
    new EnergyPickup(this.scene, 1250, 340);
  }
  
  loadCrystalCaves() {
    console.log('💎 Loading Crystal Caves...');
    
    // Crystal cave platforms
    this.createPlatform(0, 750, 2400, 50, 0x2D1B3D);
    this.createPlatform(180, 680, 140, 20, 0x3E2B4E);
    this.createPlatform(400, 620, 120, 20, 0x3E2B4E);
    this.createPlatform(650, 560, 160, 20, 0x3E2B4E);
    this.createPlatform(900, 500, 140, 20, 0x3E2B4E);
    this.createPlatform(1150, 440, 180, 20, 0x3E2B4E);
    this.createPlatform(1450, 380, 160, 20, 0x3E2B4E);
    this.createPlatform(1750, 320, 200, 20, 0x3E2B4E);
    
    // Crystal formations
    this.createPlatform(500, 400, 20, 60, 0x3498DB);
    this.createPlatform(1000, 300, 25, 80, 0x3498DB);
    this.createPlatform(1600, 200, 20, 100, 0x3498DB);
    
    // Crystal enemies (enhanced)
    new ShadowWraith(this.scene, 250, 650);
    new ForestGuardian(this.scene, 500, 590);
    new ShadowWraith(this.scene, 750, 530);
    new ForestGuardian(this.scene, 1050, 470);
    new ShadowWraith(this.scene, 1300, 410);
    new ShadowWraith(this.scene, 1550, 350);
    
    // Crystal collectibles
    new Collectible(this.scene, 220, 650, 'crystal');
    new Collectible(this.scene, 460, 590, 'orb');
    new Collectible(this.scene, 710, 530, 'crystal');
    new Collectible(this.scene, 960, 470, 'key');
    new Collectible(this.scene, 1210, 410, 'crystal');
    new Collectible(this.scene, 1510, 350, 'orb');
    new Collectible(this.scene, 1850, 290, 'artifact');
    
    // Pickups
    new HealthPickup(this.scene, 650, 520);
    new EnergyPickup(this.scene, 1350, 340);
  }
  
  loadBossArena() {
    console.log('⚔️ Loading Boss Arena...');
    
    // Boss arena platforms
    this.createPlatform(0, 750, 2400, 50, 0x3D1A1A);
    this.createPlatform(200, 650, 100, 20, 0x4E2B2B);
    this.createPlatform(400, 550, 120, 20, 0x4E2B2B);
    this.createPlatform(650, 450, 140, 20, 0x4E2B2B);
    this.createPlatform(900, 350, 160, 20, 0x4E2B2B);
    this.createPlatform(1200, 250, 180, 20, 0x4E2B2B);
    this.createPlatform(1500, 150, 200, 20, 0x4E2B2B);
    this.createPlatform(1800, 400, 120, 20, 0x4E2B2B);
    this.createPlatform(2000, 300, 140, 20, 0x4E2B2B);
    
    // Multi-level boss enemies
    new ShadowWraith(this.scene, 300, 620);
    new ForestGuardian(this.scene, 500, 520);
    new ShadowWraith(this.scene, 750, 420);
    new ForestGuardian(this.scene, 1000, 320);
    new ShadowWraith(this.scene, 1300, 220);
    new ForestGuardian(this.scene, 1600, 120);
    
    // Final collectibles
    new Collectible(this.scene, 250, 620, 'orb');
    new Collectible(this.scene, 470, 520, 'crystal');
    new Collectible(this.scene, 720, 420, 'key');
    new Collectible(this.scene, 970, 320, 'crystal');
    new Collectible(this.scene, 1270, 220, 'orb');
    new Collectible(this.scene, 1570, 120, 'crystal');
    new Collectible(this.scene, 2100, 270, 'artifact');
    
    // Final pickups
    new HealthPickup(this.scene, 800, 400);
    new EnergyPickup(this.scene, 1450, 200);
  }
  
  createPlatform(x, y, width, height, color) {
    const platform = this.scene.add.rectangle(x + width/2, y + height/2, width, height, color);
    this.scene.physics.add.existing(platform, true);
    
    if (this.scene.platforms) {
      this.scene.platforms.add(platform);
    }
    
    return platform;
  }
  
  getCurrentBiomeName() {
    const biome = Object.values(GAME_CONFIG.BIOMES).find(b => b.id === this.currentBiome);
    return biome ? biome.name : 'Unknown Realm';
  }
  
  isLastBiome() {
    return this.currentBiome >= Object.keys(GAME_CONFIG.BIOMES).length;
  }
  
  getNextBiomeId() {
    return this.currentBiome + 1;
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.BiomeManager = BiomeManager;
}