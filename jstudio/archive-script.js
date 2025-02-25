document.addEventListener('DOMContentLoaded', () => {
    initializeArchiveControls();
});

function initializeArchiveControls() {
    const gridViewButton = document.querySelector('.grid-view');
    const listViewButton = document.querySelector('.list-view');
    const archiveContent = document.querySelector('.archive-content');

    if (gridViewButton && listViewButton) {
        gridViewButton.addEventListener('click', () => {
            archiveContent.classList.remove('list-view-active');
            archiveContent.classList.add('grid-view-active');
            gridViewButton.classList.add('active');
            listViewButton.classList.remove('active');
        });

        listViewButton.addEventListener('click', () => {
            archiveContent.classList.remove('grid-view-active');
            archiveContent.classList.add('list-view-active');
            listViewButton.classList.add('active');
            gridViewButton.classList.remove('active');
        });
    }

    // Initialize filters
    const yearFilter = document.querySelector('.year-filter');
    const categoryFilter = document.querySelector('.category-filter');

    if (yearFilter) {
        yearFilter.addEventListener('change', filterArticles);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterArticles);
    }
}

function filterArticles() {
    // Add filtering logic here when needed
    console.log('Filtering articles...');
}