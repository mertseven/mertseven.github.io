// Sample publications data
const publicationsData = [
    {
        title: "Homophily studies in higher education: Bibliometric and methodological analysis of the literature",
        authors: "Seven, M., Aysel, K.",
        year: 2025,
        abstract: "A bibliometric study investigating homophily in higher education, revealing patterns in how similar individuals form relationships within university settings and their impact on educational networks.",
        doi: "https://doi.org/10.19145/e-gifder.1297604",
        keywords: ["Higher education", "Social networks", "Social learning"],
        downloadable: {
            pdf: "https://dergipark.org.tr/en/download/article-file/3144777",
            citation: "Seven, M., Uğurluer, S., & Aysel, K. (2023). Küresel bir hayaletin yerel gölgeleri: Türkiye'de cadilar bayrami Üzerine bir analiz. Gümüşhane Üniversitesi İletişim Fakültesi Elektronik Dergisi, 11(2), 1430-1461. https://doi.org/10.19145/e-gifder.1297604"
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
            citation: "in press"
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
            citation: "in press"
        }
    },
    {
        title: "Ergenlerde suç, madde kullanımı ve şiddetle ilişkili durumlar",
        authors: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., Onat, B.",
        year: 2017,
        doi: "",
        keywords: [""],
        downloadable: {
            pdf: "",
            citation: "Yüncü, Z., Havaçeliği Atlam, D., Seven, M., Onat, B. (2016). A Study on Characteristics of Illicit Drugs Among Adolescent Drug Users in Prison in Izmir, Turkey. 2.Regional TIAFT Meeting in Turkey (Oral Presentation)"
        }
    },
    {
        title: "A study on characteristics of illicit drugs among adolescent drug users in prison in Izmir, Turkey",
        authors: "Havaçeliği Atlam, D., Yüncü, Z., Seven, M., Onat, B.",
        year: 2016,
        keywords: [""],
        downloadable: {
            citation: "Yüncü, Z., Havaçeliği Atlam, D., Seven, M., Onat, B. (2016). A Study on Characteristics of Illicit Drugs Among Adolescent Drug Users in Prison in Izmir, Turkey. 2.Regional TIAFT Meeting in Turkey (Oral Presentation)"
        }
    },
    
];

// Function to create a publication card
function createPublicationCard(publication) {
    const card = document.createElement('div');
    card.className = 'publication-card';

    card.innerHTML = `
        <div class="publication-year">${publication.year}</div>
        <h3 class="publication-title">${publication.title}</h3>
        <p class="publication-authors">${publication.authors}</p>
        <p class="publication-abstract">${publication.abstract}</p>
        <div class="publication-keywords">
            ${publication.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
        </div>
        <div class="publication-actions">
            ${publication.doi ? 
                `<a href="${publication.doi}" class="publication-link" target="_blank" rel="noopener noreferrer">View Publication</a>` : 
                `<button class="publication-link view-details">View Details</button>`
            }
        </div>
    `;

    // Make entire card clickable
    card.addEventListener('click', () => showPublicationModal(publication));

    return card;
}

function showPublicationModal(publication) {
    const modal = document.getElementById('publication-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalText = document.getElementById('modal-text');

    modalTitle.textContent = publication.title;
    modalMeta.innerHTML = `
        <span class="modal-year">${publication.year}</span>
        <span class="modal-authors">${publication.authors}</span>
    `;

    modalText.innerHTML = `
        <div class="modal-section">
            <h3>Abstract</h3>
            <p>${publication.abstract}</p>
        </div>
        
        <div class="modal-section">
            <h3>Keywords</h3>
            <div class="publication-keywords">
                ${publication.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
            </div>
        </div>
        
        ${publication.downloadable ? `
            <div class="download-section">
                <h3>Download</h3>
                ${publication.downloadable.pdf ? `
                    <a href="${publication.downloadable.pdf}" class="download-btn" download>
                        <span class="download-icon">↓</span> Download PDF
                    </a>
                ` : ''}
                ${publication.downloadable.citation ? `
                    <div class="citation-box">
                        <h4>Citation</h4>
                        <p>${publication.downloadable.citation}</p>
                        <button class="copy-citation" data-citation="${publication.downloadable.citation}">
                            Copy Citation
                        </button>
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `;

    // Add event listener for citation copy
    const copyBtn = modalText.querySelector('.copy-citation');
    if (copyBtn) {
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(copyBtn.dataset.citation);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Citation';
            }, 2000);
        };
    }

    modal.style.display = 'block';
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const publicationsGrid = document.querySelector('.publications-grid');
    
    publicationsData.forEach(publication => {
        const card = createPublicationCard(publication);
        publicationsGrid.appendChild(card);
    });

    // Modal close functionality
    const modal = document.getElementById('publication-modal');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

// Extend terminal commands for publications
if (typeof TerminalEmulator !== 'undefined') {
    TerminalEmulator.prototype.commands.publications = function() {
        this.addToTerminal('Available publications:');
        publicationsData.forEach(pub => {
            this.addToTerminal(`- ${pub.year}: ${pub.title}`);
        });
    };
}