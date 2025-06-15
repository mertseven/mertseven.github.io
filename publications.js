// publications.js

// Publications Data (already provided)
const publicationsData = [
    {
        title: "Homophily studies in higher education: Bibliometric and methodological analysis of the literature",
        authors: "Seven, M., Aysel, K.",
        year: 2025,
        abstract: "A bibliometric study investigating homophily in higher education, revealing patterns in how similar individuals form relationships within university settings and their impact on educational networks.",
        doi: "https://doi.org/10.19145/e-gifder.1297604",
        keywords: ["Higher education", "Social networks", "Social learning"],
        downloadable: {
            pdf: "https://dergipark.org.tr/tr/pub/odusobiad/issue/90913/1473688",
            citation: "Seven, M., & Aysel, K. (2025). Homophily studies in higher education: Bibliometric and methodological analysis of the international literature. Ordu Üniversitesi Sosyal Bilimler Enstitüsü Sosyal Bilimler Araştırmaları Dergisi, 15(1), 426-471. https://doi.org/10.48146/odusobiad.1473688",  
        }
    },
    {
        title: "A bibliometric analysis of extended reality research trends in communication studies written in English: Mapping the increasing adoption of extended reality technologies",
        authors: "Uğurluer, S., Seven, M.",
        year: 2024,
        abstract: "This study provides a comprehensive bibliometric analysis of extended reality research in communication studies, mapping trends and revealing the increasing adoption of XR technologies across different fields.",
        doi: "https://doi.org/10.26650/CONNECTIST2024-1441592",
        keywords: ["Extended reality", "Communication studies", "Bibliometric analysis"],
        downloadable: {
            pdf: "https://cdn.istanbul.edu.tr/file/JTA6CLJ8T5/B089B5EC87554457B9176B390C068841",
            citation: "Uğurluer, S., & Seven, M. (2024). A bibliometric analysis of extended reality research trends in communication studies written in English: Mapping the increasing adoption of extended reality technologies. Connectist: İstanbul University Journal of Communication Sciences, 66, 147-181."
        }
    },
    { // This is the dissertation entry
        title: "[PhD] Information in social epistemic structures: An analysis of conversations about Syrian refugees on social networks",
        authors: "Seven, M.",
        year: 2023,
        abstract: "This research examines how individuals process and trust information about Syrian refugees on social media, focusing on the epistemology of testimony and misinformation dynamics. Through quantitative analysis of 608 respondents, the study reveals how social media environments affect information exchange and attitude formation in the context of migration communication.",
        keywords: ["Epistemology of testimony", "misinformation", "uncertainty"],
        downloadable: {
            pdf: "https://tez.yok.gov.tr/UlusalTezMerkezi/TezGoster?key=weFMBHaUra8rsS5wi2bmHMd_ouHxllM4_WqpFQ-Zq03GmP7Q5uAxL8bnudpT3nq5", // Link to full thesis
            citation: "Seven, M. (2023). Information in social epistemic structures: An analysis of conversations about Syrian refugees on social networks [Doctoral dissertation, Ege University]"
        }
    },
    {
        title: "Küresel bir hayaletin yerel gölgeleri: Türkiye'de cadılar bayramı üzerine bir analiz",
        authors: "Seven, M., Uğurluer, S., Aysel, K.",
        year: 2023,
        abstract: "An analysis of Halloween event posters in Turkish cities, examining how cultural globalization influences local celebrations and transforms traditional festivities into commercialized entertainment events.",
        doi: "https://doi.org/10.19145/e-gifder.1297604",
        keywords: ["Cultural globalization", "Localization", "Content analysis"],
        downloadable: {
            pdf: "https://dergipark.org.tr/en/download/article-file/3144777",
            citation: "Seven, M., Uğurluer, S., & Aysel, K. (2023). Küresel bir hayaletin yerel gölgeleri: Türkiye'de cadilar bayrami Üzerine bir analiz. Gümüşhane Üniversitesi İletişim Fakültesi Elektronik Dergisi, 11(2), 1430-1461. https://doi.org/10.19145/e-gifder.1297604"
        }
    },
    {
        title: "The decay of the face in co-living: The many revelations and concealings of face masks",
        authors: "Seven, M., Aysel, K.",
        year: 2021,
        abstract: "An exploration of masks as social and philosophical mediators, examining their dual nature in concealing and revealing aspects of human interaction. Drawing from Levinas' ethics of the face and contemporary social theory, this study investigates how masks function beyond their protective purposes to shape social relationships, cultural meanings, and ethical responsibilities in co-living spaces.",
        doi: "in press",
        keywords: ["Co-presence", "Ethics of face", "Artifactual communication"],
        downloadable: {
            pdf: "", 
            citation: "Seven, M., & Aysel, K. (2021). The decay of the face in co-living: The many revelations and concealings of face masks. [Journal Name, if known, or 'In Press']."
        }
    },
    {
        title: "Excluding the excluders: Cybergoth masks as physical and mental barricades",
        authors: "Aysel, K., Seven, M.",
        year: 2021,
        abstract: "An analysis of how cybergoth subculture uses medical masks as a symbolic barrier, examining both their protective and communicative functions. Through the study of fashion, subculture, and visual identity, this paper explores how cybergoths embody masks as performative agents to maintain boundaries between themselves and mainstream society, while simultaneously creating internal group cohesion.",
        doi: "in press",
        keywords: ["Cybergoths", "Subculture", "Resistance"],
        downloadable: {
            pdf: "",
            citation: "Aysel, K., & Seven, M. (2021). Excluding the excluders: Cybergoth masks as physical and mental barricades. [Journal Name, if known, or 'In Press']."
        }
    },
    {
        title: "Ergenlerde suç, madde kullanımı ve şiddetle ilişkili durumlar",
        authors: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., Onat, B.",
        year: 2017,
        doi: "", 
        keywords: ["Adolescence", "Crime", "Substance use"],
        abstract: "A study focusing on the interrelation of crime, substance use, and violence-related situations among adolescents. This research likely explores risk factors and patterns within this demographic.",
        downloadable: {
            pdf: "",
            citation: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., & Onat, B. (2017). Ergenlerde suç, madde kullanımı ve şiddetle ilişkili durumlar. [Conference/Publication Source, if known]"
        }
    },
    {
        title: "A study on characteristics of illicit drugs among adolescent drug users in prison in Izmir, Turkey",
        authors: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., Onat, B.",
        year: 2016,
        doi: "",
        keywords: ["Illicit drugs", "Adolescents", "Prison", "Turkey"],
        abstract: "This study investigates the characteristics of illicit drug use among adolescent populations within the prison system in Izmir, Turkey. It likely presented findings at the 2nd Regional TIAFT Meeting.",
        downloadable: {
            pdf: "",
            citation: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., & Onat, B. (2016). A study on characteristics of illicit drugs among adolescent drug users in prison in Izmir, Turkey. (Oral Presentation). 2nd Regional TIAFT Meeting, Turkey."
        }
    }
];

// --- Existing Publication Card and Modal Logic ---
// publications.js

// ... (publicationsData array remains the same) ...

function createPublicationCard(publication) {
    if (publication.title.startsWith("[PhD]")) {
        return null; 
    }

    const card = document.createElement('div');
    card.className = 'publication-card-new';
    const slug = publication.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    card.id = `pub-${slug}`;

    let viewPublicationButtonHtml = '';
    if (publication.doi && publication.doi.toLowerCase() !== 'in press' && publication.doi.trim() !== '') {
        viewPublicationButtonHtml = `<a href="${publication.doi}" class="btn btn-primary publication-action-link view-doi-link" target="_blank" rel="noopener noreferrer">View Publication</a>`;
    }
    
    // Always include the "Read More" button
    const readMoreButtonHtml = `<button class="btn btn-secondary publication-action-link read-more-btn">Read More</button>`;

    card.innerHTML = `
        <div class="publication-year-new">${publication.year}</div>
        <h3 class="publication-title-new">${publication.title}</h3>
        <p class="publication-authors-new">${publication.authors}</p>
        <div class="publication-abstract-new-wrapper">
            <p class="publication-abstract-new">${publication.abstract || 'Abstract not available.'}</p>
        </div>
        <div class="publication-keywords-new">
            ${(publication.keywords && publication.keywords.length > 0 && publication.keywords.some(k => k && k.trim() !== '')) ? 
                publication.keywords.map(keyword => `<span class="keyword-new">${keyword}</span>`).join('') :
                '<span class="keyword-new-none">No keywords</span>'}
        </div>
        <div class="publication-actions-new">
            ${viewPublicationButtonHtml}
            ${readMoreButtonHtml}
        </div>
    `;

    // Event listener for the entire card
    card.addEventListener('click', (e) => {
        // Check if the click originated from the actual DOI link or its descendant.
        // The .view-doi-link class is added to the <a> tag for easier targeting.
        if (e.target.closest('.view-doi-link')) {
            // If it's the DOI link, let the default browser action (opening the link) happen.
            // No need to call e.stopPropagation() here if the link itself handles navigation.
            return; 
        }

        // For any other click on the card (including the "Read More" button if its click isn't stopped),
        // or if the click was on the card itself and not a specific action button.
        showPublicationModal(publication);
    });

    // Specifically handle the "Read More" button to ensure modal opens,
    // and stop its click from bubbling to the card's listener if we want to avoid double calls (though not strictly necessary here).
    const readMoreBtnInCard = card.querySelector('.read-more-btn');
    if (readMoreBtnInCard) {
        readMoreBtnInCard.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the card's click listener from firing *again* for this same action.
            showPublicationModal(publication);
        });
    }
    
    // If there's a View Publication DOI link, ensure clicks on it don't trigger the card's modal.
    // This is more of a safeguard, as the card's main click listener already checks for this.
    const viewDoiLinkInCard = card.querySelector('.view-doi-link');
    if (viewDoiLinkInCard) {
        viewDoiLinkInCard.addEventListener('click', (e) => {
            e.stopPropagation(); // Important: Prevent card's click listener from opening modal.
        });
    }

    return card;
}

// ... (rest of your publications.js: showPublicationModal, DOMContentLoaded, PDF viewer logic, etc. remain the same) ...
// Make sure the showPublicationModal function and the DOMContentLoaded listener from your previous full publications.js file are present.
// The PDF viewer logic for the dissertation is also part of that.
function showPublicationModal(publication) {
    const modal = document.getElementById('publication-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalText = document.getElementById('modal-text');
    const modalContent = modal.querySelector('.publication-modal-content-new');

    modalTitle.textContent = publication.title;
    modalMeta.innerHTML = `
        <span class="publication-modal-year">${publication.year}</span>
        <span class="publication-modal-authors">${publication.authors}</span>
    `;

    let downloadSectionHtml = '';
    if (publication.downloadable) {
        let pdfButton = '';
        if (publication.downloadable.pdf && publication.downloadable.pdf.trim() !== '') {
            pdfButton = `<a href="${publication.downloadable.pdf}" class="btn btn-primary download-pdf-btn" target="_blank" rel="noopener noreferrer" download>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                            Download PDF
                         </a>`;
        }
        let citationBox = '';
        if (publication.downloadable.citation && publication.downloadable.citation.trim() !== '') {
            citationBox = `
                <div class="publication-modal-citation-box">
                    <h4>Citation</h4>
                    <p>${publication.downloadable.citation}</p>
                    <button class="btn btn-secondary copy-citation-btn" data-citation="${publication.downloadable.citation.trim()}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                        Copy Citation
                    </button>
                </div>`;
        }
        if (pdfButton || citationBox) {
             downloadSectionHtml = `
                <div class="publication-modal-section">
                    <h3>Access & Citation</h3>
                    <div class="publication-modal-download-actions">
                        ${pdfButton}
                    </div>
                    ${citationBox}
                </div>`;
        }
    }
    let doiLinkHtml = '';
    if (publication.doi && publication.doi.toLowerCase() !== 'in press' && publication.doi.trim() !== '') {
        doiLinkHtml = `<div class="publication-modal-section"><h3>DOI</h3><p><a href="${publication.doi}" target="_blank" rel="noopener noreferrer">${publication.doi}</a></p></div>`;
    } else if (publication.doi && publication.doi.toLowerCase() === 'in press') {
         doiLinkHtml = `<div class="publication-modal-section"><h3>Status</h3><p>This publication is currently in press.</p></div>`;
    }

    modalText.innerHTML = `
        <div class="publication-modal-section"><h3>Abstract</h3><p>${publication.abstract || 'Abstract not available.'}</p></div>
        <div class="publication-modal-section"><h3>Keywords</h3><div class="publication-keywords-new">
            ${(publication.keywords && publication.keywords.length > 0 && publication.keywords.some(k => k && k.trim() !== '')) ? 
                publication.keywords.map(keyword => `<span class="keyword-new">${keyword}</span>`).join('') :
                '<span class="keyword-new-none">No keywords provided</span>'}
        </div></div>
        ${doiLinkHtml}
        ${downloadSectionHtml}
    `;
    const copyBtn = modalText.querySelector('.copy-citation-btn');
    if (copyBtn) {
        copyBtn.onclick = (e) => { /* ... copy logic ... */ };
    }
    if (modalContent) modalContent.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
}


// --- NEW: Dissertation Accordion and PDF Viewer Logic ---
let dissertationPdfDoc = null;
let dissertationPageNum = 1;
let dissertationPageRendering = false;
let dissertationPageNumPending = null;
let dissertationScale = 1.0;
const dissertationPdfUrl = 'https://mertseven.com/Seven_VP.pdf'; // Visual Paper URL
let dissertationPdfInitialized = false;
let dissertationIsFullscreen = false;

function initializeDissertationPdfViewer() {
    if (dissertationPdfInitialized || typeof pdfjsLib === 'undefined') return;

    const canvas = document.getElementById('dissertationPdfCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const loadingElement = document.getElementById('dissertationPdfLoading');
    const fullscreenMode = document.getElementById('dissertationFullscreenMode');
    const fullscreenCanvas = document.getElementById('dissertationFullscreenCanvas');
    const fullscreenCtx = fullscreenCanvas ? fullscreenCanvas.getContext('2d') : null;

    if (!canvas || !fullscreenCanvas) {
        console.error("Dissertation PDF canvas elements not found.");
        if (loadingElement) loadingElement.innerHTML = '<p style="color:red;">Error: Canvas for dissertation PDF missing.</p>';
        return;
    }

    const prevButton = document.getElementById('dissertationPrevPage');
    const nextButton = document.getElementById('dissertationNextPage');
    const pageCounter = document.getElementById('dissertationPageNum');
    const zoomInButton = document.getElementById('dissertationZoomIn');
    const zoomOutButton = document.getElementById('dissertationZoomOut');
    const zoomResetButton = document.getElementById('dissertationZoomReset');
    const fullscreenButton = document.getElementById('dissertationFullscreenBtn');
    const thumbnailContainer = document.getElementById('dissertationThumbnailContainer');

    const exitFullscreenButton = document.getElementById('dissertationExitFullscreenBtn');
    const fullscreenPrevButton = document.getElementById('dissertationFullscreenPrev');
    const fullscreenNextButton = document.getElementById('dissertationFullscreenNext');
    const fullscreenPageCounter = document.getElementById('dissertationFullscreenPageNum');
    const fullscreenZoomInButton = document.getElementById('dissertationFullscreenZoomIn');
    const fullscreenZoomOutButton = document.getElementById('dissertationFullscreenZoomOut');
    const fullscreenZoomResetButton = document.getElementById('dissertationFullscreenZoomReset');

    function calculateOptimalScaleDissertation(page, containerWidth, containerHeight) {
        if (!page || !containerWidth || !containerHeight) return 1.0;
        const viewport = page.getViewport({ scale: 1.0 });
        let scaleToFitWidth = containerWidth / viewport.width;
        let scaleToFitHeight = containerHeight / viewport.height;
        let optimalScale = scaleToFitWidth;
        if ((viewport.height * optimalScale) > containerHeight) {
            optimalScale = scaleToFitHeight;
        }
        return Math.max(0.25, optimalScale * 0.98);
    }

    function renderDissertationPage(num, targetIsFullscreen = dissertationIsFullscreen) {
        if (!dissertationPdfDoc) return;
        dissertationPageRendering = true;
        if (loadingElement && !targetIsFullscreen) loadingElement.style.display = 'flex';

        dissertationPdfDoc.getPage(num).then(function(page) {
            const targetCanvas = targetIsFullscreen ? fullscreenCanvas : canvas;
            const targetCtx = targetIsFullscreen ? fullscreenCtx : ctx;
            const viewport = page.getViewport({ scale: dissertationScale });
            targetCanvas.height = viewport.height;
            targetCanvas.width = viewport.width;
            const renderTask = page.render({ canvasContext: targetCtx, viewport: viewport });

            renderTask.promise.then(() => {
                dissertationPageRendering = false;
                if (loadingElement && !targetIsFullscreen) loadingElement.style.display = 'none';
                if (dissertationPageNumPending !== null) {
                    renderDissertationPage(dissertationPageNumPending, targetIsFullscreen);
                    dissertationPageNumPending = null;
                }
                if (!targetIsFullscreen) updateActiveDissertationThumbnail(num);
            }).catch(err => { console.error("Error rendering dissertation page: ", err); if (loadingElement && !targetIsFullscreen) loadingElement.innerHTML = '<p style="color:red;">Error rendering page.</p>'; dissertationPageRendering = false; });
        }).catch(err => { console.error("Error getting dissertation page: ", err); if (loadingElement && !targetIsFullscreen) loadingElement.innerHTML = '<p style="color:red;">Error loading page data.</p>'; dissertationPageRendering = false; });

        pageCounter.textContent = `Page ${num} of ${dissertationPdfDoc.numPages}`;
        fullscreenPageCounter.textContent = `Page ${num} of ${dissertationPdfDoc.numPages}`;
        const isFirst = num <= 1;
        const isLast = num >= dissertationPdfDoc.numPages;
        [prevButton, fullscreenPrevButton].forEach(btn => btn.disabled = isFirst);
        [nextButton, fullscreenNextButton].forEach(btn => btn.disabled = isLast);
    }

    function queueRenderDissertationPage(num) {
        if (dissertationPageRendering) dissertationPageNumPending = num;
        else renderDissertationPage(num, dissertationIsFullscreen);
    }

    function onDissertationPrevPage() { if (dissertationPageNum <= 1) return; dissertationPageNum--; queueRenderDissertationPage(dissertationPageNum); }
    function onDissertationNextPage() { if (dissertationPageNum >= dissertationPdfDoc.numPages) return; dissertationPageNum++; queueRenderDissertationPage(dissertationPageNum); }
    
    function changeDissertationZoom(delta) {
        const newScale = Math.max(0.25, Math.min(3.0, dissertationScale + delta));
        if (newScale !== dissertationScale) { dissertationScale = newScale; queueRenderDissertationPage(dissertationPageNum); }
    }

    function resetDissertationZoomToFit() {
        if (!dissertationPdfDoc) return;
        dissertationPdfDoc.getPage(dissertationPageNum).then(function(page) {
            const container = dissertationIsFullscreen ? document.querySelector('#dissertationFullscreenMode .fullscreen-viewer-new') : document.querySelector('#dissertation-pdf-viewer-container .pdf-canvas-container-new');
            if (!container) return;
            dissertationScale = calculateOptimalScaleDissertation(page, container.clientWidth, container.clientHeight);
            renderDissertationPage(dissertationPageNum, dissertationIsFullscreen);
        });
    }

    function toggleDissertationFullscreen() {
        dissertationIsFullscreen = !dissertationIsFullscreen;
        fullscreenMode.classList.toggle('active', dissertationIsFullscreen);
        document.body.style.overflow = dissertationIsFullscreen ? 'hidden' : '';
        resetDissertationZoomToFit();
    }

    async function generateDissertationThumbnails() {
        if (!dissertationPdfDoc || !thumbnailContainer) return;
        thumbnailContainer.innerHTML = '';
        for (let i = 1; i <= dissertationPdfDoc.numPages; i++) {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'pdf-thumbnail-new';
            thumbnailDiv.dataset.pageNum = i;
            const thumbCanvas = document.createElement('canvas');
            const thumbNumSpan = document.createElement('span');
            thumbNumSpan.className = 'thumbnail-page-num-new';
            thumbNumSpan.textContent = i;
            thumbnailDiv.appendChild(thumbCanvas);
            thumbnailDiv.appendChild(thumbNumSpan);
            try {
                const page = await dissertationPdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.2 });
                thumbCanvas.width = viewport.width; thumbCanvas.height = viewport.height;
                await page.render({ canvasContext: thumbCanvas.getContext('2d'), viewport: viewport }).promise;
            } catch (err) { console.error(`Error rendering dissertation thumbnail for page ${i}:`, err); thumbnailDiv.innerHTML = `<span class="thumbnail-error">Error</span><span class="thumbnail-page-num-new">${i}</span>`; }
            thumbnailDiv.addEventListener('click', function() { dissertationPageNum = parseInt(this.dataset.pageNum); queueRenderDissertationPage(dissertationPageNum); });
            thumbnailContainer.appendChild(thumbnailDiv);
        }
        updateActiveDissertationThumbnail(dissertationPageNum);
    }

    function updateActiveDissertationThumbnail(currentNum) {
        if(!thumbnailContainer) return;
        thumbnailContainer.querySelectorAll('.pdf-thumbnail-new').forEach(thumb => thumb.classList.remove('active'));
        const activeThumbnail = thumbnailContainer.querySelector(`.pdf-thumbnail-new[data-page-num="${currentNum}"]`);
        if (activeThumbnail) { activeThumbnail.classList.add('active'); activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });}
    }

    if (loadingElement) loadingElement.style.display = 'flex';
    pdfjsLib.getDocument(dissertationPdfUrl).promise.then(pdf => {
        dissertationPdfDoc = pdf;
        dissertationPdfInitialized = true;
        if (loadingElement) loadingElement.style.display = 'none';
        pageCounter.textContent = `Page ${dissertationPageNum} of ${dissertationPdfDoc.numPages}`;
        fullscreenPageCounter.textContent = `Page ${dissertationPageNum} of ${dissertationPdfDoc.numPages}`;
        generateDissertationThumbnails().then(() => { resetDissertationZoomToFit(); });
    }).catch(error => {
        console.error('Error loading Dissertation PDF document:', error);
        if (loadingElement) loadingElement.innerHTML = `<p style="color:red; font-weight:bold;">Failed to load PDF Visual Booklet. <br>Please check the console for details.</p>`;
        dissertationPdfInitialized = true; // Mark as initialized to prevent retries on toggle
    });

    // Attach event listeners
    if(prevButton) prevButton.addEventListener('click', onDissertationPrevPage);
    if(nextButton) nextButton.addEventListener('click', onDissertationNextPage);
    if(zoomInButton) zoomInButton.addEventListener('click', () => changeDissertationZoom(0.2));
    if(zoomOutButton) zoomOutButton.addEventListener('click', () => changeDissertationZoom(-0.2));
    if(zoomResetButton) zoomResetButton.addEventListener('click', resetDissertationZoomToFit);
    if(fullscreenButton) fullscreenButton.addEventListener('click', toggleDissertationFullscreen);
    if(exitFullscreenButton) exitFullscreenButton.addEventListener('click', toggleDissertationFullscreen);
    if(fullscreenPrevButton) fullscreenPrevButton.addEventListener('click', onDissertationPrevPage);
    if(fullscreenNextButton) fullscreenNextButton.addEventListener('click', onDissertationNextPage);
    if(fullscreenZoomInButton) fullscreenZoomInButton.addEventListener('click', () => changeDissertationZoom(0.2));
    if(fullscreenZoomOutButton) fullscreenZoomOutButton.addEventListener('click', () => changeDissertationZoom(-0.2));
    if(fullscreenZoomResetButton) fullscreenZoomResetButton.addEventListener('click', resetDissertationZoomToFit);

    // Global keydown listener specific to dissertation PDF viewer when active
    // Note: This might need refinement if multiple PDF viewers are on a page or modals are open.
    // For now, it assumes context based on isFullscreen for dissertation.
    document.addEventListener('keydown', function(e) {
        const activeSearchInput = document.getElementById('terminal-search-input');
         // If search is open, or focus is in an input, or PDF not loaded, do nothing.
        if ((activeSearchInput && document.activeElement === activeSearchInput) || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || !dissertationPdfDoc) return;
        
        // Only handle PDF keys if accordion is open or fullscreen is active
        const dissertationAccordion = document.getElementById('dissertationAccordion');
        if (!(dissertationAccordion && dissertationAccordion.open) && !dissertationIsFullscreen) return;

        let handled = false;
        if (e.key === 'ArrowLeft') { onDissertationPrevPage(); handled = true; }
        else if (e.key === 'ArrowRight') { onDissertationNextPage(); handled = true; }
        else if (e.key.toLowerCase() === 'f') { toggleDissertationFullscreen(); handled = true; }
        
        if (e.key === 'Escape' && dissertationIsFullscreen) { toggleDissertationFullscreen(); handled = true; }
        
        if(handled) e.preventDefault();
    });

    let dissertationResizeTimeout;
    window.addEventListener('resize', () => {
        if (!dissertationPdfDoc || !dissertationPdfInitialized) return;
        const dissertationAccordion = document.getElementById('dissertationAccordion');
        if (!(dissertationAccordion && dissertationAccordion.open) && !dissertationIsFullscreen) return; // Only resize if visible

        clearTimeout(dissertationResizeTimeout);
        dissertationResizeTimeout = setTimeout(() => {
            resetDissertationZoomToFit();
        }, 250);
    });
}


// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Publications Grid & Modal (Existing Logic) ---
    const publicationsGrid = document.getElementById('publications-grid');
    if (publicationsGrid) {
        publicationsData.forEach(publication => {
            const card = createPublicationCard(publication);
            if (card) { // createPublicationCard might return null for dissertation
                publicationsGrid.appendChild(card);
            }
        });
    }

    const modal = document.getElementById('publication-modal');
    const closeBtn = document.querySelector('.publication-modal-close-btn-new');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
    if (modal) modal.onclick = (event) => { if (event.target === modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }};
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && modal.style.display === 'flex') { modal.style.display = 'none'; document.body.style.overflow = ''; }});


    // --- Dissertation Accordion Logic ---
    const dissertationAccordion = document.getElementById('dissertationAccordion');
    if (dissertationAccordion) {
        dissertationAccordion.addEventListener('toggle', function() {
            if (this.open) {
                // Initialize PDF viewer only when accordion is opened for the first time
                initializeDissertationPdfViewer(); 
            }
        });
    }

    // Ensure PDF.js workerSrc is set (might be redundant if already at top but safe)
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    } else {
        console.warn("PDF.js library not available at DOMContentLoaded for workerSrc setup (publications.js). Dissertation PDF viewer might have issues if not handled earlier.");
        const dissLoadingElement = document.getElementById('dissertationPdfLoading');
        if(dissLoadingElement) dissLoadingElement.innerHTML = '<p style="color: red; font-weight: bold;">Error: PDF.js library not found.</p>';
    }
});