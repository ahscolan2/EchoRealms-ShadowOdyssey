// EchoRealms: Shadow Odyssey - Game Configuration
// Centralized configuration for all game constants and settings

const GAME_CONFIG = {
  // World Settings
  WORLD: {
    WIDTH: 2400,
    HEIGHT: 800,
    GRAVITY: 600,
    BOUNDS_PADDING: 50
  },
  
  // Player Configuration
  PLAYER: {
    WIDTH: 28,
    HEIGHT: 42,
    SPEED: 180,
    JUMP_POWER: 380,
    MAX_HEALTH: 100,
    MAX_ENERGY: 100,
    ENERGY_REGEN_RATE: 0.8,
    DRAG: 400,
    SPAWN_X: 100,
    SPAWN_Y: 600,
    COLOR: 0x00FFFF
  },
  
  // Ability System
  ABILITIES: {
    TRIPLE_JUMP: {
      MAX_JUMPS: 3,
      POWER_DECREASE: 50,
      ENABLED: true
    },
    ECHO_DASH: {
      DISTANCE: 280,
      COOLDOWN: 150,
      ENERGY_COST: 25,
      INVULNERABILITY_TIME: 300,
      ENABLED: true
    },
    TIME_SLOW: {
      DURATION: 250,
      COOLDOWN: 500,
      ENERGY_COST: 35,
      TIME_SCALE: 0.4,
      ENABLED: true
    },
    GROUND_SLAM: {
      POWER: 550,
      DAMAGE_RADIUS: 80,
      DAMAGE_AMOUNT: 60,
      ENERGY_COST: 30,
      ENABLED: true
    }
  },
  
  // Biome Definitions
  BIOMES: {
    SHADOW_REALM: {
      id: 1,
      name: 'Shadow Realm',
      backgroundColor: '#0d001a',
      gradientColors: ['#0d001a', '#1a0033'],
      particleColors: [0x8E44AD, 0x9B59B6, 0x663399],
      requiredArtifacts: 1
    },
    FOREST_KINGDOM: {
      id: 2,
      name: 'Forest Kingdom',
      backgroundColor: '#0d2818',
      gradientColors: ['#001a0d', '#0d2818'],
      particleColors: [0x27AE60, 0x2ECC71, 0x58D68D],
      requiredArtifacts: 1
    },
    CRYSTAL_CAVES: {
      id: 3,
      name: 'Crystal Caves',
      backgroundColor: '#2d1b3d',
      gradientColors: ['#0d001a', '#2d1b3d'],
      particleColors: [0x3498DB, 0x5DADE2, 0x85C1E9],
      requiredArtifacts: 1
    },
    BOSS_ARENA: {
      id: 4,
      name: 'Boss Arena',
      backgroundColor: '#3d1a1a',
      gradientColors: ['#1a0d0d', '#3d1a1a'],
      particleColors: [0xE74C3C, 0xF1948A, 0xCD6155],
      requiredArtifacts: 1
    }
  },
  
  // Enemy Configuration
  ENEMIES: {
    SHADOW_WRAITH: {
      health: 40,
      speed: 85,
      damage: 20,
      detectionRange: 180,
      attackRange: 45,
      attackCooldown: 1200,
      color: 0x8E44AD,
      canFly: true
    },
    FOREST_GUARDIAN: {
      health: 70,
      speed: 60,
      damage: 30,
      detectionRange: 150,
      attackRange: 40,
      attackCooldown: 1500,
      color: 0x27AE60,
      armor: 2
    },
    CRYSTAL_SENTINEL: {
      health: 55,
      speed: 75,
      damage: 25,
      detectionRange: 200,
      attackRange: 60,
      attackCooldown: 1000,
      color: 0x3498DB,
      projectileSpeed: 250
    }
  },
  
  // Collectible System
  COLLECTIBLES: {
    ORB: {
      color: 0x9B59B6,
      radius: 8,
      value: 1,
      points: 25
    },
    KEY: {
      color: 0xF1C40F,
      radius: 10,
      value: 1,
      points: 50
    },
    CRYSTAL: {
      color: 0x3498DB,
      radius: 12,
      value: 1,
      points: 75
    },
    ARTIFACT: {
      color: 0xE74C3C,
      radius: 15,
      value: 1,
      points: 200
    }
  },
  
  // Audio Settings
  AUDIO: {
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.8,
    SOUND_CONFIGS: {
      jump: { frequency: 220, duration: 0.1, type: 'sine' },
      dash: { frequency: 440, duration: 0.2, type: 'square' },
      collect: { frequency: 660, duration: 0.15, type: 'triangle' },
      timeSlow: { frequency: 110, duration: 0.3, type: 'sawtooth' },
      groundSlam: { frequency: 55, duration: 0.4, type: 'square' },
      impact: { frequency: 80, duration: 0.2, type: 'square' },
      enemyHit: { frequency: 150, duration: 0.1, type: 'triangle' },
      playerHit: { frequency: 200, duration: 0.2, type: 'sawtooth' }
    }
  },
  
  // Particle System
  PARTICLES: {
    MAX_PARTICLES: 150,
    POOL_SIZE: 200,
    AMBIENT_SPAWN_RATE: 800,
    JUMP_PARTICLE_COUNT: 8,
    IMPACT_PARTICLE_COUNT: 12,
    COLLECT_PARTICLE_COUNT: 10
  },
  
  // UI Configuration
  UI: {
    HEALTH_BAR_WIDTH: 200,
    HEALTH_BAR_HEIGHT: 20,
    ENERGY_BAR_WIDTH: 200,
    ENERGY_BAR_HEIGHT: 15,
    COOLDOWN_BAR_WIDTH: 50,
    COOLDOWN_BAR_HEIGHT: 12,
    FADE_DURATION: 500,
    TRANSITION_DURATION: 3000
  },
  
  // Performance Settings
  PERFORMANCE: {
    TARGET_FPS: 60,
    PHYSICS_FPS: 60,
    PARTICLE_CLEANUP_INTERVAL: 1000,
    MEMORY_CLEANUP_INTERVAL: 5000,
    DEBUG_MODE: false
  },
  
  // Input Configuration
  INPUT: {
    COYOTE_TIME: 100,
    JUMP_BUFFER_TIME: 150,
    DOUBLE_TAP_TIME: 300,
    KEYS: {
      MOVE_LEFT: ['A', 'ARROW_LEFT'],
      MOVE_RIGHT: ['D', 'ARROW_RIGHT'],
      JUMP: ['W', 'SPACE', 'ARROW_UP'],
      DASH: ['X'],
      TIME_SLOW: ['C'],
      GROUND_SLAM: ['Z'],
      PAUSE: ['P', 'ESC'],
      RESTART: ['R']
    }
  },
  
  // Platform Configuration
  PLATFORMS: {
    DEFAULT_COLOR: 0x2C3E50,
    HIGHLIGHT_COLOR: 0x34495E,
    SPECIAL_COLOR: 0x8B4513,
    CRYSTAL_COLOR: 0x3498DB,
    MOVING_SPEED: 50
  },
  
  // Game States
  STATES: {
    LOADING: 'loading',
    MENU: 'menu',
    INSTRUCTIONS: 'instructions',
    PLAYING: 'playing',
    PAUSED: 'paused',
    TRANSITION: 'transition',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory',
    ERROR: 'error'
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
}

// Global access
window.GAME_CONFIG = GAME_CONFIG;