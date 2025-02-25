// create-article.js
document.addEventListener('DOMContentLoaded', () => {
    initializeContentBlocks();
    initializePreview();
    initializeFormSubmission();
});

function initializeContentBlocks() {
    const toolbar = document.querySelector('.content-toolbar');
    const blocksContainer = document.getElementById('contentBlocks');

    toolbar.addEventListener('click', (e) => {
        if (e.target.matches('[data-block]')) {
            const blockType = e.target.dataset.block;
            addContentBlock(blockType, blocksContainer);
        }
    });

    // Handle block controls (move up/down, delete)
    blocksContainer.addEventListener('click', (e) => {
        if (e.target.matches('.move-up')) {
            moveBlock(e.target.closest('.content-block'), 'up');
        } else if (e.target.matches('.move-down')) {
            moveBlock(e.target.closest('.content-block'), 'down');
        } else if (e.target.matches('.delete-block')) {
            e.target.closest('.content-block').remove();
            updatePreview();
        }
    });

    // Handle content changes
    blocksContainer.addEventListener('input', updatePreview);
}

function addContentBlock(type, container) {
    const block = document.createElement('div');
    block.className = 'content-block';
    block.dataset.type = type;

    const controls = `
        <div class="block-controls">
            <button type="button" class="move-up">↑</button>
            <button type="button" class="move-down">↓</button>
            <button type="button" class="delete-block">×</button>
        </div>
    `;

    let content = '';
    switch (type) {
        case 'paragraph':
            content = `<textarea class="block-content" placeholder="Enter paragraph text"></textarea>`;
            break;
        case 'image':
            content = `
                <input type="text" class="block-content" placeholder="Image URL">
                <input type="text" class="block-caption" placeholder="Image caption (optional)">
            `;
            break;
        case 'video':
            content = `
                <input type="text" class="block-content" placeholder="Video URL">
                <input type="text" class="block-caption" placeholder="Video caption (optional)">
            `;
            break;
        case 'iframe':
            content = `
                <input type="text" class="block-content" placeholder="Iframe embed code">
                <input type="text" class="block-caption" placeholder="Caption (optional)">
            `;
            break;
        case 'quote':
            content = `
                <textarea class="block-content" placeholder="Enter quote text"></textarea>
                <input type="text" class="block-citation" placeholder="Citation">
            `;
            break;
        case 'subheading':
            content = `<input type="text" class="block-content" placeholder="Enter subheading">`;
            break;
    }

    block.innerHTML = controls + content;
    container.appendChild(block);
    updatePreview();
}

function moveBlock(block, direction) {
    const sibling = direction === 'up' ? block.previousElementSibling : block.nextElementSibling;
    if (sibling) {
        const container = block.parentNode;
        if (direction === 'up') {
            container.insertBefore(block, sibling);
        } else {
            container.insertBefore(sibling, block);
        }
        updatePreview();
    }
}

function initializePreview() {
    const previewButton = document.getElementById('previewButton');
    const previewPane = document.getElementById('previewPane');
    
    previewButton.addEventListener('click', () => {
        previewPane.classList.toggle('visible');
        updatePreview();
    });
}

function updatePreview() {
    const previewContainer = document.querySelector('.preview-container');
    const articleInfo = collectFormData();
    previewContainer.innerHTML = generateArticlePreview(articleInfo);
}

function generateArticlePreview(info) {
    // Generate HTML similar to generateArticleHtml but for preview
    // Include content blocks
    const blocks = Array.from(document.querySelectorAll('.content-block')).map(block => {
        const type = block.dataset.type;
        const content = block.querySelector('.block-content').value;
        
        switch (type) {
            case 'paragraph':
                return `<p>${content}</p>`;
            case 'image':
                const imgCaption = block.querySelector('.block-caption').value;
                return `
                    <figure class="article-figure">
                        <img src="${content}" alt="${imgCaption}" class="article-image">
                        ${imgCaption ? `<figcaption class="media-caption">${imgCaption}</figcaption>` : ''}
                    </figure>
                `;
            // Add other block type handlers
        }
    }).join('\n');

    return `
        <article class="news-article">
            <header class="article-header">
                <!-- Header content -->
            </header>
            <div class="article-content">
                ${blocks}
            </div>
        </article>
    `;
}

// Previous form submission and HTML generation code remains

function collectFormData() {
    const formData = new FormData(document.getElementById('articleForm'));
    const date = new Date();
    
    return {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        authorName: formData.get('authorName'),
        authorRole: formData.get('authorRole'),
        isoDate: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        leadParagraph: formData.get('leadParagraph'),
        tags: formData.get('tags').split(',').map(tag => tag.trim())
    };
}

function generateArticleHtml(info) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${info.title} - Journalism Studio News</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="../article-styles.css">
</head>
<body>
    <div class="page-wrapper">
        <!-- Header content -->
        <div class="container">
            <main class="article-main">
                <article class="news-article">
                    <header class="article-header">
                        <div class="article-meta">
                            <span class="article-category">${info.category}</span>
                            <time datetime="${info.isoDate}">${info.formattedDate}</time>
                        </div>
                        <h1 class="article-title">${info.title}</h1>
                        <div class="article-subheader">
                            <p class="article-description">${info.description}</p>
                            <div class="author-info">
                                <img src="/api/placeholder/50/50" alt="" class="author-image">
                                <div class="author-details">
                                    <span class="author-name">${info.authorName}</span>
                                    <span class="author-role">${info.authorRole}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div class="article-content">
                        <p class="article-lead">${info.leadParagraph}</p>
                        <!-- Add more content here -->
                    </div>

                    <footer class="article-footer">
                        <div class="tags">
                            ${info.tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                            ')}
                        </div>
                        <div class="share-buttons">
                            <button class="share-button">Share</button>
                            <button class="save-button">Save</button>
                        </div>
                    </footer>
                </article>
            </main>
        </div>
    </div>
    <script src="../article-script.js"></script>
</body>
</html>`;
}