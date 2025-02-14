class FortuneWheel {
    constructor() {
        this.names = [];
        this.history = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.spinSpeed = 5;
        this.totalNames = 0;  // Track total names for counter
        this.initElements();
        this.initCanvas();
        this.initEventListeners();
    }

    initElements() {
        // Input elements
        this.singleInput = document.getElementById('single-input');
        this.bulkInput = document.getElementById('bulk-input');
        this.fileInput = document.getElementById('file-input');
        
        // Buttons
        this.addButton = document.getElementById('add-student');
        this.addBulkButton = document.getElementById('add-bulk');
        this.uploadButton = document.getElementById('upload-file');
        this.resetButton = document.getElementById('reset-wheel');
        this.spinButton = document.getElementById('spin-wheel');
        this.fullscreenButton = document.getElementById('enter-fullscreen');
        
        // Display elements
        this.selectedDisplay = document.getElementById('selected-name');
        this.historyList = document.getElementById('selection-history');
        
        // Canvas elements
        this.wheelCanvas = document.getElementById('wheel-canvas');
        this.fullscreenCanvas = document.getElementById('fullscreen-canvas');
        
        // Fullscreen elements
        this.fullscreenMode = document.getElementById('fullscreen-mode');
        this.fullscreenPopup = document.getElementById('fullscreen-popup');
        this.popupName = document.getElementById('popup-name');
        this.exitFullscreenButton = document.getElementById('exit-fullscreen');
        this.fullscreenSpinButton = document.getElementById('fullscreen-spin');
        this.speedControl = document.getElementById('spin-speed');
    }

    initCanvas() {
        // Set canvas size
        this.wheelCanvas.width = 500;
        this.wheelCanvas.height = 500;
        this.fullscreenCanvas.width = 800;
        this.fullscreenCanvas.height = 800;
        
        // Get contexts
        this.ctx = this.wheelCanvas.getContext('2d');
        this.fullscreenCtx = this.fullscreenCanvas.getContext('2d');
    }

    initEventListeners() {
        // Tab handlers
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // Add Enter key support for single input
        this.singleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addName();
            }
        });

        // Input handlers
        this.addButton.addEventListener('click', () => this.addName());
        this.addBulkButton.addEventListener('click', () => this.addBulkNames());
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Control handlers
        this.resetButton.addEventListener('click', () => this.reset());
        this.spinButton.addEventListener('click', () => this.spin());
        this.fullscreenButton.addEventListener('click', () => this.enterFullscreen());
        this.exitFullscreenButton.addEventListener('click', () => this.exitFullscreen());
        this.fullscreenSpinButton.addEventListener('click', () => this.spin(true));
        this.speedControl.addEventListener('input', (e) => this.updateSpeed(e));
        
        // Keyboard handlers
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    switchTab(event) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.input-group').forEach(group => group.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        event.target.classList.add('active');
        const tabId = event.target.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
    }

    addName() {
        const name = this.singleInput.value.trim();
        if (name) {
            this.names.push(name);
            this.totalNames++;  // Increment total names counter
            this.singleInput.value = '';
            this.drawWheel();
            this.updateCounter();
        }
    }

    addBulkNames() {
        const names = this.bulkInput.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name);
        
        if (names.length) {
            this.names = [...this.names, ...names];
            this.totalNames += names.length;  // Increment total names counter
            this.bulkInput.value = '';
            this.drawWheel();
            this.updateCounter();
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const names = text
                .split(/[\n,]/)
                .map(name => name.trim())
                .filter(name => name);
            
            if (names.length) {
                this.names = [...this.names, ...names];
                this.totalNames += names.length;
                this.drawWheel();
                this.updateCounter();
            }
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    spin(isFullscreen = false) {
        if (this.isSpinning || this.names.length === 0) return;
        
        this.isSpinning = true;
        const extraSpins = 5;
        const baseSpeed = this.spinSpeed * 0.1;
        const duration = 5000 / baseSpeed;
        
        const targetSlice = Math.floor(Math.random() * this.names.length);
        const sliceAngle = (2 * Math.PI) / this.names.length;
        
        this.targetRotation = this.currentRotation + 
            (2 * Math.PI * extraSpins) -
            (sliceAngle * targetSlice) -
            (this.currentRotation % (2 * Math.PI));
        
        const startTime = performance.now();
        const startRotation = this.currentRotation;
        const rotationDiff = this.targetRotation - this.currentRotation;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = 1 - Math.pow(1 - progress, 4);
            this.currentRotation = startRotation + (rotationDiff * eased);
            
            this.drawWheel(this.ctx, this.wheelCanvas);
            if (isFullscreen) {
                this.drawWheel(this.fullscreenCtx, this.fullscreenCanvas);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.announceWinner(targetSlice, isFullscreen);
            }
        };
        
        requestAnimationFrame(animate);
    }

    drawWheel(ctx = this.ctx, canvas = this.wheelCanvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.names.length === 0) {
            this.drawEmptyWheel(ctx, centerX, centerY, radius);
            return;
        }

        const sliceAngle = (2 * Math.PI) / this.names.length;
        
        this.names.forEach((name, index) => {
            const startAngle = index * sliceAngle + this.currentRotation;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = index % 2 ? '#f0f0f0' : '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.font = `${radius / 20}px 'IBM Plex Mono'`;
            const name_truncated = name.length > 20 ? name.substring(0, 17) + '...' : name;
            ctx.fillStyle = '#000000';
            ctx.fillText(name_truncated, radius * 0.85, 0);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#000000';
        ctx.fill();
    }

    drawEmptyWheel(ctx, centerX, centerY, radius) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        
        ctx.font = '20px "IBM Plex Mono"';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const message = this.totalNames === 0 ? 
            'Add names to begin' : 
            'All names have been selected';
        
        ctx.fillText(message, centerX, centerY);
    }

    announceWinner(index, isFullscreen) {
        const winner = this.names[index];
        this.history.push(winner);
        
        // Remove the selected name from the names array
        this.names.splice(index, 1);
        
        this.updateHistory();
        this.selectedDisplay.textContent = winner;
        this.drawWheel();
        this.updateCounter();
        
        if (isFullscreen) {
            this.showFullscreenPopup(winner);
        }
    }
    updateCounter() {
        const remaining = this.names.length;
        const total = this.totalNames;
        const counterText = `${remaining}/${total} names remaining`;
        
        document.getElementById('names-counter').textContent = counterText;
        document.getElementById('fullscreen-counter').textContent = counterText;
    }

    showFullscreenPopup(name) {
        console.log('Showing popup for:', name); // Debug log
        
        // Set the name
        this.popupName.textContent = name;
        
        // Clear any existing timers or listeners
        if (this.popupTimer) {
            clearTimeout(this.popupTimer);
        }
        document.removeEventListener('click', this.hidePopupHandler);
        
        // Show the popup
        this.fullscreenPopup.classList.remove('hidden');
        // Force a reflow
        void this.fullscreenPopup.offsetWidth;
        this.fullscreenPopup.classList.add('visible');
        
        // Create hide handler
        this.hidePopupHandler = () => {
            this.fullscreenPopup.classList.remove('visible');
            setTimeout(() => {
                this.fullscreenPopup.classList.add('hidden');
            }, 300);
        };
        
        // Set timer to enable click-to-dismiss
        this.popupTimer = setTimeout(() => {
            document.addEventListener('click', this.hidePopupHandler, { once: true });
        }, 1000);
    }
    updateHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            this.historyList.appendChild(li);
        });
    }

    enterFullscreen() {
        this.fullscreenMode.classList.remove('hidden');
        this.drawWheel(this.fullscreenCtx, this.fullscreenCanvas);
    }

    exitFullscreen() {
        this.fullscreenMode.classList.add('hidden');
    }

    updateSpeed(event) {
        this.spinSpeed = parseInt(event.target.value);
    }

    handleKeyboard(event) {
        if (event.code === 'Space' && !this.fullscreenMode.classList.contains('hidden')) {
            event.preventDefault();
            this.spin(true);
        } else if (event.code === 'Escape') {
            this.exitFullscreen();
        }
    }

    handleResize() {
        if (!this.fullscreenMode.classList.contains('hidden')) {
            const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
            this.fullscreenCanvas.width = size;
            this.fullscreenCanvas.height = size;
            this.drawWheel(this.fullscreenCtx, this.fullscreenCanvas);
        }
    }

    reset() {
        this.names = [];
        this.history = [];
        this.totalNames = 0;
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.selectedDisplay.textContent = 'Spin the wheel!';
        this.updateHistory();
        this.updateCounter();
        this.drawWheel();
        this.drawWheel(this.fullscreenCtx, this.fullscreenCanvas);
    }
}

// Initialize the wheel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FortuneWheel();
});