// Main application script
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize global variables
    window.currentData = null;
    window.visualization = null;
    
    // Initialize the application
    init();
    
    // Load default article (Leibniz's Philosophy of Physics)
    await loadArticle('leibniz-physics');
});

/**
 * Initialize the application
 */
function init() {
    // Initialize event listeners
    initEventListeners();
    
    // Initialize tooltips
    initTooltips();
    
    // Adjust layout on window resize
    window.addEventListener('resize', () => {
        if (window.currentData) {
            // Redraw the visualization when the window is resized
            drawVisualization(window.currentData);
        }
    });
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Domain selection listener
    const domainItems = document.querySelectorAll('.dropdown-content li[data-domain]');
    domainItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const domain = e.target.getAttribute('data-domain');
            // TODO: Load articles from the selected domain
            console.log(`Selected domain: ${domain}`);
        });
    });
    
    // Randomize button listener
    const randomizeBtn = document.querySelector('.randomize');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', () => {
            // TODO: Load a random article
            console.log('Randomize clicked');
            
            // For demonstration, load the Leibniz article
            loadArticle('leibniz-physics');
        });
    }
    
    // Link direction checkboxes
    const incomingLinksCheckbox = document.getElementById('incoming-links');
    const outgoingLinksCheckbox = document.getElementById('outgoing-links');
    
    if (incomingLinksCheckbox && outgoingLinksCheckbox) {
        incomingLinksCheckbox.addEventListener('change', updateLinkVisibility);
        outgoingLinksCheckbox.addEventListener('change', updateLinkVisibility);
    }
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltip = document.getElementById('node-tooltip');
    
    // Track mouse movement for tooltip positioning
    document.addEventListener('mousemove', (e) => {
        if (tooltip.style.opacity === '1') {
            const offsetX = 15;
            const offsetY = 15;
            
            // Position tooltip near cursor
            tooltip.style.left = `${e.pageX + offsetX}px`;
            tooltip.style.top = `${e.pageY + offsetY}px`;
        }
    });
}

/**
 * Update link visibility based on checkbox state
 */
function updateLinkVisibility() {
    const incomingLinksCheckbox = document.getElementById('incoming-links');
    const outgoingLinksCheckbox = document.getElementById('outgoing-links');
    
    if (!incomingLinksCheckbox || !outgoingLinksCheckbox) return;
    
    const showIncoming = incomingLinksCheckbox.checked;
    const showOutgoing = outgoingLinksCheckbox.checked;
    
    // TODO: Update visualization based on checkbox state
    console.log(`Show incoming: ${showIncoming}, Show outgoing: ${showOutgoing}`);
    
    // Example implementation (if we had classified links)
    /*
    d3.selectAll('.connection.incoming').style('visibility', showIncoming ? 'visible' : 'hidden');
    d3.selectAll('.connection.outgoing').style('visibility', showOutgoing ? 'visible' : 'hidden');
    */
}

/**
 * Load article data and update the visualization
 * @param {string} articleId - The ID of the article to load
 */
async function loadArticle(articleId) {
    try {
        // Load article data using the data loader
        const data = await loadArticleData(articleId);
        
        if (!data) {
            console.error(`Failed to load article data for: ${articleId}`);
            return;
        }
        
        // Store current data globally
        window.currentData = data;
        
        // Update UI with article details
        updateArticleDetails(data);
        
        // Draw the visualization
        drawVisualization(data);
        
        // Update linked articles
        updateLinkedArticles(data);
        
        console.log(`Article loaded: ${data.title}`);
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

/**
 * Update the article details sidebar
 * @param {Object} data - The article data
 */
function updateArticleDetails(data) {
    const titleElement = document.getElementById('article-title');
    const descriptionElement = document.getElementById('article-description');
    const categoriesList = document.getElementById('categories-list');
    const articleLink = document.querySelector('.article-link');
    
    if (titleElement) titleElement.textContent = data.title;
    if (descriptionElement) descriptionElement.textContent = data.description;
    
    // Update article link
    if (articleLink && data.url) {
        articleLink.href = data.url;
    }
    
    // Update categories
    if (categoriesList && data.categories) {
        categoriesList.innerHTML = '';
        
        Object.entries(data.categories).forEach(([key, value]) => {
            const li = document.createElement('li');
            li.textContent = value;
            li.className = `cat-${key}`;
            categoriesList.appendChild(li);
        });
    }
}

/**
 * Update the linked articles sidebar
 * @param {Object} data - The article data
 */
function updateLinkedArticles(data) {
    const linkedArticlesList = document.getElementById('linked-articles-list');
    
    if (!linkedArticlesList) return;
    
    // For demonstration, we'll use the connections as linked articles
    // In a real application, you might have separate linked articles data
    
    linkedArticlesList.innerHTML = '';
    
    // Create a sample of linked articles
    const sampleLinks = [
        { title: 'Leibniz', relevance: 'high' },
        { title: 'Force in Physics', relevance: 'medium' },
        { title: 'Newton', relevance: 'medium' },
        { title: 'Descartes', relevance: 'low' },
        { title: 'Theories of Time', relevance: 'low' }
    ];
    
    sampleLinks.forEach(link => {
        const li = document.createElement('li');
        
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = link.title;
        
        const span = document.createElement('span');
        span.className = `article-relevance ${link.relevance}`;
        
        li.appendChild(a);
        li.appendChild(span);
        
        linkedArticlesList.appendChild(li);
    });
}

/**
 * Draw the visualization using D3.js
 * @param {Object} data - The article data
 */
function drawVisualization(data) {
    // Clear any existing visualization
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create the visualization using the graph.js createVisualization function
    window.visualization = createVisualization(data, 'visualization-container');
}
