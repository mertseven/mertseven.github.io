/**
 * Test Script for Visualizing SEP
 * This script helps verify functionality and identify issues
 * 
 * How to use:
 * 1. Include this script in your index.html after other scripts
 * 2. Open the browser console to see test results
 * 3. Call runTests() in the console to run all tests
 */

// Configuration options
const testConfig = {
    articleIds: ['leibniz-physics', 'newton-gravity', 'kant-space-time'],
    logResults: true,
    autoRun: false,
    testTimeout: 5000,
};

/**
 * Run all tests
 */
function runTests() {
    console.log('%c Running Visualizing SEP Tests', 'background: #3D348B; color: white; padding: 4px 8px; font-weight: bold;');
    
    // Run tests in sequence
    testBasicElements()
        .then(() => testDataLoading())
        .then(() => testVisualization())
        .then(() => testInteractions())
        .then(() => testResponsiveness())
        .then(() => testPerformance())
        .then(() => {
            console.log('%c All tests completed!', 'background: #4ECDC4; color: black; padding: 4px 8px; font-weight: bold;');
        })
        .catch(error => {
            console.error('%c Test failed!', 'background: #FF6B6B; color: white; padding: 4px 8px; font-weight: bold;', error);
        });
}

/**
 * Test basic page elements
 */
async function testBasicElements() {
    console.log('%c Testing Basic Elements', 'font-weight: bold;');
    
    const testResults = {
        header: !!document.querySelector('header'),
        logo: !!document.querySelector('.logo'),
        dropdowns: document.querySelectorAll('.dropdown').length >= 2,
        mainContainer: !!document.querySelector('main'),
        visualizationContainer: !!document.getElementById('visualization-container'),
        leftSidebar: !!document.querySelector('.left-sidebar'),
        rightSidebar: !!document.querySelector('.right-sidebar'),
        tooltip: !!document.getElementById('node-tooltip'),
    };
    
    // Log results
    logTestResults('Basic Elements', testResults);
    
    // Check for critical issues
    const criticalIssues = Object.entries(testResults)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
    
    if (criticalIssues.length > 0) {
        throw new Error(`Missing critical elements: ${criticalIssues.join(', ')}`);
    }
    
    return true;
}

/**
 * Test data loading functionality
 */
async function testDataLoading() {
    console.log('%c Testing Data Loading', 'font-weight: bold;');
    
    const testResults = {
        dataLoaderExists: typeof loadArticleData === 'function',
        searchExists: typeof searchArticles === 'function',
        domainDataExists: typeof loadDomainData === 'function',
    };
    
    // Test article loading for each test article
    for (const articleId of testConfig.articleIds) {
        try {
            console.log(`Testing loading article: ${articleId}`);
            const data = await loadArticleData(articleId);
            testResults[`${articleId}Loaded`] = !!data;
            testResults[`${articleId}HasConnections`] = data && Array.isArray(data.connections) && data.connections.length > 0;
        } catch (error) {
            console.error(`Error loading article ${articleId}:`, error);
            testResults[`${articleId}Loaded`] = false;
            testResults[`${articleId}HasConnections`] = false;
        }
    }
    
    // Log results
    logTestResults('Data Loading', testResults);
    
    // Check for critical issues
    if (!testResults.dataLoaderExists) {
        throw new Error('Data loader function not found');
    }
    
    return true;
}

/**
 * Test visualization creation and rendering
 */
async function testVisualization() {
    console.log('%c Testing Visualization', 'font-weight: bold;');
    
    const testResults = {
        createVisualizationExists: typeof createVisualization === 'function',
        d3Available: typeof d3 !== 'undefined',
    };
    
    // Test visualization creation
    if (testResults.createVisualizationExists && testResults.d3Available) {
        try {
            // Check if a visualization already exists
            const existingSvg = document.querySelector('#visualization-container svg');
            testResults.visualizationRendered = !!existingSvg;
            
            // Check for central node
            testResults.centralNodeExists = !!document.querySelector('.central-node');
            
            // Check for connection nodes
            const connectionNodes = document.querySelectorAll('.node');
            testResults.connectionNodesExist = connectionNodes.length > 0;
            
            // Check for connection lines
            const connectionLines = document.querySelectorAll('.connection');
            testResults.connectionLinesExist = connectionLines.length > 0;
        } catch (error) {
            console.error('Error testing visualization:', error);
            testResults.visualizationRendered = false;
            testResults.centralNodeExists = false;
            testResults.connectionNodesExist = false;
            testResults.connectionLinesExist = false;
        }
    }
    
    // Log results
    logTestResults('Visualization', testResults);
    
    // Check for critical issues
    if (!testResults.createVisualizationExists) {
        throw new Error('Visualization function not found');
    }
    
    if (!testResults.d3Available) {
        throw new Error('D3.js not available');
    }
    
    return true;
}

/**
 * Test user interactions
 */
async function testInteractions() {
    console.log('%c Testing Interactions', 'font-weight: bold;');
    
    const testResults = {
        handleNodeClickExists: typeof handleNodeClick === 'function',
        handleCentralNodeClickExists: typeof handleCentralNodeClick === 'function',
        showTooltipExists: typeof showTooltip === 'function',
        hideTooltipExists: typeof hideTooltip === 'function',
        zoomBehaviorExists: !!document.querySelector('#visualization-container svg')?.getAttribute('__zoom'),
    };
    
    // Test dropdown behavior
    try {
        const dropdowns = document.querySelectorAll('.dropdown');
        testResults.dropdownsExist = dropdowns.length > 0;
        
        if (testResults.dropdownsExist) {
            // Test dropdown content visibility
            const firstDropdown = dropdowns[0];
            const dropdownContent = firstDropdown.querySelector('.dropdown-content');
            
            // Check initial state (should be hidden)
            const initialDisplay = window.getComputedStyle(dropdownContent).display;
            testResults.dropdownInitiallyHidden = initialDisplay === 'none' || initialDisplay === '';
            
            // Simulate click to show dropdown
            const dropdownButton = firstDropdown.querySelector('.dropdown-btn');
            if (dropdownButton) {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                dropdownButton.dispatchEvent(clickEvent);
                
                // Wait a moment for the click to be processed
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Check if dropdown is visible
                const afterClickDisplay = dropdownContent.style.display;
                testResults.dropdownShowsOnClick = afterClickDisplay === 'block';
                
                // Simulate click outside to hide dropdown
                const outsideClickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                document.body.dispatchEvent(outsideClickEvent);
                
                // Wait a moment for the click to be processed
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Check if dropdown is hidden again
                const afterOutsideClickDisplay = dropdownContent.style.display;
                testResults.dropdownHidesOnOutsideClick = afterOutsideClickDisplay === '' || afterOutsideClickDisplay === 'none';
            }
        }
    } catch (error) {
        console.error('Error testing dropdown behavior:', error);
        testResults.dropdownShowsOnClick = false;
        testResults.dropdownHidesOnOutsideClick = false;
    }
    
    // Log results
    logTestResults('Interactions', testResults);
    
    return true;
}

/**
 * Test responsiveness
 */
async function testResponsiveness() {
    console.log('%c Testing Responsiveness', 'font-weight: bold;');
    
    const testResults = {
        viewportMeta: !!document.querySelector('meta[name="viewport"]'),
        responsiveMediaQueries: checkResponsiveMediaQueries(),
    };
    
    // Log results
    logTestResults('Responsiveness', testResults);
    
    return true;
}

/**
 * Check if the CSS contains responsive media queries
 */
function checkResponsiveMediaQueries() {
    const styleSheets = document.styleSheets;
    let hasMediaQueries = false;
    
    try {
        for (let i = 0; i < styleSheets.length; i++) {
            const sheet = styleSheets[i];
            
            try {
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) continue;
                
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    
                    if (rule instanceof CSSMediaRule) {
                        hasMediaQueries = true;
                        break;
                    }
                }
                
                if (hasMediaQueries) break;
            } catch (securityError) {
                // Cross-origin stylesheet access is restricted
                console.warn('Could not access rules for stylesheet', sheet.href);
            }
        }
    } catch (error) {
        console.error('Error checking for media queries:', error);
    }
    
    return hasMediaQueries;
}

/**
 * Test performance
 */
async function testPerformance() {
    console.log('%c Testing Performance', 'font-weight: bold;');
    
    const testResults = {};
    
    // Test visualization rendering time
    try {
        const startTime = performance.now();
        
        // Try to load and render a different article
        await loadArticle('newton-gravity');
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        testResults.visualizationRenderTime = `${renderTime.toFixed(2)}ms`;
        testResults.renderTimeAcceptable = renderTime < 1000; // Less than 1 second is acceptable
    } catch (error) {
        console.error('Error testing rendering performance:', error);
        testResults.visualizationRenderTime = 'Failed';
        testResults.renderTimeAcceptable = false;
    }
    
    // Log results
    logTestResults('Performance', testResults);
    
    return true;
}

/**
 * Log test results to console
 * @param {string} testName - The name of the test
 * @param {Object} results - The test results
 */
function logTestResults(testName, results) {
    if (!testConfig.logResults) return;
    
    console.group(`${testName} Test Results`);
    
    for (const [key, value] of Object.entries(results)) {
        const style = value === true 
            ? 'color: green; font-weight: bold;' 
            : value === false 
                ? 'color: red; font-weight: bold;' 
                : 'color: blue;';
        
        console.log(`%c${key}: %c${value}`, 'color: black;', style);
    }
    
    console.groupEnd();
}

// Auto-run tests if configured
if (testConfig.autoRun) {
    setTimeout(runTests, 1000);
}

console.log('%c Test script loaded. Call runTests() to run all tests.', 'background: #4ECDC4; color: black; padding: 4px 8px;');
