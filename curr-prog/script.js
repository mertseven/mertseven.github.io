document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (sidebar && sidebarToggle) {
        // Initialize toggle button state based on sidebar's actual initial state
        if (sidebar.classList.contains('expanded')) {
            sidebarToggle.textContent = '✕';
            sidebarToggle.style.backgroundColor = '#c0392b';
        } else {
            sidebarToggle.textContent = '☰';
            sidebarToggle.style.backgroundColor = '#3498db';
        }

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            if (sidebar.classList.contains('expanded')) {
                sidebarToggle.textContent = '✕';
                sidebarToggle.style.backgroundColor = '#c0392b';
            } else {
                sidebarToggle.textContent = '☰';
                sidebarToggle.style.backgroundColor = '#3498db';
            }
        });
    }

    const curriculumLayout = document.getElementById('curriculum-layout');
    const colorPicker = document.getElementById('courseColor');
    const tagInput = document.getElementById('courseTagsInput');
    const addTagButton = document.getElementById('addTagButton');
    const compareButton = document.getElementById('compareButton');
    const comparisonCountSpan = document.getElementById('comparisonCount');
    const searchInput = document.getElementById('searchInput');

    const newCourseCodeInput = document.getElementById('newCourseCode');
    const newCourseNameInput = document.getElementById('newCourseName');
    const newCourseEctsInput = document.getElementById('newCourseEcts');
    const newCourseHoursInput = document.getElementById('newCourseHours');
    const newCourseLecturerInput = document.getElementById('newCourseLecturer');
    const newCourseSyllabusInput = document.getElementById('newCourseSyllabus');
    const addNewCourseButton = document.getElementById('addNewCourseButton');

    const editCourseButton = document.getElementById('editCourseButton');
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

    // --- YOUR UPDATED coursesData ARRAY ---
    let coursesData = [
        // SEMESTER 1
        { id: 'comm1120', code: 'COMM 1120', name: 'SOCIAL THEORY', syllabus: '', color: '#FFFFE0', tags: [], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-1' },
        { id: 'comm1130', code: 'COMM 1130', name: 'VISUAL CULTURE', syllabus: '', color: '#FFFFE0', tags: [], ects: 6, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-1' },
        { id: 'med1115', code: 'NMED 1115', name: 'NEW MEDIA AND COMMUNICATION TECHNOLOGIES', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+2P", lecturer: "Mert Seven", category: 'category-semester-1' },
        { id: 'vcds2107', code: 'VCDS 2107', name: 'PHOTOGRAPHY', syllabus: '', color: '#70FFE7', tags: [], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-1' },
        { id: 'trk1110', code: 'TRK 1110', name: 'TURKISH I', syllabus: '', color: '#E0E8FF', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-1' },
        { id: 'sofl1101', code: 'SOFL 1101', name: 'ACADEMIC ENGLISH I', syllabus: '', color: '#E0E8FF', tags: [], ects: 4, hours: "4T+0P", lecturer: "SOFL", category: 'category-semester-1' },
        { id: 'ufmdxxxx_dt', code: 'UFMD XXXX', name: 'DESIGN THINKING', syllabus: '', color: '#FFDACD', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-1' },

        // SEMESTER 2
        { id: 'comm1110', code: 'COMM 11XX', name: 'COMMUNICATION AND MEDIA THEORIES', syllabus: '', color: '#FFFFE0', tags: [], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-2' },
        { id: 'nmed1116', code: 'NMED 1116', name: 'MEDIA HISTORY', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-2' },
        { id: 'nmed1110', code: 'NMED 1110', name: 'COMPUTATIONAL THINKING', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+0P", lecturer: "Mert Seven", category: 'category-semester-2' },
        { id: 'nmed1118', code: 'NMED 1118', name: 'DIGITAL VISUALIZATION', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-2' },
        { id: 'sofl1102', code: 'SOFL 1102', name: 'ACADEMIC ENGLISH II', syllabus: '', color: '#E0E8FF', tags: [], ects: 4, hours: "4T+0P", lecturer: "SOFL", category: 'category-semester-2' },
        { id: 'trk1210', code: 'TRK 1210', name: 'TURKISH II', syllabus: '', color: '#E0E8FF', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },
        { id: 'ufmd_g', code: 'UFMD XXXX', name: 'GİRİŞİMCİLİK (Entrepreneurship)', syllabus: '', color: '#FFDACD', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },
        { id: 'ufmd_ad', code: 'UFMD XXXX', name: 'ANALİTİK DÜŞÜNME (Analytical Thinking)', syllabus: '', color: '#FFDACD', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-2' },

        // SEMESTER 3
        { id: 'comm1140', code: 'COMM 11XX', name: 'HISTORY OF CIVILIZATION', syllabus: '', color: '#FFFFE0', tags: [], ects: 5, hours: "3T+0P", lecturer: "Güven Selçuk", category: 'category-semester-3' },
        { id: 'nmed2115', code: 'NMED 2115', name: 'USER EXPERIENCE DESIGN', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "2T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-3' },
        { id: 'nmed2117', code: 'NMED 2117', name: 'VIDEO NARRATIVES I', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-3' },
        { id: 'nmed2105', code: 'NMED 2105', name: 'BASIC DESIGN FOR DIGITAL ENVIRONMENT', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "4T+2P", lecturer: "Ayça Durmaz", category: 'category-semester-3' },
        { id: 'creative_comm', code: 'NMED XXXX', name: 'CREATIVE COMM STRATEGIES', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+0P", lecturer: "Özlem Ozan", category: 'category-semester-3' },
        { id: 'hist1110', code: 'HIST 1110', name: 'PRINCIPLES OF ATATÜRK AND HISTORY OF REVOLUTION I', syllabus: '', color: '#E0E8FF', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-3' },
        { id: 'ufndxxxx_ebp', code: 'UFND XXXX', name: 'ENTREPRENEURSHIP AND BUSINESS PLANNING', syllabus: '', color: '#FFD700', tags: [], ects: 0, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-3' },
        { id: 'ufnd7010', code: 'UFND 7010', name: 'SOCIAL RESPONSIBILITY PROJECT', syllabus: '', color: '#FFD700', tags: [], ects: 1, hours: "0T+2P", lecturer: "ODL", category: 'category-semester-3' },

        // SEMESTER 4
        { id: 'comm1170', code: 'COMM 1170', name: 'İLETİŞİMDE HAK VE ÖZGÜRLÜKLER', syllabus: '', color: '#FFFFE0', tags: [], ects: 5, hours: "3T+0P", lecturer: "Gizem Kızıltunalı", category: 'category-semester-4' },
        { id: 'nmed2122', code: 'NMED 2122', name: 'VIDEO NARRATIVES II', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "2T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-4' },
        { id: 'nmed2124', code: 'NMED 2124', name: 'COMMUNICATION RESEARCH AND ETHICS', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "3T+2P", lecturer: "Özlem Ozan", category: 'category-semester-4' },
        { id: 'nmed2126', code: 'NMED 2126', name: 'WEB APPLICATIONS FOR NEW MEDIA', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "2T+2P", lecturer: "Mert Seven", category: 'category-semester-4' },
        { id: 'hist1210', code: 'HIST 1210', name: 'PRINCIPLES OF ATATÜRK AND HISTORY OF REVOLUTION II', syllabus: '', color: '#E0E8FF', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-4' },
        { id: 'uni_elective1', code: 'ÜNİVERSİTE SEÇMELİ I', name: 'UNIVERSITY ELECTIVE COURSE I', syllabus: '', color: '#90EE90', tags: [], ects: 5, hours: "3T+0P", lecturer: "UNI", category: 'category-semester-4' },

        // SEMESTER 5
        { id: 'comm1150', code: 'COMM 1150', name: 'JOURNALISM', syllabus: '', color: '#FFFFE0', tags: [], ects: 6, hours: "3T+0P", lecturer: "Mert Seven", category: 'category-semester-5' },
        { id: 'comm1160', code: 'COMM 1160', name: 'POLITICS, SOCIETY AND MEDIA IN TURKEY', syllabus: '', color: '#FFFFE0', tags: [], ects: 5, hours: "3T+0P", lecturer: "Sevda Alankuş", category: 'category-semester-5' },
        { id: 'nmed3129', code: 'NMED 3129', name: 'SOCIAL NETWORK MEDIA', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+2P", lecturer: "Özlem Ozan", category: 'category-semester-5' },
        { id: 'nmed3131', code: 'NMED 3131', name: 'MOBILE APPLICATIONS FOR NEW MEDIA', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "2T+2P", lecturer: "Mert Seven", category: 'category-semester-5' },
        { id: 'nmed3126', code: 'NMED 3126', name: 'SOCIAL MEDIA PLANNING', syllabus: '', color: '#FFFFFF', tags: [], ects: 5, hours: "3T+0P", lecturer: "Simge Gökbayrak", category: 'category-semester-5' },
        { id: 'uni_elective2', code: 'ÜNİVERSİTE SEÇMELİ II', name: 'UNIVERSITY ELECTIVE COURSES II', syllabus: '', color: '#90EE90', tags: [], ects: 5, hours: "3T+0P", lecturer: "UNI", category: 'category-semester-5' },

        // SEMESTER 6
        { id: 'nmed3128', code: 'NMED 3128', name: 'JOURNALISM STUDIO', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "4T+2P", lecturer: "Sevda Alankuş", category: 'category-semester-6' },
        { id: 'nmed3130', code: 'NMED 3130', name: 'DIGITAL STORYTELLING', syllabus: '', color: '#FFFFFF', tags: [], ects: 6, hours: "3T+2P", lecturer: "Simge Gökbayrak", category: 'category-semester-6' },
        { id: 'dept_elective1', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS I', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE I', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },
        { id: 'dept_elective2', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS II', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE II', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },
        { id: 'dept_elective3_s6', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS III', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE III', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-6' },

        // SEMESTER 7
        { id: 'nmed4111', code: 'NMED 4111', name: 'NEW MEDIA GRADUATION PROJECT I', syllabus: '', color: '#FFFFFF', tags: [], ects: 10, hours: "2T+4P", lecturer: "Özlem Ozan", category: 'category-semester-7' },
        { id: 'dept_elective3_s7', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS III', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE III', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'dept_elective4', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS IV', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE IV', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'dept_elective5', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS V', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE V', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-7' },
        { id: 'ufmd_cp', code: 'UFMD XXXX', name: 'KARİYER PLANLAMA (Career Planning)', syllabus: '', color: '#FFDACD', tags: [], ects: 2, hours: "2T+0P", lecturer: "ODL", category: 'category-semester-7' },

        // SEMESTER 8
        { id: 'nmed4112', code: 'NMED 4112', name: 'NEW MEDIA GRADUATION PROJECT II', syllabus: '', color: '#FFFFFF', tags: [], ects: 12, hours: "2T+4P", lecturer: "Özlem Ozan", category: 'category-semester-8' },
        { id: 'dept_elective6', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VI', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VI', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
        { id: 'dept_elective7', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VII', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VII', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
        { id: 'dept_elective8', code: 'BÖLÜM/FAKÜLTE SEÇMELİ DERS VIII', name: 'DEPARTMENT/FACULTY ELECTIVE COURSE VIII', syllabus: '', color: '#90EE90', tags: [], ects: 6, hours: "3T+0P", lecturer: "TBA", category: 'category-semester-8' },
    ];
    // --- END OF YOUR UPDATED coursesData ---

    let activeEditCourseEl = null;
    let coursesForComparison = [];
    const MAX_COMPARE_COURSES = 3;
    let draggedItem = null;
    let placeholder = null;
    let currentWorkloadData = null;

    // --- NEW HELPER: Determine Semester Type ---
    function getSemesterType(category) {
        if (!category || !category.startsWith('category-semester-')) {
            return "Uncategorized"; 
        }
        const semesterNumber = parseInt(category.split('-')[2], 10);
        if (isNaN(semesterNumber)) return "Uncategorized";

        if (semesterNumber % 2 !== 0) { 
            return "Fall";
        } else { 
            return "Spring";
        }
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
        const randomPart = Math.random().toString(36).substr(2, 5);
        const timestamp = Date.now().toString().slice(-5);
        return `course-${timestamp}-${randomPart}`;
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
        const parts = hoursString.toLowerCase().split('+');
        parts.forEach(part => {
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
                totalHours += num;
            }
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

        courseEl.appendChild(codeEl);
        courseEl.appendChild(nameEl);
        courseEl.appendChild(detailsEl);
        courseEl.appendChild(tagsEl);

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
            const matchesSearch = searchTerm === '' ||
                course.code.toLowerCase().includes(searchTerm) ||
                course.name.toLowerCase().includes(searchTerm) ||
                (course.lecturer && course.lecturer.toLowerCase().includes(searchTerm)) ||
                (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

            if (matchesSearch) {
                const courseEl = createCourseElement(course);
                const categoryZoneId = course.category || 'category-uncategorized';
                const targetList = document.querySelector(`#${categoryZoneId} .course-list`);
                if (targetList) {
                    targetList.appendChild(courseEl);
                } else {
                    console.warn(`Target list for category ${categoryZoneId} not found. Placing in uncategorized.`);
                    document.querySelector('#category-uncategorized .course-list').appendChild(courseEl);
                }
            }
        });

        if (activeEditCourseEl) {
            const newActiveEl = document.getElementById(activeEditCourseEl.id);
            if (newActiveEl) activeEditCourseEl = newActiveEl; else clearActiveEditCourse();
            if (activeEditCourseEl) activeEditCourseEl.classList.add('active-edit');
        }
        coursesForComparison = coursesForComparison.map(compareEl => {
            const newCompareEl = document.getElementById(compareEl.id);
            if (newCompareEl) {
                newCompareEl.classList.add('selected-compare');
                return newCompareEl;
            }
            return null;
        }).filter(el => el !== null);

        updateComparisonCount();
        calculateAndDisplaySemesterTotals();
    }

    function calculateAndDisplaySemesterTotals() {
        document.querySelectorAll('.category-zone').forEach(zone => {
            let totalEctsInZone = 0;
            const courseItemsInZone = zone.querySelectorAll('.course-list .course-item');
            courseItemsInZone.forEach(itemEl => {
                const courseData = findCourseDataById(itemEl.dataset.courseId);
                if (courseData && courseData.ects !== null) {
                    totalEctsInZone += parseInt(courseData.ects, 10) || 0;
                }
            });
            const totalEctsSpan = zone.querySelector('.semester-footer .total-ects');
            if (totalEctsSpan) {
                totalEctsSpan.textContent = totalEctsInZone;
            }
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
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        draggedItem = null;
        calculateAndDisplaySemesterTotals();
    }

    function getDragAfterElement(container, clientX) {
        const draggableElements = [...container.querySelectorAll('.course-item:not(.dragging):not(.drag-placeholder)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = clientX - box.left - (box.width / 2);
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetZoneList = e.target.closest('.course-list');
        if (targetZoneList && draggedItem) {
            const afterElement = getDragAfterElement(targetZoneList, e.clientX);
            if (placeholder.parentNode !== targetZoneList) {
                targetZoneList.appendChild(placeholder);
            }
            if (afterElement) {
                targetZoneList.insertBefore(placeholder, afterElement);
            } else {
                targetZoneList.appendChild(placeholder);
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetCourseList = e.target.closest('.course-list');
        const targetCategoryZone = e.target.closest('.category-zone');
        if (targetCourseList && draggedItem && targetCategoryZone) {
            if (placeholder && placeholder.parentNode) {
                targetCourseList.insertBefore(draggedItem, placeholder);
            } else {
                targetCourseList.appendChild(draggedItem);
            }
            const courseId = draggedItem.dataset.courseId;
            const newCategory = targetCategoryZone.id;
            updateCourseData(courseId, { category: newCategory });
        }
        handleDragEnd();
    }

    document.querySelectorAll('.category-zone .course-list').forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
    });
    document.addEventListener('dragend', handleDragEnd);

    function clearActiveEditCourse() {
        if (activeEditCourseEl) {
            activeEditCourseEl.classList.remove('active-edit');
        }
        activeEditCourseEl = null;
        editCourseButton.disabled = true;
        colorPicker.value = '#e0e0e0';
        tagInput.value = '';
    }

    function setActiveEditCourse(courseEl) {
        clearActiveEditCourse();
        activeEditCourseEl = courseEl;
        activeEditCourseEl.classList.add('active-edit');
        editCourseButton.disabled = false;
        const courseData = findCourseDataById(courseEl.dataset.courseId);
        if (courseData) {
            colorPicker.value = courseData.color || '#e0e0e0';
        }
    }

    function handleCourseClick(e) {
        const clickedCourseEl = this;
        if (e.ctrlKey || e.metaKey) {
            toggleCompareSelection(clickedCourseEl);
            if (activeEditCourseEl && activeEditCourseEl === clickedCourseEl && clickedCourseEl.classList.contains('selected-compare')) {
                clearActiveEditCourse();
            }
        } else {
            coursesForComparison.forEach(c => c.classList.remove('selected-compare'));
            coursesForComparison = [];
            updateComparisonCount();
            if (activeEditCourseEl === clickedCourseEl) {
            } else {
                setActiveEditCourse(clickedCourseEl);
            }
        }
    }

    colorPicker.addEventListener('input', (e) => {
        if (activeEditCourseEl) {
            activeEditCourseEl.style.backgroundColor = e.target.value;
            updateCourseData(activeEditCourseEl.dataset.courseId, { color: e.target.value });
        }
    });

    addTagButton.addEventListener('click', () => {
        if (activeEditCourseEl && tagInput.value.trim() !== '') {
            const courseId = activeEditCourseEl.dataset.courseId;
            const courseData = findCourseDataById(courseId);
            const newTag = tagInput.value.trim().toLowerCase();
            if (courseData && courseData.tags && !courseData.tags.includes(newTag)) {
                courseData.tags.push(newTag);
                renderTags(activeEditCourseEl.querySelector('.course-tags'), courseData.tags, courseId);
                tagInput.value = '';
            } else if (courseData && !courseData.tags) {
                courseData.tags = [newTag];
                renderTags(activeEditCourseEl.querySelector('.course-tags'), courseData.tags, courseId);
                tagInput.value = '';
            }
        }
    });

    function removeTagFromCourse(courseId, tagToRemove) {
        const courseData = findCourseDataById(courseId);
        if (courseData && courseData.tags) {
            courseData.tags = courseData.tags.filter(tag => tag !== tagToRemove);
            const courseEl = document.getElementById(courseId);
            if (courseEl) {
                renderTags(courseEl.querySelector('.course-tags'), courseData.tags, courseId);
            }
        }
    }

    addNewCourseButton.addEventListener('click', () => {
        const code = newCourseCodeInput.value.trim();
        const name = newCourseNameInput.value.trim();
        const ectsValue = newCourseEctsInput.value;
        const ects = ectsValue === '' ? null : parseInt(ectsValue, 10);
        const hours = newCourseHoursInput.value.trim();
        const lecturer = newCourseLecturerInput.value.trim() || null;
        const syllabus = newCourseSyllabusInput.value.trim();

        if (!code || !name) {
            alert('Course Code and Name are required.');
            return;
        }
        if (ectsValue !== '' && (isNaN(ects) || ects < 0)) {
            alert('Please enter a valid non-negative number for ECTS or leave it empty.');
            return;
        }

        const newCourse = {
            id: generateId(), code, name, syllabus,
            ects: ects, hours: hours, lecturer: lecturer,
            color: '#e0e0e0', tags: [],
            category: 'category-uncategorized'
        };
        coursesData.push(newCourse);
        populateAllCourses();

        newCourseCodeInput.value = ''; newCourseNameInput.value = '';
        newCourseEctsInput.value = ''; newCourseHoursInput.value = '';
        newCourseLecturerInput.value = '';
        newCourseSyllabusInput.value = '';
    });

    editCourseButton.addEventListener('click', () => {
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

    closeEditModalButton.onclick = () => editCourseModal.style.display = 'none';

    saveCourseChangesButton.addEventListener('click', () => {
        const id = editCourseIdInput.value;
        const ectsValue = editCourseEctsModalInput.value;
        const ects = ectsValue === '' ? null : parseInt(ectsValue, 10);

        if (ectsValue !== '' && (isNaN(ects) || ects < 0)) {
            alert('Please enter a valid non-negative number for ECTS or leave it empty.');
            return;
        }
        const updatedData = {
            code: editCourseCodeModalInput.value.trim(),
            name: editCourseNameModalInput.value.trim(),
            ects: ects,
            hours: editCourseHoursModalInput.value.trim(),
            lecturer: editCourseLecturerModalInput.value.trim() || null,
            syllabus: editCourseSyllabusModalInput.value.trim()
        };

        if (!updatedData.code || !updatedData.name) {
            alert('Course Code and Name cannot be empty.');
            return;
        }

        if (updateCourseData(id, updatedData)) {
            populateAllCourses();
        }
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
            } else {
                alert(`Max ${MAX_COMPARE_COURSES} courses for comparison.`);
            }
        }
        updateComparisonCount();
    }

    function updateComparisonCount() {
        comparisonCountSpan.textContent = coursesForComparison.length;
        compareButton.disabled = coursesForComparison.length < 2;
    }

    compareButton.addEventListener('click', () => {
        if (coursesForComparison.length < 2) return;
        displaySyllabiForComparison();
    });

    function displaySyllabiForComparison() {
        syllabusComparisonArea.innerHTML = '';
        coursesForComparison.forEach(courseEl => {
            const courseData = findCourseDataById(courseEl.dataset.courseId);
            if (courseData) {
                const column = document.createElement('div');
                column.classList.add('syllabus-column');
                const title = document.createElement('h4');
                title.textContent = `${courseData.code} - ${courseData.name}`;
                const syllabusText = document.createElement('pre');
                syllabusText.textContent = courseData.syllabus || 'No syllabus available.';
                column.appendChild(title);
                column.appendChild(syllabusText);
                syllabusComparisonArea.appendChild(column);
            }
        });
        syllabusModal.style.display = 'block';
    }

    // --- MODIFIED: calculateWorkload() for Fall/Spring ---
    function calculateWorkload() {
        const workload = {};
        coursesData.forEach(course => {
            const lecturerName = course.lecturer || "Unassigned";
            const courseHours = parseCourseHours(course.hours);
            const semesterType = getSemesterType(course.category); // Use helper

            if (!workload[lecturerName]) {
                workload[lecturerName] = {
                    fallTotalHours: 0,
                    springTotalHours: 0,
                    overallTotalHours: 0,
                    courses: []
                };
            }

            workload[lecturerName].courses.push({
                code: course.code,
                name: course.name,
                hours: course.hours,
                parsedHours: courseHours,
                semesterType: semesterType,
                category: course.category 
            });

            if (semesterType === "Fall") {
                workload[lecturerName].fallTotalHours += courseHours;
            } else if (semesterType === "Spring") {
                workload[lecturerName].springTotalHours += courseHours;
            }
            workload[lecturerName].overallTotalHours += courseHours;
        });

        for (const lecturer in workload) {
            workload[lecturer].courses.sort((a, b) => {
                const semA = parseInt(a.category?.split('-')[2] || 0);
                const semB = parseInt(b.category?.split('-')[2] || 0);
                if (semA !== semB) {
                    return semA - semB;
                }
                return a.code.localeCompare(b.code);
            });
        }
        return workload;
    }

    // --- MODIFIED: displayWorkloadTable() for Fall/Spring ---
    function displayWorkloadTable(workloadData) {
        currentWorkloadData = workloadData;
        workloadTableContainer.innerHTML = '';
        if (Object.keys(workloadData).length === 0) {
            workloadTableContainer.innerHTML = '<p>No workload data to display.</p>';
            exportWorkloadCsvButton.disabled = true;
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        ['Lecturer', 'Course Code', 'Course Name', 'Semester', 'Hours (Parsed)'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const sortedLecturers = Object.keys(workloadData).sort();

        sortedLecturers.forEach(lecturer => {
            const lecturerData = workloadData[lecturer];
            lecturerData.courses.forEach((course, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    const lecturerCell = document.createElement('td');
                    lecturerCell.textContent = lecturer;
                    lecturerCell.rowSpan = lecturerData.courses.length + 1;
                    row.appendChild(lecturerCell);
                }

                const codeCell = document.createElement('td');
                codeCell.textContent = course.code;
                row.appendChild(codeCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = course.name;
                row.appendChild(nameCell);

                const semesterTypeCell = document.createElement('td');
                semesterTypeCell.textContent = course.semesterType;
                row.appendChild(semesterTypeCell);

                const hoursParsedCell = document.createElement('td');
                hoursParsedCell.textContent = course.parsedHours;
                row.appendChild(hoursParsedCell);

                tbody.appendChild(row);
            });

            const totalRow = document.createElement('tr');
            totalRow.classList.add('lecturer-total-row');
            totalRow.innerHTML = `
                <td colspan="3" style="text-align: right; padding-right: 10px;">
                    Fall: ${lecturerData.fallTotalHours}h | 
                    Spring: ${lecturerData.springTotalHours}h | 
                    Overall:
                </td>
                <td><strong>${lecturerData.overallTotalHours}h</strong></td>
            `;
            tbody.appendChild(totalRow);
        });

        table.appendChild(tbody);
        workloadTableContainer.appendChild(table);
        exportWorkloadCsvButton.disabled = false;
    }

    if (viewWorkloadButton) {
        viewWorkloadButton.addEventListener('click', () => {
            const workloadData = calculateWorkload();
            displayWorkloadTable(workloadData);
            if (workloadModal) workloadModal.style.display = 'block';
        });
    }
    if (closeWorkloadModalButton) {
        closeWorkloadModalButton.onclick = () => {
            if (workloadModal) workloadModal.style.display = 'none';
        }
    }

    // --- MODIFIED: CSV Export for Fall/Spring Workload ---
    function exportToCsv(filename, rows) {
        const processRow = (row) => {
            let finalVal = '';
            for (let j = 0; j < row.length; j++) {
                let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
                if (String(row[j]).includes(',')) {
                    innerValue = '"' + innerValue.replace(/"/g, '""') + '"';
                }
                finalVal += innerValue + ',';
            }
            return finalVal.slice(0, -1) + '\r\n';
        };

        let csvFile = '';
        rows.forEach(row => {
            csvFile += processRow(row);
        });

        const blob = new Blob(["\uFEFF" + csvFile], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    if (exportWorkloadCsvButton) {
        exportWorkloadCsvButton.addEventListener('click', () => {
            if (!currentWorkloadData) {
                alert('Please generate the workload table first.');
                return;
            }
            const csvData = [];
            csvData.push(['Lecturer', 'Course Code', 'Course Name', 'Semester Type', 'Hours (Parsed)', 'Fall Hours Total', 'Spring Hours Total', 'Overall Hours Total']);

            const sortedLecturers = Object.keys(currentWorkloadData).sort();
            sortedLecturers.forEach(lecturer => {
                const lecturerData = currentWorkloadData[lecturer];
                let isFirstCourseOfLecturer = true;
                lecturerData.courses.forEach(course => {
                    if (isFirstCourseOfLecturer) {
                        csvData.push([
                            lecturer,
                            course.code,
                            course.name,
                            course.semesterType,
                            course.parsedHours,
                            lecturerData.fallTotalHours,
                            lecturerData.springTotalHours,
                            lecturerData.overallTotalHours
                        ]);
                        isFirstCourseOfLecturer = false;
                    } else {
                        csvData.push([
                            "", 
                            course.code,
                            course.name,
                            course.semesterType,
                            course.parsedHours,
                            "", "", ""
                        ]);
                    }
                });
            });
            exportToCsv('lecturer_workload_by_semester.csv', csvData);
        });
    }

    closeCompareModalButton.onclick = () => syllabusModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == syllabusModal) syllabusModal.style.display = 'none';
        if (event.target == editCourseModal) editCourseModal.style.display = 'none';
        if (event.target == workloadModal) workloadModal.style.display = 'none';
    };

    searchInput.addEventListener('input', () => {
        populateAllCourses();
    });

    populateAllCourses();
    updateComparisonCount();
});
