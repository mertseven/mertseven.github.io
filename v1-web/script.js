document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing script..."); // Debug: Script start

    // --- Sidebar Navigation & Iframe Logic (for projects.html) ---
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const contentPane = document.querySelector('.content-pane');
    let activeIframe = null;
    let handleInitialLoadAndHashChange; 

    function showContentSection(targetId) {
        // Hide currently active iframe if any
        if (activeIframe) {
            const iframeContainer = activeIframe.closest('.project-iframe-container');
            // Setting src to 'about:blank' helps in stopping any media playback and clearing content
            activeIframe.src = 'about:blank';
            try { 
                // Attempt to remove the iframe to free up resources
                activeIframe.remove(); 
            } catch(e){
                console.error("Error removing iframe:", e);
            }
            activeIframe = null; // Reset active iframe reference

            if (iframeContainer) {
                // Hide loading and unavailable messages when an iframe is being cleared
                const loadingMsg = iframeContainer.querySelector('.iframe-loading-message');
                const unavailableMsg = iframeContainer.querySelector('.iframe-unavailable-message');
                if (loadingMsg) loadingMsg.style.display = 'none';
                if (unavailableMsg) unavailableMsg.style.display = 'none';
                // If there was a src, show loading message (it will be immediately replaced by new iframe or unavailable message)
                if (iframeContainer.dataset.iframeSrc && iframeContainer.dataset.iframeSrc !== "#") {
                   if(loadingMsg) loadingMsg.style.display = 'block';
                } else {
                   // If src was '#' (unavailable), show the unavailable message
                   if(unavailableMsg) unavailableMsg.style.display = 'block';
                }
            }
        }

        // Iterate over all content sections to show/hide and manage iframes
        contentSections.forEach(section => {
            const iframeContainer = section.querySelector('.project-iframe-container');
            if (section.id === targetId) {
                section.style.display = 'block'; // Show the target section
                // Scroll content pane to top only on desktop to avoid disrupting mobile view
                if (contentPane && window.innerWidth > 768) { 
                    contentPane.scrollTop = 0;
                }
                // If the section has an iframe container, manage the iframe
                if (iframeContainer) {
                    const iframeSrc = iframeContainer.dataset.iframeSrc;
                    const loadingMessage = iframeContainer.querySelector('.iframe-loading-message');
                    const unavailableMessage = iframeContainer.querySelector('.iframe-unavailable-message');
                    const existingIframeInContainer = iframeContainer.querySelector('iframe');
                    
                    // Remove any old iframe that might still be in this container (edge case)
                    if (existingIframeInContainer) existingIframeInContainer.remove();
                    
                    // Hide messages initially
                    if (loadingMessage) loadingMessage.style.display = 'none';
                    if (unavailableMessage) unavailableMessage.style.display = 'none';

                    if (iframeSrc && iframeSrc !== "#") {
                        // If a valid iframe source exists, show loading and create new iframe
                        if (loadingMessage) loadingMessage.style.display = 'block';
                        const newIframe = document.createElement('iframe');
                        newIframe.setAttribute('frameborder', '0'); 
                        newIframe.style.width = '100%'; 
                        newIframe.style.height = '100%';
                        newIframe.onload = () => { 
                            // Hide loading message once iframe content loads
                            if (loadingMessage) loadingMessage.style.display = 'none'; 
                        };
                        newIframe.onerror = () => { 
                            // Show error message if iframe fails to load
                            if (loadingMessage) loadingMessage.style.display = 'none';
                            if (unavailableMessage) { 
                                unavailableMessage.textContent = "Preview could not be loaded. This might be due to external site restrictions."; 
                                unavailableMessage.style.display = 'block';
                            }
                        };
                        newIframe.src = iframeSrc; 
                        iframeContainer.appendChild(newIframe); 
                        activeIframe = newIframe; // Set this as the active iframe
                    } else { 
                        // If no valid iframe source, show unavailable message
                        if (unavailableMessage) unavailableMessage.style.display = 'block'; 
                    }
                }
            } else {
                section.style.display = 'none'; // Hide non-target sections
            }
        });
    }

    // Initialize sidebar link listeners for project page
    if (sidebarLinks.length > 0 && contentSections.length > 0) {
        console.log("Project page sidebar elements found. Initializing listeners."); // Debug
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) { 
                const href = this.getAttribute('href');
                // Ensure it's an internal hash link for the projects page
                if (href && href.startsWith('#') && !href.includes('.html') && window.location.pathname.includes('projects.html')) {
                    event.preventDefault(); 
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement && targetElement.classList.contains('content-section')) {
                        console.log("Sidebar link clicked, showing section:", targetId); // Debug
                        // Remove active class from all sidebar links
                        sidebarLinks.forEach(l => {
                            if (l.getAttribute('href').startsWith('#')) l.classList.remove('active');
                        });
                        this.classList.add('active'); // Add active class to clicked link
                        showContentSection(targetId); // Show the corresponding content section
                        // Update URL hash without reloading the page
                        if (history.pushState) history.pushState(null, null, `#${targetId}`);
                        else location.hash = `#${targetId}`;
                    }
                }
            });
        });

        // Function to handle initial load and hash changes for project page
        handleInitialLoadAndHashChange = function() { 
            console.log("Handling initial load or hash change for project page."); // Debug
            const hash = window.location.hash;
            let targetIdToShow = 'overview'; // Default section to show
            if (hash) {
                const potentialTargetId = hash.substring(1);
                const targetSection = document.getElementById(potentialTargetId);
                // Validate if the hash corresponds to a valid content section
                if(targetSection && targetSection.classList.contains('content-section')) {
                    targetIdToShow = potentialTargetId;
                }
            }
            showContentSection(targetIdToShow); // Show the determined section
            // Set active class on the corresponding sidebar link
            let activeLink = document.querySelector(`.sidebar-nav a[href="#${targetIdToShow}"]`);
            if (activeLink) {
                sidebarLinks.forEach(l => { if (l.getAttribute('href').startsWith('#')) l.classList.remove('active'); });
                activeLink.classList.add('active');
                // Open parent <details> tag if the active link is inside one
                let parentDetails = activeLink.closest('details');
                if (parentDetails && !parentDetails.open) parentDetails.open = true;
            }
            // Ensure the URL hash is correctly set after showing the content
            if (window.location.hash !== `#${targetIdToShow}`) {
                if (history.replaceState) history.replaceState(null, null, `#${targetIdToShow}`);
                else location.hash = `#${targetIdToShow}`;
            }
        };
        handleInitialLoadAndHashChange(); // Call on initial load
        window.addEventListener('hashchange', handleInitialLoadAndHashChange); // Listen for hash changes
    } else {
        console.warn("Project page sidebar elements NOT found. Sidebar functionality may be limited or disabled.");
    }

    // --- New: Set Active Class for Main Header Navigation ---
    function setActiveHeaderNavLink() {
        const currentPath = window.location.pathname.split('/').pop(); // Get filename
        const navLinks = document.querySelectorAll('.new-main-nav .new-nav-item');
        
        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove active from all first
            const linkHref = link.getAttribute('href');
            // Special handling for index.html as root path
            if (currentPath === '' || currentPath === 'index.html') {
                if (linkHref === 'index.html') {
                    link.classList.add('active');
                }
            } else if (linkHref.includes(currentPath)) {
                link.classList.add('active');
            }
        });
        console.log("Main header navigation active class set for:", currentPath);
    }
    setActiveHeaderNavLink(); // Call on DOMContentLoaded

    // --- Search Terminal Logic ---
    const searchBarTrigger = document.getElementById('search-bar-trigger'); 
    const searchTerminalOverlay = document.getElementById('search-terminal-overlay');
    const terminalSearchInput = document.getElementById('terminal-search-input');
    const projectsSearchResultsList = document.getElementById('projects-search-results-list');
    const projectsResultsTitle = document.getElementById('projects-results-title');
    const isProjectPage = window.location.pathname.includes('projects.html');
    let projectsData = []; 

    if (searchBarTrigger && searchTerminalOverlay && terminalSearchInput && projectsSearchResultsList && projectsResultsTitle) {
        console.log("Search terminal elements found. Initializing search."); // Debug

        // Populate projectsData by reading breadcrumbs directly from the content sections
        if (isProjectPage && document.querySelector('.sidebar-nav')) { 
            console.log("Populating search data for project page."); // Debug
            
            document.querySelectorAll('.content-section').forEach(projectSectionElement => {
                // Skip the overview section here, it's handled separately
                if (projectSectionElement.id === 'overview') return;

                const id = projectSectionElement.id; // e.g., 'project-jstudio'
                const nameElement = projectSectionElement.querySelector('h2'); // Get project title
                const breadcrumbElement = projectSectionElement.querySelector('.breadcrumb'); // Get breadcrumb element
                
                if (nameElement && breadcrumbElement) {
                    const name = nameElement.textContent.trim();
                    const breadcrumb = breadcrumbElement.textContent.trim();
                    const href = `#${id}`; // Internal link for projects

                    // Clone content to extract text for search, avoiding interference with display
                    let contentClone = projectSectionElement.cloneNode(true);
                    // Remove elements not relevant for search content text
                    contentClone.querySelectorAll('.breadcrumb, h2, figure, .project-iframe-container, p > a[target="_blank"], p > a[onclick]').forEach(el => el.remove());
                    const contentText = (contentClone.textContent || "").replace(/\s+/g, ' ').trim().toLowerCase();

                    projectsData.push({ id, name, breadcrumb, href, contentText, page: 'projects.html' });
                    console.log(`Added project to search data: ${name}, Breadcrumb: ${breadcrumb}`); // Debug log
                } else {
                    console.warn(`Could not find name or breadcrumb for content section: ${projectSectionElement.id}`);
                }
            });

            // Add overview section separately, ensuring its breadcrumb is correct
            const overviewSection = document.getElementById('overview');
            if (overviewSection) { 
                let overviewBreadcrumb = '/portfolio/overview'; // Default fallback
                const overviewBreadcrumbEl = overviewSection.querySelector('.breadcrumb');
                if (overviewBreadcrumbEl) {
                    overviewBreadcrumb = overviewBreadcrumbEl.textContent.trim();
                }
                let overviewContentClone = overviewSection.cloneNode(true);
                overviewContentClone.querySelectorAll('.breadcrumb, h2, figure, .project-iframe-container, p > a[target="_blank"], p > a[onclick]').forEach(el => el.remove());
                projectsData.unshift({ 
                    id: 'overview', 
                    name: 'Overview', 
                    breadcrumb: overviewBreadcrumb, // Use the dynamically fetched overview breadcrumb
                    href: '#overview', 
                    contentText: (overviewContentClone.textContent || "").replace(/\s+/g, ' ').trim().toLowerCase(),
                    page: 'projects.html'
                }); 
                console.log(`Added overview to search data: Overview, Breadcrumb: ${overviewBreadcrumb}`); // Debug log
            }
        } else { // Populate for non-project pages (e.g., index.html)
            console.log("Populating search data for index/other page (main navigation)."); // Debug
            projectsResultsTitle.textContent = "NAVIGATE TO"; 
            projectsData = [
                 { id: 'nav-home', name: 'HOME', breadcrumb: 'Main / Overview', href: 'index.html', contentText: 'home main overview index', page: 'index.html' },
                 { id: 'nav-projects', name: 'PROJECTS', breadcrumb: 'Portfolio / Works', href: 'projects.html', contentText: 'projects portfolio works overview list', page: 'projects.html' },
                 { id: 'nav-publications', name: 'PUBLICATIONS', breadcrumb: 'Articles / Research', href: 'publications.html', contentText: 'publications articles research papers', page: 'publications.html' },
                 { id: 'nav-dissertation', name: 'DISSERTATION', breadcrumb: 'Thesis / Academic', href: 'dissertation.html', contentText: 'dissertation thesis academic research', page: 'dissertation.html' },
            ];
        }

        function openSearchTerminal() {
            console.log("Opening search terminal."); // Debug
            searchTerminalOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling body when overlay is open
            terminalSearchInput.value = ''; // Clear input
            filterResults(''); // Show all results initially or default message
            terminalSearchInput.focus(); // Focus input for immediate typing
        }

        function closeSearchTerminal() {
            console.log("Closing search terminal."); // Debug
            searchTerminalOverlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore body scrolling
        }

        // Helper function to highlight search query within text
        function highlightText(text, query) { 
            if (!query || !text) return text || '';
            const trimmedQuery = query.trim();
            if (trimmedQuery === "") return text;
            try { 
                const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
                const regex = new RegExp(`(${escapedQuery})`, 'gi'); 
                return text.replace(regex, '<strong>$1</strong>'); 
            }
            catch (e) { 
                console.error("Error highlighting text:", e);
                return text; 
            }
        }

        // Filters and displays search results
        function filterResults(query) {
            const lowerQuery = query.toLowerCase().trim();
            projectsSearchResultsList.innerHTML = ''; // Clear previous results
            let resultsToShow = [];

            // Adjust title based on page context
            if(isProjectPage) {
                projectsResultsTitle.textContent = "PROJECTS";
            } else {
                projectsResultsTitle.textContent = "NAVIGATE TO";
            }

            // Filter results based on query
            resultsToShow = (lowerQuery === '') ? projectsData : projectsData.filter(item => 
                item.name.toLowerCase().includes(lowerQuery) || 
                (item.breadcrumb && item.breadcrumb.toLowerCase().includes(lowerQuery)) ||
                (item.contentText && item.contentText.includes(lowerQuery))
            );

            if (resultsToShow.length > 0) {
                projectsResultsTitle.style.display = 'block'; // Show category title
                resultsToShow.forEach(item => {
                    const li = document.createElement('li');
                    let contextSnippet = '';
                    let highlightedName = highlightText(item.name, lowerQuery);
                    let highlightedBreadcrumb = highlightText(item.breadcrumb, lowerQuery);

                    // Generate a context snippet if searching within project content
                    if (lowerQuery !== '' && item.contentText && item.contentText.includes(lowerQuery) && isProjectPage) {
                        const index = item.contentText.indexOf(lowerQuery);
                        const start = Math.max(0, index - 30); // Get text before query
                        const end = Math.min(item.contentText.length, index + lowerQuery.length + 30); // Get text after query
                        let snippetRaw = item.contentText.substring(start, end);
                        if (start > 0) snippetRaw = "..." + snippetRaw; // Add ellipsis if snippet isn't from start
                        if (end < item.contentText.length) snippetRaw = snippetRaw + "..."; // Add ellipsis if snippet isn't to end
                        contextSnippet = highlightText(snippetRaw, lowerQuery); // Highlight query in snippet
                    }
                    // Determine icon based on item type (project or general navigation)
                    const iconSVG = (isProjectPage || item.page === 'projects.html') ? 
                     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16"><path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/><path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/></svg>` :
                     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/></svg>`;
                    
                    // Construct list item HTML
                    li.innerHTML = `<span class="item-icon-project">${iconSVG}</span><span class="item-text"><span class="item-text-project-name">${highlightedName}</span><span class="item-text-project-breadcrumb">${highlightedBreadcrumb}</span>${contextSnippet ? `<span class="item-text-project-snippet">${contextSnippet}</span>` : ''}</span>`;
                    
                    // Add click event listener to each search result
                    li.addEventListener('click', () => {
                        console.log("Search result clicked:", item.name, "Navigating to:", item.href); // Debug
                        closeSearchTerminal(); 
                        
                        let targetUrl = item.href;
                        // Handle navigation for internal project page hash links vs. external HTML pages
                        if (item.href.startsWith('#')) {
                            const currentPageFilename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html';
                            if (item.page && item.page !== currentPageFilename) {
                                // If linking to a hash on a different page, combine page and hash
                                targetUrl = item.page + item.href;
                            }
                        }
                        console.log("Final targetUrl for navigation:", targetUrl); // Debug
                        window.location.href = targetUrl; // Navigate to the selected item
                    });
                    projectsSearchResultsList.appendChild(li);
                });
            } else {
                // Display message if no results found or input is empty
                const li = document.createElement('li');
                li.innerHTML = `<span class="item-text" style="color: #808285; padding-left: 0;">${lowerQuery !== '' ? `No results for "${query}"` : 'Start typing to search projects or site pages...'}</span>`;
                projectsSearchResultsList.appendChild(li);
                projectsResultsTitle.style.display = 'block';
            }
        }

        // Event listeners for search terminal
        searchBarTrigger.addEventListener('click', openSearchTerminal);
        searchBarTrigger.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' || e.key === ' ') { 
                e.preventDefault(); // Prevent default action (e.g., space scrolling page)
                openSearchTerminal(); 
            }
        });
        terminalSearchInput.addEventListener('input', (e) => filterResults(e.target.value));
        terminalSearchInput.addEventListener('keyup', (e) => { 
            // Refresh results if input is cleared by keypress
            if (e.target.value === '') filterResults(''); 
        });
        searchTerminalOverlay.addEventListener('click', (e) => { 
            // Close overlay if clicking outside the content area
            if (e.target === searchTerminalOverlay) closeSearchTerminal(); 
        });
        
        // Global keyboard shortcuts for search
        document.addEventListener('keydown', (e) => { 
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { 
                e.preventDefault(); // Prevent browser's default Ctrl+K behavior
                if (searchTerminalOverlay.classList.contains('hidden')) openSearchTerminal(); 
                else if (terminalSearchInput) terminalSearchInput.focus(); // If already open, just focus input
            }
            if (e.key === 'Escape' && !searchTerminalOverlay.classList.contains('hidden')) { 
                closeSearchTerminal(); // Close on Escape key
            }
        });

    } else {
        console.warn("Search terminal elements NOT fully found. Search functionality will be disabled."); // Debug
        if(!searchBarTrigger) console.warn("- Search bar trigger missing (expected ID: search-bar-trigger)");
    }

    // Homepage smooth scroll for internal anchors (only if not on project page)
    // This logic is generally for index.html, preventing it from interfering with projects.html
    if (!isProjectPage) { 
        console.log("Initializing homepage smooth scroll for anchors."); // Debug
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            // Ensure it's a valid ID selector and not just "#" or part of a full URL.
            if (href && href.startsWith('#') && href.length > 1 && !anchor.href.includes('.html') && document.getElementById(href.substring(1))) { 
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        console.log("Homepage anchor clicked, scrolling to:", targetId); // Debug
                        e.preventDefault(); // Prevent default anchor jump
                        targetElement.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
                    }
                });
            }
        });
    }

    console.log("Script initialization complete."); // Debug: Script end
});
