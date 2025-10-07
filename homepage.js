document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 3D CUBE LOGIC ---
    // Add this to the top of the 'DOMContentLoaded' listener in script.js

// --- WHAT'S NEW BANNER LOGIC ---

// 1. DEFINE YOUR LATEST UPDATE HERE
// To push a new update, just change the `id` and update the content.
const latestUpdate = {
    id: 'update-2024-05-24-living-doc', // A unique ID for this specific update
    content: 'This site is now a "Living Document"! Click on the green circles <span class="log-marker"></span> to see embedded history.',
};

// 2. CHECK IF THE USER HAS ALREADY SEEN THIS UPDATE
const lastSeenUpdateId = localStorage.getItem('lastSeenUpdateId');

if (latestUpdate.id !== lastSeenUpdateId) {
    // 3. CREATE AND INJECT THE BANNER HTML
    const banner = document.createElement('div');
    banner.className = 'whats-new-banner';
    banner.innerHTML = `
        <div class="whats-new-content">
            <p><strong>What's New:</strong> ${latestUpdate.content}</p>
        </div>
        <div class="whats-new-actions">
            <button class="whats-new-dismiss" title="Dismiss">×</button>
        </div>
    `;
    document.body.appendChild(banner);

    // 4. SHOW THE BANNER
    setTimeout(() => {
        banner.classList.add('visible');
    }, 500); // Small delay to let the page settle

    // 5. HANDLE DISMISSAL
    const dismissButton = banner.querySelector('.whats-new-dismiss');
    dismissButton.addEventListener('click', () => {
        banner.classList.remove('visible');
        // Remember that this update has been seen
        localStorage.setItem('lastSeenUpdateId', latestUpdate.id);
        // Optional: remove the banner from the DOM after it fades out
        setTimeout(() => banner.remove(), 500);
    });
}

// --- End of What's New Banner Logic ---

console.log("DOM fully loaded and parsed. Initializing script..."); // This line should now be after the banner logic
    const cube = document.getElementById('hero-cube');
    if (cube) {
        // The rotation is handled entirely by CSS animation.
    }

    // --- 2. LIVING DOCUMENT & HISTORY LOGIC ---
    const logData = {
        'log-redesign': {
            date: '2025-07-07',
            description: 'This homepage was redesigned with a 3D element and a curated "Creative Strands" grid to better reflect the works presented.'
        },
        'log-kafka': {
            date: '2025-07-06',
            description: 'Launched <a href="projects.html#project-kafka">Project KAFKA</a>, an interactive essay that uses real-time hand tracking to deconstruct the user\'s own digital presence. The project explores media philosophy concepts from Kittler and Stiegler, turning the browser into a site for critical analysis.'
        },
        'log-living-doc': {
            date: '2025-07-07',
            description: 'Implemented this "Living Document" feature, embedding the site\'s history as interactive annotations rather than a static list.'
        }
    };

    const markers = document.querySelectorAll('.log-marker');
    let activePopover = null;

    markers.forEach(marker => {
        marker.addEventListener('click', (event) => {
            event.stopPropagation();
            const logId = marker.dataset.logId;
            const data = logData[logId];
            
            if (activePopover && activePopover.dataset.logId === logId) {
                closeActivePopover();
            } else {
                closeActivePopover();
                createPopover(marker, data);
            }
        });
    });

    function createPopover(marker, data) {
        const popover = document.createElement('div');
        popover.className = 'log-popover';
        popover.dataset.logId = marker.dataset.logId;
        popover.innerHTML = `
            <span class="popover-date">LOG: ${data.date}</span>
            <p class="popover-description">${data.description}</p>
        `;
        document.body.appendChild(popover);

        // --- START OF FIX: Viewport-aware positioning logic ---
        const markerRect = marker.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const spaceOnRight = viewportWidth - markerRect.right;
        
        // Position vertically first
        popover.style.top = `${markerRect.bottom + window.scrollY + 8}px`;

        // Check if there's enough space on the right. If not, align to the right edge.
        if (spaceOnRight < popoverRect.width) {
            // Not enough space, align to the right edge of the screen
            popover.style.right = '10px';
            popover.style.left = 'auto';
        } else {
            // Enough space, align to the left of the marker
            popover.style.left = `${markerRect.left + window.scrollX}px`;
            popover.style.right = 'auto';
        }
        // --- END OF FIX ---

        // Show the popover
        setTimeout(() => popover.classList.add('visible'), 10);
        
        activePopover = popover;
    }

    function closeActivePopover() {
        if (activePopover) {
            activePopover.remove();
            activePopover = null;
        }
    }
    
    document.addEventListener('click', (event) => {
        if (activePopover && !activePopover.contains(event.target) && !event.target.classList.contains('log-marker')) {
            closeActivePopover();
        }
    });

    // --- 3. SITE HISTORY MODAL LOGIC ---
    const modal = document.getElementById('site-history-modal');
    const openBtn = document.getElementById('view-history-link');
    const closeBtn = document.getElementById('history-modal-close');
    const modalList = document.getElementById('history-modal-list');

    function renderHistoryList() {
        modalList.innerHTML = '';
        const sortedLog = Object.values(logData).sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedLog.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-modal-item';
            let title = "General Update"; // Default title
            if (log.description.includes('redesigned')) title = "Homepage Redesign";
            if (log.description.includes('Living Document')) title = "Feature Implementation";

            item.innerHTML = `
                <div class="item-header">
                    <span class="item-title">${title}</span>
                    <span class="item-date">${log.date}</span>
                </div>
                <p class="item-description">${log.description}</p>
            `;
            modalList.appendChild(item);
        });
    }
    
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderHistoryList();
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
