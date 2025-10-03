// EchoRealms: Shadow Odyssey - Main Game Initialization
// Phaser.js configuration and game startup

// Game configuration
const gameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 700,
  parent: 'phaser-game',
  backgroundColor: GAME_CONFIG.BIOMES.SHADOW_REALM.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.WORLD.GRAVITY },
      debug: GAME_CONFIG.PERFORMANCE.DEBUG_MODE,
      fps: GAME_CONFIG.PERFORMANCE.PHYSICS_FPS
    }
  },
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  fps: {
    target: GAME_CONFIG.PERFORMANCE.TARGET_FPS,
    forceSetTimeOut: true
  },
  loader: {
    crossOrigin: 'anonymous'
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true
  }
};

// Global game instance
let echoRealmsGame = null;

// Game initialization with error handling
function initializeGame() {
  try {
    console.log('🌌 Initializing EchoRealms: Shadow Odyssey');
    
    // Destroy existing game if it exists
    if (echoRealmsGame) {
      echoRealmsGame.destroy(true);
      echoRealmsGame = null;
    }
    
    // Create new game instance
    echoRealmsGame = new Phaser.Game(gameConfig);
    
    // Global access for debugging
    window.echoRealmsGame = echoRealmsGame;
    
    console.log('✅ Game initialized successfully');
    
    // Performance monitoring
    if (GAME_CONFIG.PERFORMANCE.DEBUG_MODE) {
      setupPerformanceMonitoring();
    }
    
    return echoRealmsGame;
    
  } catch (error) {
    console.error('❌ Game initialization failed:', error);
    showError('Failed to initialize game: ' + error.message);
    return null;
  }
}

// Performance monitoring setup
function setupPerformanceMonitoring() {
  console.log('🔍 Setting up performance monitoring');
  
  // FPS monitoring
  let frameCount = 0;
  let lastTime = performance.now();
  
  function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(updateFPS);
  }
  
  if (typeof performance !== 'undefined') {
    requestAnimationFrame(updateFPS);
  }
  
  // Memory monitoring
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      console.log(`Memory - Used: ${Math.round(memory.usedJSHeapSize / 1048576)}MB, Total: ${Math.round(memory.totalJSHeapSize / 1048576)}MB`);
    }, 5000);
  }
}

// Game state management
function getGameState() {
  if (!echoRealmsGame || !echoRealmsGame.scene.scenes[0]) {
    return GAME_CONFIG.STATES.LOADING;
  }
  
  return echoRealmsGame.scene.scenes[0].gameState || GAME_CONFIG.STATES.LOADING;
}

// Restart game
function restartGame() {
  if (echoRealmsGame && echoRealmsGame.scene.scenes[0]) {
    try {
      echoRealmsGame.scene.scenes[0].scene.restart();
      console.log('🔄 Game restarted');
    } catch (error) {
      console.error('Failed to restart game:', error);
      // Fallback: reinitialize completely
      initializeGame();
    }
  } else {
    initializeGame();
  }
}

// Pause/Resume functions
function pauseGame() {
  if (echoRealmsGame && echoRealmsGame.scene.scenes[0]) {
    echoRealmsGame.scene.scenes[0].pauseGame();
    console.log('⏸️ Game paused');
  }
}

function resumeGame() {
  if (echoRealmsGame && echoRealmsGame.scene.scenes[0]) {
    echoRealmsGame.scene.scenes[0].resumeGame();
    console.log('▶️ Game resumed');
  }
}

// Audio control
function setMasterVolume(volume) {
  if (echoRealmsGame && echoRealmsGame.scene.scenes[0] && echoRealmsGame.scene.scenes[0].audioSystem) {
    echoRealmsGame.scene.scenes[0].audioSystem.setMasterVolume(volume);
  }
}

function toggleMute() {
  if (echoRealmsGame && echoRealmsGame.scene.scenes[0] && echoRealmsGame.scene.scenes[0].audioSystem) {
    const audioSystem = echoRealmsGame.scene.scenes[0].audioSystem;
    if (audioSystem.masterVolume > 0) {
      audioSystem.muteAll();
    } else {
      audioSystem.unmuteAll();
    }
  }
}

// Error handling
function handleGameError(error) {
  console.error('🚫 Game Runtime Error:', error);
  
  // Try to show error screen
  try {
    showError(error.message || 'An unexpected game error occurred');
  } catch (uiError) {
    console.error('Failed to show error UI:', uiError);
    // Fallback: browser alert
    alert('Game Error: ' + (error.message || 'Unknown error occurred'));
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('phaser')) {
    handleGameError(event.error || new Error(event.message));
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  handleGameError(new Error('Promise rejection: ' + event.reason));
});

// Visibility API - pause when tab is not active
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (getGameState() === GAME_CONFIG.STATES.PLAYING) {
      pauseGame();
    }
  }
  // Note: Don't auto-resume as player might want to stay paused
});

// Export functions for global access
window.initializeGame = initializeGame;
window.restartGame = restartGame;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.setMasterVolume = setMasterVolume;
window.toggleMute = toggleMute;
window.getGameState = getGameState;

// Auto-initialize when this script loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, game ready to initialize');
  // Don't auto-start, wait for user interaction
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGame,
    restartGame,
    pauseGame,
    resumeGame,
    setMasterVolume,
    toggleMute,
    getGameState,
    gameConfig
  };
}