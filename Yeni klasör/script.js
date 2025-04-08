document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Header Toggle ---
    const header = document.getElementById('main-header');
    const mobileToggleBtn = document.getElementById('mobile-header-toggle');
	console.log("Mobile Toggle Button Element:", mobileToggleBtn);
    const collapsibleContent = document.querySelector('.header-collapsible-content');
    const arrowDown = mobileToggleBtn?.querySelector('.arrow.down');
    const arrowUp = mobileToggleBtn?.querySelector('.arrow.up');

    if (mobileToggleBtn && collapsibleContent && header && arrowDown && arrowUp) {
        mobileToggleBtn.addEventListener('click', () => {
            const isCollapsed = header.classList.contains('header-collapsed');

            if (isCollapsed) {
                // Expand
                header.classList.remove('header-collapsed');
                mobileToggleBtn.setAttribute('aria-expanded', 'true');
                arrowDown.style.display = 'none'; // Hide down arrow
                arrowUp.style.display = 'inline'; // Show up arrow
            } else {
                // Collapse
                header.classList.add('header-collapsed');
                mobileToggleBtn.setAttribute('aria-expanded', 'false');
                arrowDown.style.display = 'inline'; // Show down arrow
                arrowUp.style.display = 'none'; // Hide up arrow
            }
        });

        // Check initial state based on CSS (max-height) rather than adding class here
        // This prevents potential flashing if JS loads slow
        // Update arrow state based on initial CSS rendering might be complex,
        // so start with down arrow visible and rely on first click to sync.
        arrowDown.style.display = 'inline';
        arrowUp.style.display = 'none';
        mobileToggleBtn.setAttribute('aria-expanded', 'false'); // Assume starts collapsed

    }


    // --- Theme Toggler ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    const body = document.body;

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
         // Add/remove class for easier CSS targeting if needed & compatibility
         if (theme === 'dark') {
             body.classList.add('dark-mode');
         } else {
             body.classList.remove('dark-mode');
         }
    }

    if (currentTheme) {
        setTheme(currentTheme); // Apply saved theme on load
    } else {
         const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
         setTheme(prefersDark ? 'dark' : 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }


    // --- Tooltip Generator ---
    const terms = document.querySelectorAll('.tooltip-term');
    // Get or create the global tooltip container
    let tooltipContainer = document.getElementById('tooltip-container');
    if (!tooltipContainer) {
        tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'tooltip-container';
        // Apply basic styles via JS - or better, add #tooltip-container style to CSS
        tooltipContainer.style.position = 'fixed';
        tooltipContainer.style.visibility = 'hidden';
        tooltipContainer.style.opacity = '0';
        tooltipContainer.style.transition = 'opacity 0.2s ease, visibility 0s linear 0.2s';
        tooltipContainer.style.zIndex = '1000';
        tooltipContainer.style.pointerEvents = 'none'; // Allow clicks through
        // Add styles matching .tooltip-box from CSS (background, color, border etc.)
        tooltipContainer.style.backgroundColor = 'var(--tooltip-bg)';
        tooltipContainer.style.color = 'var(--tooltip-text)';
        tooltipContainer.style.border = '2px solid var(--border-color)';
        tooltipContainer.style.padding = '0.5rem 0.8rem';
        tooltipContainer.style.borderRadius = '0';
        tooltipContainer.style.fontSize = '0.9rem';
        tooltipContainer.style.fontFamily = 'var(--body-font)';
        tooltipContainer.style.maxWidth = '300px';
        tooltipContainer.style.textAlign = 'center';
        tooltipContainer.style.whiteSpace = 'normal';

        document.body.appendChild(tooltipContainer);
    }


    terms.forEach(term => {
        const definition = term.getAttribute('data-definition');
        if (definition) {
            term.setAttribute('tabindex', '0'); // Make focusable

            term.addEventListener('mouseenter', (e) => showTooltip(e.target, definition));
            term.addEventListener('focus', (e) => showTooltip(e.target, definition));

            term.addEventListener('mouseleave', hideTooltip);
            term.addEventListener('blur', hideTooltip);
        }
    });

    function showTooltip(termElement, definition) {
        tooltipContainer.textContent = definition;
        tooltipContainer.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--tooltip-bg');
        tooltipContainer.style.color = getComputedStyle(document.documentElement).getPropertyValue('--tooltip-text');
        tooltipContainer.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');


        const termRect = termElement.getBoundingClientRect();
        tooltipContainer.style.left = `${termRect.left + (termRect.width / 2)}px`;
        tooltipContainer.style.top = `${termRect.top}px`;
        // Position above the term, centered horizontally
        tooltipContainer.style.transform = `translate(-50%, calc(-100% - 10px))`; // 10px gap

        tooltipContainer.style.visibility = 'visible';
        tooltipContainer.style.opacity = '1';
    }

    function hideTooltip() {
        tooltipContainer.style.visibility = 'hidden';
        tooltipContainer.style.opacity = '0';
    }


    // --- System 1 Demo ---
    const faceBtn = document.getElementById('face-btn');
    const faceResult = document.getElementById('face-result');
    if (faceBtn) {
        faceBtn.addEventListener('click', () => {
            faceResult.textContent = ":)  <-- S1: Instant Recognition!";
        });
    }

    // --- CRT Interaction ---
    const crtButtons = document.querySelectorAll('.crt-submit');
    const crtData = {
        '1': { answer: '5', intuitive: '10' },
        '2': { answer: '5', intuitive: '100' },
        '3': { answer: '47', intuitive: '24' }
    };
    crtButtons.forEach(button => {
        button.addEventListener('click', () => {
            const crtId = button.getAttribute('data-crt-id');
            const userAnswer = document.getElementById(`crt${crtId}-answer`).value.trim();
            const resultP = document.getElementById(`crt${crtId}-result`);
            const correct = crtData[crtId].answer;
            const intuitive = crtData[crtId].intuitive;
             const currentTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color'); // Get theme text color

            resultP.style.color = currentTextColor; // Reset color first

            if (userAnswer === correct) {
                resultP.textContent = `Correct (${correct})! S2 override successful. Intuitive S1 guess: ${intuitive}.`;
                resultP.style.color = 'green';
            } else if (userAnswer === intuitive) {
                resultP.textContent = `S1 trap (${intuitive})! Correct: ${correct}. Requires S2 effort!`;
                 resultP.style.color = 'orange';
            } else if (userAnswer === '') {
                 resultP.textContent = `Enter answer. Correct: ${correct}. Intuitive guess: ${intuitive}.`;
                 // resultP.style.color = currentTextColor; // Already set
            }
             else {
                resultP.textContent = `Incorrect. Correct: ${correct}. Intuitive guess: ${intuitive}. Did S1 misfire?`;
                 resultP.style.color = 'red';
            }
        });
    });

    // --- Müller-Lyer Illusion ---
    const mullerBtn = document.getElementById('muller-reveal');
    const mullerResult = document.getElementById('muller-result');
    if (mullerBtn) {
        mullerBtn.addEventListener('click', () => {
            mullerResult.textContent = "They are the SAME length! S1 persists in seeing difference even when S2 knows.";
        });
    }

    // --- Bias Spotting ---
    const biasButtons = document.querySelectorAll('.bias-submit');
    const biasAnswers = {
        '1': 'a', // Availability (emotional story)
        '2': 'c'  // Representativeness (stereotype)
    };
     const biasExplanations = {
         '1': {
            'a': 'Correct! Vivid, easily recalled stories (Availability) often outweigh statistics.',
            'b': 'Incorrect. Anchoring needs a numerical starting point.',
            'c': 'Incorrect. Representativeness compares to a stereotype.'
        },
        '2': {
            'a': 'Incorrect. Availability is about ease of recall.',
            'b': 'Incorrect. Anchoring needs a number.',
            'c': 'Correct! Judging based on similarity to a stereotype (Representativeness), ignoring base rates.'
        }
    };
    biasButtons.forEach(button => {
        button.addEventListener('click', () => {
            const biasId = button.getAttribute('data-bias-id');
            const resultP = document.getElementById(`bias${biasId}-result`);
            const selectedRadio = document.querySelector(`input[name="bias${biasId}"]:checked`);
            const currentTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');

            resultP.style.color = currentTextColor; // Reset color

            if (selectedRadio) {
                const userAnswer = selectedRadio.value;
                const correctAnswer = biasAnswers[biasId];
                 resultP.textContent = biasExplanations[biasId][userAnswer];
                 resultP.style.color = (userAnswer === correctAnswer) ? 'green' : 'red';
            } else {
                resultP.textContent = "Please select an option.";
                 // resultP.style.color = currentTextColor; // Already set
            }
        });
    });

}); // End DOMContentLoaded