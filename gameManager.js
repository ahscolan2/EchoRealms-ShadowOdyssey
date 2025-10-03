// EchoRealms: Shadow Odyssey - Fixed Game Manager
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
        
        // Window load event
        window.addEventListener('load', () => {
            this.setupUIEventListeners();
        });
    }
    
    setupUIEventListeners() {
        // No specific buttons to set up - using onclick in HTML
        console.log('\ud83c\udfa7 GameManager UI listeners initialized');
    }
    
    startGameLoad() {
        // Show loading screen and initialize game
        this.showScreen('loadingScreen');
        
        // Simulate loading time and initialize game
        setTimeout(() => {
            this.initializeGame();
            this.showScreen('startScreen');
            this.gameState = 'menu';
            console.log('\u2728 Game loaded successfully! Ready to play.');
        }, 2000);
    }
    
    initializeGame() {
        try {
            // The game is initialized in game.js
            if (typeof window.echoRealmsGame !== 'undefined') {
                this.gameInstance = window.echoRealmsGame;
                console.log('\u2705 Game instance found and connected!');
            } else {
                console.log('\u26a0\ufe0f Game instance not found, but game should still work');
            }
        } catch (error) {
            console.error('\u274c Error initializing game:', error);
            this.showError('Failed to initialize game: ' + error.message);
        }
    }
    
    showScreen(screenId) {
        try {
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
                console.log(`\ud83d\uddbc\ufe0f Switched to screen: ${screenId}`);
            } else {
                console.error('\u274c Screen not found:', screenId);
                // Try to show start screen as fallback
                const startScreen = document.getElementById('startScreen');
                if (startScreen && screenId !== 'startScreen') {
                    startScreen.classList.remove('hidden');
                    this.currentScreen = 'startScreen';
                }
            }
        } catch (error) {
            console.error('\u274c Error showing screen:', error);
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
                gameElement.style.opacity = '1';
            }
            
            console.log('\ud83c\udfae Game started! Time to master the shadows!');
        } catch (error) {
            console.error('\u274c Error starting game:', error);
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
                const activeScene = this.gameInstance.scene.getScene('MainScene');
                if (activeScene) {
                    activeScene.scene.pause();
                }
            }
            
            console.log('\u23f8\ufe0f Game paused');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideAllScreens();
            
            // Resume Phaser game if available
            if (this.gameInstance && this.gameInstance.scene) {
                const activeScene = this.gameInstance.scene.getScene('MainScene');
                if (activeScene) {
                    activeScene.scene.resume();
                }
            }
            
            console.log('\u25b6\ufe0f Game resumed');
        }
    }
    
    restartGame() {
        try {
            this.gameState = 'playing';
            this.playerScore = 0;
            this.currentBiome = 1;
            
            // Restart Phaser game if available
            if (this.gameInstance && this.gameInstance.scene) {
                const activeScene = this.gameInstance.scene.getScene('MainScene');
                if (activeScene) {
                    activeScene.scene.restart();
                } else {
                    // If no active scene, try to restart the game
                    this.gameInstance.destroy(true);
                    // The game will be recreated by the game.js script
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            } else {
                // Fallback: reload the page
                window.location.reload();
            }
            
            this.hideAllScreens();
            console.log('\ud83d\udd04 Game restarted!');
        } catch (error) {
            console.error('\u274c Error restarting game:', error);
            // Fallback: reload the page
            window.location.reload();
        }
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.showScreen('startScreen');
        
        // Stop Phaser game if available
        if (this.gameInstance && this.gameInstance.scene) {
            const activeScene = this.gameInstance.scene.getScene('MainScene');
            if (activeScene) {
                activeScene.scene.stop();
            }
        }
        
        console.log('\ud83c\udfe0 Returned to main menu');
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
        console.log('\ud83d\udc80 Game Over - Score:', score);
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
        console.log('\ud83c\udf89 Victory! - Score:', score);
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
        
        console.log('\ud83c\udf1f Biome transition:', biomeName);
    }
    
    showError(message) {
        this.gameState = 'error';
        
        // Update error message
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        this.showScreen('errorScreen');
        console.error('\u26a0\ufe0f Game Error:', message);
    }
    
    hideAllScreens() {
        try {
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.add('hidden');
            });
            this.currentScreen = null;
        } catch (error) {
            console.error('\u274c Error hiding screens:', error);
        }
    }
    
    handleGlobalKeyPress(event) {
        // Don't handle keys if we're in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
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
                
            case 'F11':
                event.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
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

// ==========================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS
// ==========================================

function startGame() {
    if (window.gameManager) {
        window.gameManager.startGame();
    } else {
        console.error('GameManager not found!');
    }
}

function showInstructions() {
    if (window.gameManager) {
        window.gameManager.showInstructions();
    } else {
        console.error('GameManager not found!');
    }
}

function backToMenu() {
    if (window.gameManager) {
        window.gameManager.backToMenu();
    } else {
        console.error('GameManager not found!');
    }
}

function pauseGame() {
    if (window.gameManager) {
        window.gameManager.pauseGame();
    } else {
        console.error('GameManager not found!');
    }
}

function resumeGame() {
    if (window.gameManager) {
        window.gameManager.resumeGame();
    } else {
        console.error('GameManager not found!');
    }
}

function restartGame() {
    if (window.gameManager) {
        window.gameManager.restartGame();
    } else {
        console.error('GameManager not found!');
    }
}

function returnToMenu() {
    if (window.gameManager) {
        window.gameManager.returnToMenu();
    } else {
        console.error('GameManager not found!');
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize game manager when page loads
if (typeof window !== 'undefined') {
    // Try multiple initialization points to ensure it works
    const initGameManager = () => {
        if (!window.gameManager) {
            window.gameManager = new GameManager();
            console.log('\ud83c\udfa7 GameManager initialized successfully!');
        }
    };
    
    // Try immediate initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGameManager);
    } else {
        initGameManager();
    }
    
    // Fallback initialization on window load
    window.addEventListener('load', () => {
        if (!window.gameManager) {
            initGameManager();
        }
    });
    
    // Emergency fallback after a short delay
    setTimeout(() => {
        if (!window.gameManager) {
            initGameManager();
        }
    }, 100);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}

console.log('\ud83c\udfa7 GameManager script loaded successfully!');
