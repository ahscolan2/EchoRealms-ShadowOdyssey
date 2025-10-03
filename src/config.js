// Game Configuration
const GAME_CONFIG = {
  // World settings
  WORLD: {
    WIDTH: 2400,
    HEIGHT: 800,
    GRAVITY: 600
  },
  
  // Player settings
  PLAYER: {
    SPEED: 200,
    JUMP_POWER: 400,
    MAX_HEALTH: 100,
    MAX_ENERGY: 100,
    SIZE: { width: 28, height: 42 }
  },
  
  // Ability settings
  ABILITIES: {
    TRIPLE_JUMP: { 
      MAX_JUMPS: 3, 
      POWER_DECREASE: 60 
    },
    ECHO_DASH: { 
      DISTANCE: 300, 
      COOLDOWN: 180, 
      ENERGY_COST: 25 
    },
    TIME_SLOW: { 
      DURATION: 300, 
      COOLDOWN: 600, 
      ENERGY_COST: 40, 
      TIME_SCALE: 0.3 
    },
    GROUND_SLAM: { 
      POWER: 600, 
      RADIUS: 80, 
      ENERGY_COST: 30 
    }
  },
  
  // Biome definitions
  BIOMES: {
    SHADOW_REALM: { id: 1, name: 'Shadow Realm', color: '#1a0033' },
    FOREST_KINGDOM: { id: 2, name: 'Forest Kingdom', color: '#0d2818' },
    CRYSTAL_CAVES: { id: 3, name: 'Crystal Caves', color: '#2d1b3d' },
    BOSS_ARENA: { id: 4, name: 'Boss Arena', color: '#3d1a1a' }
  },
  
  // Enemy settings
  ENEMIES: {
    SHADOW_WRAITH: {
      health: 40,
      speed: 100,
      damage: 20,
      color: 0x8E44AD,
      detectionRange: 200,
      attackRange: 50
    },
    FOREST_GUARDIAN: {
      health: 80,
      speed: 60,
      damage: 30,
      color: 0x27AE60,
      detectionRange: 150,
      attackRange: 40,
      armor: 2
    }
  },
  
  // Collectible settings
  COLLECTIBLES: {
    orb: { color: 0x9B59B6, radius: 8, value: 1, points: 25 },
    key: { color: 0xF1C40F, radius: 10, value: 1, points: 50 },
    crystal: { color: 0x3498DB, radius: 12, value: 1, points: 75 },
    artifact: { color: 0xE74C3C, radius: 15, value: 1, points: 200 }
  },
  
  // UI settings
  UI: {
    HEALTH_BAR: { x: 120, y: 40, width: 220, height: 25 },
    ENERGY_BAR: { x: 120, y: 70, width: 220, height: 20 },
    ABILITY_COOLDOWN: { startX: 600, y: 40, width: 50, height: 15, spacing: 60 }
  }
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME_CONFIG;
}