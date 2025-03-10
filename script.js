// Core Variables
var totalScore = 0; // Tracks the player's total points
var score = 0; // Tracks points earned since the last level-up
var autoTappers = 0; // Points per second from Auto-Tappers
var baseMultiplier = 1; // Base multiplier (increased by upgrades)
var grandmas = 0; // Points per second from Grandmas
var totalUpgrades = 0; // Tracks total upgrades purchased
var powerUpActive = false; // Tracks if a power-up is active

// Level and Prestige System
var level = 1; // Current level
var prestigeLevel = 0; // Current prestige level
var pointsToNextLevel = 999; // Points required to level up

// Offline Progress Tracking
var lastLoginDate = null; // Tracks the last login date
const OFFLINE_POINTS_PER_SECOND = 1; // Points earned per second while offline

// DOM Elements
const levelDisplay = document.getElementById('level');
const prestigeBtn = document.getElementById('prestigeBtn');
const prestigeLevelDisplay = document.getElementById('prestigeLevel');
const progressFill = document.getElementById('progressFill');
const offlineProgressContainer = document.getElementById('offlineProgressContainer');
const timeAwayElement = document.getElementById('timeAway');
const offlinePointsElement = document.getElementById('offlinePoints');

// Auto-tapper and Grandma points run every second
setInterval(() => {
    const grandmaPoints = grandmas * 5; // Each Grandma gives 5 points/second
    totalScore += autoTappers + grandmaPoints;
    score += autoTappers + grandmaPoints;
    updateScoreDisplay();
    checkLevelUp();
}, 1000);

// Save Game State to Local Storage
function saveGameState() {
    const gameState = {
        totalScore,
        score,
        autoTappers,
        baseMultiplier,
        grandmas,
        totalUpgrades,
        level,
        prestigeLevel,
        lastLoginDate: new Date().toDateString(),
    };
    localStorage.setItem('cookieClickerGameState', JSON.stringify(gameState));
}

// Load Game State from Local Storage
function loadGameState() {
    const savedState = localStorage.getItem('cookieClickerGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        totalScore = gameState.totalScore || 0;
        score = gameState.score || 0;
        autoTappers = gameState.autoTappers || 0;
        baseMultiplier = gameState.baseMultiplier || 1;
        grandmas = gameState.grandmas || 0;
        totalUpgrades = gameState.totalUpgrades || 0;
        level = gameState.level || 1;
        prestigeLevel = gameState.prestigeLevel || 0;
        lastLoginDate = gameState.lastLoginDate;

        // Calculate offline progress
        calculateOfflineProgress();
    }
}

// Calculate Offline Progress
function calculateOfflineProgress() {
    const today = new Date().toDateString();
    if (lastLoginDate && lastLoginDate !== today) {
        const lastLoginTime = new Date(lastLoginDate).getTime();
        const currentTime = new Date().getTime();
        const timeAwayInSeconds = Math.floor((currentTime - lastLoginTime) / 1000);

        const offlinePoints = timeAwayInSeconds * OFFLINE_POINTS_PER_SECOND;
        totalScore += offlinePoints;

        // Update UI for offline progress
        offlineProgressContainer.style.display = 'block';
        timeAwayElement.textContent = timeAwayInSeconds;
        offlinePointsElement.textContent = offlinePoints;

        alert(`You were away for ${timeAwayInSeconds} seconds and earned ${offlinePoints} points!`);
    }
}

// Initialize Game
function initializeGame() {
    loadGameState();
    updateScoreDisplay();
    updateLevelDisplay();
}

// Click Cookie Function
function clickCookie() {
    let pointsToAdd = baseMultiplier;

    // If a power-up is active, double the points
    if (powerUpActive) {
        pointsToAdd *= 2;
    }

    // Apply prestige bonus
    pointsToAdd += pointsToAdd * (prestigeLevel * 0.1);

    totalScore += pointsToAdd;
    score += pointsToAdd;
    updateScoreDisplay();
    checkLevelUp();

    // Add bounce animation
    const cookie = document.getElementById('cookie');
    cookie.classList.add('bounce');
    setTimeout(() => {
        cookie.classList.remove('bounce');
    }, 300); // Remove the class after the animation ends

    // Save game state after each click
    saveGameState();
}

// Update Score Display
function updateScoreDisplay() {
    document.getElementById('score').textContent = Math.floor(totalScore);
}

// Check Level Up
function checkLevelUp() {
    if (score >= pointsToNextLevel) {
        // Deduct points needed to level up
        score -= pointsToNextLevel;
        level++;
        alert(`Congratulations! You've reached Level ${level}!`);

        // Update UI
        updateLevelDisplay();

        // Unlock prestige at level 9
        if (level === 9 && prestigeBtn.classList.contains('prestige-disabled')) {
            prestigeBtn.classList.remove('prestige-disabled');
            alert("You've reached Level 9! You can now Prestige!");
        }
    }

    // Update progress bar
    const progressPercentage = (score / pointsToNextLevel) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// Update Level Display
function updateLevelDisplay() {
    levelDisplay.textContent = level;
    prestigeLevelDisplay.textContent = prestigeLevel;
}

// Buy Upgrade Function
function buyUpgrade(upgradeType) {
    if (upgradeType === 'autoTapper') {
        const cost = 10;
        if (totalScore >= cost) {
            totalScore -= cost;
            autoTappers += 1;
            totalUpgrades += 1;
            alert(`You bought an Auto-Tapper! You now earn ${autoTappers} points per second.`);
        } else {
            alert("Not enough points! Keep clicking!");
        }
    } else if (upgradeType === 'multiplier') {
        const cost = 50;
        if (totalScore >= cost) {
            totalScore -= cost;
            baseMultiplier *= 2; // Double the base multiplier
            totalUpgrades += 1;
            alert(`You bought a Multiplier! Your clicks are now worth ${baseMultiplier} points.`);
        } else {
            alert("Not enough points! Keep clicking!");
        }
    } else if (upgradeType === 'grandma') {
        const cost = 100;
        if (totalScore >= cost) {
            totalScore -= cost;
            grandmas += 1;
            totalUpgrades += 1;
            alert(`You bought a Grandma! You now earn ${grandmas * 5} points per second.`);
        } else {
            alert("Not enough points! Keep clicking!");
        }
    }
    updateScoreDisplay();
    saveGameState();
}

// Activate Power-Up Function
function activatePowerUp(powerUpType) {
    if (powerUpActive) {
        alert("A power-up is already active! Wait for it to finish.");
        return;
    }

    if (powerUpType === 'doublePoints') {
        const cost = 75;
        if (totalScore >= cost) {
            totalScore -= cost;
            alert("x2 Points activated for 20 seconds!");
            activateTemporaryPowerUp(20);
        } else {
            alert("Not enough points! Keep clicking!");
        }
    } else if (powerUpType === 'frenzyMode') {
        const cost = 150;
        if (totalScore >= cost) {
            totalScore -= cost;
            alert("Frenzy Mode activated for 20 seconds!");
            activateFrenzyMode(20);
        } else {
            alert("Not enough points! Keep clicking!");
        }
    }
    updateScoreDisplay();
    saveGameState();
}

// Activate Temporary Power-Up
function activateTemporaryPowerUp(duration) {
    powerUpActive = true;
    countdownDisplay.style.display = 'block';
    let timeLeft = duration;

    const countdownInterval = setInterval(() => {
        timerDisplay.textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            powerUpActive = false;
            countdownDisplay.style.display = 'none';
            alert("x2 Points power-up has ended!");
        }
    }, 1000);
}

// Activate Frenzy Mode
function activateFrenzyMode(duration) {
    powerUpActive = true;
    countdownDisplay.style.display = 'block';
    let timeLeft = duration;

    const frenzyInterval = setInterval(() => {
        totalScore += 10;
        updateScoreDisplay();
    }, 1000);

    const countdownInterval = setInterval(() => {
        timerDisplay.textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(frenzyInterval);
            clearInterval(countdownInterval);
            powerUpActive = false;
            countdownDisplay.style.display = 'none';
            alert("Frenzy Mode has ended!");
        }
    }, 1000);
}

// Prestige Function
function prestige() {
    if (level < 9) {
        alert("You need to reach Level 9 to Prestige!");
        return;
    }

    // Reset progress
    totalScore = 0;
    score = 0;
    autoTappers = 0;
    baseMultiplier = 1;
    grandmas = 0;
    totalUpgrades = 0;
    level = 1;

    // Increase prestige level and apply bonus
    prestigeLevel++;
    alert(`You've prestiged! Your multiplier is now increased by ${prestigeLevel * 10}% permanently.`);

    // Update UI
    updateScoreDisplay();
    updateLevelDisplay();
    progressFill.style.width = '0%';

    // Save game state after prestige
    saveGameState();
}

// Claim Daily Reward Function
function claimDailyReward() {
    const today = new Date().toDateString();
    if (lastLoginDate !== today) {
        totalScore += 100; // Bonus points for daily login
        lastLoginDate = today;
        alert("You claimed your daily reward! +100 points!");
        updateScoreDisplay();
    } else {
        alert("You've already claimed your daily reward today!");
    }
    saveGameState();
}

// Check Achievements
function checkAchievements() {
    const achievement1 = document.getElementById('achievement1');
    const achievement2 = document.getElementById('achievement2');
    const achievement3 = document.getElementById('achievement3');

    // Achievement 1: Score 100 points
    if (totalScore >= 100 && !achievement1.classList.contains('completed')) {
        achievement1.classList.add('completed');
        alert("Achievement Unlocked: Score 100 points!");
    }

    // Achievement 2: Buy 3 upgrades
    if (totalUpgrades >= 3 && !achievement2.classList.contains('completed')) {
        achievement2.classList.add('completed');
        alert("Achievement Unlocked: Buy 3 upgrades!");
    }

    // Achievement 3: Reach 1000 points
    if (totalScore >= 1000 && !achievement3.classList.contains('completed')) {
        achievement3.classList.add('completed');
        alert("Achievement Unlocked: Reach 1000 points!");
    }
}

// Check achievements every second
setInterval(() => {
    checkAchievements();
}, 1000);

// Initialize the game when the page loads
window.onload = initializeGame;
