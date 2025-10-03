// EchoRealms: Shadow Odyssey - Game Manager
// Manages game states, UI transitions, and overall game flow

class GameManager {
  constructor() {
    this.currentScreen = 'loadingScreen';
    this.gameInstance = null;
    this.gameState = 'loading';
    this.playerScore = 0;
    this.currentBiome = 1;
    
    this.initializeEventListeners();
    this.startGameLoad();
  }
  
  initializeEventListeners() {
    // Initialize all UI event listeners
    document.addEventListener('DOMContentLoaded', () => {
      this.setupUIEventListeners();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleGlobalKeyPress(event);
    });
  }
  
  setupUIEventListeners() {
    // Error handling for missing buttons
    const safeAddListener = (id, event, callback) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(event, callback);
      }
    };
    
    // Menu buttons
    safeAddListener('startBtn', 'click', () => this.startGame());
    safeAddListener('instructionsBtn', 'click', () => this.showInstructions());
    
    // Game state buttons
    safeAddListener('pauseResumeBtn', 'click', () => this.resumeGame());
    safeAddListener('restartBtn', 'click', () => this.restartGame());
    safeAddListener('menuBtn', 'click', () => this.returnToMenu());
  }
  
  startGameLoad() {
    // Simulate loading time and initialize game
    this.showScreen('loadingScreen');
    
    // Load game resources
    setTimeout(() => {
      this.initializeGame();
      this.showScreen('startScreen');
      this.gameState = 'menu';
    }, 2000);
  }
  
  initializeGame() {
    try {
      // The game is already initialized in game.js
      // Just make sure we have access to it
      if (typeof enhancedGame !== 'undefined') {
        this.gameInstance = enhancedGame;
        console.log('✅ Game initialized successfully!');
      } else {
        console.log('⚠️ Game instance not found, but game should still work');
      }
    } catch (error) {
      console.error('❌ Error initializing game:', error);
      this.showError('Failed to initialize game: ' + error.message);
    }
  }
  
  showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.currentScreen = screenId;
    } else {
      console.error('Screen not found:', screenId);
    }
  }
  
  startGame() {
    try {
      this.gameState = 'playing';
      this.hideAllScreens();
      
      // Make sure Phaser game is visible
      const gameElement = document.getElementById('phaser-game');
      if (gameElement) {
        gameElement.style.display = 'block';
        gameElement.style.visibility = 'visible';
      }
      
      console.log('🎮 Game started!');
    } catch (error) {
      console.error('❌ Error starting game:', error);
      this.showError('Failed to start game: ' + error.message);
    }
  }
  
  showInstructions() {
    this.showScreen('instructionsScreen');
    this.gameState = 'instructions';
  }
  
  backToMenu() {
    this.showScreen('startScreen');
    this.gameState = 'menu';
  }
  
  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.showScreen('pauseScreen');
      
      // Pause Phaser game if available
      if (this.gameInstance && this.gameInstance.scene) {
        this.gameInstance.scene.pause();
      }
    }
  }
  
  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.hideAllScreens();
      
      // Resume Phaser game if available
      if (this.gameInstance && this.gameInstance.scene) {
        this.gameInstance.scene.resume();
      }
    }
  }
  
  restartGame() {
    try {
      this.gameState = 'playing';
      this.playerScore = 0;
      this.currentBiome = 1;
      
      // Restart Phaser game if available
      if (this.gameInstance && this.gameInstance.scene) {
        const activeScene = this.gameInstance.scene.getScene('AdvancedMainScene');
        if (activeScene) {
          activeScene.scene.restart();
        }
      }
      
      this.hideAllScreens();
      console.log('🔄 Game restarted!');
    } catch (error) {
      console.error('❌ Error restarting game:', error);
      this.showError('Failed to restart game: ' + error.message);
    }
  }
  
  returnToMenu() {
    this.gameState = 'menu';
    this.showScreen('startScreen');
    
    // Stop Phaser game if available
    if (this.gameInstance && this.gameInstance.scene) {
      const activeScene = this.gameInstance.scene.getScene('AdvancedMainScene');
      if (activeScene) {
        activeScene.scene.stop();
      }
    }
    
    console.log('🏠 Returned to main menu');
  }
  
  showGameOver(score = 0) {
    this.gameState = 'gameOver';
    this.playerScore = score;
    
    // Update score display
    const scoreElement = document.getElementById('finalScore');
    if (scoreElement) {
      scoreElement.textContent = `Final Score: ${score}`;
    }
    
    this.showScreen('gameOverScreen');
    console.log('💀 Game Over - Score:', score);
  }
  
  showVictory(score = 0) {
    this.gameState = 'victory';
    this.playerScore = score;
    
    // Update score display
    const scoreElement = document.getElementById('victoryScore');
    if (scoreElement) {
      scoreElement.textContent = `Final Score: ${score}`;
    }
    
    this.showScreen('victoryScreen');
    console.log('🎉 Victory! - Score:', score);
  }
  
  showBiomeTransition(biomeName) {
    this.gameState = 'transition';
    
    // Update biome name
    const biomeElement = document.getElementById('nextBiomeName');
    if (biomeElement) {
      biomeElement.textContent = `Entering: ${biomeName}`;
    }
    
    this.showScreen('transitionScreen');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (this.gameState === 'transition') {
        this.gameState = 'playing';
        this.hideAllScreens();
      }
    }, 3000);
    
    console.log('🌟 Biome transition:', biomeName);
  }
  
  showError(message) {
    this.gameState = 'error';
    
    // Update error message
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
      errorElement.textContent = message;
    }
    
    this.showScreen('errorScreen');
    console.error('⚠️ Game Error:', message);
  }
  
  hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.add('hidden');
    });
    this.currentScreen = null;
  }
  
  handleGlobalKeyPress(event) {
    switch (event.key) {
      case 'Escape':
      case 'p':
      case 'P':
        if (this.gameState === 'playing') {
          this.pauseGame();
        } else if (this.gameState === 'paused') {
          this.resumeGame();
        }
        break;
        
      case 'r':
      case 'R':
        if (this.gameState === 'gameOver' || this.gameState === 'paused') {
          this.restartGame();
        }
        break;
        
      case 'm':
      case 'M':
        if (this.gameState !== 'playing') {
          this.returnToMenu();
        }
        break;
        
      case 'Enter':
        if (this.gameState === 'menu') {
          this.startGame();
        }
        break;
    }
  }
  
  // Public methods for external access
  getCurrentState() {
    return this.gameState;
  }
  
  getPlayerScore() {
    return this.playerScore;
  }
  
  getCurrentBiome() {
    return this.currentBiome;
  }
  
  updateScore(newScore) {
    this.playerScore = newScore;
  }
  
  updateBiome(biomeNumber) {
    this.currentBiome = biomeNumber;
  }
}

// Global functions for button onclick events
function startGame() {
  if (window.gameManager) {
    window.gameManager.startGame();
  }
}

function showInstructions() {
  if (window.gameManager) {
    window.gameManager.showInstructions();
  }
}

function backToMenu() {
  if (window.gameManager) {
    window.gameManager.backToMenu();
  }
}

function pauseGame() {
  if (window.gameManager) {
    window.gameManager.pauseGame();
  }
}

function resumeGame() {
  if (window.gameManager) {
    window.gameManager.resumeGame();
  }
}

function restartGame() {
  if (window.gameManager) {
    window.gameManager.restartGame();
  }
}

function returnToMenu() {
  if (window.gameManager) {
    window.gameManager.returnToMenu();
  }
}

// Initialize game manager when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    window.gameManager = new GameManager();
    console.log('🎮 GameManager initialized!');
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameManager;
}