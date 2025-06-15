// publications.js

// Make publicationsData globally accessible for script.js (search functionality)
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
    {
        title: "[PhD] Information in social epistemic structures: An analysis of conversations about Syrian refugees on social networks",
        authors: "Seven, M.",
        year: 2023,
        abstract: "This research examines how individuals process and trust information about Syrian refugees on social media, focusing on the epistemology of testimony and misinformation dynamics. Through quantitative analysis of 608 respondents, the study reveals how social media environments affect information exchange and attitude formation in the context of migration communication.",
        keywords: ["Epistemology of testimony", "misinformation", "uncertainty"],
        downloadable: {
            pdf: "https://tez.yok.gov.tr/UlusalTezMerkezi/TezGoster?key=weFMBHaUra8rsS5wi2bmHMd_ouHxllM4_WqpFQ-Zq03GmP7Q5uAxL8bnudpT3nq5",
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

function createPublicationCard(publication) {
    const card = document.createElement('div');
    card.className = 'publication-card-new';
    // Create a slug for ID, useful for direct linking if implemented later
    const slug = publication.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    card.id = `pub-${slug}`;


    let actionButtonHtml = '';
    // Primary action: View Publication (DOI) or View Details (Modal)
    if (publication.doi && publication.doi.toLowerCase() !== 'in press' && publication.doi.trim() !== '') {
        actionButtonHtml += `<a href="${publication.doi}" class="btn btn-primary publication-action-link" target="_blank" rel="noopener noreferrer">View Publication</a>`;
    } else {
        // If no DOI or "in press", this button will open the modal via card click logic.
        // We can make it explicit or rely on the general "Read More" / card click.
        // For clarity, let's keep it simple: "Read More" will always open modal.
    }
    // Secondary action: Read More (always opens modal)
    actionButtonHtml += `<button class="btn btn-secondary publication-action-link read-more-btn">Read More</button>`;


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
            ${actionButtonHtml}
        </div>
    `;

    card.addEventListener('click', (e) => {
        // If "View Publication" (actual link) was clicked, let it proceed.
        if (e.target.closest('a.publication-action-link[target="_blank"]')) {
            e.stopPropagation(); // Stop card click if external link was clicked
            return;
        }
        // For "Read More" button or general card click, open the modal.
        showPublicationModal(publication);
    });
    
    // Stop propagation for any button to prevent double modal open if card also opens modal.
    card.querySelectorAll('.publication-action-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!e.target.closest('a[target="_blank"]')) { // If it's not the external DOI link
                e.stopPropagation(); // Stop click from bubbling to the card for internal actions
            }
        });
    });

    return card;
}

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
        doiLinkHtml = `<div class="publication-modal-section">
                        <h3>DOI</h3>
                        <p><a href="${publication.doi}" target="_blank" rel="noopener noreferrer">${publication.doi}</a></p>
                       </div>`;
    } else if (publication.doi && publication.doi.toLowerCase() === 'in press') {
         doiLinkHtml = `<div class="publication-modal-section">
                        <h3>Status</h3>
                        <p>This publication is currently in press.</p>
                       </div>`;
    }


    modalText.innerHTML = `
        <div class="publication-modal-section">
            <h3>Abstract</h3>
            <p>${publication.abstract || 'Abstract not available.'}</p>
        </div>
        
        <div class="publication-modal-section">
            <h3>Keywords</h3>
            <div class="publication-keywords-new">
                ${(publication.keywords && publication.keywords.length > 0 && publication.keywords.some(k => k && k.trim() !== '')) ? 
                    publication.keywords.map(keyword => `<span class="keyword-new">${keyword}</span>`).join('') :
                    '<span class="keyword-new-none">No keywords provided</span>'}
            </div>
        </div>
        ${doiLinkHtml}
        ${downloadSectionHtml}
    `;

    const copyBtn = modalText.querySelector('.copy-citation-btn');
    if (copyBtn) {
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(copyBtn.dataset.citation).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>Copied!`;
                copyBtn.disabled = true;
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy citation: ', err);
                alert('Failed to copy citation. Please try again or copy manually.');
            });
        };
    }
    
    // Reset scroll position of modal content
    if (modalContent) {
        modalContent.scrollTop = 0;
    }

    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const publicationsGrid = document.getElementById('publications-grid');
    if (publicationsGrid) {
        publicationsData.forEach(publication => {
            const card = createPublicationCard(publication);
            publicationsGrid.appendChild(card);
        });
    }

    const modal = document.getElementById('publication-modal');
    const closeBtn = document.querySelector('.publication-modal-close-btn-new');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
    }

    if (modal) {
        modal.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});
