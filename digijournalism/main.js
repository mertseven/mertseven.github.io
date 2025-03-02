// DOM Elements
const workflowEl = document.getElementById('workflow');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popupTitle');
const toolsList = document.getElementById('toolsList');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');
const stepIndicator = document.getElementById('stepIndicator');

// Create workflow visualization
function createWorkflow() {
    // Add circles
    steps.forEach(step => {
        const circle = document.createElement('div');
        circle.className = 'circle';
        circle.style.left = `${step.x - 7}%`;  // Adjust for center positioning
        circle.style.top = `${step.y - 7}%`;   // Adjust for center positioning
        circle.style.backgroundColor = step.color || '#ffffff';
        circle.style.color = step.textColor || '#000000';
        
        circle.innerHTML = `
            <div class="step">${step.id}</div>
            <div class="name">${step.name}</div>
        `;
        
        circle.addEventListener('click', () => {
            showTools(step);
        });
        
        // Create hover effect
        circle.addEventListener('mouseover', () => {
            showStepIndicator(step.name);
        });
        
        circle.addEventListener('mouseout', () => {
            hideStepIndicator();
        });
        
        workflowEl.appendChild(circle);
    });
}

// Show step indicator
function showStepIndicator(stepName) {
    stepIndicator.textContent = stepName;
    stepIndicator.style.display = 'block';
}

// Hide step indicator
function hideStepIndicator() {
    stepIndicator.style.display = 'none';
}

// Show tools and examples for a specific step
function showTools(step) {
    popupTitle.textContent = `${step.id}. ${step.name}`;
    
    // Clear previous content
    toolsList.innerHTML = '';
    const exampleContent = document.getElementById('exampleContent');
    exampleContent.innerHTML = '';
    
    // Add examples
    if (step.examples && step.examples.length > 0) {
        step.examples.forEach(example => {
            const exampleEl = document.createElement('div');
            exampleEl.className = 'example-item';
            exampleEl.innerHTML = `
                <div class="example-title">${example.title}</div>
                <div>${example.description}</div>
                <div class="example-source">Source: ${example.source}</div>
            `;
            exampleContent.appendChild(exampleEl);
        });
    }
    
    // Add tools
    step.tools.forEach(tool => {
        const toolEl = document.createElement('div');
        toolEl.className = 'tool';
        toolEl.innerHTML = `
            <div class="tool-header">${tool.name}</div>
            <div class="tool-body">${tool.description}</div>
        `;
        toolsList.appendChild(toolEl);
    });
    
    // Show popup and overlay
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

// Close tools panel
function closeToolsPanel() {
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// Event listeners
closeBtn.addEventListener('click', closeToolsPanel);
overlay.addEventListener('click', closeToolsPanel);

// Add keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeToolsPanel();
    }
});

// Initialize
createWorkflow();

// Add entry animation
setTimeout(() => {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
        setTimeout(() => {
            circle.style.opacity = '1';
            circle.style.transform = 'translateY(-5px) translateX(-5px)';
            setTimeout(() => {
                circle.style.transform = '';
            }, 200);
        }, index * 120);
    });
}, 300);

// Add responsive handling
function adjustForMobile() {
    if (window.innerWidth < 768) {
        // Mobile layout adjustments
        const circleElements = document.querySelectorAll('.circle');
        
        // Stack circles vertically
        steps.forEach((step, index) => {
            const yPos = 10 + index * 13;
            const circle = circleElements[index];
            if (circle) {
                circle.style.left = '42%';
                circle.style.top = `${yPos}%`;
            }
        });
    }
}

// Check on resize and initial load
window.addEventListener('resize', adjustForMobile);

// Add random "glitch" effect for brutalist style
function addGlitchEffect() {
    setInterval(() => {
        const randomStep = Math.floor(Math.random() * steps.length);
        const circles = document.querySelectorAll('.circle');
        const targetCircle = circles[randomStep];
        
        if (targetCircle) {
            targetCircle.style.transform = 'translateX(3px)';
            setTimeout(() => {
                targetCircle.style.transform = '';
            }, 150);
        }
    }, 5000);
}

// Initialize effects
addGlitchEffect();

// Add this to your main.js file, at the end

// Examples Panel Functionality
const examplesPanel = document.getElementById('examplesPanel');
const examplesToggleBtn = document.getElementById('examplesToggleBtn');
const closeExamplesBtn = document.getElementById('closeExamplesBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const categoryContents = document.querySelectorAll('.category-content');

// Toggle examples panel
function toggleExamplesPanel() {
    examplesPanel.classList.toggle('open');
}

// Close examples panel
function closeExamplesPanel() {
    examplesPanel.classList.remove('open');
}

// Change tab
function changeTab(e) {
    // Remove active class from all tabs
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    e.target.classList.add('active');
    
    // Hide all content
    categoryContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected content
    const category = e.target.getAttribute('data-category');
    document.getElementById(`${category}-content`).classList.add('active');
}

// Event listeners
examplesToggleBtn.addEventListener('click', toggleExamplesPanel);
closeExamplesBtn.addEventListener('click', closeExamplesPanel);

// Add event listeners to tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', changeTab);
});

// Close examples panel with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && examplesPanel.classList.contains('open')) {
        closeExamplesPanel();
    }
});