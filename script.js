document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing script...");

    // --- START: NEW MOBILE MENU & SEARCH INTEGRATION ---
    const body = document.body;
    const mobileNavTrigger = document.querySelector('.nav-trigger');
    const mobileSearchTrigger = document.querySelector('.mobile-search-trigger');
    const overlay = document.querySelector('.content-overlay');

    // Get references to existing search terminal functions
    const searchTerminalOverlay = document.getElementById('search-terminal-overlay');
    const terminalSearchInput = document.getElementById('terminal-search-input');
    
    // Check if the required elements for the search terminal exist
    const canOpenSearch = searchTerminalOverlay && terminalSearchInput;

    function openSearchTerminal() {
        if (!canOpenSearch) return;
        console.log("Opening search terminal.");
        searchTerminalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        terminalSearchInput.value = '';
        // The existing filterResults function will handle the rest
        if (typeof filterResults === 'function') {
            filterResults('');
        }
        terminalSearchInput.focus();
    }

    function closeSearchTerminal() {
        if (!canOpenSearch) return;
        console.log("Closing search terminal.");
        searchTerminalOverlay.classList.add('hidden');
        // Only restore body overflow if the mobile menu is also closed
        if (!body.classList.contains('mobile-menu-open')) {
            document.body.style.overflow = '';
        }
    }

    function openMobileNav() {
        closeSearchTerminal(); // Close search if it's open
        body.classList.add('mobile-menu-open');
        mobileNavTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeAllPopups() {
        body.classList.remove('mobile-menu-open');
        if(mobileNavTrigger) mobileNavTrigger.setAttribute('aria-expanded', 'false');
        closeSearchTerminal();
    }

    if (mobileNavTrigger && overlay) {
        mobileNavTrigger.setAttribute('aria-expanded', 'false');
        mobileNavTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            body.classList.contains('mobile-menu-open') ? closeAllPopups() : openMobileNav();
        });
    }
    
    if(mobileSearchTrigger) {
        mobileSearchTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllPopups(); // Close nav menu first
            openSearchTerminal(); // Then open search
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeAllPopups);
    }
    // --- END: NEW MOBILE MENU & SEARCH INTEGRATION ---


    // --- Sidebar Navigation & Iframe Logic (for projects.html) ---
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const contentPane = document.querySelector('.content-pane');
    let activeIframe = null;
    let handleInitialLoadAndHashChange; 

    function showContentSection(targetId) {
        if (activeIframe) {
            const iframeContainer = activeIframe.closest('.project-iframe-container');
            activeIframe.src = 'about:blank';
            try { activeIframe.remove(); } catch(e){ console.error("Error removing iframe:", e); }
            activeIframe = null;
            if (iframeContainer) {
                const loadingMsg = iframeContainer.querySelector('.iframe-loading-message');
                const unavailableMsg = iframeContainer.querySelector('.iframe-unavailable-message');
                if (loadingMsg) loadingMsg.style.display = 'none';
                if (unavailableMsg) unavailableMsg.style.display = 'none';
                if (iframeContainer.dataset.iframeSrc && iframeContainer.dataset.iframeSrc !== "#") {
                   if(loadingMsg) loadingMsg.style.display = 'block';
                } else {
                   if(unavailableMsg) unavailableMsg.style.display = 'block';
                }
            }
        }
        contentSections.forEach(section => {
            const iframeContainer = section.querySelector('.project-iframe-container');
            if (section.id === targetId) {
                section.style.display = 'block';
                if (contentPane && window.innerWidth > 768) { contentPane.scrollTop = 0; }
                if (iframeContainer) {
                    const iframeSrc = iframeContainer.dataset.iframeSrc;
                    const loadingMessage = iframeContainer.querySelector('.iframe-loading-message');
                    const unavailableMessage = iframeContainer.querySelector('.iframe-unavailable-message');
                    const existingIframeInContainer = iframeContainer.querySelector('iframe');
                    if (existingIframeInContainer) existingIframeInContainer.remove();
                    if (loadingMessage) loadingMessage.style.display = 'none';
                    if (unavailableMessage) unavailableMessage.style.display = 'none';
                    if (iframeSrc && iframeSrc !== "#") {
                        if (loadingMessage) loadingMessage.style.display = 'block';
                        const newIframe = document.createElement('iframe');
                        newIframe.setAttribute('frameborder', '0'); 
                        newIframe.style.width = '100%'; newIframe.style.height = '100%';
                        newIframe.onload = () => { if (loadingMessage) loadingMessage.style.display = 'none'; };
                        newIframe.onerror = () => { 
                            if (loadingMessage) loadingMessage.style.display = 'none';
                            if (unavailableMessage) { 
                                unavailableMessage.textContent = "Preview could not be loaded. This might be due to external site restrictions."; 
                                unavailableMessage.style.display = 'block';
                            }
                        };
                        newIframe.src = iframeSrc; iframeContainer.appendChild(newIframe); activeIframe = newIframe;
                    } else { 
                        if (unavailableMessage) unavailableMessage.style.display = 'block'; 
                    }
                }
            } else {
                section.style.display = 'none';
            }
        });
    }

    if (sidebarLinks.length > 0 && contentSections.length > 0) {
        console.log("Project page sidebar elements found. Initializing listeners.");
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) { 
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && !href.includes('.html') && window.location.pathname.includes('projects.html')) {
                    event.preventDefault(); 
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement && targetElement.classList.contains('content-section')) {
                        console.log("Sidebar link clicked, showing section:", targetId);
                        sidebarLinks.forEach(l => { if (l.getAttribute('href').startsWith('#')) l.classList.remove('active'); });
                        this.classList.add('active');
                        showContentSection(targetId);
                        if (history.pushState) history.pushState(null, null, `#${targetId}`);
                        else location.hash = `#${targetId}`;
                    }
                }
            });
        });
        handleInitialLoadAndHashChange = function() { 
            console.log("Handling initial load or hash change for project page.");
            const hash = window.location.hash;
            let targetIdToShow = 'overview';
            if (hash) {
                const potentialTargetId = hash.substring(1);
                const targetSection = document.getElementById(potentialTargetId);
                if(targetSection && targetSection.classList.contains('content-section')) {
                    targetIdToShow = potentialTargetId;
                }
            }
            showContentSection(targetIdToShow);
            let activeLink = document.querySelector(`.sidebar-nav a[href="#${targetIdToShow}"]`);
            if (activeLink) {
                sidebarLinks.forEach(l => { if (l.getAttribute('href').startsWith('#')) l.classList.remove('active'); });
                activeLink.classList.add('active');
                let parentDetails = activeLink.closest('details');
                if (parentDetails && !parentDetails.open) parentDetails.open = true;
            }
            if (window.location.hash !== `#${targetIdToShow}`) {
                if (history.replaceState) history.replaceState(null, null, `#${targetIdToShow}`);
                else location.hash = `#${targetIdToShow}`;
            }
        };
        handleInitialLoadAndHashChange();
        window.addEventListener('hashchange', handleInitialLoadAndHashChange);
    } else {
        console.warn("Project page sidebar elements NOT found. Sidebar functionality may be limited or disabled.");
    }

    function setActiveHeaderNavLink() {
        const currentPath = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.new-main-nav .new-nav-item, .popout-nav a'); // Target both desktop and mobile nav links
        
        let foundActive = false;
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            let linkPath = linkHref ? linkHref.split('/').pop() : '';

            // Handle root case
            if ((currentPath === '' || currentPath === 'index.html') && (linkPath === '' || linkPath === 'index.html')) {
                link.classList.add('active');
                foundActive = true;
            } else if (linkHref && currentPath !== '' && currentPath !== 'index.html' && linkHref.includes(currentPath)) {
                link.classList.add('active');
                foundActive = true;
            }
        });
        console.log("Main header navigation active class set for:", currentPath);
    }
    setActiveHeaderNavLink();


    // --- Search Terminal Logic (functions moved up, but listeners remain here) ---
    const searchBarTrigger = document.getElementById('search-bar-trigger'); 
    const searchResultsListGlobal = document.getElementById('projects-search-results-list'); 
    const searchResultsTitleGlobal = document.getElementById('projects-results-title');     
    
    const isProjectsPageGlobal = window.location.pathname.includes('projects.html');
    const isPublicationsPageGlobal = window.location.pathname.includes('publications.html');

    let searchableDataGlobal = [];
    let filterResults; // Declare here to be accessible globally within this scope

    if (searchBarTrigger && canOpenSearch && searchResultsListGlobal && searchResultsTitleGlobal) {
        console.log("Search terminal elements found. Initializing search.");

        // Data Population
        if (isProjectsPageGlobal && document.querySelector('.sidebar-nav')) { 
            console.log("Populating search data for PROJECTS page.");
            searchResultsTitleGlobal.textContent = "PROJECTS";
            document.querySelectorAll('.content-section').forEach(projectSectionElement => {
                if (projectSectionElement.id === 'overview') return;
                const id = projectSectionElement.id;
                const nameElement = projectSectionElement.querySelector('h2');
                const breadcrumbElement = projectSectionElement.querySelector('.breadcrumb');
                if (nameElement && breadcrumbElement) {
                    const name = nameElement.textContent.trim();
                    const breadcrumb = breadcrumbElement.textContent.trim();
                    const href = `#${id}`;
                    let contentClone = projectSectionElement.cloneNode(true);
                    contentClone.querySelectorAll('.breadcrumb, h2, figure, .project-iframe-container, p > a[target="_blank"], p > a[onclick]').forEach(el => el.remove());
                    const contentText = (contentClone.textContent || "").replace(/\s+/g, ' ').trim().toLowerCase();
                    searchableDataGlobal.push({ type: 'project', id, name, breadcrumb, href, contentText, page: 'projects.html' });
                }
            });
            const overviewSection = document.getElementById('overview');
            if (overviewSection) { 
                let overviewBreadcrumb = '/portfolio/overview';
                const overviewBreadcrumbEl = overviewSection.querySelector('.breadcrumb');
                if (overviewBreadcrumbEl) overviewBreadcrumb = overviewBreadcrumbEl.textContent.trim();
                let overviewContentClone = overviewSection.cloneNode(true);
                overviewContentClone.querySelectorAll('.breadcrumb, h2, figure, .project-iframe-container, p > a[target="_blank"], p > a[onclick]').forEach(el => el.remove());
                searchableDataGlobal.unshift({ type: 'project', id: 'overview', name: 'Overview', breadcrumb: overviewBreadcrumb, href: '#overview', contentText: (overviewContentClone.textContent || "").replace(/\s+/g, ' ').trim().toLowerCase(), page: 'projects.html' }); 
            }
        } else if (isPublicationsPageGlobal && typeof publicationsData !== 'undefined' && Array.isArray(publicationsData)) {
            console.log("Populating search data for PUBLICATIONS page.");
            searchResultsTitleGlobal.textContent = "PUBLICATIONS";
            publicationsData.forEach(pub => {
                const slug = `pub-${pub.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}`;
                searchableDataGlobal.push({ type: 'publication', id: slug, name: pub.title, breadcrumb: `${pub.authors} (${pub.year})`, href: pub.doi && pub.doi !== 'in press' ? pub.doi : `publications.html#${slug}`, target: pub.doi && pub.doi !== 'in press' ? '_blank' : '_self', contentText: `${pub.title} ${pub.authors} ${pub.abstract || ''} ${pub.keywords ? pub.keywords.join(' ') : ''}`.toLowerCase(), page: 'publications.html', data: pub });
            });
        } else { 
            console.log("Populating search data for general navigation (index/other pages).");
            searchResultsTitleGlobal.textContent = "NAVIGATE TO"; 
            searchableDataGlobal = [
                 { type: 'navigation', id: 'nav-home', name: 'HOME', breadcrumb: 'Main / Overview', href: 'index.html', contentText: 'home main overview index', page: 'index.html' },
                 { type: 'navigation', id: 'nav-projects', name: 'PROJECTS', breadcrumb: 'Portfolio / Works', href: 'projects.html', contentText: 'projects portfolio works overview list', page: 'projects.html' },
                 { type: 'navigation', id: 'nav-publications', name: 'RESEARCH', breadcrumb: 'Papers / Thesis', href: 'publications.html', contentText: 'publications articles research papers dissertation thesis academic', page: 'publications.html' },
                 { type: 'navigation', id: 'nav-contact', name: 'ABOUT & CONTACT', breadcrumb: 'Profile / Get in Touch', href: 'contact.html', contentText: 'contact get in touch email profile', page: 'contact.html' },
            ];
        }

        function highlightText(text, query) {
            if (!query || !text) return text || '';
            const trimmedQuery = query.trim();
            if (trimmedQuery === "") return text;
            try { 
                const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
                const regex = new RegExp(`(${escapedQuery})`, 'gi'); 
                return text.replace(regex, '<strong>$1</strong>'); 
            } catch (e) { console.error("Error highlighting text:", e); return text; }
        }

        filterResults = function(query) { // Assign to the previously declared variable
            const lowerQuery = query.toLowerCase().trim();
            searchResultsListGlobal.innerHTML = ''; 
            let resultsToShow = (lowerQuery === '') ? searchableDataGlobal : searchableDataGlobal.filter(item => 
                item.name.toLowerCase().includes(lowerQuery) || 
                (item.breadcrumb && item.breadcrumb.toLowerCase().includes(lowerQuery)) ||
                (item.contentText && item.contentText.includes(lowerQuery))
            );

            if (resultsToShow.length > 0) {
                searchResultsTitleGlobal.style.display = 'block';
                resultsToShow.forEach(item => {
                    const li = document.createElement('li');
                    let contextSnippet = '';
                    let highlightedName = highlightText(item.name, lowerQuery);
                    let highlightedBreadcrumb = highlightText(item.breadcrumb, lowerQuery);

                    if (lowerQuery !== '' && item.contentText && item.contentText.includes(lowerQuery) && (item.type === 'project' || item.type === 'publication')) {
                        const index = item.contentText.indexOf(lowerQuery);
                        const start = Math.max(0, index - 30);
                        const end = Math.min(item.contentText.length, index + lowerQuery.length + 30);
                        let snippetRaw = item.contentText.substring(start, end);
                        if (start > 0) snippetRaw = "..." + snippetRaw;
                        if (end < item.contentText.length) snippetRaw = snippetRaw + "...";
                        contextSnippet = highlightText(snippetRaw, lowerQuery);
                    }
                    
                    let iconSVG = '';
                    if (item.type === 'project') {
                        iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder" viewBox="0 0 16 16"><path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996.819l-.637 7A1 1 0 0 0 1.56 13h11.617a1 1 0 0 0 .996-.819l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.22 3h4.342a1 1 0 0 1 .832.445l.894.894A1 1 0 0 0 9.172 5H13.5a1 1 0 0 0 .984-.813l.001-.069c.042-.156.063-.316.073-.483H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 2.293z"/></svg>`;
                    } else if (item.type === 'publication') {
                        iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16"><path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/><path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/></svg>`;
                    } else { // Navigation
                        iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/></svg>`;
                    }
                    
                    li.innerHTML = `<span class="item-icon-project">${iconSVG}</span><span class="item-text"><span class="item-text-project-name">${highlightedName}</span><span class="item-text-project-breadcrumb">${highlightedBreadcrumb}</span>${contextSnippet ? `<span class="item-text-project-snippet">${contextSnippet}</span>` : ''}</span>`;
                    
                    li.addEventListener('click', () => {
                        closeSearchTerminal(); 
                        let targetUrl = item.href;
                        if (item.href.startsWith('#')) {
                            const currentPageFilename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html';
                            if (item.page && item.page !== currentPageFilename) {
                                targetUrl = item.page + item.href;
                            }
                        } else if (item.target === '_blank') {
                            window.open(targetUrl, '_blank');
                            return;
                        }
                        window.location.href = targetUrl;
                    });
                    searchResultsListGlobal.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.innerHTML = `<span class="item-text" style="color: #808285; padding-left: 0;">${lowerQuery !== '' ? `No results for "${query}"` : 'Start typing to search...'}</span>`;
                searchResultsListGlobal.appendChild(li);
                searchResultsTitleGlobal.style.display = 'block';
            }
        }

        // Event listeners for search terminal
        searchBarTrigger.addEventListener('click', openSearchTerminal);
        searchBarTrigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSearchTerminal(); } });
        terminalSearchInput.addEventListener('input', (e) => filterResults(e.target.value));
        terminalSearchInput.addEventListener('keyup', (e) => { if (e.target.value === '') filterResults(''); });
        searchTerminalOverlay.addEventListener('click', (e) => { if (e.target === searchTerminalOverlay) closeSearchTerminal(); });
        
        // Combined Keydown Listener for global shortcuts
        document.addEventListener('keydown', (e) => {
            // Mobile Menu & Search Close
            if (e.key === 'Escape') {
                if (body.classList.contains('mobile-menu-open')) {
                    closeAllPopups();
                } else if (!searchTerminalOverlay.classList.contains('hidden')) {
                    closeSearchTerminal();
                }
            }
            // Search Open
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { 
                e.preventDefault(); 
                if (searchTerminalOverlay.classList.contains('hidden')) {
                    openSearchTerminal();
                } else if (terminalSearchInput) {
                    terminalSearchInput.focus();
                }
            }
        });

    } else {
        console.warn("Search terminal elements NOT fully found. Search functionality will be disabled.");
        if(!searchBarTrigger) console.warn("- Search bar trigger missing (expected ID: search-bar-trigger)");
    }

    if (!isProjectsPageGlobal) { 
        console.log("Initializing homepage smooth scroll for anchors.");
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1 && !anchor.href.includes('.html') && document.getElementById(href.substring(1))) { 
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        console.log("Homepage anchor clicked, scrolling to:", targetId);
                        e.preventDefault(); 
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });
    }
    console.log("Script initialization complete.");
});