/**
 * Data loader module
 * Handles loading article data from JSON files
 */

// Cache for loaded articles to avoid redundant fetches
const articleCache = new Map();

/**
 * Load article data from a JSON file
 * @param {string} articleId - The ID of the article to load
 * @returns {Promise<Object>} - The article data
 */
async function loadArticleData(articleId) {
    // Check if article is already cached
    if (articleCache.has(articleId)) {
        console.log(`Loading article from cache: ${articleId}`);
        return articleCache.get(articleId);
    }
    
    try {
        console.log(`Fetching article data: ${articleId}`);
        
        // Fetch the article data from the data directory
        const response = await fetch(`data/${articleId}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch article data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the article data
        articleCache.set(articleId, data);
        
        return data;
    } catch (error) {
        console.error(`Error loading article data for ${articleId}:`, error);
        
        // For demonstration purposes, return sample data if fetch fails
        // This is useful for GitHub Pages where you might not have a server
        if (articleId === 'leibniz-physics') {
            const sampleData = getSampleLeibnizData();
            articleCache.set(articleId, sampleData);
            return sampleData;
        }
        
        return null;
    }
}

/**
 * Get sample Leibniz article data
 * This is used as a fallback when fetch fails
 * @returns {Object} - Sample article data
 */
function getSampleLeibnizData() {
    return {
        "id": "leibniz-physics",
        "title": "Leibniz's Philosophy of Physics",
        "description": "Leibniz made numerous contributions to physics, having developed a naturalistic account of the physical world that provided an alternative to Newtonian physics.",
        "url": "https://plato.stanford.edu/entries/leibniz-physics/",
        "connections": [
            {
                "id": "dynamical-models",
                "title": "Dynamical Models",
                "category": "dynamical",
                "description": "Leibniz's approach to physical systems through dynamic modeling",
                "relatedNodes": ["force-distance", "substance-models"]
            },
            {
                "id": "force-distance",
                "title": "Force Distance",
                "category": "dynamical",
                "description": "Leibniz's conception of force acting at a distance",
                "relatedNodes": ["dynamical-models", "absolute-relative-motion"]
            },
            {
                "id": "substance-models",
                "title": "Substance Models",
                "category": "substance",
                "description": "Leibniz's models of substance in physics",
                "relatedNodes": ["dynamical-models", "monadology"]
            },
            {
                "id": "absolute-relative-motion",
                "title": "Absolute and Relative Motion",
                "category": "method",
                "description": "Leibniz's views on absolute versus relative motion",
                "relatedNodes": ["force-distance", "space-time-framework"]
            },
            {
                "id": "conserved-quantities",
                "title": "Conserved Quantities",
                "category": "theory",
                "description": "Leibniz's work on conservation laws in physics",
                "relatedNodes": ["vis-viva", "force-distance"]
            },
            {
                "id": "vis-viva",
                "title": "Vis Viva",
                "category": "theory",
                "description": "Leibniz's concept of 'living force'",
                "relatedNodes": ["conserved-quantities", "dynamical-models"]
            },
            {
                "id": "cartesian-influence",
                "title": "Cartesian Influence",
                "category": "influence",
                "description": "Descartes' influence on Leibniz's physics",
                "relatedNodes": ["mechanistic-principles", "substance-models"]
            },
            {
                "id": "mechanistic-principles",
                "title": "Mechanistic Principles",
                "category": "method",
                "description": "Leibniz's mechanistic approach to natural phenomena",
                "relatedNodes": ["cartesian-influence", "vis-viva"]
            },
            {
                "id": "monadology",
                "title": "Monadology",
                "category": "substance",
                "description": "Connection between Leibniz's physics and his monadology",
                "relatedNodes": ["substance-models", "metaphysics-physics"]
            },
            {
                "id": "metaphysics-physics",
                "title": "Metaphysics and Physics",
                "category": "method",
                "description": "Relationship between Leibniz's metaphysics and physics",
                "relatedNodes": ["monadology", "sufficient-reason"]
            },
            {
                "id": "sufficient-reason",
                "title": "Principle of Sufficient Reason",
                "category": "method",
                "description": "Application of sufficient reason in Leibniz's physics",
                "relatedNodes": ["metaphysics-physics", "space-time-framework"]
            },
            {
                "id": "space-time-framework",
                "title": "Space-Time Framework",
                "category": "theory",
                "description": "Leibniz's conception of space and time",
                "relatedNodes": ["sufficient-reason", "absolute-relative-motion"]
            }
        ],
        "categories": {
            "dynamical": "Dynamical Concepts",
            "substance": "Substance Theory",
            "method": "Methodological Principles",
            "influence": "Historical Influences",
            "theory": "Theoretical Frameworks"
        }
    };
}

/**
 * Load domain data
 * @param {string} domainId - The ID of the domain to load
 * @returns {Promise<Object>} - The domain data
 */
async function loadDomainData(domainId) {
    try {
        const response = await fetch(`data/domains/${domainId}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch domain data: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error loading domain data for ${domainId}:`, error);
        return null;
    }
}

/**
 * Search for articles
 * @param {string} query - The search query
 * @returns {Promise<Array>} - An array of search results
 */
async function searchArticles(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    try {
        // For a real implementation, you'd have a search endpoint
        // or a complete articles index to search through
        
        // For demonstration, we'll return some sample results
        const sampleResults = [
            { id: 'leibniz-physics', title: "Leibniz's Philosophy of Physics" },
            { id: 'newton-gravity', title: "Newton's Theory of Gravity" },
            { id: 'descartes-method', title: "Descartes' Method" },
            { id: 'kant-space-time', title: "Kant on Space and Time" },
            { id: 'einstein-relativity', title: "Einstein's Theory of Relativity" }
        ];
        
        // Filter results based on query
        return sampleResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error('Error searching articles:', error);
        return [];
    }
}
