// Birthday Countdown Website - JavaScript
// Persistent state management with localStorage + Theme Switching

let countdownInterval;
let photoIndex = 0;
let heartsInterval;

// Storage keys for localStorage
const STORAGE_KEYS = {
    BIRTHDAY_DATE: 'birthdayCountdown_date',
    COUNTDOWN_ACTIVE: 'birthdayCountdown_active',
    CURRENT_STAGE: 'birthdayCountdown_stage',
    PHOTO_INDEX: 'birthdayCountdown_photoIndex'
};

// Stages of the countdown experience
const STAGES = {
    INITIAL: 'initial',
    COUNTDOWN: 'countdown',
    BIRTHDAY: 'birthday',
    PHOTOS: 'photos',
    FINAL: 'final'
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupResetButton();
    initializeThemeSwitching();
});

// Initialize the application based on stored state
function initializeApp() {
    // Set default date (tomorrow) if no date is stored
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const storedDate = localStorage.getItem(STORAGE_KEYS.BIRTHDAY_DATE);
    document.getElementById('birthdayDate').value = storedDate || defaultDate;

    // Check if countdown was previously active
    const isActive = localStorage.getItem(STORAGE_KEYS.COUNTDOWN_ACTIVE) === 'true';
    const currentStage = localStorage.getItem(STORAGE_KEYS.CURRENT_STAGE) || STAGES.INITIAL;

    if (isActive && storedDate) {
        restoreCountdownState(storedDate, currentStage);
    }
}

// Restore the countdown state after page refresh
function restoreCountdownState(dateString, stage) {
    const birthdayDate = new Date(dateString).getTime();
    const now = new Date().getTime();

    // If birthday has passed, show birthday message
    if (birthdayDate <= now) {
        showBirthdayMessage();
        return;
    }

    // Restore based on the current stage
    switch(stage) {
        case STAGES.COUNTDOWN:
            document.getElementById('dateInput').style.display = 'none';
            document.getElementById('countdown').style.display = 'block';
            startCountdownTimer(birthdayDate);
            break;

        case STAGES.BIRTHDAY:
            showBirthdayMessage();
            break;

        case STAGES.PHOTOS:
            showBirthdayMessage();
            setTimeout(() => {
                showPhotos();
            }, 1000);
            break;

        case STAGES.FINAL:
            showBirthdayMessage();
            setTimeout(() => {
                showPhotos();
                setTimeout(() => {
                    document.getElementById('finalMessage').style.display = 'block';
                }, 2000);
            }, 1000);
            break;

        default:
            // Stay in initial state
            break;
    }
}

// Start the countdown when button is clicked
function startCountdown() {
    const dateInput = document.getElementById('birthdayDate').value;
    if (!dateInput) {
        alert('Please select a birthday date!');
        return;
    }

    const birthdayDate = new Date(dateInput).getTime();
    const now = new Date().getTime();

    // Store the date and activate countdown
    localStorage.setItem(STORAGE_KEYS.BIRTHDAY_DATE, dateInput);
    localStorage.setItem(STORAGE_KEYS.COUNTDOWN_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_STAGE, STAGES.COUNTDOWN);

    if (birthdayDate <= now) {
        showBirthdayMessage();
        return;
    }

    document.getElementById('dateInput').style.display = 'none';
    document.getElementById('countdown').style.display = 'block';

    startCountdownTimer(birthdayDate);
}

// Start the actual countdown timer
function startCountdownTimer(birthdayDate) {
    countdownInterval = setInterval(() => {
        updateCountdown(birthdayDate);
    }, 1000);

    updateCountdown(birthdayDate);
}

// Update countdown display
function updateCountdown(birthdayDate) {
    const now = new Date().getTime();
    const timeLeft = birthdayDate - now;

    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        showBirthdayMessage();
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Show birthday message when countdown ends
function showBirthdayMessage() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STAGE, STAGES.BIRTHDAY);

    document.getElementById('countdown').style.display = 'none';
    document.getElementById('birthdayMessage').style.display = 'block';
    createHearts();
}

// Show photo gallery
function showPhotos() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STAGE, STAGES.PHOTOS);

    document.getElementById('birthdayMessage').style.display = 'none';
    document.getElementById('photoGallery').style.display = 'block';

    // Reset photo index from storage or start from 0
    photoIndex = parseInt(localStorage.getItem(STORAGE_KEYS.PHOTO_INDEX)) || 0;
    showNextPhoto();
}

// Show photos one by one with animation
function showNextPhoto() {
    const photos = document.querySelectorAll('.photo-item');
    if (photoIndex < photos.length) {
        photos[photoIndex].style.display = 'block';
        photos[photoIndex].style.animation = 'fadeInUp 0.8s ease-out';

        // Store current photo index
        localStorage.setItem(STORAGE_KEYS.PHOTO_INDEX, photoIndex.toString());
        photoIndex++;

        setTimeout(showNextPhoto, 1500);
    } else {
        setTimeout(() => {
            localStorage.setItem(STORAGE_KEYS.CURRENT_STAGE, STAGES.FINAL);
            document.getElementById('finalMessage').style.display = 'block';
        }, 2000);
    }
}

// Create floating heart animations
function createHearts() {
    const heartsContainer = document.getElementById('hearts');

    heartsInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        heart.style.fontSize = (Math.random() * 10 + 15) + 'px';

        heartsContainer.appendChild(heart);

        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, 6000);
    }, 300);
}

// Setup the hidden reset button functionality
function setupResetButton() {
    const resetButton = document.getElementById('resetButton');
    let clickCount = 0;
    let clickTimer;

    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        clickCount++;

        // Clear existing timer
        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        // Triple click to reset (more secure)
        if (clickCount === 3) {
            resetCountdown();
            clickCount = 0;
        } else {
            // Reset click count after 1 second if not triple clicked
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
        }
    });
}

// Reset the countdown to initial state
function resetCountdown() {
    // Show confirmation dialog
    const confirmReset = confirm('Are you sure you want to reset the countdown? This will restart everything.');

    if (!confirmReset) {
        return;
    }

    // Clear all intervals
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    if (heartsInterval) {
        clearInterval(heartsInterval);
    }

    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    // Reset photo index
    photoIndex = 0;

    // Hide all sections with fade out animation
    const sections = ['countdown', 'birthdayMessage', 'photoGallery', 'finalMessage'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section.style.display !== 'none') {
            section.classList.add('fade-out');
        }
    });

    // Clear hearts container
    document.getElementById('hearts').innerHTML = '';

    // Reset all sections after animation
    setTimeout(() => {
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            section.style.display = 'none';
            section.classList.remove('fade-out');
        });

        // Hide all photos
        document.querySelectorAll('.photo-item').forEach(photo => {
            photo.style.display = 'none';
        });

        // Show initial date input
        document.getElementById('dateInput').style.display = 'block';

        // Reset date to tomorrow
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('birthdayDate').value = tomorrow.toISOString().split('T')[0];

    }, 500);
}

// Prevent accidental page refresh
window.addEventListener('beforeunload', function(e) {
    const isActive = localStorage.getItem(STORAGE_KEYS.COUNTDOWN_ACTIVE) === 'true';

    if (isActive) {
        const confirmationMessage = 'Are you sure you want to leave? The countdown is currently active.';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible again, check if we need to update countdown
        const isActive = localStorage.getItem(STORAGE_KEYS.COUNTDOWN_ACTIVE) === 'true';
        const storedDate = localStorage.getItem(STORAGE_KEYS.BIRTHDAY_DATE);

        if (isActive && storedDate) {
            const birthdayDate = new Date(storedDate).getTime();
            const now = new Date().getTime();

            if (birthdayDate <= now && document.getElementById('countdown').style.display === 'block') {
                // Birthday has arrived while user was away
                showBirthdayMessage();
            }
        }

        // Also update theme when user returns
        updateTheme();
    }
});

// ========================
// AUTOMATIC THEME SWITCHING
// ========================

// Theme switching based on time
function updateTheme() {
    const now = new Date();
    const hour = now.getHours();
    const body = document.body;

    // 6am to 6pm = Day theme (Sunflower)
    // 6pm to 6am = Night theme (Black & Blue)
    if (hour >= 6 && hour < 18) {
        // Day theme (6am - 5:59pm)
        body.classList.remove('night-theme');
        body.classList.add('day-theme');
        updateThemeIndicator('🌻');
    } else {
        // Night theme (6pm - 5:59am)
        body.classList.remove('day-theme');
        body.classList.add('night-theme');
        updateThemeIndicator('🌙');
    }
}

// Update theme indicator
function updateThemeIndicator(icon) {
    let indicator = document.getElementById('themeIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'themeIndicator';
        indicator.className = 'theme-indicator';
        document.body.appendChild(indicator);
    }
    indicator.textContent = icon;
}

// Apply theme immediately and set up periodic checks
function initializeThemeSwitching() {
    updateTheme();

    // Check theme every minute for smooth transitions
    setInterval(updateTheme, 60000);

    // Also check when page becomes visible (user returns to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateTheme();
        }
    });
}

// ========================
// ENHANCED SPARKLE EFFECTS FOR BOTH THEMES
// ========================

// Enhanced sparkle creation with theme-aware colors
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${x - 2}px`;
    sparkle.style.top = `${y - 2}px`;
    document.body.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
}

// Enhanced droplet creation with theme-aware colors
function createDroplet(x, y) {
    const drop = document.createElement('div');
    drop.className = 'droplet';
    drop.style.left = `${x - 3}px`;
    drop.style.top = `${y - 3}px`;
    document.body.appendChild(drop);
    drop.addEventListener('animationend', () => drop.remove());
}

// Handler for pointer events (works with both themes)
function handlePointerMove(evt) {
    let points = [];
    if (evt.touches) {
        // Convert TouchList to array for mobile
        points = Array.prototype.slice.call(evt.touches);
    } else {
        // Mouse event: use single point
        points = [{ clientX: evt.clientX, clientY: evt.clientY }];
    }

    points.forEach(pt => {
        const x = pt.clientX;
        const y = pt.clientY;

        // Create sparkle at pointer position
        createSparkle(x, y);

        // Occasionally create a falling droplet
        if (Math.random() < 0.1) {
            createDroplet(x, y);
        }
    });
}

// Attach listeners for both mouse and touch events
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('touchmove', handlePointerMove, { passive: true });