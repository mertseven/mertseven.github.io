/**
 * Navigation module
 * Handles UI interactions for navigation elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize search functionality
    initSearch();
    
    // Handle dropdown behavior
    initDropdowns();
});

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.querySelector('.dropdown-content input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Add input event listener for search
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        // Search for articles
        const results = await searchArticles(query);
        
        // Display search results
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No results found';
            li.className = 'no-results';
            searchResults.appendChild(li);
            return;
        }
        
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result.title;
            li.setAttribute('data-id', result.id);
            li.addEventListener('click', () => {
                // Load the selected article
                loadArticle(result.id);
                
                // Clear the search input and results
                searchInput.value = '';
                searchResults.innerHTML = '';
                
                // Close the dropdown
                const dropdown = searchInput.closest('.dropdown-content');
                if (dropdown) {
                    dropdown.style.display = 'none';
                    setTimeout(() => {
                        dropdown.style.display = '';
                    }, 10);
                }
            });
            
            searchResults.appendChild(li);
        });
    }, 300));
}

/**
 * Initialize dropdown behavior
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (!btn || !content) return;
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                content.style.display = '';
            }
        });
        
        // Toggle dropdown when clicking button
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close all other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    const c = d.querySelector('.dropdown-content');
                    if (c) c.style.display = '';
                }
            });
            
            // Toggle this dropdown
            if (content.style.display === 'block') {
                content.style.display = '';
            } else {
                content.style.display = 'block';
            }
        });
        
        // Prevent dropdown from closing when clicking inside content
        content.addEventListener('click', (e) => {
            // Allow propagation for specific elements like search results
            if (!e.target.closest('.search-results')) {
                e.stopPropagation();
            }
        });
    });
}

/**
 * Create a debounced function
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, delay) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

/**
 * Handle navigation to a specific article
 * @param {string} articleId - The ID of the article to navigate to
 */
function navigateToArticle(articleId) {
    // Update URL if needed
    // history.pushState({articleId}, '', `?article=${articleId}`);
    
    // Load the article
    loadArticle(articleId);
}
