class XRayViewer {
    constructor() {
        this.viewer = document.getElementById('xray-viewer');
        this.toggleBtn = document.getElementById('xray-toggle');
        this.isVisible = false;
        this.isLocked = false;
        this.lastInspectedElement = null;
        this.init();
        
        // Hide the viewer initially
        this.viewer.classList.add('hidden');
        this.toggleBtn.textContent = 'Show X-Ray';
    }

    init() {
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.toggleViewer = this.toggleViewer.bind(this);
        this.handleViewerMouseEnter = this.handleViewerMouseEnter.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);

        document.addEventListener('mousemove', this.handleMouseMove);
        this.toggleBtn.addEventListener('click', this.toggleViewer);
        this.viewer.addEventListener('mouseenter', this.handleViewerMouseEnter);
        document.addEventListener('click', this.handleDocumentClick);

        const lockIndicator = document.createElement('div');
        lockIndicator.className = 'xray-lock-indicator';
        lockIndicator.textContent = 'Unlocked';
        this.viewer.appendChild(lockIndicator);
    }

    handleMouseMove(e) {
        if (!this.isVisible || this.isLocked) return;

        const viewerWidth = window.innerWidth <= 600 ? window.innerWidth * 0.9 : 400;
        const viewerHeight = window.innerWidth <= 600 ? window.innerHeight * 0.5 : 300;
        const padding = 20;

        let left = e.clientX + 20;
        let top = e.clientY + 20;

        if (window.innerWidth <= 600) {
            left = window.innerWidth * 0.05;
            top = window.innerHeight - viewerHeight - padding;
        } else {
            if (left + viewerWidth > window.innerWidth - padding) {
                left = e.clientX - viewerWidth - 20;
            }
            if (top + viewerHeight > window.innerHeight - padding) {
                top = window.innerHeight - viewerHeight - padding;
            }
            left = Math.max(padding, left);
        }

        this.viewer.style.left = left + 'px';
        this.viewer.style.top = top + 'px';

        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElement = elements.find(el => 
            el !== this.viewer && 
            el !== this.toggleBtn && 
            !this.viewer.contains(el)
        );

        if (this.lastInspectedElement && this.lastInspectedElement !== targetElement) {
            this.lastInspectedElement.classList.remove('xray-highlight');
        }

        if (targetElement) {
            this.showElementCode(targetElement);
        }
    }

    handleViewerMouseEnter() {
        if (!this.isLocked && this.lastInspectedElement) {
            this.isLocked = true;
            this.viewer.classList.add('locked');
            this.updateLockIndicator();
            this.lockedPosition = {
                left: this.viewer.style.left,
                top: this.viewer.style.top
            };
        }
    }

    handleDocumentClick(e) {
        if (!this.viewer.contains(e.target) && e.target !== this.toggleBtn) {
            this.isLocked = false;
            this.viewer.classList.remove('locked');
            this.updateLockIndicator();
            this.lockedPosition = null;
        }
    }

    showElementCode(element) {
        this.lastInspectedElement = element;
        element.classList.add('xray-highlight');

        const html = element.outerHTML
            .replace(/>/g, '>\n')
            .replace(/</g, '\n<')
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim())
            .join('\n');

        const styles = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const highlightedCode = this.highlightCode(html);

        this.viewer.innerHTML = `
            <div class="xray-info">
                <div class="xray-tag">Element: &lt;${element.tagName.toLowerCase()}&gt;</div>
                ${element.className ? `<div class="xray-attr">Class: ${element.className}</div>` : ''}
            </div>
            <div class="xray-details">
                <div class="xray-detail-item">Size: ${Math.round(rect.width)} × ${Math.round(rect.height)}px</div>
                <div class="xray-detail-item">Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}</div>
                <div class="xray-detail-item">Font: ${styles.fontFamily} (${styles.fontSize})</div>
                <div class="xray-detail-item">Colors: ${styles.color}, bg: ${styles.backgroundColor}</div>
            </div>
            <pre>${highlightedCode}</pre>
            ${this.isLocked ? '<div class="xray-lock-indicator">Locked</div>' : '<div class="xray-lock-indicator">Unlocked</div>'}
        `;
    }

    highlightCode(code) {
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    updateLockIndicator() {
        const indicator = this.viewer.querySelector('.xray-lock-indicator');
        if (indicator) {
            indicator.textContent = this.isLocked ? 'Locked' : 'Unlocked';
        }
    }

    toggleViewer() {
        this.isVisible = !this.isVisible;
        this.viewer.classList.toggle('hidden');
        this.toggleBtn.textContent = this.isVisible ? 'Hide X-Ray' : 'Show X-Ray';
        
        if (!this.isVisible && this.lastInspectedElement) {
            this.lastInspectedElement.classList.remove('xray-highlight');
            this.lastInspectedElement = null;
        }
    }
}

// Initialize the X-Ray viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new XRayViewer();
});