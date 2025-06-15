// dissertation.js
document.addEventListener('DOMContentLoaded', () => {
    if (typeof pdfjsLib === 'undefined') {
        console.error("PDF.js library is not loaded. PDF Viewer will not work.");
        const loadingElement = document.getElementById('pdfLoading');
        if (loadingElement) {
            loadingElement.innerHTML = '<p style="color: red; font-weight: bold;">Error: PDF Viewer library (PDF.js) failed to load. Please check your internet connection or contact support if the issue persists.</p>';
        }
        const pdfContainer = document.querySelector('.pdf-container-new');
        if(pdfContainer) {
            const controls = pdfContainer.querySelector('.pdf-controls-new');
            if(controls) controls.style.display = 'none';
            const thumbnails = pdfContainer.querySelector('.pdf-thumbnails-new');
            if(thumbnails) thumbnails.style.display = 'none';
            const viewer = pdfContainer.querySelector('.pdf-viewer-new');
            if(viewer && !loadingElement) { // If loading element itself failed
                 viewer.innerHTML = '<p style="color: red; font-weight: bold; text-align:center; padding: 20px;">PDF Viewer cannot be initialized.</p>';
            } else if (viewer && loadingElement) {
                viewer.style.alignItems = 'center'; // Center the error message
                viewer.style.justifyContent = 'center';
            }
        }
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.0;
    const pdfUrl = 'https://mertseven.com/Seven_VP.pdf'; // Ensure this URL is correct

    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const loadingElement = document.getElementById('pdfLoading');

    const fullscreenMode = document.getElementById('fullscreenMode');
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    const fullscreenCtx = fullscreenCanvas ? fullscreenCanvas.getContext('2d') : null;
    let isFullscreen = false;

    // Main controls
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageCounter = document.getElementById('pageNum');
    const zoomInButton = document.getElementById('zoomIn');
    const zoomOutButton = document.getElementById('zoomOut');
    const zoomResetButton = document.getElementById('zoomReset');
    const fullscreenButton = document.getElementById('fullscreenBtn');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const pdfViewerElement = document.querySelector('.pdf-viewer-new');

    // Fullscreen controls
    const exitFullscreenButton = document.getElementById('exitFullscreenBtn');
    const fullscreenPrevButton = document.getElementById('fullscreenPrev');
    const fullscreenNextButton = document.getElementById('fullscreenNext');
    const fullscreenPageCounter = document.getElementById('fullscreenPageNum');
    const fullscreenZoomInButton = document.getElementById('fullscreenZoomIn');
    const fullscreenZoomOutButton = document.getElementById('fullscreenZoomOut');
    const fullscreenZoomResetButton = document.getElementById('fullscreenZoomReset');

    if (!canvas || !fullscreenCanvas) {
        console.error("One or both canvas elements not found. PDF viewer cannot initialize.");
        if (loadingElement) loadingElement.innerHTML = '<p style="color:red;">Error: Canvas element for PDF rendering is missing.</p>';
        return;
    }


    function calculateOptimalScale(page, containerWidth, containerHeight) {
        if (!page || !containerWidth || !containerHeight) return 1.0;
        const viewport = page.getViewport({ scale: 1.0 });
        // Calculate scale to fit width, ensuring it's not excessively small if height is very constraining
        let scaleToFitWidth = containerWidth / viewport.width;
        // Calculate scale to fit height
        let scaleToFitHeight = containerHeight / viewport.height;
        
        // Prioritize fitting width, but don't exceed container height
        // This logic can be adjusted based on desired "fit" behavior
        let optimalScale = scaleToFitWidth;
        if ((viewport.height * optimalScale) > containerHeight) {
            optimalScale = scaleToFitHeight;
        }
        return Math.max(0.25, optimalScale * 0.98); // Ensure some padding and min scale
    }
            
    function renderPage(num, targetIsFullscreen = isFullscreen) {
        if (!pdfDoc) return;
        pageRendering = true;
        if (loadingElement && !targetIsFullscreen) loadingElement.style.display = 'flex';

        pdfDoc.getPage(num).then(function(page) {
            const targetCanvas = targetIsFullscreen ? fullscreenCanvas : canvas;
            const targetCtx = targetIsFullscreen ? fullscreenCtx : ctx;
            
            const viewport = page.getViewport({ scale: scale });
            targetCanvas.height = viewport.height;
            targetCanvas.width = viewport.width;

            const renderContext = { canvasContext: targetCtx, viewport: viewport };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
                pageRendering = false;
                if (loadingElement && !targetIsFullscreen) loadingElement.style.display = 'none';
                if (pageNumPending !== null) {
                    renderPage(pageNumPending, targetIsFullscreen);
                    pageNumPending = null;
                }
                if (!targetIsFullscreen) updateActiveThumbnail(num);
            }).catch(err => {
                console.error("Error rendering page: ", err);
                if (loadingElement && !targetIsFullscreen) loadingElement.innerHTML = '<p style="color:red;">Error rendering page.</p>';
                pageRendering = false;
            });
        }).catch(err => {
             console.error("Error getting page: ", err);
             if (loadingElement && !targetIsFullscreen) loadingElement.innerHTML = '<p style="color:red;">Error loading page data.</p>';
             pageRendering = false;
        });

        pageCounter.textContent = `Page ${num} of ${pdfDoc.numPages}`;
        fullscreenPageCounter.textContent = `Page ${num} of ${pdfDoc.numPages}`;
        
        const isFirst = num <= 1;
        const isLast = num >= pdfDoc.numPages;

        [prevButton, fullscreenPrevButton].forEach(btn => btn.disabled = isFirst);
        [nextButton, fullscreenNextButton].forEach(btn => btn.disabled = isLast);
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num, isFullscreen);
        }
    }
    
    function onPrevPage() { if (pageNum <= 1) return; pageNum--; queueRenderPage(pageNum); }
    function onNextPage() { if (pageNum >= pdfDoc.numPages) return; pageNum++; queueRenderPage(pageNum); }
    
    function changeZoom(delta) {
        const newScale = Math.max(0.25, Math.min(3.0, scale + delta));
        if (newScale !== scale) { scale = newScale; queueRenderPage(pageNum); }
    }

    function resetZoomToFit() {
         if (!pdfDoc) return;
         pdfDoc.getPage(pageNum).then(function(page) {
            const container = isFullscreen ? document.querySelector('.fullscreen-viewer-new') : document.querySelector('.pdf-canvas-container-new'); // Use the scrolling container
            if (!container) return;
            scale = calculateOptimalScale(page, container.clientWidth, container.clientHeight);
            renderPage(pageNum, isFullscreen); // Pass current fullscreen state
        });
    }

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        fullscreenMode.classList.toggle('active', isFullscreen);
        document.body.style.overflow = isFullscreen ? 'hidden' : '';
        
        // Ensure scale is recalculated and page re-rendered for the new view mode
        resetZoomToFit(); 
    }
            
    async function generateThumbnails() {
        if (!pdfDoc || !thumbnailContainer) return;
        thumbnailContainer.innerHTML = ''; 

        for (let i = 1; i <= pdfDoc.numPages; i++) {
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
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.2 }); // Slightly larger thumbnails
                thumbCanvas.width = viewport.width;
                thumbCanvas.height = viewport.height;
                await page.render({ canvasContext: thumbCanvas.getContext('2d'), viewport: viewport }).promise;
            } catch (err) {
                console.error(`Error rendering thumbnail for page ${i}:`, err);
                thumbCanvas.parentElement.innerHTML = `<span class="thumbnail-error">Error</span><span class="thumbnail-page-num-new">${i}</span>`;
            }
            
            thumbnailDiv.addEventListener('click', function() {
                pageNum = parseInt(this.dataset.pageNum);
                queueRenderPage(pageNum);
            });
            thumbnailContainer.appendChild(thumbnailDiv);
        }
        updateActiveThumbnail(pageNum);
    }

    function updateActiveThumbnail(currentNum) {
        if(!thumbnailContainer) return;
        const thumbnails = thumbnailContainer.querySelectorAll('.pdf-thumbnail-new');
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        const activeThumbnail = thumbnailContainer.querySelector(`.pdf-thumbnail-new[data-page-num="${currentNum}"]`);
        if (activeThumbnail) {
            activeThumbnail.classList.add('active');
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    if (pdfViewerElement) {
        pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
            pdfDoc = pdf;
            pageCounter.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
            fullscreenPageCounter.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
            generateThumbnails().then(() => {
                 resetZoomToFit(); 
            });
        }).catch(error => {
            console.error('Error loading PDF document:', error);
            if (loadingElement) loadingElement.innerHTML = `<p style="color:red; font-weight:bold;">Failed to load PDF: ${error.message}. <br>Please ensure the file exists at <a href="${pdfUrl}" target="_blank" rel="noopener">${pdfUrl}</a> and is accessible (CORS might be an issue if on a different domain).</p>`;
        });
    }

    // Event Listeners
    if(prevButton) prevButton.addEventListener('click', onPrevPage);
    if(nextButton) nextButton.addEventListener('click', onNextPage);
    if(zoomInButton) zoomInButton.addEventListener('click', () => changeZoom(0.2));
    if(zoomOutButton) zoomOutButton.addEventListener('click', () => changeZoom(-0.2));
    if(zoomResetButton) zoomResetButton.addEventListener('click', resetZoomToFit);
    if(fullscreenButton) fullscreenButton.addEventListener('click', toggleFullscreen);
    if(exitFullscreenButton) exitFullscreenButton.addEventListener('click', toggleFullscreen);
    
    if(fullscreenPrevButton) fullscreenPrevButton.addEventListener('click', onPrevPage);
    if(fullscreenNextButton) fullscreenNextButton.addEventListener('click', onNextPage);
    if(fullscreenZoomInButton) fullscreenZoomInButton.addEventListener('click', () => changeZoom(0.2));
    if(fullscreenZoomOutButton) fullscreenZoomOutButton.addEventListener('click', () => changeZoom(-0.2));
    if(fullscreenZoomResetButton) fullscreenZoomResetButton.addEventListener('click', resetZoomToFit);

    document.addEventListener('keydown', function(e) {
        const activeSearchInput = document.getElementById('terminal-search-input');
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || (activeSearchInput && e.target === activeSearchInput) || !pdfDoc) return;
        
        let handled = false;
        if (e.key === 'ArrowLeft') { onPrevPage(); handled = true; }
        else if (e.key === 'ArrowRight') { onNextPage(); handled = true; }
        else if (e.key.toLowerCase() === 'f') { toggleFullscreen(); handled = true; }
        
        if (e.key === 'Escape' && isFullscreen) { toggleFullscreen(); handled = true; }
        
        if(handled) e.preventDefault();
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (!pdfDoc) return;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => { // Debounce resize event
            resetZoomToFit();
        }, 250);
    });
});
