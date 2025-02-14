// Main array to store form sections
let sections = [];

// Initialize builder when document loads
document.addEventListener('DOMContentLoaded', initializeBuilder);

function initializeBuilder() {
    addSection(); // Add one section by default
}

function addSection() {
    const section = {
        id: Date.now(),
        title: `Section ${sections.length + 1}`,
        maxPoints: 20,
        criteria: [{
            id: Date.now() + 1,
            label: 'Criterion 1',
            description: 'Description for criterion 1',
            maxScore: 10
        }]
    };
    sections.push(section);
    renderSections();
}

function addCriterion(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.criteria.push({
            id: Date.now(),
            label: `Criterion ${section.criteria.length + 1}`,
            description: 'New criterion description',
            maxScore: 10
        });
        renderSections();
    }
}

function deleteSection(sectionId) {
    sections = sections.filter(s => s.id !== sectionId);
    renderSections();
}

function deleteCriterion(sectionId, criterionId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.criteria = section.criteria.filter(c => c.id !== criterionId);
        renderSections();
    }
}

function renderSections() {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';

    sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'builder-section';
        sectionElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <input type="text" value="${section.title}" 
                       onchange="updateSectionTitle(${section.id}, this.value)" 
                       style="width: auto;">
                <button onclick="deleteSection(${section.id})" class="delete-btn">×</button>
            </div>
            <div class="criteria-container">
                ${section.criteria.map(criterion => `
                    <div class="criteria-row">
                        <input type="text" value="${criterion.label}" 
                               onchange="updateCriterion(${section.id}, ${criterion.id}, 'label', this.value)"
                               placeholder="Criterion name">
                        <input type="text" value="${criterion.description}"
                               onchange="updateCriterion(${section.id}, ${criterion.id}, 'description', this.value)"
                               placeholder="Description">
                        <input type="number" value="${criterion.maxScore}"
                               onchange="updateCriterion(${section.id}, ${criterion.id}, 'maxScore', this.value)"
                               style="width: 60px;">
                        <button onclick="deleteCriterion(${section.id}, ${criterion.id})" 
                                class="delete-btn">×</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="addCriterion(${section.id})" class="button-outline">
                + Add Criterion
            </button>
        `;
        container.appendChild(sectionElement);
    });
}

function updateSectionTitle(sectionId, newTitle) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.title = newTitle;
    }
}

function updateCriterion(sectionId, criterionId, field, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        const criterion = section.criteria.find(c => c.id === criterionId);
        if (criterion) {
            criterion[field] = value;
        }
    }
}
// Form template for generated forms
const formTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FORM_TITLE</title>
    <link href='https://fonts.googleapis.com/css?family=IBM Plex Sans Condensed' rel='stylesheet'>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        @page {
            size: A4;
            margin: 20mm;
        }

        body {
            font-family: monospace;
            background-color: #fff;
            color: #000;
            line-height: 1.4;
            padding: 40px;
        }

        h1, h2 {
            font-family: 'IBM Plex Sans Condensed', monospace;
            text-transform: uppercase;
        }

        h1 {
            font-size: 32px;
            margin: 0;
            border-bottom: 8px solid #000;
            padding-bottom: 10px;
        }

        h2 {
            font-size: 20px;
            margin: 20px 0 10px 0;
        }

        .container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
        }

        .form-section {
            margin-bottom: 30px;
            border-left: 4px solid #000;
            padding-left: 20px;
            page-break-inside: avoid;
        }

        .criteria-row {
            display: grid;
            grid-template-columns: 2fr 6fr 1fr;
            gap: 1rem;
            align-items: start;
            margin-bottom: 1rem;
            padding: 10px 0;
            border-bottom: 1px solid #000;
            page-break-inside: avoid;
        }

        .score-box {
            width: 60px;
            height: 30px;
            border: 2px solid #000;
            display: inline-block;
        }

        .total-score {
            margin-top: 30px;
            padding: 15px;
            border: 4px solid #000;
            display: inline-block;
            font-weight: bold;
        }

        .info-section {
            margin: 20px 0;
            border-left: 4px solid #000;
            padding-left: 20px;
        }

        .info-row {
            margin: 10px 0;
        }

        .info-label {
            font-weight: bold;
            margin-right: 10px;
        }

        .info-value {
            border-bottom: 2px solid #000;
            display: inline-block;
            min-width: 200px;
            height: 25px;
        }

        .navigation-buttons {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }

        .nav-button {
            background-color: #000;
            color: #fff;
            padding: 10px 20px;
            border: none;
            font-family: monospace;
            font-weight: bold;
            cursor: pointer;
        }

        .nav-button:hover {
            background-color: #333;
        }

        @media print {
            .navigation-buttons {
                display: none;
            }

            body {
                padding: 0;
            }

            .form-section {
                page-break-inside: avoid;
            }

            .criteria-row {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="navigation-buttons">
        <button class="nav-button" onclick="window.close()">Return to Editor</button>
        <button class="nav-button" onclick="window.print()">Download</button>
    </div>
    <div class="container">
        <div class="form-header">
            <h1>FORM_TITLE</h1>
            <p>FORM_SUBTITLE</p>
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Jury Member:</span>
                <span class="info-value"></span>
            </div>
            <div class="info-row">
                <span class="info-label">Student Name:</span>
                <span class="info-value"></span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value"></span>
            </div>
        </div>

        FORM_SECTIONS

        <div class="total-score">
            Total Score: _____ / TOTAL_SCORE
        </div>
    </div>
</body>
</html>`;

function generateFormHtml(config) {
    let sectionsHtml = '';

    config.sections.forEach(section => {
        sectionsHtml += `
            <div class="form-section">
                <h2>${section.title}</h2>
                ${section.criteria.map(criterion => `
                    <div class="criteria-row">
                        <div class="criteria-label">${criterion.label}</div>
                        <div class="criteria-description">${criterion.description}</div>
                        <div class="criteria-score">
                            <div class="score-box"></div>
                            <div style="text-align: right; font-size: 0.8em; margin-top: 5px;">
                                (max: ${criterion.maxScore})
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });

    return formTemplate
        .replace(/FORM_TITLE/g, config.title)
        .replace(/FORM_SUBTITLE/g, config.subtitle)
        .replace(/TOTAL_SCORE/g, config.totalScore)
        .replace('FORM_SECTIONS', sectionsHtml);
}

function previewForm() {
    const formConfig = {
        title: document.getElementById('formTitle').value,
        subtitle: document.getElementById('formSubtitle').value,
        totalScore: document.getElementById('totalScore').value,
        sections: sections
    };

    const formHtml = generateFormHtml(formConfig);
    const win = window.open('', '_blank');
    win.document.write(formHtml);
    win.document.close();
}
