// Game State
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    canFlip: true,
    totalPairs: 6
};

// Romantic symbols for the game
const symbols = [
    '💕', '💕', // Love hearts
    '🌹', '🌹', // Rose
    '💍', '💍', // Ring
    '🎂', '🎂', // Birthday cake
    '⭐', '⭐', // Star
    '💖', '💖'  // Sparkling heart
];

// DOM Elements
let currentScreen = 'welcome';
let gameBoard = null;
let movesCount = null;
let pairsFound = null;
let totalPairs = null;
let progressFill = null;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    gameBoard = document.querySelector('.game-board');
    movesCount = document.getElementById('moves-count');
    pairsFound = document.getElementById('pairs-found');
    totalPairs = document.getElementById('total-pairs');
    progressFill = document.querySelector('.progress-fill');
    
    totalPairs.textContent = gameState.totalPairs;
    updateProgress();
}

function setupEventListeners() {
    // Start game button
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Game control buttons
    document.getElementById('restart-game').addEventListener('click', restartGame);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    
    // Victory screen buttons
    document.getElementById('play-again').addEventListener('click', restartGame);
    document.getElementById('share-love').addEventListener('click', shareLove);

    // Add video functionality for victory screen
    document.addEventListener('click', function(e) {
        if (e.target.closest('.video-item')) {
            const videoItem = e.target.closest('.video-item');
            if (videoItem.classList.contains('placeholder')) {
                showVideoUploadPrompt();
            } else {
                const video = videoItem.querySelector('video, iframe');
                if (video) {
                    openVideoModal(video.outerHTML, 'Our Love Story');
                }
            }
        }
    });
}

function startGame() {
    showScreen('game');
    createGameBoard();
    shuffleCards();
    renderCards();
}

function createGameBoard() {
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.canFlip = true;
    
    // Create card objects
    symbols.forEach((symbol, index) => {
        gameState.cards.push({
            id: index,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        });
    });
}

function shuffleCards() {
    for (let i = gameState.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.cards[i], gameState.cards[j]] = [gameState.cards[j], gameState.cards[i]];
    }
}

function renderCards() {
    gameBoard.innerHTML = '';
    
    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'game-card';
        cardElement.dataset.index = index;
        
        if (card.isMatched) {
            cardElement.classList.add('matched');
            cardElement.classList.add('flipped'); // Keep matched cards flipped
        } else if (card.isFlipped) {
            cardElement.classList.add('flipped');
        }
        
        cardElement.innerHTML = `
            <div class="game-card-front">💕</div>
            <div class="game-card-back">${card.symbol}</div>
        `;
        
        // Only add click event if card is not matched
        if (!card.isMatched) {
            cardElement.addEventListener('click', () => flipCard(index));
        }
        
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(index) {
    if (!gameState.canFlip || gameState.cards[index].isFlipped || gameState.cards[index].isMatched) {
        return;
    }
    
    const card = gameState.cards[index];
    card.isFlipped = true;
    gameState.flippedCards.push(index);
    
    renderCards();
    
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateGameInfo();
        
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [index1, index2] = gameState.flippedCards;
    const card1 = gameState.cards[index1];
    const card2 = gameState.cards[index2];
    
    if (card1.symbol === card2.symbol) {
        // Match found!
        card1.isMatched = true;
        card2.isMatched = true;
        card1.isFlipped = true; // Keep flipped
        card2.isFlipped = true; // Keep flipped
        gameState.matchedPairs++;
        
        // Add celebration effect
        createMatchEffect(index1, index2);
        
        if (gameState.matchedPairs === gameState.totalPairs) {
            setTimeout(showVictory, 1000);
        }
    } else {
        // No match, flip cards back
        card1.isFlipped = false;
        card2.isFlipped = false;
    }
    
    gameState.flippedCards = [];
    gameState.canFlip = true;
    renderCards();
    updateProgress();
}

function createMatchEffect(index1, index2) {
    const cards = document.querySelectorAll('.game-card');
    const card1 = cards[index1];
    const card2 = cards[index2];
    
    // Add sparkle effect
    card1.style.animation = 'matchPulse 0.6s ease';
    card2.style.animation = 'matchPulse 0.6s ease';
    
    // Create floating hearts
    createFloatingHearts();
}

function createFloatingHearts() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '💕';
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.top = '100vh';
            heart.style.fontSize = '2rem';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '1000';
            heart.style.transition = 'all 3s ease-out';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                heart.style.top = '-20px';
                heart.style.opacity = '0';
            }, 100);
            
            setTimeout(() => {
                if (document.body.contains(heart)) {
                    document.body.removeChild(heart);
                }
            }, 3000);
        }, i * 200);
    }
}

function showHint() {
    if (gameState.flippedCards.length === 1) {
        // Show hint for second card
        const flippedIndex = gameState.flippedCards[0];
        const flippedSymbol = gameState.cards[flippedIndex].symbol;
        
        // Find matching card
        const matchingIndex = gameState.cards.findIndex((card, index) => 
            card.symbol === flippedSymbol && index !== flippedIndex && !card.isMatched
        );
        
        if (matchingIndex !== -1) {
            highlightCard(matchingIndex);
        }
    } else {
        // Show hint for any unmatched pair
        const unmatchedCards = gameState.cards.filter(card => !card.isMatched);
        if (unmatchedCards.length >= 2) {
            const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
            const cardIndex = gameState.cards.indexOf(randomCard);
            highlightCard(cardIndex);
        }
    }
}

function highlightCard(index) {
    const cards = document.querySelectorAll('.game-card');
    const card = cards[index];
    
    card.style.boxShadow = '0 0 20px #ffd93d';
    card.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
    }, 2000);
}

function updateGameInfo() {
    movesCount.textContent = gameState.moves;
    pairsFound.textContent = gameState.matchedPairs;
}

function updateProgress() {
    const progress = (gameState.matchedPairs / gameState.totalPairs) * 100;
    progressFill.style.width = progress + '%';
}

function showVictory() {
    showScreen('victory');
    createVictoryCelebration();
}

function createVictoryCelebration() {
    // Create confetti
    createConfetti();
    
    // Create more floating hearts
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createFloatingHearts();
        }, i * 300);
    }
}

function createConfetti() {
    const colors = ['#ff6b9d', '#ffd93d', '#667eea', '#764ba2', '#ff9a9e'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (document.body.contains(confetti)) {
                    document.body.removeChild(confetti);
                }
            }, 5000);
        }, i * 50);
    }
}

function restartGame() {
    showScreen('game');
    startGame();
}

function shareLove() {
    // Create a shareable message
    const message = "I just completed the Birthday Love Puzzle! 💕🎂";
    
    if (navigator.share) {
        navigator.share({
            title: 'Birthday Love Puzzle',
            text: message,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            alert('Love message copied to clipboard! 💕');
        });
    }
}

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenName + '-screen').classList.add('active');
    currentScreen = screenName;
}

// Add confetti animation CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Add floating hearts animation
const floatingHeartsStyle = document.createElement('style');
floatingHeartsStyle.textContent = `
    @keyframes floatHeart {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
        50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
    }
`;
document.head.appendChild(floatingHeartsStyle);
