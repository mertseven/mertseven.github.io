document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (sidebar && sidebarToggle) {
        const updateToggleAppearance = () => {
            if (sidebar.classList.contains('expanded')) {
                sidebarToggle.textContent = '✕';
                sidebarToggle.style.backgroundColor = '#c0392b';
            } else {
                sidebarToggle.textContent = '☰';
                sidebarToggle.style.backgroundColor = '#3498db';
            }
        };
        updateToggleAppearance();
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            updateToggleAppearance();
        });
    }

    // Main UI elements
    const searchInput = document.getElementById('searchInput');
    const colorPicker = document.getElementById('courseColor');
    const tagInput = document.getElementById('courseTagsInput');
    const addTagButton = document.getElementById('addTagButton');
    const editCourseButton = document.getElementById('editCourseButton');
    const compareButton = document.getElementById('compareButton');
    const comparisonCountSpan = document.getElementById('comparisonCount');
    
    const newCourseCodeInput = document.getElementById('newCourseCode');
    const newCourseNameInput = document.getElementById('newCourseName');
    const newCourseEctsInput = document.getElementById('newCourseEcts');
    const newCourseHoursInput = document.getElementById('newCourseHours');
    const newCourseLecturerInput = document.getElementById('newCourseLecturer');
    const newCourseSyllabusInput = document.getElementById('newCourseSyllabus');
    const addNewCourseButton = document.getElementById('addNewCourseButton');

    const editCourseModal = document.getElementById('edit-course-modal');
    const closeEditModalButton = document.getElementById('closeEditModal');
    const editCourseIdInput = document.getElementById('editCourseId');
    const editCourseCodeModalInput = document.getElementById('editCourseCodeModal');
    const editCourseNameModalInput = document.getElementById('editCourseNameModal');
    const editCourseEctsModalInput = document.getElementById('editCourseEctsModal');
    const editCourseHoursModalInput = document.getElementById('editCourseHoursModal');
    const editCourseLecturerModalInput = document.getElementById('editCourseLecturerModal');
    const editCourseSyllabusModalInput = document.getElementById('editCourseSyllabusModal');
    const saveCourseChangesButton = document.getElementById('saveCourseChangesButton');

    const syllabusModal = document.getElementById('syllabus-modal');
    const closeCompareModalButton = document.getElementById('closeCompareModal');
    const syllabusComparisonArea = document.getElementById('syllabus-comparison-area');

    const workloadModal = document.getElementById('workload-modal');
    const closeWorkloadModalButton = document.getElementById('closeWorkloadModal');
    const workloadTableContainer = document.getElementById('workload-table-container');
    const viewWorkloadButton = document.getElementById('viewWorkloadButton');

    const exportWorkloadCsvButton = document.getElementById('exportWorkloadCsvButton');
    const exportCurriculumTsvButton = document.getElementById('exportCurriculumTsvButton');

    const newTagCategoryPromptDiv = document.getElementById('newTagCategoryPrompt');
    const newTagNameDisplaySpan = document.getElementById('newTagNameDisplay');
    const newTagCategorySelect = document.getElementById('newTagCategorySelect');
    const confirmNewTagCategoryButton = document.getElementById('confirmNewTagCategoryButton');
    const cancelNewTagCategoryButton = document.getElementById('cancelNewTagCategoryButton');

    const importTagsButton = document.getElementById('importTagsButton');
    const importTagsModal = document.getElementById('import-tags-modal');
    const closeImportTagsModalButton = document.getElementById('closeImportTagsModal');
    const tagImportFileInput = document.getElementById('tagImportFileInput');
    const tagImportTextarea = document.getElementById('tagImportTextarea');
    const processTagImportButton = document.getElementById('processTagImportButton');
    const importTagsStatusDiv = document.getElementById('importTagsStatus');

    // D3 Tag Network Graph Elements
    const viewTagNetworkButton = document.getElementById('viewTagNetworkButton');
    let d3Simulation, d3Svg, d3NodeElements, d3LinkElements;
    const d3TagNetworkModal = document.getElementById('tag-network-modal');
    const d3CloseTagNetworkModalButton = document.getElementById('closeTagNetworkModalD3');
    const calculateMetricsButton = document.getElementById('calculateMetricsButton'); 
    const calculatingMetricsMessage = document.getElementById('calculating-metrics-message');

    const d3SearchInput = document.getElementById('d3-search-input');
    const d3SearchButton = document.getElementById('d3-search-button');
    const d3ControlParametersCollapsible = document.querySelector('.d3-control-parameters.collapsible'); // For main D3 controls
    const d3TagLinkParametersCollapsible = document.querySelector('.d3-tag-link-parameters.collapsible'); // For new tag link controls

    const d3ToggleTagLinksCheckbox = document.getElementById('d3-toggle-tag-links');
    const d3MinCooccurrenceInput = document.getElementById('d3-min-cooccurrence');
    const d3TagLinksControlContent = document.getElementById('d3-tag-links-control-content');


    if(d3ControlParametersCollapsible) {
        const d3ParameterToggleButton = d3ControlParametersCollapsible.querySelector('.d3-toggle-button');
        if (d3ParameterToggleButton) {
            d3ControlParametersCollapsible.querySelector('.d3-control-header').addEventListener('click', () => {
                d3ControlParametersCollapsible.classList.toggle('expanded');
                d3ParameterToggleButton.textContent = d3ControlParametersCollapsible.classList.contains('expanded') ? '▲' : '▼';
            });
        }
    }
     if(d3TagLinkParametersCollapsible) { 
        const d3TagLinkToggleButton = d3TagLinkParametersCollapsible.querySelector('.d3-toggle-button');
        if (d3TagLinkToggleButton) {
            d3TagLinkParametersCollapsible.querySelector('.d3-control-header').addEventListener('click', () => {
                d3TagLinkParametersCollapsible.classList.toggle('expanded');
                d3TagLinkToggleButton.textContent = d3TagLinkParametersCollapsible.classList.contains('expanded') ? '▲' : '▼';
                if(d3TagLinksControlContent) d3TagLinksControlContent.style.maxHeight = d3TagLinkParametersCollapsible.classList.contains('expanded') ? d3TagLinksControlContent.scrollHeight + "px" : "0px";
            });
            if (d3TagLinkParametersCollapsible.classList.contains('expanded') && d3TagLinksControlContent) {
                d3TagLinksControlContent.style.maxHeight = d3TagLinksControlContent.scrollHeight + "px";
            }
        }
    }
    
    const d3LinkDistanceSlider = document.getElementById('d3-link-distance');
    const d3ChargeStrengthSlider = document.getElementById('d3-charge-strength');
    const d3NodeSizeFactorSlider = document.getElementById('d3-node-size-factor');
    const d3LinkStrengthSlider = document.getElementById('d3-link-strength');
    const d3CategoryFilterButtonsContainer = document.getElementById('d3-category-filter-buttons');
    const d3ResetViewButton = document.getElementById('d3-reset-view');
    const d3RefreshGraphButton = document.getElementById('d3-refresh-graph-button');
    const d3GraphContainer = document.getElementById('d3-tag-network-graph'); 
    const d3LegendItemsContainer = document.getElementById('d3-legend-items');
    const d3InfoButton = document.getElementById('d3-info-button');
    const d3InfoModalOverlay = document.getElementById('d3-info-overlay');
    const d3CloseInfoModalButton = document.getElementById('d3-close-info-modal');

    const d3NodePopup = document.getElementById('d3-node-popup');
    const d3PopupTitle = document.getElementById('d3-popup-title');
    const d3PopupType = document.getElementById('d3-popup-type');
    const d3PopupCategoryInfo = document.getElementById('d3-popup-category-info');
    const d3PopupDescription = document.getElementById('d3-popup-description');
    const d3PopupDetails = document.getElementById('d3-popup-details');
    const d3ConnectionsList = document.getElementById('d3-connections-list');
    const d3ClosePopupButton = document.getElementById('d3-close-popup');
    const d3ShowNeighborGraphButton = document.getElementById('d3-show-neighbor-graph-button');
    const d3MetricDegreeSpan = document.getElementById('d3-metric-degree');
    const d3MetricBetweennessSpan = document.getElementById('d3-metric-betweenness');

    const neighborVisModal = document.getElementById('neighbor-visualization-modal');
    const closeNeighborVisModalButton = document.getElementById('closeNeighborVisModal');
    const neighborVisTitle = document.getElementById('neighbor-vis-title');
    const neighborVisSvgContainer = document.getElementById('neighbor-vis-svg-container');
    const neighborVisDepthSelect = document.getElementById('neighbor-vis-depth');
    const neighborVisNetworkLayoutToggle = document.getElementById('neighbor-vis-network-layout-toggle');
    const neighborVisFilterContainer = document.getElementById('neighbor-vis-filter-buttons-container');
    const neighborVisResetFiltersButton = document.getElementById('neighbor-vis-reset-filters-button');
    let d3NeighborSimulation = null; 
    let activeNeighborVisFilters = new Set();
    let currentNeighborViewRawData = { egoGraph: { nodes: [], links: [] }, concentricData: {} };

    const networkMetricsModal = document.getElementById('network-metrics-modal');
    const closeNetworkMetricsModalButton = document.getElementById('closeNetworkMetricsModal');
    const metricsTableContainer = document.getElementById('metrics-table-container');
    let currentSortColumn = 'degree';
    let currentSortDirection = 'desc';


    const globalTagCategoryStyles = {
        "theory": { visJsShape: 'dot', color: { background: '#FFB3BA', border: '#E06373' }, fontColor: '#333333' },
        "skill": { visJsShape: 'square', color: { background: '#BAFFC9', border: '#63E07B' }, fontColor: '#333333' },
        "tool": { visJsShape: 'triangle', color: { background: '#BAD7FF', border: '#6395E0' }, fontColor: '#333333' },
        "content": { visJsShape: 'diamond', color: { background: '#FFFACD', border: '#E0D478' }, fontColor: '#333333' },
        "methodology": { visJsShape: 'star', color: { background: '#D8BFD8', border: '#B48BB4' }, fontColor: '#333333' },
    };
    let tagToCategoryMap = {};
    let activeD3CategoryFilters = new Set();
    let currentD3GraphData = { nodes: [], links: [] };
    let currentCentralNodeForNeighborVis = null;
    let networkMetricsCalculated = false;
    let activeEditCourseEl = null;
    let coursesForComparison = [];
    const MAX_COMPARE_COURSES = 3;
    let draggedItem = null;
    let placeholder = null;
    let currentWorkloadData = null;
    let tempNewTagHolder = null;

    let coursesData = [
        // SEMESTER 1
        { id: 'comm1120', code: 'COMM 1120', name: 'FUNDAMENTALS OF COMMUNICATION', syllabus: 'Syllabus for Social Theory...', color: '#7DFAFF', tags: ['theory', 'core', 'social'], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-1' },
        { id: 'comm1130', code: 'COMM 1130', name: 'VISUAL CULTURE', syllabus: 'Visual Culture details...', color: '#7DFAFF', tags: ['culture', 'visuals', 'core'], ects: 6, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-1' },
        { id: 'comm1180', code: 'COMM 1180', name: 'PHOTOGRAPHY', syllabus: 'Photography basics...', color: '#7DFAFF', tags: ['visuals', 'practical', 'art'], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-1' },
        { id: 'nmed1115', code: 'NMED 1115', name: 'NEW MEDIA AND COMMUNICATION TECHNOLOGIES', syllabus: 'NMED Tech syllabus...', color: '#FFFFFF', tags: ['new media', 'technology', 'core'], ects: 5, hours: "3T+2P", lecturer: "Mert Seven", category: 'category-semester-1' },
        { id: 'trk1110', code: 'TRK 1110', name: 'TURKISH I', syllabus: '', color: '#DCED31', tags: ['language'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-1' },
        { id: 'sofl1101', code: 'SOFL 1101', name: 'ACADEMIC ENGLISH I', syllabus: '', color: '#D57AFF', tags: ['language', 'academic'], ects: 4, hours: "4T+0P", lecturer: "SOFL", category: 'category-semester-1' },
        { id: 'ufmdxxxx_dt', code: 'UFMD XXXX', name: 'DESIGN THINKING', syllabus: '', color: '#C7C7C7', tags: ['design', 'methodology'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-1' },

        // SEMESTER 2
        { id: 'comm1110', code: 'COMM 11XX', name: 'SOCIAL THEORY', syllabus: '', color: '#7DFAFF', tags: ['theory', 'media', 'core'], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-2' },
        { id: 'nmed1116', code: 'NMED 1116', name: 'MEDIA HISTORY', syllabus: '', color: '#FFFFFF', tags: ['media', 'history'], ects: 5, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-2' },
        { id: 'nmed1110', code: 'NMED 1110', name: 'COMPUTATIONAL THINKING', syllabus: '', color: '#FFFFFF', tags: ['technology', 'programming basics'], ects: 5, hours: "3T+0P", lecturer: "Mert Seven", category: 'category-semester-2' },
        { id: 'nmed1118', code: 'NMED 1118', name: 'DIGITAL VISUALIZATION', syllabus: '', color: '#FFFFFF', tags: ['visuals', 'digital', 'design'], ects: 5, hours: "3T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-2' },
        { id: 'trk1210', code: 'TRK 1210', name: 'TURKISH II', syllabus: '', color: '#DCED31', tags: ['language'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },
        { id: 'sofl1102', code: 'SOFL 1102', name: 'ACADEMIC ENGLISH II', syllabus: '', color: '#D57AFF', tags: ['language', 'academic'], ects: 4, hours: "4T+0P", lecturer: "SOFL", category: 'category-semester-2' },
        { id: 'ufmd_g', code: 'UFMD XXXX', name: 'GİRİŞİMCİLİK (Entrepreneurship)', syllabus: '', color: '#C7C7C7', tags: ['business'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },
        { id: 'ufmd_ad', code: 'UFMD XXXX', name: 'ANALİTİK DÜŞÜNME (Analytical Thinking)', syllabus: '', color: '#C7C7C7', tags: ['skills'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },

        // SEMESTER 3
        { id: 'comm1140', code: 'COMM 1140', name: 'MEDIA THEORIES', syllabus: '', color: '#7DFAFF', tags: ['media', 'theory', 'core'], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-3' },
        { id: 'nmed2115', code: 'NMED 2115', name: 'USER EXPERIENCE DESIGN', syllabus: 'UX Design details', color: '#FFFFFF', tags: ['design', 'ux', 'ui', 'digital'], ects: 5, hours: "2T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-3' },
        { id: 'nmed2117', code: 'NMED 2117', name: 'VIDEO NARRATIVES I', syllabus: '', color: '#FFFFFF', tags: ['video', 'narrative', 'practical'], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-3' },
        { id: 'nmed2105', code: 'NMED 2105', name: 'BASIC DESIGN FOR DIGITAL ENVIRONMENT', syllabus: '', color: '#FFFFFF', tags: ['design', 'digital', 'foundational'], ects: 6, hours: "4T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-3' },
        { id: 'creative_comm', code: 'NMED XXXX', name: 'CREATIVE COMM STRATEGIES', syllabus: '', color: '#FFFFFF', tags: ['strategy', 'communication'], ects: 5, hours: "3T+0P", lecturer: "Özlem Ozan", category: 'category-semester-3' },
        { id: 'hist1110', code: 'HIST 1110', name: 'PRINCIPLES OF ATATÜRK AND HISTORY OF REVOLUTION I', syllabus: '', color: '#DCED31', tags: ['history', 'national'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-3' },
        { id: 'ufndxxxx_ebp', code: 'UFND XXXX', name: 'ENTREPRENEURSHIP AND BUSINESS PLANNING', syllabus: '', color: '#F26419', tags: ['business', 'planning'], ects: 0, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-3' },
        { id: 'ufnd7010', code: 'UFND 7010', name: 'SOCIAL RESPONSIBILITY PROJECT', syllabus: '', color: '#F26419', tags: ['social', 'project'], ects: 1, hours: "0T+2P", lecturer: "ODL", category: 'category-semester-3' },

        // SEMESTER 4
        { id: 'comm1170', code: 'COMM 1170', name: 'İLETİŞİMDE HAK VE ÖZGÜRLÜKLER', syllabus: '', color: '#7DFAFF', tags: ['law', 'ethics', 'media'], ects: 5, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-4' },
        { id: 'nmed2122', code: 'NMED 2122', name: 'VIDEO NARRATIVES II', syllabus: '', color: '#FFFFFF', tags: ['video', 'narrative', 'practical', 'advanced'], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-4' },
        { id: 'nmed2124', code: 'NMED 2124', name: 'COMMUNICATION RESEARCH AND ETHICS', syllabus: '', color: '#FFFFFF', tags: ['research', 'ethics', 'communication'], ects: 6, hours: "3T+2P", lecturer: "Özlem Ozan", category: 'category-semester-4' },
        { id: 'nmed2126', code: 'NMED 2126', name: 'WEB APPLICATIONS FOR NEW MEDIA', syllabus: '', color: '#FFFFFF', tags: ['web', 'technology', 'new media', 'programming'], ects: 5, hours: "2T+2P", lecturer: "Mert Seven", category: 'category-semester-4' },
        { id: 'hist1210', code: 'HIST 1210', name: 'PRINCIPLES OF ATATÜRK AND HISTORY OF REVOLUTION II', syllabus: '', color: '#DCED31', tags: ['history', 'national'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-4' },
        { id: 'uni_elective1', code: 'ÜNİVERSİTE SEÇMELİ I', name: 'UNIVERSITY ELECTIVE COURSE I', syllabus: '', color: '#FFEC00', tags: ['elective'], ects: 5, hours: "3T+0P", lecturer: "UNI", category: 'category-semester-4' },

        // SEMESTER 5
        { id: 'comm1150', code: 'COMM 1150', name: 'JOURNALISM', syllabus: '', color: '#7DFAFF', tags: ['journalism', 'writing', 'media'], ects: 6, hours: "3T+0P", lecturer: "Mert Seven", category: 'category-semester-5' },
        { id: 'comm1160', code: 'COMM 1160', name: 'POLITICS, SOCIETY AND MEDIA IN TURKEY', syllabus: '', color: '#7DFAFF', tags: ['politics', 'society', 'media', 'national'], ects: 5, hours: "3T+0P", lecturer: "Sevda Alankuş", category: 'category-semester-5' },
        { id: 'nmed3129', code: 'NMED 3129', name: 'SOCIAL NETWORK MEDIA', syllabus: '', color: '#FFFFFF', tags: ['social media', 'new media', 'digital'], ects: 5, hours: "3T+2P", lecturer: "Özlem Ozan", category: 'category-semester-5' },
        { id: 'nmed3131', code: 'NMED 3131', name: 'MOBILE APPLICATIONS FOR NEW MEDIA', syllabus: '', color: '#FFFFFF', tags: ['mobile', 'app development', 'technology', 'programming'], ects: 5, hours: "2T+2P", lecturer: "Mert Seven", category: 'category-semester-5' },
        { id: 'nmed3126', code: 'NMED 3126', name: 'SOCIAL MEDIA PLANNING', syllabus: '', color: '#FFFFFF', tags: ['social media', 'strategy', 'planning'], ects: 5, hours: "3T+0P", lecturer: "Simge Gökbayrak", category: 'category-semester-5' },
        { id: 'uni_elective2', code: 'ÜNİVERSİTE SEÇMELİ II', name: 'UNIVERSITY ELECTIVE COURSES II', syllabus: '', color: '#FFEC00', tags: ['elective'], ects: 5, hours: "3T+0P", lecturer: "UNI", category: 'category-semester-5' },

        // SEMESTER 6
        { id: 'nmed3128', code: 'NMED 3128', name: 'JOURNALISM STUDIO', syllabus: '', color: '#FFFFFF', tags: ['journalism', 'practical', 'studio'], ects: 6, hours: "4T+2P", lecturer: "Sevda Alankuş", category: 'category-semester-6' },
        { id: 'nmed3130', code: 'NMED 3130', name: 'DIGITAL STORYTELLING', syllabus: '', color: '#FFFFFF', tags: ['digital', 'narrative', 'storytelling'], ects: 6, hours: "3T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-6' },
        { id: 'dept_elective1', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS I', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE I', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },
        { id: 'dept_elective2', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS II', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE II', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },
        { id: 'dept_elective3_s6', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS III', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE III', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },

        // SEMESTER 7
        { id: 'nmed4111', code: 'NMED 4111', name: 'NEW MEDIA GRADUATION PROJECT I', syllabus: '', color: '#FFFFFF', tags: ['project', 'graduation', 'capstone'], ects: 10, hours: "2T+4P", lecturer: "Özlem Ozan", category: 'category-semester-7' },
        { id: 'dept_elective3_s7', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS III', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE III', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'dept_elective4', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS IV', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE IV', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'dept_elective5', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS V', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE V', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'ufmd_cp', code: 'UFMD XXXX', name: 'KARİYER PLANLAMA (Career Planning)', syllabus: '', color: '#C7C7C7', tags: ['career', 'skills'], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-7' },

        // SEMESTER 8
        { id: 'nmed4112', code: 'NMED 4112', name: 'NEW MEDIA GRADUATION PROJECT II', syllabus: '', color: '#FFFFFF', tags: ['project', 'graduation', 'capstone', 'advanced'], ects: 12, hours: "2T+4P", lecturer: "Özlem Ozan", category: 'category-semester-8' },
        { id: 'dept_elective6', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VI', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VI', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
        { id: 'dept_elective7', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VII', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VII', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
        { id: 'dept_elective8', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VIII', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VIII', syllabus: '', color: '#00FF75', tags: ['elective', 'departmental'], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
    ];

    function isColorDark(hexColor) {
        if (!hexColor) return false;
        const color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const uicolors = [r / 255, g / 255, b / 255];
        const c = uicolors.map((col) => {
            if (col <= 0.03928) { return col / 12.92; }
            return Math.pow((col + 0.055) / 1.055, 2.4);
        });
        const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        return L <= 0.179; 
    }

    function initializeTagSystem() {
        coursesData.forEach(course => {
            if (course.tags && Array.isArray(course.tags)) {
                course.tags.forEach(tag => {
                    const normalizedTag = tag.toLowerCase();
                    if (!tagToCategoryMap[normalizedTag]) {
                        if (['theory', 'core', 'culture', 'media', 'history', 'national', 'social', 'politics', 'ethics', 'law'].some(keyword => normalizedTag.includes(keyword))) {
                            tagToCategoryMap[normalizedTag] = 'content';
                        } else if (['visuals', 'practical', 'digital', 'programming', 'web', 'mobile', 'ux', 'ui', 'design', 'video', 'narrative', 'storytelling', 'writing', 'research', 'communication', 'academic', 'planning', 'skills'].some(keyword => normalizedTag.includes(keyword))) {
                            tagToCategoryMap[normalizedTag] = 'skill';
                        } else if (['technology', 'tool', 'software', 'app', 'applications'].some(keyword => normalizedTag.includes(keyword))) {
                            tagToCategoryMap[normalizedTag] = 'tool';
                        } else if (['elective', 'language', 'business', 'project', 'studio'].some(keyword => normalizedTag.includes(keyword))) {
                            tagToCategoryMap[normalizedTag] = 'methodology';
                        } else {
                            tagToCategoryMap[normalizedTag] = 'uncategorized';
                        }
                    }
                });
            }
        });

        if (newTagCategorySelect) {
            newTagCategorySelect.innerHTML = '';
            const uncatOption = document.createElement('option');
            uncatOption.value = 'uncategorized';
            uncatOption.textContent = 'Uncategorized';
            newTagCategorySelect.appendChild(uncatOption);

            for (const categoryName in globalTagCategoryStyles) {
                const option = document.createElement('option');
                option.value = categoryName;
                option.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                newTagCategorySelect.appendChild(option);
            }
            newTagCategorySelect.value = 'uncategorized';
        }
    }

    function getSemesterType(category) {
        if (!category || !category.startsWith('category-semester-')) {
            return "Uncategorized";
        }
        const semesterNumber = parseInt(category.split('-')[2], 10);
        if (isNaN(semesterNumber)) return "Uncategorized";
        return (semesterNumber % 2 !== 0) ? "Fall" : "Spring";
    }

    function findCourseDataById(id) {
        return coursesData.find(c => c.id === id);
    }

    function updateCourseData(id, newData) {
        const courseIndex = coursesData.findIndex(c => c.id === id);
        if (courseIndex > -1) {
            coursesData[courseIndex] = { ...coursesData[courseIndex], ...newData };
            return true;
        }
        return false;
    }

    function generateId() {
        return `course-${Date.now().toString().slice(-5)}-${Math.random().toString(36).substr(2, 5)}`;
    }

    function createPlaceholder() {
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.classList.add('drag-placeholder');
        }
        return placeholder;
    }

    function parseCourseHours(hoursString) {
        if (!hoursString || typeof hoursString !== 'string') return 0;
        let totalHours = 0;
        hoursString.toLowerCase().split('+').forEach(part => {
            const num = parseInt(part, 10);
            if (!isNaN(num)) totalHours += num;
        });
        return totalHours;
    }

    function createCourseElement(course) {
        const courseEl = document.createElement('div');
        courseEl.classList.add('course-item');
        courseEl.id = course.id;
        courseEl.draggable = true;
        courseEl.style.backgroundColor = course.color || '#e0e0e0';
        courseEl.dataset.courseId = course.id;

        const codeEl = document.createElement('h3');
        codeEl.textContent = course.code;
        const nameEl = document.createElement('p');
        nameEl.classList.add('course-name');
        nameEl.textContent = course.name;
        const detailsEl = document.createElement('div');
        detailsEl.classList.add('course-details');
        detailsEl.innerHTML = `
            <span>ECTS: <strong>${course.ects !== null ? course.ects : 'N/A'}</strong></span>
            <span>Hours: <strong>${course.hours || 'N/A'}</strong></span>
            ${course.lecturer ? `<span class="lecturer-info">Lecturer: <strong>${course.lecturer}</strong></span>` : ''}
        `;
        const tagsEl = document.createElement('div');
        tagsEl.classList.add('course-tags');
        renderTags(tagsEl, course.tags, course.id);

        courseEl.append(codeEl, nameEl, detailsEl, tagsEl);
        courseEl.addEventListener('dragstart', handleDragStart);
        courseEl.addEventListener('click', handleCourseClick);
        return courseEl;
    }

    function renderTags(tagsContainer, tagsArray, courseId) {
        tagsContainer.innerHTML = '';
        (tagsArray || []).forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.classList.add('tag');
            tagSpan.textContent = tag;

            const normalizedTag = tag.toLowerCase();
            const category = tagToCategoryMap[normalizedTag] || 'uncategorized';
            if (globalTagCategoryStyles[category]) {
                tagSpan.style.borderLeft = `3px solid ${globalTagCategoryStyles[category].color.border || '#ccc'}`;
                tagSpan.title = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
            } else if (category === 'uncategorized') {
                const uncatBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-border').trim();
                tagSpan.style.borderLeft = `3px solid ${uncatBorderColor || '#7f8c8d'}`; // Fallback
                tagSpan.title = `Category: Uncategorized`;
            }

            const removeTagBtn = document.createElement('span');
            removeTagBtn.classList.add('remove-tag');
            removeTagBtn.textContent = 'x';
            removeTagBtn.title = "Remove tag";
            removeTagBtn.onclick = (e) => {
                e.stopPropagation();
                removeTagFromCourse(courseId, tag);
            };
            tagSpan.appendChild(removeTagBtn);
            tagsContainer.appendChild(tagSpan);
        });
    }

    function populateAllCourses() {
        document.querySelectorAll('.category-zone .course-list').forEach(list => list.innerHTML = '');
        const searchTerm = searchInput.value.toLowerCase();
        coursesData.forEach(course => {
            const matchesSearch = !searchTerm ||
                course.code.toLowerCase().includes(searchTerm) ||
                course.name.toLowerCase().includes(searchTerm) ||
                (course.lecturer && course.lecturer.toLowerCase().includes(searchTerm)) ||
                (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            if (matchesSearch) {
                const courseEl = createCourseElement(course);
                const targetList = document.querySelector(`#${course.category || 'category-uncategorized'} .course-list`);
                if (targetList) targetList.appendChild(courseEl);
                else document.querySelector('#category-uncategorized .course-list').appendChild(courseEl);
            }
        });
        if (activeEditCourseEl) {
            const newActiveEl = document.getElementById(activeEditCourseEl.id);
            if (newActiveEl) { activeEditCourseEl = newActiveEl; activeEditCourseEl.classList.add('active-edit'); }
            else clearActiveEditCourse();
        }
        coursesForComparison = coursesForComparison.map(compareEl => {
            const newCompareEl = document.getElementById(compareEl.id);
            if (newCompareEl) { newCompareEl.classList.add('selected-compare'); return newCompareEl; }
            return null;
        }).filter(el => el);
        updateComparisonCount();
        calculateAndDisplaySemesterTotals();
    }

    function calculateAndDisplaySemesterTotals() {
        document.querySelectorAll('.category-zone').forEach(zone => {
            let totalEctsInZone = 0;
            zone.querySelectorAll('.course-list .course-item').forEach(itemEl => {
                const courseData = findCourseDataById(itemEl.dataset.courseId);
                if (courseData && courseData.ects !== null) totalEctsInZone += parseInt(courseData.ects, 10) || 0;
            });
            const totalEctsSpan = zone.querySelector('.semester-footer .total-ects');
            if (totalEctsSpan) totalEctsSpan.textContent = totalEctsInZone;
        });
    }

    function handleDragStart(e) {
        draggedItem = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.id);
        setTimeout(() => this.classList.add('dragging'), 0);
        createPlaceholder();
    }

    function handleDragEnd() {
        if (draggedItem) draggedItem.classList.remove('dragging');
        if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        draggedItem = null;
        calculateAndDisplaySemesterTotals();
    }

    function getDragAfterElement(container, clientX) {
        const draggableElements = [...container.querySelectorAll('.course-item:not(.dragging):not(.drag-placeholder)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = clientX - box.left - (box.width / 2);
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetZoneList = e.target.closest('.course-list');
        if (targetZoneList && draggedItem) {
            const afterElement = getDragAfterElement(targetZoneList, e.clientX);
            if (placeholder.parentNode !== targetZoneList) targetZoneList.appendChild(placeholder);
            if (afterElement) targetZoneList.insertBefore(placeholder, afterElement);
            else targetZoneList.appendChild(placeholder);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetCourseList = e.target.closest('.course-list');
        const targetCategoryZone = e.target.closest('.category-zone');
        if (targetCourseList && draggedItem && targetCategoryZone) {
            if (placeholder && placeholder.parentNode) targetCourseList.insertBefore(draggedItem, placeholder);
            else targetCourseList.appendChild(draggedItem);
            updateCourseData(draggedItem.dataset.courseId, { category: targetCategoryZone.id });
        }
        handleDragEnd();
    }

    document.querySelectorAll('.category-zone .course-list').forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
    });
    document.addEventListener('dragend', handleDragEnd);

    function clearActiveEditCourse() {
        if (activeEditCourseEl) activeEditCourseEl.classList.remove('active-edit');
        activeEditCourseEl = null;
        if(editCourseButton) editCourseButton.disabled = true;
        if(colorPicker) colorPicker.value = '#e0e0e0';
        if(tagInput) tagInput.value = '';
        if (newTagCategoryPromptDiv && newTagCategoryPromptDiv.style.display === 'block') {
            hideNewTagCategoryPrompt();
        }
    }

    function setActiveEditCourse(courseEl) {
        clearActiveEditCourse();
        activeEditCourseEl = courseEl;
        activeEditCourseEl.classList.add('active-edit');
        if(editCourseButton) editCourseButton.disabled = false;
        const courseData = findCourseDataById(courseEl.dataset.courseId);
        if (courseData && colorPicker) colorPicker.value = courseData.color || '#e0e0e0';
    }

    function handleCourseClick(e) {
        if (e.ctrlKey || e.metaKey) {
            toggleCompareSelection(this);
            if (activeEditCourseEl === this && this.classList.contains('selected-compare')) clearActiveEditCourse();
        } else {
            coursesForComparison.forEach(c => c.classList.remove('selected-compare'));
            coursesForComparison = [];
            updateComparisonCount();
            if (activeEditCourseEl !== this) setActiveEditCourse(this);
        }
    }

    if(colorPicker) colorPicker.addEventListener('input', (e) => {
        if (activeEditCourseEl) {
            activeEditCourseEl.style.backgroundColor = e.target.value;
            updateCourseData(activeEditCourseEl.dataset.courseId, { color: e.target.value });
        }
    });

    if(addTagButton) addTagButton.addEventListener('click', () => {
        if (!activeEditCourseEl) return;
        const rawTag = tagInput.value.trim();
        if (!rawTag) return;

        const normalizedTag = rawTag.toLowerCase();
        const courseId = activeEditCourseEl.dataset.courseId;
        const courseData = findCourseDataById(courseId);

        if (courseData) {
            if (tagToCategoryMap[normalizedTag]) {
                addTagToCourse(courseData, rawTag);
                tagInput.value = '';
                populateAllCourses();
            } else {
                tempNewTagHolder = { courseData, rawTag, normalizedTag };
                showNewTagCategoryPrompt(rawTag);
            }
        }
    });

    function showNewTagCategoryPrompt(rawTagName) {
        if(newTagNameDisplaySpan) newTagNameDisplaySpan.textContent = rawTagName;
        if(newTagCategorySelect) newTagCategorySelect.value = 'uncategorized';
        if(newTagCategoryPromptDiv) newTagCategoryPromptDiv.style.display = 'block';
        if(tagInput) tagInput.disabled = true;
        if(addTagButton) addTagButton.disabled = true;
    }

    function hideNewTagCategoryPrompt() {
        if(newTagCategoryPromptDiv) newTagCategoryPromptDiv.style.display = 'none';
        if(tagInput) tagInput.disabled = false;
        if(addTagButton) addTagButton.disabled = false;
        if(tagInput) tagInput.value = '';
        tempNewTagHolder = null;
    }

    if(confirmNewTagCategoryButton) confirmNewTagCategoryButton.addEventListener('click', () => {
        if (!tempNewTagHolder) return;
        const { courseData, rawTag, normalizedTag } = tempNewTagHolder;
        const selectedCategory = newTagCategorySelect.value;
        tagToCategoryMap[normalizedTag] = selectedCategory;
        addTagToCourse(courseData, rawTag);
        hideNewTagCategoryPrompt();
        populateAllCourses();
    });

    if(cancelNewTagCategoryButton) cancelNewTagCategoryButton.addEventListener('click', () => {
        hideNewTagCategoryPrompt();
    });

    function addTagToCourse(courseData, rawTag) {
        courseData.tags = courseData.tags || [];
        if (!courseData.tags.some(t => t.toLowerCase() === rawTag.toLowerCase())) {
            courseData.tags.push(rawTag);
        }
    }

    function removeTagFromCourse(courseId, tagToRemove) {
        const courseData = findCourseDataById(courseId);
        if (courseData && courseData.tags) {
            courseData.tags = courseData.tags.filter(tag => tag !== tagToRemove);
            populateAllCourses();
        }
    }

    if(addNewCourseButton) addNewCourseButton.addEventListener('click', () => {
        const code = newCourseCodeInput.value.trim();
        const name = newCourseNameInput.value.trim();
        const ectsVal = newCourseEctsInput.value;
        const ects = ectsVal === '' ? null : parseInt(ectsVal, 10);
        if (!code || !name) return alert('Course Code and Name are required.');
        if (ectsVal !== '' && (isNaN(ects) || ects < 0)) return alert('Valid non-negative ECTS or empty.');

        const newCourse = {
            id: generateId(), code, name, ects,
            hours: newCourseHoursInput.value.trim(),
            lecturer: newCourseLecturerInput.value.trim() || null,
            syllabus: newCourseSyllabusInput.value.trim(),
            color: '#e0e0e0', tags: [], category: 'category-uncategorized'
        };
        coursesData.push(newCourse);
        populateAllCourses();
        [newCourseCodeInput, newCourseNameInput, newCourseEctsInput, newCourseHoursInput, newCourseLecturerInput, newCourseSyllabusInput].forEach(i => i.value = '');
    });

    if(editCourseButton) editCourseButton.addEventListener('click', () => {
        if (!activeEditCourseEl) return;
        const courseData = findCourseDataById(activeEditCourseEl.dataset.courseId);
        if (courseData) {
            editCourseIdInput.value = courseData.id;
            editCourseCodeModalInput.value = courseData.code;
            editCourseNameModalInput.value = courseData.name;
            editCourseEctsModalInput.value = courseData.ects === null ? '' : courseData.ects;
            editCourseHoursModalInput.value = courseData.hours || '';
            editCourseLecturerModalInput.value = courseData.lecturer || '';
            editCourseSyllabusModalInput.value = courseData.syllabus || '';
            editCourseModal.style.display = 'block';
        }
    });
    if(closeEditModalButton) closeEditModalButton.onclick = () => editCourseModal.style.display = 'none';

    if(saveCourseChangesButton) saveCourseChangesButton.addEventListener('click', () => {
        const id = editCourseIdInput.value;
        const ectsVal = editCourseEctsModalInput.value;
        const ects = ectsVal === '' ? null : parseInt(ectsVal, 10);
        if (ectsVal !== '' && (isNaN(ects) || ects < 0)) return alert('Valid non-negative ECTS or empty.');
        const updatedData = {
            code: editCourseCodeModalInput.value.trim(),
            name: editCourseNameModalInput.value.trim(),
            ects,
            hours: editCourseHoursModalInput.value.trim(),
            lecturer: editCourseLecturerModalInput.value.trim() || null,
            syllabus: editCourseSyllabusModalInput.value.trim()
        };
        if (!updatedData.code || !updatedData.name) return alert('Code and Name cannot be empty.');
        if (updateCourseData(id, updatedData)) populateAllCourses();
        editCourseModal.style.display = 'none';
    });

    function toggleCompareSelection(courseEl) {
        const index = coursesForComparison.findIndex(c => c.id === courseEl.id);
        if (index > -1) {
            coursesForComparison.splice(index, 1);
            courseEl.classList.remove('selected-compare');
        } else {
            if (coursesForComparison.length < MAX_COMPARE_COURSES) {
                coursesForComparison.push(courseEl);
                courseEl.classList.add('selected-compare');
            } else alert(`Max ${MAX_COMPARE_COURSES} courses for comparison.`);
        }
        updateComparisonCount();
    }

    function updateComparisonCount() {
        if(comparisonCountSpan) comparisonCountSpan.textContent = coursesForComparison.length;
        if(compareButton) compareButton.disabled = coursesForComparison.length < 2;
    }

    if(compareButton) compareButton.addEventListener('click', () => {
        if (coursesForComparison.length < 2) return;
        syllabusComparisonArea.innerHTML = '';
        coursesForComparison.forEach(courseEl => {
            const courseData = findCourseDataById(courseEl.dataset.courseId);
            if (courseData) {
                const column = document.createElement('div');
                column.classList.add('syllabus-column');
                column.innerHTML = `<h4>${courseData.code} - ${courseData.name}</h4><pre>${courseData.syllabus || 'No syllabus.'}</pre>`;
                syllabusComparisonArea.appendChild(column);
            }
        });
        syllabusModal.style.display = 'block';
    });

    function calculateWorkload() {
        const workload = {};
        coursesData.forEach(course => {
            const lecturerName = course.lecturer || "Unassigned";
            const courseHours = parseCourseHours(course.hours);
            const semesterType = getSemesterType(course.category);
            if (!workload[lecturerName]) {
                workload[lecturerName] = { fallTotalHours: 0, springTotalHours: 0, overallTotalHours: 0, courses: [] };
            }
            workload[lecturerName].courses.push({ code: course.code, name: course.name, hours: course.hours, parsedHours: courseHours, semesterType, category: course.category });
            if (semesterType === "Fall") workload[lecturerName].fallTotalHours += courseHours;
            else if (semesterType === "Spring") workload[lecturerName].springTotalHours += courseHours;
            workload[lecturerName].overallTotalHours += courseHours;
        });
        for (const lecturer in workload) {
            workload[lecturer].courses.sort((a, b) => (parseInt(a.category?.split('-')[2] || 0) - parseInt(b.category?.split('-')[2] || 0)) || a.code.localeCompare(b.code));
        }
        return workload;
    }

    function displayWorkloadTable(workloadData) {
        currentWorkloadData = workloadData;
        workloadTableContainer.innerHTML = '';
        if (Object.keys(workloadData).length === 0) {
            workloadTableContainer.innerHTML = '<p>No workload data.</p>';
            if(exportWorkloadCsvButton) exportWorkloadCsvButton.disabled = true; return;
        }
        const table = document.createElement('table');
        table.innerHTML = `<thead><tr><th>Lecturer</th><th>Course Code</th><th>Course Name</th><th>Semester</th><th>Hours (Parsed)</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        Object.keys(workloadData).sort().forEach(lecturer => {
            const data = workloadData[lecturer];
            data.courses.forEach((course, index) => {
                const row = tbody.insertRow();
                if (index === 0) row.insertCell().outerHTML = `<td rowspan="${data.courses.length + 1}">${lecturer}</td>`;
                row.insertCell().textContent = course.code;
                row.insertCell().textContent = course.name;
                row.insertCell().textContent = course.semesterType;
                row.insertCell().textContent = course.parsedHours;
            });
            const totalRow = tbody.insertRow();
            totalRow.classList.add('lecturer-total-row');
            totalRow.innerHTML = `<td colspan="3" style="text-align: right; padding-right: 10px;">Fall: ${data.fallTotalHours}h | Spring: ${data.springTotalHours}h | Overall:</td><td><strong>${data.overallTotalHours}h</strong></td>`;
        });
        table.appendChild(tbody);
        workloadTableContainer.appendChild(table);
        if(exportWorkloadCsvButton) exportWorkloadCsvButton.disabled = false;
    }

    if (viewWorkloadButton) viewWorkloadButton.addEventListener('click', () => {
        displayWorkloadTable(calculateWorkload());
        if (workloadModal) workloadModal.style.display = 'block';
    });
    if (closeWorkloadModalButton) closeWorkloadModalButton.onclick = () => { if (workloadModal) workloadModal.style.display = 'none'; };

    function triggerFileDownload(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function escapeCsvValue(value) {
        if (value === null || value === undefined) return '';
        let stringValue = String(value).replace(/\r?\n|\r/g, ' '); 
        if (stringValue.includes(',') || stringValue.includes('"') || /^\s|\s$/.test(stringValue)) {
            stringValue = stringValue.replace(/"/g, '""');
            return `"${stringValue}"`;
        }
        return stringValue;
    }

    function generateCurriculumCsv(courses) { 
        const headers = ['id', 'code', 'name', 'syllabus', 'color', 'tags', 'ects', 'hours', 'lecturer', 'category'];
        let csvContent = "\uFEFF" + headers.map(escapeCsvValue).join(',') + '\r\n'; 
        courses.forEach(course => {
            const row = headers.map(header => {
                let val = course[header];
                if (header === 'tags' && Array.isArray(val)) val = val.join(';'); 
                return escapeCsvValue(val); 
            });
            csvContent += row.join(',') + '\r\n'; 
        });
        return csvContent;
    }

    if (exportCurriculumTsvButton) { 
        exportCurriculumTsvButton.textContent = 'Export Curriculum (CSV)'; 
        exportCurriculumTsvButton.addEventListener('click', () => {
            const csvData = generateCurriculumCsv(coursesData); 
            triggerFileDownload(csvData, 'curriculum_export.csv', 'text/csv;charset=utf-8;'); 
        });
    }

    if (exportWorkloadCsvButton) exportWorkloadCsvButton.addEventListener('click', () => {
        if (!currentWorkloadData) return alert('Generate workload table first.');
        const rows = [['Lecturer', 'Course Code', 'Course Name', 'Semester Type', 'Hours (Parsed)', 'Fall Hours Total', 'Spring Hours Total', 'Overall Hours Total']];
        Object.keys(currentWorkloadData).sort().forEach(lecturer => {
            const data = currentWorkloadData[lecturer];
            data.courses.forEach((course, i) => {
                rows.push(i === 0 ? [lecturer, course.code, course.name, course.semesterType, course.parsedHours, data.fallTotalHours, data.springTotalHours, data.overallTotalHours]
                                : ["", course.code, course.name, course.semesterType, course.parsedHours, "", "", ""]);
            });
        });
        const csvContent = "\uFEFF" + rows.map(r => r.map(v => String(v).includes(',') ? `"${v.replace(/"/g, '""')}"` : v).join(',')).join('\r\n');
        triggerFileDownload(csvContent, 'lecturer_workload_by_semester.csv', 'text/csv;charset=utf-8;');
    });

    // --- D3 GRAPH FUNCTIONS & Network Analysis ---

    function initializeD3NetworkColorPalette() {
        const root = document.documentElement;
        Object.entries(globalTagCategoryStyles).forEach(([categoryKey, style]) => {
            if (style && style.color) {
                root.style.setProperty(`--d3-tag-cat-${categoryKey}-bg`, style.color.background);
                root.style.setProperty(`--d3-tag-cat-${categoryKey}-border`, style.color.border);
            }
        });
    }
    
    function generateTagToTagLinks(activeCoursesData, minCooccurrence = 2) {
        const tagToTagLinks = [];
        if (!activeCoursesData || activeCoursesData.length === 0) return tagToTagLinks;

        const tagToCoursesMap = new Map();
        activeCoursesData.forEach(course => {
            (course.tags || []).forEach(rawTag => {
                const tag = rawTag.toLowerCase();
                if (!tagToCoursesMap.has(tag)) {
                    tagToCoursesMap.set(tag, new Set());
                }
                tagToCoursesMap.get(tag).add(course.id);
            });
        });

        const allTags = Array.from(tagToCoursesMap.keys());
        for (let i = 0; i < allTags.length; i++) {
            for (let j = i + 1; j < allTags.length; j++) {
                const tagA = allTags[i];
                const tagB = allTags[j];
                const coursesA = tagToCoursesMap.get(tagA);
                const coursesB = tagToCoursesMap.get(tagB);
                const intersection = new Set([...coursesA].filter(courseId => coursesB.has(courseId)));

                if (intersection.size >= minCooccurrence) {
                    tagToTagLinks.push({
                        source: `tag-${tagA}`,
                        target: `tag-${tagB}`,
                        type: 'tag-tag',
                        value: intersection.size // Co-occurrence count
                    });
                }
            }
        }
        return tagToTagLinks;
    }


    function generateD3GraphData() {
        const nodes = []; 
        const links = []; 
        const addedNodeIds = new Set();
        const coursesToGraph = coursesData; // Using the global coursesData

        coursesToGraph.forEach(course => {
            if (!addedNodeIds.has(course.id)) {
                nodes.push({
                    id: course.id, name: course.code, 
                    displayName: `${course.code}: ${course.name.substring(0, 25)}${course.name.length > 25 ? '...' : ''}`,
                    type: 'course', category: 'course', color: course.color, data: course,
                    degree: 0, betweenness: undefined 
                });
                addedNodeIds.add(course.id);
            }
            (course.tags || []).forEach(rawTag => {
                const normalizedTag = rawTag.toLowerCase();
                const tagId = `tag-${normalizedTag}`;
                const tagCategory = tagToCategoryMap[normalizedTag] || 'uncategorized';
                if (!addedNodeIds.has(tagId)) {
                    nodes.push({
                        id: tagId, name: rawTag, displayName: rawTag,
                        type: 'tag', category: tagCategory, data: { name: rawTag, category: tagCategory },
                        degree: 0, betweenness: undefined
                    });
                    addedNodeIds.add(tagId);
                }
                links.push({ source: course.id, target: tagId, value: 1, type: 'course-tag' });
            });
        });

        if (d3ToggleTagLinksCheckbox && d3ToggleTagLinksCheckbox.checked) {
            const minCooccurrence = d3MinCooccurrenceInput ? parseInt(d3MinCooccurrenceInput.value, 10) : 2;
            const tagTagLinks = generateTagToTagLinks(coursesToGraph, minCooccurrence);
            links.push(...tagTagLinks);
        }
        
        currentD3GraphData = { nodes: nodes, links: links };
    }

    function calculateDegreeCentrality(nodes, links) {
        if (!nodes || !links) return;
        nodes.forEach(node => node.degree = 0);
        links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            const sourceNode = nodes.find(n => n.id === sourceId);
            const targetNode = nodes.find(n => n.id === targetId);
            if (sourceNode) sourceNode.degree = (sourceNode.degree || 0) + 1;
            if (targetNode) targetNode.degree = (targetNode.degree || 0) + 1;
        });
    }

    function calculateBetweennessCentrality(nodes, links) {
        if (!nodes || !links || nodes.length === 0) return;
        const adj = new Map();
        nodes.forEach(node => adj.set(node.id, new Set()));
        links.forEach(link => {
            const u = link.source.id || link.source;
            const v = link.target.id || link.target;
            adj.get(u).add(v); adj.get(v).add(u);
        });
        nodes.forEach(node => node.betweenness = 0.0);

        for (const sNode of nodes) {
            const s = sNode.id;
            const S = []; const P = new Map();
            nodes.forEach(n => P.set(n.id, []));
            const sigma = new Map(); nodes.forEach(n => sigma.set(n.id, 0)); sigma.set(s, 1);
            const dist = new Map(); nodes.forEach(n => dist.set(n.id, -1)); dist.set(s, 0);
            const Q = [s]; let head = 0;
            while (head < Q.length) {
                const v = Q[head++]; S.push(v);
                if (!adj.get(v)) continue;
                adj.get(v).forEach(w => {
                    if (dist.get(w) < 0) { Q.push(w); dist.set(w, dist.get(v) + 1); }
                    if (dist.get(w) === dist.get(v) + 1) { sigma.set(w, sigma.get(w) + sigma.get(v)); P.get(w).push(v); }
                });
            }
            const delta = new Map(); nodes.forEach(n => delta.set(n.id, 0));
            while (S.length > 0) {
                const w = S.pop();
                P.get(w).forEach(v => {
                    if (sigma.get(w) !== 0) delta.set(v, delta.get(v) + (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w)));
                });
                if (w !== s) {
                    const wNode = nodes.find(n => n.id === w);
                    if (wNode) wNode.betweenness += delta.get(w);
                }
            }
        }
        nodes.forEach(node => {
            if (adj.get(node.id) && adj.get(node.id).size === 1) {
                node.betweenness = 0;
            } else {
                node.betweenness /= 2;
            }
        });
    }

    async function handleCalculateMetrics() {
        if (!currentD3GraphData.nodes || currentD3GraphData.nodes.length === 0) {
            alert("Graph data not available. Please open the D3 graph first.");
            return;
        }
        if(calculateMetricsButton) calculateMetricsButton.disabled = true;
        if(calculatingMetricsMessage) calculatingMetricsMessage.style.display = 'block';
        
        await new Promise(resolve => setTimeout(resolve, 50)); 

        const startTime = performance.now();
        calculateDegreeCentrality(currentD3GraphData.nodes, currentD3GraphData.links);
        calculateBetweennessCentrality(currentD3GraphData.nodes, currentD3GraphData.links);
        networkMetricsCalculated = true;
        const endTime = performance.now();
        console.log(`Metrics calculation took ${(endTime - startTime).toFixed(2)} ms.`);
        
        if(calculatingMetricsMessage) calculatingMetricsMessage.style.display = 'none';
        if(calculateMetricsButton) calculateMetricsButton.disabled = false;
        
        displayMetricsTable(currentD3GraphData.nodes);

        if (d3NodePopup && d3NodePopup.classList.contains('visible') && currentCentralNodeForNeighborVis) {
            const nodeData = currentD3GraphData.nodes.find(n => n.id === currentCentralNodeForNeighborVis.id);
            if (nodeData) {
                if (d3MetricDegreeSpan) d3MetricDegreeSpan.textContent = nodeData.degree !== undefined ? nodeData.degree : 'N/A';
                if (d3MetricBetweennessSpan) d3MetricBetweennessSpan.textContent = nodeData.betweenness !== undefined ? nodeData.betweenness.toFixed(4) : 'N/A';
            }
        }
    }
    
    if (calculateMetricsButton) { 
        calculateMetricsButton.addEventListener('click', handleCalculateMetrics);
    }

    function displayMetricsTable(nodes) {
        if (!metricsTableContainer || !networkMetricsModal) return;
        metricsTableContainer.innerHTML = '';
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();
        const headers = [
            { key: 'displayName', text: 'Node Name', numeric: false },
            { key: 'type', text: 'Type', numeric: false },
            { key: 'category', text: 'Category', numeric: false },
            { key: 'degree', text: 'Degree', numeric: true },
            { key: 'betweenness', text: 'Betweenness', numeric: true }
        ];

        const headerRow = thead.insertRow();
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.text;
            const arrowSpan = document.createElement('span');
            arrowSpan.classList.add('sort-arrow');
            if (header.key === currentSortColumn) {
                arrowSpan.textContent = currentSortDirection === 'asc' ? ' ▲' : ' ▼';
            }
            th.appendChild(arrowSpan);
            th.onclick = () => {
                if (currentSortColumn === header.key) {
                    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortColumn = header.key;
                    currentSortDirection = header.numeric ? 'desc' : 'asc'; 
                }
                displayMetricsTable(nodes); 
            };
            headerRow.appendChild(th);
        });

        const sortedNodes = [...nodes].sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            if (currentSortColumn === 'betweenness' || currentSortColumn === 'degree') {
                valA = valA === undefined ? (currentSortDirection === 'asc' ? Infinity : -Infinity) : valA;
                valB = valB === undefined ? (currentSortDirection === 'asc' ? Infinity : -Infinity) : valB;
            } else { 
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }
            
            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        sortedNodes.forEach(node => {
            const row = tbody.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                let value = node[header.key];
                if (header.key === 'betweenness' && typeof value === 'number') {
                    cell.textContent = value.toFixed(4);
                } else if (header.key === 'displayName') {
                    cell.textContent = node.displayName || node.name;
                } 
                else {
                    cell.textContent = value !== undefined ? value : 'N/A';
                }
            });
        });
        metricsTableContainer.appendChild(table);
        networkMetricsModal.style.display = 'block';
    }

    if(closeNetworkMetricsModalButton) closeNetworkMetricsModalButton.onclick = () => networkMetricsModal.style.display = 'none';


    function getD3NodeColor(d) {
        if (d.type === 'course') return `var(--d3-color-course)`;
        if (d.type === 'tag') return `var(--d3-tag-cat-${d.category}-bg, var(--d3-color-uncategorized-bg))`;
        return '#ccc';
    }

    function getD3NodeBorderColor(d) {
       if (d.type === 'course') return `var(--d3-border-course)`;
       if (d.type === 'tag') return `var(--d3-tag-cat-${d.category}-border, var(--d3-color-uncategorized-border))`;
       return '#999';
   }

    function getD3NodeRadius(d) {
        const baseSize = 7;
        const factor = (d3NodeSizeFactorSlider ? parseFloat(d3NodeSizeFactorSlider.value) : 1) || 1;
        let radius = baseSize;
        if (d.type === 'course') radius = baseSize * 1.2; 
        return radius * factor;
    }

    function setupD3CategoryFiltersAndLegend() {
        if (!d3CategoryFilterButtonsContainer || !d3LegendItemsContainer) return;
        d3CategoryFilterButtonsContainer.innerHTML = '';
        d3LegendItemsContainer.innerHTML = '';
        activeD3CategoryFilters.clear();
        initializeD3NetworkColorPalette(); 

        const categoriesInUse = new Set(['course']);
        currentD3GraphData.nodes.forEach(node => {
            if (node.type === 'tag') categoriesInUse.add(node.category);
        });
        if (currentD3GraphData.nodes.some(n => n.type === 'tag' && n.category === 'uncategorized') && !categoriesInUse.has('uncategorized')) {
            categoriesInUse.add('uncategorized');
        }

        Array.from(categoriesInUse).sort().forEach(catKey => {
            activeD3CategoryFilters.add(catKey);
            const btn = document.createElement('button');
            btn.classList.add('d3-category-button', 'active');
            btn.dataset.category = catKey; btn.textContent = catKey;
            const legendItem = document.createElement('div');
            legendItem.classList.add('d3-legend-item');
            const legendColorBox = document.createElement('span');
            legendColorBox.classList.add('d3-legend-color');

            if (catKey === 'course') {
                btn.classList.add('filter-type-course');
                btn.style.backgroundColor = `var(--d3-color-course)`;
                btn.style.color = 'white'; 
                legendColorBox.style.backgroundColor = `var(--d3-color-course)`;
            } else {
                btn.classList.add(`filter-tag-${catKey}`);
                const bgColorVar = `--d3-tag-cat-${catKey}-bg`;
                const borderColorVar = `--d3-tag-cat-${catKey}-border`;
                const finalBgColor = getComputedStyle(document.documentElement).getPropertyValue(bgColorVar) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-bg');
                const finalBorderColor = getComputedStyle(document.documentElement).getPropertyValue(borderColorVar) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-border');
                btn.style.backgroundColor = finalBgColor;
                btn.style.borderColor = finalBorderColor;
                btn.style.color = isColorDark(finalBgColor.trim()) ? 'white' : 'black';
                legendColorBox.style.backgroundColor = finalBgColor;
            }
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const category = this.dataset.category;
                if (this.classList.contains('active')) {
                    activeD3CategoryFilters.add(category);
                    this.style.backgroundColor = (category === 'course') ? `var(--d3-color-course)` : (getComputedStyle(document.documentElement).getPropertyValue(`--d3-tag-cat-${category}-bg`) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-bg'));
                    this.style.color = isColorDark(this.style.backgroundColor.trim()) || category === 'course' ? 'white' : 'black';
                } else {
                    activeD3CategoryFilters.delete(category);
                    this.style.backgroundColor = '#fff'; this.style.color = 'black';
                }
                applyD3FiltersAndSearch();
            });
            d3CategoryFilterButtonsContainer.appendChild(btn);
            legendItem.appendChild(legendColorBox);
            legendItem.append(document.createTextNode(` ${catKey}`));
            d3LegendItemsContainer.appendChild(legendItem);
        });
    }

    function applyD3FiltersAndSearch() {
        if (!d3NodeElements || !d3LinkElements) return;
        const searchTerm = (d3SearchInput ? d3SearchInput.value.toLowerCase() : "");

        d3NodeElements.each(function(d_node) {
            const nodeElement = d3.select(this);
            const isCategoryMatch = activeD3CategoryFilters.has(d_node.category);
            let isSearchMatch = true;
            if (searchTerm) {
                isSearchMatch = (d_node.name && d_node.name.toLowerCase().includes(searchTerm)) ||
                                (d_node.displayName && d_node.displayName.toLowerCase().includes(searchTerm)) ||
                                (d_node.data && d_node.data.code && d_node.data.code.toLowerCase().includes(searchTerm)) ||
                                (d_node.type === 'course' && d_node.data.lecturer && d_node.data.lecturer.toLowerCase().includes(searchTerm));
            }
            if (isCategoryMatch && isSearchMatch) {
                nodeElement.style('display', 'block').classed('dimmed', false).classed('search-match', searchTerm && isSearchMatch);
            } else {
                nodeElement.style('display', 'none').classed('dimmed', true).classed('search-match', false);
            }
        });

        d3LinkElements.style('display', d_link => {
            const sourceNode = currentD3GraphData.nodes.find(n => n.id === (d_link.source.id || d_link.source));
            const targetNode = currentD3GraphData.nodes.find(n => n.id === (d_link.target.id || d_link.target));
            const sourceVisible = sourceNode && d3.select(d3NodeElements.nodes().find(el => d3.select(el).datum().id === sourceNode.id)).style('display') === 'block';
            const targetVisible = targetNode && d3.select(d3NodeElements.nodes().find(el => d3.select(el).datum().id === targetNode.id)).style('display') === 'block';
            return sourceVisible && targetVisible ? 'block' : 'none';
        }).classed('dimmed', d_link => {
             const sourceNode = currentD3GraphData.nodes.find(n => n.id === (d_link.source.id || d_link.source));
            const targetNode = currentD3GraphData.nodes.find(n => n.id === (d_link.target.id || d_link.target));
            const sourceVisible = sourceNode && d3.select(d3NodeElements.nodes().find(el => d3.select(el).datum().id === sourceNode.id)).style('display') === 'block';
            const targetVisible = targetNode && d3.select(d3NodeElements.nodes().find(el => d3.select(el).datum().id === targetNode.id)).style('display') === 'block';
            return !(sourceVisible && targetVisible);
        });
    }

    function initializeAndDisplayD3TagNetwork() {
        if (!d3GraphContainer) return; 
        
        generateD3GraphData(); 
        calculateDegreeCentrality(currentD3GraphData.nodes, currentD3GraphData.links);
        networkMetricsCalculated = false; 
        currentD3GraphData.nodes.forEach(n => n.betweenness = undefined); 

        if(calculateMetricsButton) {
            calculateMetricsButton.disabled = !(currentD3GraphData.nodes && currentD3GraphData.nodes.length > 0);
        }
        if(calculatingMetricsMessage) calculatingMetricsMessage.style.display = 'none';

        if (!coursesData || coursesData.length === 0 || currentD3GraphData.nodes.length === 0) {
            if (d3TagNetworkModal) d3TagNetworkModal.style.display = 'block';
            d3GraphContainer.innerHTML = `<p style="text-align:center; padding:50px; font-family: 'Space Mono', monospace; color: #333;">No data to visualize.</p>`;
            if (d3LegendItemsContainer) d3LegendItemsContainer.innerHTML = ''; 
            if (d3CategoryFilterButtonsContainer) d3CategoryFilterButtonsContainer.innerHTML = '';
            return;
        }
        
        setupD3CategoryFiltersAndLegend();
        const width = d3GraphContainer.clientWidth;
        const height = d3GraphContainer.clientHeight;
        d3GraphContainer.innerHTML = ''; 

        const svgRoot = d3.select(d3GraphContainer).attr("width", width).attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]).on("dblclick.zoom", null); 
        d3Svg = svgRoot.append("g"); 
        svgRoot.call(d3.zoom().on("zoom", (event) => { if (d3Svg) d3Svg.attr("transform", event.transform); }));

        d3Simulation = d3.forceSimulation(currentD3GraphData.nodes)
            .force("link", d3.forceLink(currentD3GraphData.links).id(d => d.id)
                .distance(parseFloat(d3LinkDistanceSlider.value))
                .strength(parseFloat(d3LinkStrengthSlider.value)))
            .force("charge", d3.forceManyBody().strength(parseFloat(d3ChargeStrengthSlider.value)))
            .force("center", d3.forceCenter(0, 0))
            .force("collide", d3.forceCollide().radius(d => getD3NodeRadius(d) + 6).strength(0.8));

        d3LinkElements = d3Svg.append("g").attr("class", "d3-links").selectAll("line")
            .data(currentD3GraphData.links).join("line")
            .attr("class", d => d.type === 'tag-tag' ? "d3-link d3-link-tag-tag" : "d3-link d3-link-course-tag")
            .attr("stroke-width", d => d.type === 'tag-tag' ? 1.2 : Math.max(1, Math.sqrt(d.value || 1) * 1.5)) 
            .attr("stroke", d => d.type === 'tag-tag' ? 'var(--d3-link-tag-tag-color)' : '#555'); 

        d3NodeElements = d3Svg.append("g").attr("class", "d3-nodes")
            .selectAll("g.d3-node").data(currentD3GraphData.nodes, d => d.id).join("g")
            .attr("class", d => `d3-node type-${d.type} category-${d.category}`)
            .call(d3Drag(d3Simulation)).on('click', d3NodeClicked)
            .on('mouseover', d3NodeMouseOver).on('mouseout', d3NodeMouseOut);

        d3NodeElements.append("circle").attr("r", d => getD3NodeRadius(d))
            .attr("fill", d => getD3NodeColor(d)).attr("stroke", d => getD3NodeBorderColor(d));
        d3NodeElements.append("text").text(d => d.displayName.split(':')[0]) 
            .attr("dy", d => getD3NodeRadius(d) + 10).attr("text-anchor", "middle");

        d3Simulation.on("tick", () => {
            d3LinkElements.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            d3NodeElements.attr("transform", d => `translate(${d.x},${d.y})`);
        });
        applyD3FiltersAndSearch(); 
        if (d3TagNetworkModal) d3TagNetworkModal.style.display = 'block';
    }

    function d3NodeClicked(event, d_node_data) {
        event.stopPropagation();
        if (!d3NodePopup || !d_node_data) return;
        currentCentralNodeForNeighborVis = d_node_data; 

        if(d3PopupTitle) d3PopupTitle.textContent = d_node_data.displayName || d_node_data.name;
        if(d3PopupType) d3PopupType.textContent = `Type: ${d_node_data.type}`;
        if(d3PopupCategoryInfo) d3PopupCategoryInfo.textContent = (d_node_data.type === 'tag') ? `Category: ${d_node_data.category}` : '';

        if (d_node_data.type === 'course' && d_node_data.data) {
            if(d3PopupDescription) d3PopupDescription.textContent = d_node_data.data.syllabus || "No syllabus information.";
            let detailsHTML = `<div><strong>ECTS:</strong> ${d_node_data.data.ects !== null ? d_node_data.data.ects : 'N/A'}</div>`;
            detailsHTML += `<div><strong>Hours:</strong> ${d_node_data.data.hours || 'N/A'}</div>`;
            detailsHTML += `<div><strong>Lecturer:</strong> ${d_node_data.data.lecturer || 'N/A'}</div>`;
            if(d3PopupDetails) d3PopupDetails.innerHTML = detailsHTML;
        } else if (d_node_data.type === 'tag' && d_node_data.data) {
            if(d3PopupDescription) d3PopupDescription.textContent = `This is the tag "${d_node_data.data.name}".`;
            if(d3PopupDetails) d3PopupDetails.innerHTML = '';
        } else {
            if(d3PopupDescription) d3PopupDescription.textContent = "No detailed description available.";
            if(d3PopupDetails) d3PopupDetails.innerHTML = '';
        }

        if (d3MetricDegreeSpan) d3MetricDegreeSpan.textContent = d_node_data.degree !== undefined ? d_node_data.degree : 'N/A';
        if (d3MetricBetweennessSpan) d3MetricBetweennessSpan.textContent = d_node_data.betweenness !== undefined ? d_node_data.betweenness.toFixed(4) : 'N/A (Recalculate if graph changed)';

        if(d3ConnectionsList) d3ConnectionsList.innerHTML = '';
        currentD3GraphData.links.forEach(link => {
            let connectedNodeDatum = null; let connectionDesc = '';
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            const sourceDatum = currentD3GraphData.nodes.find(n => n.id === sourceId);
            const targetDatum = currentD3GraphData.nodes.find(n => n.id === targetId);

            if (!sourceDatum || !targetDatum) return; 
            if (sourceDatum.id === d_node_data.id) { connectedNodeDatum = targetDatum; connectionDesc = (d_node_data.type === 'course' && connectedNodeDatum.type === 'tag') ? `has tag` : `connected to`; }
            else if (targetDatum.id === d_node_data.id) { connectedNodeDatum = sourceDatum; connectionDesc = (d_node_data.type === 'tag' && connectedNodeDatum.type === 'course') ? `is tag for` : `connected to`; }
            
            if (connectedNodeDatum && link.type !== 'tag-tag') { 
                const li = document.createElement('li'); 
                li.textContent = `${connectionDesc}: ${connectedNodeDatum.displayName || connectedNodeDatum.name}`; 
                d3ConnectionsList.appendChild(li); 
            }
        });
        d3NodePopup.classList.add('visible');
    }

    function d3NodeMouseOver(event, d_node_data) {
        if (!d3NodeElements || !d3LinkElements) return;
        d3NodeElements.classed('dimmed', n => n.id !== d_node_data.id);
        d3LinkElements.classed('dimmed', true).style('stroke-opacity', 0.1);
        d3NodeElements.filter(n => n.id === d_node_data.id).classed('dimmed', false).classed('highlight', true).raise(); 
        d3LinkElements.filter(l => (l.source.id === d_node_data.id || l.target.id === d_node_data.id) || (l.source === d_node_data.id || l.target === d_node_data.id) )
            .classed('dimmed', false).style('stroke-opacity', 1)
            .attr('stroke', d => d.type === 'tag-tag' ? 'var(--d3-link-tag-tag-color)' : '#333') 
            .attr('stroke-width', d => d.type === 'tag-tag' ? 2 : 2.5).raise() 
            .each(function(l) { 
                const otherNodeId = (l.source.id === d_node_data.id || l.source === d_node_data.id) ? (l.target.id || l.target) : (l.source.id || l.source);
                d3NodeElements.filter(n => n.id === otherNodeId).classed('dimmed', false).classed('highlight', true).raise();
            });
    }

    function d3NodeMouseOut(event, d_node_data) {
        if (!d3NodeElements || !d3LinkElements) return;
        d3NodeElements.classed('dimmed', false).classed('highlight', false);
        d3LinkElements.classed('dimmed', false).style('stroke-opacity', 0.6)
            .attr('stroke', d => d.type === 'tag-tag' ? 'var(--d3-link-tag-tag-color)' : '#555')
            .attr('stroke-width', d => d.type === 'tag-tag' ? 1.2 : Math.max(1, Math.sqrt(d.value || 1) * 1.5));
        applyD3FiltersAndSearch(); 
    }

    function d3Drag(simulation) {
        function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; if(d3GraphContainer && d3GraphContainer.contains(event.sourceEvent.target)) d3GraphContainer.classList.add('grabbing'); if(neighborVisSvgContainer && neighborVisSvgContainer.contains(event.sourceEvent.target)) neighborVisSvgContainer.classList.add('grabbing'); }
        function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
        function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; if(d3GraphContainer) d3GraphContainer.classList.remove('grabbing'); if(neighborVisSvgContainer) neighborVisSvgContainer.classList.remove('grabbing');}
        return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    function updateD3SimulationParameters() {
        if (!d3Simulation) return;
        d3Simulation.force("link").distance(parseFloat(d3LinkDistanceSlider.value)).strength(parseFloat(d3LinkStrengthSlider.value));
        d3Simulation.force("charge").strength(parseFloat(d3ChargeStrengthSlider.value));
        d3Simulation.force("collide").radius(d => getD3NodeRadius(d) + 6);
        if (d3NodeElements) {
            d3NodeElements.selectAll('circle').transition().duration(200).attr('r', d => getD3NodeRadius(d));
            d3NodeElements.selectAll('text').transition().duration(200).attr("dy", d => getD3NodeRadius(d) + 10);
        }
        d3Simulation.alpha(0.3).restart();
    }

    function getNDegreeNeighbors(centralNodeId, maxDepth, graphData) {
        const neighborsByDepth = {}; for (let i = 1; i <= maxDepth; i++) neighborsByDepth[i] = [];
        const queue = [{ nodeId: centralNodeId, depth: 0 }]; const visitedDepths = new Map(); 
        visitedDepths.set(centralNodeId, 0); let head = 0;
        while(head < queue.length) {
            const { nodeId: currentId, depth: currentDepth } = queue[head++];
            graphData.links.forEach(link => {
                const sourceId = link.source.id || link.source; const targetId = link.target.id || link.target;
                let neighborId = null;
                if (sourceId === currentId) neighborId = targetId; else if (targetId === currentId) neighborId = sourceId;
                if (neighborId) {
                    const newDepth = currentDepth + 1;
                    if (newDepth <= maxDepth) {
                        if (!visitedDepths.has(neighborId) || visitedDepths.get(neighborId) > newDepth) { 
                            visitedDepths.set(neighborId, newDepth);
                            const neighborNodeData = graphData.nodes.find(n => n.id === neighborId);
                            if (neighborNodeData) {
                                neighborsByDepth[newDepth].push(neighborNodeData); 
                                if (newDepth < maxDepth) queue.push({ nodeId: neighborId, depth: newDepth });
                            }
                        }
                    }
                }
            });
        }
        for (let i = 1; i <= maxDepth; i++) {
            if (neighborsByDepth[i].length > 0) {
                const uniqueNodes = new Map();
                neighborsByDepth[i].forEach(node => uniqueNodes.set(node.id, node));
                neighborsByDepth[i] = Array.from(uniqueNodes.values());
            }
        }
        return neighborsByDepth;
    }

    function getEgoNetworkData(centralNodeId, maxDepth, fullGraphData) {
        const egoNodesSet = new Set(); 
        const egoLinks = [];
        
        const centralNodeObject = fullGraphData.nodes.find(n => n.id === centralNodeId);
        if (!centralNodeObject) {
            console.error("Central node not found for ego network.");
            return { nodes: [], links: [] };
        }
        
        const queue = [{ nodeId: centralNodeId, depth: 0 }];
        const visited = new Map(); 
        visited.set(centralNodeId, 0);
        egoNodesSet.add(centralNodeId);

        let head = 0;
        while(head < queue.length) {
            const { nodeId: currentId, depth: currentDepth } = queue[head++];

            if (currentDepth >= maxDepth) continue;

            fullGraphData.links.forEach(link => {
                const sourceId = link.source.id || link.source;
                const targetId = link.target.id || link.target;
                let neighborId = null;

                if (sourceId === currentId) neighborId = targetId;
                else if (targetId === currentId) neighborId = sourceId;

                if (neighborId && (!visited.has(neighborId) || visited.get(neighborId) > currentDepth + 1) ) {
                    visited.set(neighborId, currentDepth + 1);
                    egoNodesSet.add(neighborId);
                    queue.push({ nodeId: neighborId, depth: currentDepth + 1 });
                }
            });
        }

        const finalEgoNodes = [];
        egoNodesSet.forEach(nodeId => {
            const node = fullGraphData.nodes.find(n => n.id === nodeId);
            if (node) finalEgoNodes.push({ ...node }); 
        });
        
        fullGraphData.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            if (egoNodesSet.has(sourceId) && egoNodesSet.has(targetId)) {
                egoLinks.push({ 
                    source: sourceId, 
                    target: targetId,
                    value: link.value || 1, 
                    type: link.type || 'unknown' 
                });
            }
        });
        
        return { nodes: finalEgoNodes, links: egoLinks };
    }

    function setupNeighborVisFilters(nodesForFilterGeneration) {
        if (!neighborVisFilterContainer) return;
        neighborVisFilterContainer.innerHTML = '';
        activeNeighborVisFilters.clear(); 

        const categoriesInView = new Set();
        nodesForFilterGeneration.forEach(node => {
            categoriesInView.add(node.category || 'uncategorized');
        });

        Array.from(categoriesInView).sort().forEach(catKey => {
            activeNeighborVisFilters.add(catKey); 
            const btn = document.createElement('button');
            btn.classList.add('d3-category-button', 'active'); 
            btn.dataset.category = catKey;
            btn.textContent = catKey;

            if (catKey === 'course') {
                btn.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--d3-color-course');
                btn.style.color = 'white';
            } else {
                const bgColorVar = `--d3-tag-cat-${catKey}-bg`;
                const borderColorVar = `--d3-tag-cat-${catKey}-border`;
                const finalBgColor = getComputedStyle(document.documentElement).getPropertyValue(bgColorVar) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-bg');
                btn.style.backgroundColor = finalBgColor;
                btn.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue(borderColorVar) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-border');
                btn.style.color = isColorDark(finalBgColor.trim()) ? 'white' : 'black';
            }
            
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const category = this.dataset.category;
                if (this.classList.contains('active')) {
                    activeNeighborVisFilters.add(category);
                    if (category === 'course') {
                        this.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--d3-color-course');
                        this.style.color = 'white';
                    } else {
                        const bgColorVar = `--d3-tag-cat-${category}-bg`;
                        const finalBgColor = getComputedStyle(document.documentElement).getPropertyValue(bgColorVar) || getComputedStyle(document.documentElement).getPropertyValue('--d3-color-uncategorized-bg');
                        this.style.backgroundColor = finalBgColor;
                        this.style.color = isColorDark(finalBgColor.trim()) ? 'white' : 'black';
                    }
                } else {
                    activeNeighborVisFilters.delete(category);
                    this.style.backgroundColor = '#fff'; 
                    this.style.color = 'black';
                }
                renderCurrentNeighborView(); 
            });
            neighborVisFilterContainer.appendChild(btn);
        });
    }

    function renderCurrentNeighborView() {
        if (!currentCentralNodeForNeighborVis || !currentNeighborViewRawData) return;

        const centralNode = currentCentralNodeForNeighborVis;
        let displayNodes, displayLinks;

        if (neighborVisNetworkLayoutToggle && neighborVisNetworkLayoutToggle.checked) {
            displayNodes = currentNeighborViewRawData.egoGraph.nodes.filter(n => 
                activeNeighborVisFilters.has(n.category) || n.id === centralNode.id // Always include central node
            );
            const displayNodeIds = new Set(displayNodes.map(n => n.id));
            displayLinks = currentNeighborViewRawData.egoGraph.links.filter(l => {
                const sourceId = l.source.id || l.source;
                const targetId = l.target.id || l.target;
                return displayNodeIds.has(sourceId) && displayNodeIds.has(targetId);
            });
            drawNeighborNetworkLayout(centralNode, { nodes: displayNodes, links: displayLinks });
        } else {
            // For concentric, use its specific drawing function with filters
            drawNeighborConcentricLayout(centralNode, currentNeighborViewRawData.concentricData, activeNeighborVisFilters);
        }
    }
    
    function prepareAndDisplayNeighborView() {
        if (!currentCentralNodeForNeighborVis || !currentD3GraphData || !currentD3GraphData.nodes || !currentD3GraphData.links) {
            alert("Central node or graph data unavailable for neighbor view.");
            if(neighborVisSvgContainer) neighborVisSvgContainer.innerHTML = "<p style='text-align:center;'>Data error.</p>";
            return;
        }

        const centralNode = currentCentralNodeForNeighborVis;
        const maxDepth = parseInt(neighborVisDepthSelect.value);

        if (neighborVisTitle) neighborVisTitle.textContent = `Local Network for: ${centralNode.displayName || centralNode.name}`;
        
        currentNeighborViewRawData.egoGraph = getEgoNetworkData(centralNode.id, maxDepth, currentD3GraphData);
        currentNeighborViewRawData.concentricData = getNDegreeNeighbors(centralNode.id, maxDepth, currentD3GraphData);
        
        // Use all nodes from the ego graph for this depth to populate filter buttons
        // ensuring all potential categories in the N-degree neighborhood are available
        setupNeighborVisFilters(currentNeighborViewRawData.egoGraph.nodes);
        
        renderCurrentNeighborView();
    }
    
    function drawNeighborNetworkLayout(centralNodeData, egoGraphData) {
        if (!neighborVisSvgContainer) return;
        neighborVisSvgContainer.innerHTML = ''; 
        if (d3NeighborSimulation) d3NeighborSimulation.stop();

        const containerRect = neighborVisSvgContainer.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;

        if (width === 0 || height === 0 || !egoGraphData || egoGraphData.nodes.length === 0) {
            neighborVisSvgContainer.innerHTML = "<p style='text-align:center; padding: 20px;'>Not enough data or container not ready for network layout.</p>";
            return;
        }

        const svgRoot = d3.select(neighborVisSvgContainer)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);
        
        const svg = svgRoot.append("g");

        const zoom = d3.zoom().on("zoom", (event) => {
            svg.attr("transform", event.transform);
        });
        svgRoot.call(zoom);

        d3NeighborSimulation = d3.forceSimulation(egoGraphData.nodes)
            .force("link", d3.forceLink(egoGraphData.links).id(d => d.id)
                .distance(80).strength(0.2))
            .force("charge", d3.forceManyBody().strength(-250))
            .force("center", d3.forceCenter(0,0))
            .force("collide", d3.forceCollide().radius(d => getD3NodeRadius(d) + 5).strength(0.7));

        const linkElements = svg.append("g")
            .attr("class", "d3-links")
            .selectAll("line")
            .data(egoGraphData.links)
            .join("line")
            .attr("class", d => d.type === 'tag-tag' ? "d3-link d3-link-tag-tag" : "d3-link d3-link-course-tag")
            .attr("stroke-width", d => d.type === 'tag-tag' ? 1 : Math.max(0.8, Math.sqrt(d.value || 1) * 1.2))
            .attr("stroke", d => d.type === 'tag-tag' ? 'var(--d3-link-tag-tag-color)' : '#777');

        const nodeElements = svg.append("g")
            .attr("class", "d3-nodes")
            .selectAll("g.d3-node")
            .data(egoGraphData.nodes, d => d.id)
            .join("g")
            .attr("class", d => `d3-node type-${d.type} category-${d.category}${d.id === centralNodeData.id ? ' central-ego-node' : ''}`)
            .call(d3Drag(d3NeighborSimulation));

        nodeElements.append("circle")
            .attr("r", d => getD3NodeRadius(d))
            .attr("fill", d => getD3NodeColor(d))
            .attr("stroke", d => d.id === centralNodeData.id ? 'gold' : getD3NodeBorderColor(d))
            .attr("stroke-width", d => d.id === centralNodeData.id ? 3 : 1.5);

        nodeElements.append("text")
            .text(d => d.displayName ? d.displayName.split(':')[0] : d.name)
            .attr("dy", d => getD3NodeRadius(d) + 9)
            .attr("text-anchor", "middle")
            .style("font-size", "9px") 
            .style("paint-order", "stroke")
            .style("stroke", "var(--neo-bg)")
            .style("stroke-width", "2.5px")
            .style("fill", "var(--neo-text)");

        nodeElements.append("title").text(d => `${d.displayName || d.name}\nType: ${d.type}\nCategory: ${d.category || 'N/A'}`);

        d3NeighborSimulation.on("tick", () => {
            linkElements
                .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            nodeElements
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    function drawNeighborConcentricLayout(centralNodeData, neighborsByDepth, activeFilters) {
        if (!neighborVisSvgContainer) return;
        neighborVisSvgContainer.innerHTML = ''; 
        if (d3NeighborSimulation) {
             d3NeighborSimulation.stop();
             d3NeighborSimulation = null;
        }
        
        const containerRect = neighborVisSvgContainer.getBoundingClientRect();
        const width = containerRect.width; const height = containerRect.height;
        if (width === 0 || height === 0) {
            neighborVisSvgContainer.innerHTML = "<p style='text-align:center; padding: 20px;'>Error: Container not ready.</p>"; return;
        }
        const svg = d3.select(neighborVisSvgContainer).append("svg").attr("width", width).attr("height", height);
        const cx = width / 2; const cy = height / 2;
        const maxDepthVisible = parseInt(neighborVisDepthSelect.value);
        const baseRadiusStep = Math.min(width, height) / (2 * (maxDepthVisible + 2.5)); 
        const centralNodeRadius = Math.max(12, baseRadiusStep * 0.3); 
        const neighborNodeRadius = Math.max(6, baseRadiusStep * 0.18);

        for (let i = 1; i <= maxDepthVisible; i++) {
            svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", i * baseRadiusStep + centralNodeRadius * 0.5) 
                .style("fill", "none").style("stroke", "#ccc").style("stroke-dasharray", "2,2");
        }
        
        const centralG = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);
        centralG.append("circle").attr("r", centralNodeRadius).style("fill", getD3NodeColor(centralNodeData))
            .style("stroke", getD3NodeBorderColor(centralNodeData)).style("stroke-width", 2);
        centralG.append("text").text(centralNodeData.displayName ? centralNodeData.displayName.split(':')[0] : centralNodeData.name)
            .attr("dy", centralNodeRadius + 12).attr("text-anchor", "middle").style("font-size", "10px");
        centralG.append("title").text(`${centralNodeData.displayName || centralNodeData.name}\nType: ${centralNodeData.type}\nCategory: ${centralNodeData.category || 'N/A'}`);
        
        let ringAngleOffset = -Math.PI / 2; 
        for (let depth = 1; depth <= maxDepthVisible; depth++) {
            const nodesAtThisDepthRaw = neighborsByDepth[depth] || [];
            const nodesAtThisDepthFiltered = nodesAtThisDepthRaw.filter(node => 
                activeFilters.has(node.category)
            );

            if (nodesAtThisDepthFiltered.length === 0) continue;
            
            const ringRadius = depth * baseRadiusStep + centralNodeRadius * 0.5; 
            const angleStep = (2 * Math.PI) / nodesAtThisDepthFiltered.length;

            nodesAtThisDepthFiltered.forEach((node, i) => {
                const angle = i * angleStep + ringAngleOffset + ( (depth % 2 === 0) ? angleStep / 2 : 0 ); 
                const nx = cx + ringRadius * Math.cos(angle); const ny = cy + ringRadius * Math.sin(angle);
                const nodeG = svg.append("g").attr("transform", `translate(${nx}, ${ny})`);
                nodeG.append("circle").attr("r", neighborNodeRadius).style("fill", getD3NodeColor(node))
                    .style("stroke", getD3NodeBorderColor(node)).style("stroke-width", 1.5);
                const labelText = node.displayName ? node.displayName.split(':')[0] : node.name;
                if (nodesAtThisDepthFiltered.length < 20 || neighborNodeRadius > 5) { 
                    nodeG.append("text").text(labelText.substring(0,12) + (labelText.length > 12 ? "..." : ""))
                        .attr("dy", neighborNodeRadius + 9).attr("text-anchor", "middle").style("font-size", "8px");
                }
                nodeG.append("title").text(`${node.displayName || node.name}\nType: ${node.type}\nCategory: ${node.category || 'N/A'}`);
            });
            ringAngleOffset += (Math.PI / (4 + depth*2) ) ; 
        }
    }

    // Event Listeners
    if (viewTagNetworkButton) {
        viewTagNetworkButton.addEventListener('click', () => initializeAndDisplayD3TagNetwork());
    }
    if (d3CloseTagNetworkModalButton) {
        d3CloseTagNetworkModalButton.onclick = () => {
            if (d3TagNetworkModal) d3TagNetworkModal.style.display = 'none';
            if (d3Simulation) d3Simulation.stop();
            if (d3GraphContainer) d3GraphContainer.innerHTML = '';
            if(calculatingMetricsMessage) calculatingMetricsMessage.style.display = 'none';
            if(calculateMetricsButton) calculateMetricsButton.disabled = true;
        };
    }
    if (d3ToggleTagLinksCheckbox) {
        d3ToggleTagLinksCheckbox.addEventListener('change', function() {
            if (d3MinCooccurrenceInput) d3MinCooccurrenceInput.disabled = !this.checked;
            networkMetricsCalculated = false; 
            if (networkMetricsModal.style.display === 'block') { 
                closeNetworkMetricsModalButton.click();
            }
            initializeAndDisplayD3TagNetwork(); 
        });
    }
    if (d3MinCooccurrenceInput) {
        d3MinCooccurrenceInput.addEventListener('change', () => {
            if (d3ToggleTagLinksCheckbox && d3ToggleTagLinksCheckbox.checked) {
                networkMetricsCalculated = false; 
                 if (networkMetricsModal.style.display === 'block') { 
                    closeNetworkMetricsModalButton.click();
                }
                initializeAndDisplayD3TagNetwork(); 
            }
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (d3TagNetworkModal && d3TagNetworkModal.style.display === 'block' && d3CloseTagNetworkModalButton) d3CloseTagNetworkModalButton.click();
            if (d3NodePopup && d3NodePopup.classList.contains('visible') && d3ClosePopupButton) d3ClosePopupButton.click();
            if (d3InfoModalOverlay && d3InfoModalOverlay.classList.contains('visible') && d3CloseInfoModalButton) d3CloseInfoModalButton.click();
            if (neighborVisModal && neighborVisModal.style.display === 'block' && closeNeighborVisModalButton) closeNeighborVisModalButton.click();
            if (networkMetricsModal && networkMetricsModal.style.display === 'block' && closeNetworkMetricsModalButton) closeNetworkMetricsModalButton.click();
        }
    });

    if (d3SearchButton) d3SearchButton.addEventListener('click', applyD3FiltersAndSearch);
    if (d3SearchInput) d3SearchInput.addEventListener('keyup', (event) => { if (event.key === 'Enter' || !d3SearchInput.value) applyD3FiltersAndSearch(); });
    [d3LinkDistanceSlider, d3ChargeStrengthSlider, d3NodeSizeFactorSlider, d3LinkStrengthSlider].forEach(slider => {
        if (slider) slider.addEventListener('input', updateD3SimulationParameters);
    });
    if (d3ResetViewButton) d3ResetViewButton.addEventListener('click', () => {
        if (d3LinkDistanceSlider) d3LinkDistanceSlider.value = 100; if (d3ChargeStrengthSlider) d3ChargeStrengthSlider.value = -300;
        if (d3NodeSizeFactorSlider) d3NodeSizeFactorSlider.value = 1; if (d3LinkStrengthSlider) d3LinkStrengthSlider.value = 0.3;
        if (d3ToggleTagLinksCheckbox) { 
            d3ToggleTagLinksCheckbox.checked = false;
            if(d3MinCooccurrenceInput) d3MinCooccurrenceInput.disabled = true;
            d3MinCooccurrenceInput.value = 2;
        }
        initializeAndDisplayD3TagNetwork(); 

        if (d3SearchInput) d3SearchInput.value = '';
        document.querySelectorAll('.d3-category-button').forEach(btn => { if (!btn.classList.contains('active')) btn.click(); });
        if (d3Svg && d3.zoom && d3GraphContainer.querySelector('svg')) d3.select(d3GraphContainer.querySelector('svg')).transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
        if (d3NodePopup && d3NodePopup.classList.contains('visible')) d3NodePopup.classList.remove('visible');
    });
    if (d3RefreshGraphButton) d3RefreshGraphButton.addEventListener('click', () => initializeAndDisplayD3TagNetwork());
    if (d3InfoButton) d3InfoButton.addEventListener('click', () => d3InfoModalOverlay && d3InfoModalOverlay.classList.add('visible'));
    if (d3CloseInfoModalButton) d3CloseInfoModalButton.addEventListener('click', () => d3InfoModalOverlay && d3InfoModalOverlay.classList.remove('visible'));
    if (d3InfoModalOverlay) d3InfoModalOverlay.addEventListener('click', (e) => { if (e.target === d3InfoModalOverlay) d3InfoModalOverlay.classList.remove('visible'); });
    if (d3ClosePopupButton) d3ClosePopupButton.addEventListener('click', () => d3NodePopup && d3NodePopup.classList.remove('visible'));
    if (d3NodePopup) d3NodePopup.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (event) => { 
        if (d3NodePopup && d3NodePopup.classList.contains('visible') && !d3NodePopup.contains(event.target)) {
            let targetIsNodeOrChild = false;
            if (d3NodeElements) d3NodeElements.each(function() { if (this.contains(event.target)) targetIsNodeOrChild = true; });
            if (d3ShowNeighborGraphButton && d3ShowNeighborGraphButton.contains(event.target)) targetIsNodeOrChild = true; 
            if (!targetIsNodeOrChild) d3NodePopup.classList.remove('visible');
        }
    });

    if (d3ShowNeighborGraphButton) d3ShowNeighborGraphButton.addEventListener('click', () => {
        if (!currentCentralNodeForNeighborVis || !currentD3GraphData || !currentD3GraphData.nodes || !currentD3GraphData.links) { 
            alert("Central node or graph data unavailable."); return; 
        }
        if (neighborVisModal) neighborVisModal.style.display = 'block';
        if (d3NodePopup) d3NodePopup.classList.remove('visible');
        
        requestAnimationFrame(() => prepareAndDisplayNeighborView()); 
    });

    if (neighborVisDepthSelect) neighborVisDepthSelect.addEventListener('change', () => {
        if (neighborVisModal && neighborVisModal.style.display === 'block' && currentCentralNodeForNeighborVis) {
            prepareAndDisplayNeighborView();
        }
    });
    
    if (neighborVisNetworkLayoutToggle) {
        neighborVisNetworkLayoutToggle.addEventListener('change', () => {
            if (neighborVisModal && neighborVisModal.style.display === 'block' && currentCentralNodeForNeighborVis) {
                renderCurrentNeighborView(); 
            }
        });
    }
    
    if (neighborVisResetFiltersButton) {
        neighborVisResetFiltersButton.addEventListener('click', () => {
            if (currentNeighborViewRawData.egoGraph.nodes.length > 0) {
                setupNeighborVisFilters(currentNeighborViewRawData.egoGraph.nodes);
                renderCurrentNeighborView();
            }
        });
    }

    if (closeNeighborVisModalButton) closeNeighborVisModalButton.onclick = () => {
        if (neighborVisModal) neighborVisModal.style.display = 'none';
        if (neighborVisSvgContainer) neighborVisSvgContainer.innerHTML = '';
        if (d3NeighborSimulation) {
            d3NeighborSimulation.stop();
            d3NeighborSimulation = null;
        }
    };

    if (importTagsButton) importTagsButton.addEventListener('click', () => {
        if (tagImportFileInput) tagImportFileInput.value = ''; if (tagImportTextarea) tagImportTextarea.value = '';
        if (importTagsStatusDiv) importTagsStatusDiv.innerHTML = 'Import status will appear here.';
        if (importTagsModal) importTagsModal.style.display = 'block';
    });
    if (closeImportTagsModalButton) closeImportTagsModalButton.onclick = () => { if (importTagsModal) importTagsModal.style.display = 'none'; };
    if (processTagImportButton) processTagImportButton.addEventListener('click', async () => {
        let csvData = tagImportTextarea.value.trim(); const file = tagImportFileInput.files[0];
        let statusMessages = []; let coursesUpdatedCount = 0; let tagsAddedCount = 0; let errorsCount = 0;
        if (file) { try { csvData = await file.text(); statusMessages.push(`Processing file: ${file.name}`); } catch (err) { statusMessages.push(`Error reading file: ${err.message}`); importTagsStatusDiv.innerHTML = statusMessages.join('<br>'); return; } }
        else if (!csvData) { statusMessages.push('No data provided.'); importTagsStatusDiv.innerHTML = statusMessages.join('<br>'); return; }
        const lines = csvData.split(/\r?\n/); const updatedCourseIds = new Set();
        lines.forEach((line, index) => {
            if (!line.trim() || index === 0 && line.toLowerCase().startsWith("coursecode,")) return;
            const parts = line.split(',');
            if (parts.length < 2 || parts.length > 3) { statusMessages.push(`Error line ${index + 1}: Invalid format. Expected CourseCode,Tag[,Category]. Found: "${line}"`); errorsCount++; return; }
            const courseCode = parts[0].trim(); const rawTag = parts[1].trim(); const rawCategory = (parts.length === 3 && parts[2] && parts[2].trim()) ? parts[2].trim().toLowerCase() : null;
            if (!courseCode || !rawTag) { statusMessages.push(`Error line ${index + 1}: CourseCode or Tag empty. Line: "${line}"`); errorsCount++; return; }
            const course = coursesData.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
            if (!course) { statusMessages.push(`Warning line ${index + 1}: Course "${courseCode}" not found.`); errorsCount++; return; }
            course.tags = course.tags || []; const normalizedTag = rawTag.toLowerCase();
            if (!course.tags.some(t => t.toLowerCase() === normalizedTag)) { course.tags.push(rawTag); tagsAddedCount++; updatedCourseIds.add(course.id); }
            if (!tagToCategoryMap[normalizedTag]) {
                let assignedCategory = 'uncategorized';
                if (rawCategory && (globalTagCategoryStyles[rawCategory] || rawCategory === 'uncategorized')) assignedCategory = rawCategory;
                else if (rawCategory) statusMessages.push(`Warning for "${rawTag}": Category "${parts[2].trim()}" unrecognized. Defaulted 'uncategorized'.`);
                tagToCategoryMap[normalizedTag] = assignedCategory;
            } else if (rawCategory && tagToCategoryMap[normalizedTag] !== rawCategory && (globalTagCategoryStyles[rawCategory] || rawCategory === 'uncategorized')) {
                statusMessages.push(`Info for "${rawTag}": CSV suggested "${parts[2].trim()}", but already "${tagToCategoryMap[normalizedTag]}". No change.`);
            }
        });
        coursesUpdatedCount = updatedCourseIds.size; const processedLines = lines.filter(l => l.trim() && !(l.toLowerCase().startsWith("coursecode,"))).length;
        statusMessages.unshift(`<b>Import Summary:</b><br> - Lines processed: ${processedLines}<br> - Tags added: ${tagsAddedCount}<br> - Courses updated: ${coursesUpdatedCount}<br> - Errors: ${errorsCount}`);
        if(importTagsStatusDiv) importTagsStatusDiv.innerHTML = statusMessages.join('<br>');
        if (tagsAddedCount > 0 || (processedLines > 0 && errorsCount === 0)) populateAllCourses();
    });

    if(closeCompareModalButton) closeCompareModalButton.onclick = () => syllabusModal.style.display = 'none';
    const originalWindowOnClick = window.onclick;
    window.onclick = (event) => {
        if (originalWindowOnClick) originalWindowOnClick(event);
        if (event.target == syllabusModal && syllabusModal) syllabusModal.style.display = 'none';
        if (event.target == editCourseModal && editCourseModal) editCourseModal.style.display = 'none';
        if (event.target == workloadModal && workloadModal) workloadModal.style.display = 'none';
        if (event.target == importTagsModal && importTagsModal) importTagsModal.style.display = 'none';
        if (event.target == d3TagNetworkModal && d3TagNetworkModal && d3CloseTagNetworkModalButton) d3CloseTagNetworkModalButton.click();
        if (event.target == neighborVisModal && neighborVisModal && closeNeighborVisModalButton) closeNeighborVisModalButton.click();
        if (event.target == networkMetricsModal && networkMetricsModal && closeNetworkMetricsModalButton) closeNetworkMetricsModalButton.click();
    };

    // Initial setup
    if(searchInput) searchInput.addEventListener('input', populateAllCourses);
    if (d3MinCooccurrenceInput && d3ToggleTagLinksCheckbox) d3MinCooccurrenceInput.disabled = !d3ToggleTagLinksCheckbox.checked;

    initializeD3NetworkColorPalette();
    initializeTagSystem();
    populateAllCourses();
    updateComparisonCount();
});