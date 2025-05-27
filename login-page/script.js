// ========================================
// COMPUTATIONAL THINKING IMPLEMENTATION
// ========================================

// Global variables (Data Storage)
let attempts = 0;
let correctPassword = "secret123";
let isLocked = false;
const maxAttempts = 3;

// DOM Elements (Interface Components)
const loginContainer = document.getElementById('loginContainer');
const successContainer = document.getElementById('successContainer');
const lockedContainer = document.getElementById('lockedContainer');
const passwordInput = document.getElementById('passwordInput');
const statusMessage = document.getElementById('statusMessage');
const attemptsDisplay = document.getElementById('attemptsDisplay');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

// ========================================
// CORE ALGORITHM (From Original Logic)
// ========================================

function authenticateUser(password) {
    // Pattern Recognition: Same logic as original while loop
    if (isLocked) {
        return { success: false, message: "Account is locked", locked: true };
    }
    
    attempts++;
    
    // Decision Making: Password validation
    if (password === correctPassword) {
        return { 
            success: true, 
            message: "Access granted!", 
            attempts: attempts 
        };
    } else if (attempts >= maxAttempts) {
        isLocked = true;
        return { 
            success: false, 
            message: "Account locked after 3 failed attempts", 
            locked: true 
        };
    } else {
        return { 
            success: false, 
            message: `Wrong password. ${maxAttempts - attempts} attempts remaining.`,
            remainingAttempts: maxAttempts - attempts
        };
    }
}

// ========================================
// USER INTERFACE FUNCTIONS
// ========================================

function updateStatusMessage(message, type = 'normal') {
    statusMessage.textContent = message;
    statusMessage.className = `status-${type}`;
}

function updateAttemptsDisplay() {
    const remaining = maxAttempts - attempts;
    attemptsDisplay.textContent = `Attempts remaining: ${remaining}`;
    
    // Visual feedback based on attempts
    if (remaining === 3) {
        attemptsDisplay.className = 'attempts-normal';
    } else if (remaining === 2) {
        attemptsDisplay.className = 'attempts-warning';
    } else {
        attemptsDisplay.className = 'attempts-danger';
    }
}

function showContainer(containerToShow) {
    // Hide all containers
    loginContainer.style.display = 'none';
    successContainer.style.display = 'none';
    lockedContainer.style.display = 'none';
    
    // Show the requested container with animation
    containerToShow.style.display = 'block';
    containerToShow.classList.add('fade-in');
}

function resetSystem() {
    // Decomposition: Reset all variables to initial state
    attempts = 0;
    isLocked = false;
    passwordInput.value = '';
    loginBtn.disabled = false;
    
    // Reset UI elements
    updateStatusMessage("Please enter your credentials to continue", "normal");
    updateAttemptsDisplay();
    showContainer(loginContainer);
    
    console.log("System reset - ready for new authentication attempt");
}

// ========================================
// EVENT HANDLERS
// ========================================

// Form submission handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form from submitting traditionally
    
    const password = passwordInput.value;
    
    // Input validation
    if (!password) {
        updateStatusMessage("Please enter a password", "warning");
        return;
    }
    
    // Call authentication algorithm
    const result = authenticateUser(password);
    
    // Algorithm Design: Handle different outcomes
    if (result.success) {
        updateStatusMessage(result.message, "normal");
        setTimeout(() => {
            showContainer(successContainer);
        }, 1000);
        console.log(`Authentication successful after ${result.attempts} attempts`);
        
    } else if (result.locked) {
        updateStatusMessage(result.message, "error");
        loginBtn.disabled = true;
        setTimeout(() => {
            showContainer(lockedContainer);
        }, 2000);
        console.log("Account locked due to too many failed attempts");
        
    } else {
        updateStatusMessage(result.message, "warning");
        updateAttemptsDisplay();
        passwordInput.value = ''; // Clear the input
        passwordInput.focus(); // Focus back to input
        console.log(`Failed attempt ${attempts}. ${result.remainingAttempts} attempts remaining`);
    }
});

// ========================================
// ALTERNATIVE METHOD: ORIGINAL PROMPT-BASED
// ========================================

function runOriginalPromptMethod() {
    // This demonstrates the original computational thinking approach
    alert("Running original prompt-based method...");
    
    let promptAttempts = 0;
    let userPassword;
    
    // Original while loop logic (Abstraction: same algorithm, different interface)
    while (promptAttempts < 3) {
        userPassword = prompt("Enter password:");
        
        // Handle user canceling the prompt
        if (userPassword === null) {
            alert("Login cancelled");
            return;
        }
        
        promptAttempts++;
        
        if (userPassword === correctPassword) {
            alert("Access granted!");
            console.log("Prompt method: Authentication successful");
            break;
        } else if (promptAttempts >= 3) {
            alert("Account locked after 3 failed attempts");
            console.log("Prompt method: Account locked");
        } else {
            alert(`Wrong password. ${3 - promptAttempts} attempts remaining.`);
        }
    }
}

// ========================================
// ADDITIONAL FEATURES
// ========================================

// Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    resetSystem();
    console.log("User logged out");
});

// Reset system button (in locked state)
document.getElementById('resetSystemBtn').addEventListener('click', resetSystem);

// Reset button (in alternative methods)
document.getElementById('resetBtn').addEventListener('click', resetSystem);

// Prompt method button
document.getElementById('promptMethodBtn').addEventListener('click', runOriginalPromptMethod);

// ========================================
// INITIALIZATION
// ========================================

// Page load initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("Login system initialized");
    console.log("Correct password for demo: " + correctPassword);
    console.log("This demonstrates computational thinking concepts:");
    console.log("- Pattern Recognition: Login attempt patterns");
    console.log("- Decomposition: Breaking down authentication into steps");
    console.log("- Abstraction: Focusing on core logic regardless of interface");
    console.log("- Algorithm Design: Step-by-step validation process");
    
    updateAttemptsDisplay();
    passwordInput.focus();
});

// ========================================
// EDUCATIONAL HELPERS
// ========================================

// Function to demonstrate the thinking process
function explainComputationalThinking() {
    console.log("=== COMPUTATIONAL THINKING BREAKDOWN ===");
    console.log("1. DECOMPOSITION: Break the problem into smaller parts");
    console.log("   - Get user input");
    console.log("   - Validate password");
    console.log("   - Track attempts");
    console.log("   - Handle success/failure");
    console.log("");
    console.log("2. PATTERN RECOGNITION: Identify repeating elements");
    console.log("   - Input → Validate → Feedback loop");
    console.log("   - Attempt counting pattern");
    console.log("   - Security lockout pattern");
    console.log("");
    console.log("3. ABSTRACTION: Focus on essential features");
    console.log("   - Core logic works regardless of UI (prompt vs form)");
    console.log("   - Same algorithm, different presentations");
    console.log("");
    console.log("4. ALGORITHM DESIGN: Create step-by-step solution");
    console.log("   - Step 1: Initialize variables");
    console.log("   - Step 2: Get user input");
    console.log("   - Step 3: Check password");
    console.log("   - Step 4: Update attempt counter");
    console.log("   - Step 5: Provide appropriate feedback");
    console.log("   - Step 6: Repeat or terminate based on conditions");
}

// Call this function to see the breakdown
explainComputationalThinking();