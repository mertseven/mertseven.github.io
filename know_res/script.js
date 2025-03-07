document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive elements
    initNavigation();
    initDialogueExplorer();
    initJTBAnalyzer();
    initGettierExplorer();
    initArgumentAnalyzer();
    initCorrelationExplorer();
    initValuesExplorer();
    initPluralismExplorer();
});

// ----- NAVIGATION -----
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 20,
                behavior: 'smooth'
            });
        });
    });
}

// ----- DIALOGUE EXPLORER -----
function initDialogueExplorer() {
    const definitionButtons = document.querySelectorAll('.definition-button');
    
    definitionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const definition = this.getAttribute('data-definition');
            
            // Update active button
            document.querySelectorAll('.definition-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.definition-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${definition}-content`).classList.add('active');
        });
    });
}

// ----- JTB ANALYZER -----
function initJTBAnalyzer() {
    const scenarios = [
        {
            text: "Maria looks at the clock on her wall and sees that it reads 3:00. She forms the belief 'It is 3:00.' The clock is working properly and it is indeed 3:00.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. Maria has a justified true belief: the belief is true (it is 3:00), she believes it, and she is justified in believing it based on a reliable clock."
        },
        {
            text: "James believes that it will rain tomorrow based on a weather forecast from a reliable meteorological service. The forecast is accurate, and it does rain the next day.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. James has a justified true belief based on reliable evidence from weather experts."
        },
        {
            text: "Sarah believes there are an even number of stars in the universe. By coincidence, there happens to be an even number of stars in the universe.",
            truth: true,
            belief: true,
            justification: false,
            isKnowledge: false,
            explanation: "This is not knowledge. While Sarah's belief is true, she has no justification for it. It's merely a lucky guess."
        },
        {
            text: "Tom believes that his lottery ticket will win. He has no special information, but he just has a 'feeling.' As it happens, his ticket does win.",
            truth: true,
            belief: true,
            justification: false,
            isKnowledge: false,
            explanation: "This is not knowledge. Tom's belief is true, but his 'feeling' doesn't constitute adequate justification. His true belief is due to luck, not knowledge."
        },
        {
            text: "Layla believes that water is H2O based on what she learned in chemistry class. Water is indeed H2O.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. Layla has a justified true belief based on scientific education."
        }
    ];
    
    let currentScenarioIndex = -1;
    const scenarioDisplay = document.getElementById('current-scenario');
    const truthCheckbox = document.getElementById('truth-condition');
    const beliefCheckbox = document.getElementById('belief-condition');
    const justificationCheckbox = document.getElementById('justification-condition');
    const checkButton = document.getElementById('check-knowledge');
    const nextButton = document.getElementById('next-scenario');
    const feedbackPanel = document.getElementById('jtb-feedback');
    
    nextButton.addEventListener('click', function() {
        currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
        displayScenario(currentScenarioIndex);
    });
    
    checkButton.addEventListener('click', function() {
        checkKnowledge(currentScenarioIndex);
    });
    
    function displayScenario(index) {
        // Reset UI
        scenarioDisplay.textContent = scenarios[index].text;
        truthCheckbox.checked = false;
        beliefCheckbox.checked = false;
        justificationCheckbox.checked = false;
        feedbackPanel.innerHTML = '';
    }
    
    function checkKnowledge(index) {
        const scenario = scenarios[index];
        const userTruth = truthCheckbox.checked;
        const userBelief = beliefCheckbox.checked;
        const userJustification = justificationCheckbox.checked;
        
        const userAssessment = userTruth && userBelief && userJustification;
        const correctAssessment = scenario.isKnowledge;
        
        let feedback = '';
        
        // Check individual conditions
        const truthCorrect = userTruth === scenario.truth;
        const beliefCorrect = userBelief === scenario.belief;
        const justificationCorrect = userJustification === scenario.justification;
        
        if (userAssessment === correctAssessment) {
            feedback += `<p><strong>Correct assessment!</strong> ${scenario.explanation}</p>`;
        } else {
            feedback += `<p><strong>Not quite right.</strong> ${scenario.explanation}</p>`;
        }
        
        feedback += '<p>Conditions assessment:</p><ul>';
        feedback += `<li>Truth: ${truthCorrect ? '✓' : '✗'} ${scenario.truth ? 'The belief is true.' : 'The belief is not true.'}</li>`;
        feedback += `<li>Belief: ${beliefCorrect ? '✓' : '✗'} ${scenario.belief ? 'The subject does believe it.' : 'The subject does not believe it.'}</li>`;
        feedback += `<li>Justification: ${justificationCorrect ? '✓' : '✗'} ${scenario.justification ? 'The belief is justified.' : 'The belief is not justified.'}</li>`;
        feedback += '</ul>';
        
        feedbackPanel.innerHTML = feedback;
    }
}

// ----- GETTIER EXPLORER -----
function initGettierExplorer() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.case-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ----- ARGUMENT ANALYZER -----
function initArgumentAnalyzer() {
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.argument-analyzer .tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.argument-analyzer .tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.argument-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Set up argument analysis checking
    const argumentData = {
        arg1: {
            type: 'deductive',
            validity: 'valid',
            soundness: 'unsound',
            feedback: 'This is a <strong>deductive</strong> argument because its conclusion follows necessarily from its premises. It\'s <strong>valid</strong> because if the premises were true, the conclusion would have to be true. However, it\'s <strong>unsound</strong> because the first premise ("All birds lay eggs") is false. Male birds don\'t lay eggs, and some species of birds (like some parasitic cuckoos) never lay eggs.'
        },
        arg2: {
            type: 'inductive',
            validity: 'valid',
            soundness: 'sound',
            feedback: 'This is an <strong>inductive</strong> argument because it moves from specific observations to a general conclusion. It\'s <strong>strong</strong> (the inductive equivalent of validity) because the premises provide good support for the conclusion. It\'s <strong>cogent</strong> (the inductive equivalent of soundness) because the premises are true. Human physiology consistently responds to heat with pain.'
        },
        arg3: {
            type: 'abductive',
            validity: 'valid',
            soundness: 'sound',
            feedback: 'This is an <strong>abductive</strong> argument because it reasons to the best explanation. It\'s <strong>strong</strong> because strep throat is indeed the best explanation for the symptoms and test results. It\'s <strong>cogent</strong> because the premises appear to be true - the patient does have these symptoms and test results.'
        }
    };
    
    document.querySelectorAll('.check-analysis').forEach(button => {
        button.addEventListener('click', function() {
            const argId = this.getAttribute('data-arg');
            const correctData = argumentData[argId];
            
            // Get user selections
            const userType = document.querySelector(`input[name="${argId}-type"]:checked`)?.value;
            const userValidity = document.querySelector(`input[name="${argId}-validity"]:checked`)?.value;
            const userSoundness = document.querySelector(`input[name="${argId}-soundness"]:checked`)?.value;
            
            // Generate feedback
            let feedback = '';
            
            if (!userType || !userValidity || !userSoundness) {
                feedback = '<div style="color: red;">Please make a selection for all three categories.</div>';
            } else {
                feedback = correctData.feedback;
                
                if (userType === correctData.type && userValidity === correctData.validity && userSoundness === correctData.soundness) {
                    feedback = '<div style="color: green;">Correct analysis!</div>' + feedback;
                } else {
                    feedback = '<div style="color: red;">Not quite right.</div>' + feedback;
                }
            }
            
            document.getElementById(`${argId}-feedback`).innerHTML = feedback;
        });
    });
}

// ----- CORRELATION EXPLORER -----
function initCorrelationExplorer() {
    const checkButton = document.getElementById('check-correlation');
    const feedbackElement = document.getElementById('correlation-feedback');
    
    checkButton.addEventListener('click', function() {
        const selectedValue = document.querySelector('input[name="ice-cream-cause"]:checked')?.value;
        
        if (!selectedValue) {
            feedbackElement.innerHTML = '<div style="color: red;">Please select an explanation.</div>';
            return;
        }
        
        let feedback = '';
        
        if (selectedValue === 'common') {
            feedback = '<div style="color: green;">Correct! The correlation between ice cream sales and drowning deaths is explained by a common cause: summer weather. When it\'s hot, people buy more ice cream AND people swim more, leading to more drowning incidents.</div>';
        } else if (selectedValue === 'direct') {
            feedback = '<div style="color: red;">Incorrect. There is no direct causal relationship between eating ice cream and drowning. This is a common error in causal reasoning.</div>';
        } else if (selectedValue === 'reverse') {
            feedback = '<div style="color: red;">Incorrect. Drowning incidents do not cause people to buy more ice cream. This would be an example of reverse causation, but it\'s not plausible in this case.</div>';
        } else if (selectedValue === 'coincidence') {
            feedback = '<div style="color: red;">Incorrect. While some correlations can be coincidental, this particular correlation is too strong and consistent to be mere coincidence. There is a real relationship here, but it\'s not direct causation.</div>';
        }
        
        feedbackElement.innerHTML = feedback;
    });
}

// ----- VALUES EXPLORER -----
function initValuesExplorer() {
    const stageTabs = document.querySelectorAll('.stage-tab');
    const reflectButtons = document.querySelectorAll('.value-reflect');
    const insightPanel = document.getElementById('value-insight');
    
    // Stage tab switching
    stageTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const stageId = this.getAttribute('data-stage');
            
            // Update active tab
            document.querySelectorAll('.stage-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.stage-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${stageId}-stage`).classList.add('active');
        });
    });
    
    // Value reflection
    reflectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stage = this.getAttribute('data-stage');
            let checkedValues = [];
            
            // Get checked values for the current stage
            document.querySelectorAll(`#${stage}-stage input[type="checkbox"]:checked`).forEach(checkbox => {
                checkedValues.push(checkbox.id);
            });
            
            if (checkedValues.length === 0) {
                document.getElementById(`${stage}-feedback`).innerHTML = 'Please select at least one value to reflect on.';
                return;
            }
            
            // Generate feedback based on selected values
            generateValueFeedback(stage, checkedValues);
        });
    });
    
    function generateValueFeedback(stage, values) {
        const feedbackElement = document.getElementById(`${stage}-feedback`);
        const feedbackMap = {
            // Research Question stage
            'q-economic': 'Economic values may lead researchers to prioritize profitable research directions over socially beneficial ones.',
            'q-epistemic': 'Epistemic values can promote research that fills knowledge gaps rather than solely serving commercial interests.',
            'q-social': 'Social values can guide research toward addressing health disparities and underserved populations.',
            'q-career': 'Career advancement considerations may bias researchers toward trendy or publishable topics rather than important ones.',
            
            // Study Design stage
            'd-efficiency': 'Prioritizing efficiency may lead to smaller sample sizes or shorter study durations, potentially limiting generalizability.',
            'd-safety': 'Safety values are essential but may limit what research questions can be pursued or how.',
            'd-inclusion': 'Inclusion values can enhance generalizability of findings across diverse populations.',
            'd-precision': 'Precision values may increase statistical power but also require larger samples and more resources.',
            
            // Data Analysis stage
            'a-significance': 'Prioritizing statistical significance may lead to p-hacking or publication bias.',
            'a-transparency': 'Transparency values promote reproducibility and trust in research findings.',
            'a-favorable': 'Seeking favorable results can lead to confirmation bias or selective reporting.',
            'a-objectivity': 'Objectivity values help guard against bias but may not fully eliminate unconscious influences.',
            
            // Conclusion stage
            'c-caution': 'Caution in interpretation helps prevent overstatement of findings but may reduce impact.',
            'c-impact': 'Emphasizing impact can increase attention to research but risks overstating importance.',
            'c-clarity': 'Clarity makes research more accessible but may oversimplify complex findings.',
            'c-nuance': 'Nuance preserves complexity but may make findings less accessible to non-experts.'
        };
        
        // Generate feedback
        let feedback = '<ul>';
        values.forEach(value => {
            feedback += `<li>${feedbackMap[value]}</li>`;
        });
        feedback += '</ul>';
        
        feedbackElement.innerHTML = feedback;
        
        // Update insight panel
        let stageTitle = '';
        switch(stage) {
            case 'question': stageTitle = 'Research Question Formulation'; break;
            case 'design': stageTitle = 'Study Design Decisions'; break;
            case 'analysis': stageTitle = 'Data Analysis Choices'; break;
            case 'conclusion': stageTitle = 'Drawing Conclusions'; break;
        }
        
        insightPanel.innerHTML = `<p><strong>${stageTitle}:</strong> Values influence every stage of research. Different values can guide researchers toward different decisions, without any necessarily being "wrong" or "right." Being aware of these values helps researchers make more informed choices.</p>`;
    }
}

// ----- PLURALISM EXPLORER -----
function initPluralismExplorer() {
    const approachButtons = document.querySelectorAll('.explore-approach');
    const insightsPanel = document.getElementById('integration-insights');
    const visualizationContainer = document.getElementById('integration-visualization');
    
    const approachData = {
        physics: {
            strengths: 'Provides quantitative models of greenhouse gas effects, energy balance, and climate system dynamics.',
            limitations: 'May oversimplify complex biological and social feedbacks.',
            contributions: 'Mathematical models of radiation physics, greenhouse effects, and atmospheric circulation.',
            integration: 'Physics models provide foundations for other approaches but may not capture adaptive responses of ecosystems or human societies.'
        },
        ecology: {
            strengths: 'Captures biological complexity and adaptation processes.',
            limitations: 'May lack precision in predicting physical climate changes.',
            contributions: 'Understanding of biodiversity impacts, ecosystem changes, and feedback loops in carbon cycling.',
            integration: 'Ecological insights enrich physical models but may operate at different spatial and temporal scales than economic analyses.'
        },
        economics: {
            strengths: 'Models human behavior, markets, and policy incentives.',
            limitations: 'Often relies on assumptions about rational actors that may not reflect complex human psychology.',
            contributions: 'Cost-benefit analysis, carbon pricing models, and economic impact assessments.',
            integration: 'Economic analyses depend on inputs from physical and ecological models, while using different methodologies and assumptions.'
        },
        sociology: {
            strengths: 'Captures cultural dimensions, justice considerations, and lived experiences.',
            limitations: 'May be difficult to integrate into quantitative modeling frameworks.',
            contributions: 'Understanding vulnerability, climate justice, social movements, and cultural adaptation.',
            integration: 'Sociological perspectives highlight limitations of purely technical approaches but may use different evidence standards than natural sciences.'
        }
    };
    
    approachButtons.forEach(button => {
        button.addEventListener('click', function() {
            const approach = this.getAttribute('data-approach');
            const data = approachData[approach];
            
            // Update insights panel
            insightsPanel.innerHTML = `
                <h4>${approach.toUpperCase()} APPROACH</h4>
                <p><strong>Strengths:</strong> ${data.strengths}</p>
                <p><strong>Limitations:</strong> ${data.limitations}</p>
                <p><strong>Key Contributions:</strong> ${data.contributions}</p>
                <p><strong>Integration Challenges:</strong> ${data.integration}</p>
            `;
            
            // Highlight active approach card
            document.querySelectorAll('.approach-card').forEach(card => {
                if (card.getAttribute('data-approach') === approach) {
                    card.style.borderWidth = '4px';
                } else {
                    card.style.borderWidth = '2px';
                }
            });
            
            // Update visualization (simplified representation)
            visualizationContainer.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p><strong>Multiple Perspectives on Climate Change</strong></p>
                    <p>Each approach provides a partial understanding of the complex phenomenon.</p>
                    <p>No single approach can capture the full complexity of climate change.</p>
                </div>
            `;
        });
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive elements
    initNavigation();
    initJTBAnalyzer();
    initGettierExplorer();
    initArgumentAnalyzer();
    initCorrelationExplorer();
    initValuesExplorer();
    initPluralismExplorer();
    initTrustNetwork();
    initCognitiveDivision();
    initReplicationSimulator();
});

// ----- NAVIGATION -----
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 20,
                behavior: 'smooth'
            });
        });
    });
}

// ----- JTB ANALYZER -----
function initJTBAnalyzer() {
    const scenarios = [
        {
            text: "Maria looks at the clock on her wall and sees that it reads 3:00. She forms the belief 'It is 3:00.' The clock is working properly and it is indeed 3:00.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. Maria has a justified true belief: the belief is true (it is 3:00), she believes it, and she is justified in believing it based on a reliable clock."
        },
        {
            text: "James believes that it will rain tomorrow based on a weather forecast from a reliable meteorological service. The forecast is accurate, and it does rain the next day.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. James has a justified true belief based on reliable evidence from weather experts."
        },
        {
            text: "Sarah believes there are an even number of stars in the universe. By coincidence, there happens to be an even number of stars in the universe.",
            truth: true,
            belief: true,
            justification: false,
            isKnowledge: false,
            explanation: "This is not knowledge. While Sarah's belief is true, she has no justification for it. It's merely a lucky guess."
        },
        {
            text: "Tom believes that his lottery ticket will win. He has no special information, but he just has a 'feeling.' As it happens, his ticket does win.",
            truth: true,
            belief: true,
            justification: false,
            isKnowledge: false,
            explanation: "This is not knowledge. Tom's belief is true, but his 'feeling' doesn't constitute adequate justification. His true belief is due to luck, not knowledge."
        },
        {
            text: "Layla believes that water is H2O based on what she learned in chemistry class. Water is indeed H2O.",
            truth: true,
            belief: true,
            justification: true,
            isKnowledge: true,
            explanation: "This is knowledge. Layla has a justified true belief based on scientific education."
        }
    ];
    
    let currentScenarioIndex = -1;
    const scenarioDisplay = document.getElementById('current-scenario');
    const truthCheckbox = document.getElementById('truth-condition');
    const beliefCheckbox = document.getElementById('belief-condition');
    const justificationCheckbox = document.getElementById('justification-condition');
    const checkButton = document.getElementById('check-knowledge');
    const nextButton = document.getElementById('next-scenario');
    const feedbackPanel = document.getElementById('jtb-feedback');
    
    nextButton.addEventListener('click', function() {
        currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
        displayScenario(currentScenarioIndex);
    });
    
    checkButton.addEventListener('click', function() {
        checkKnowledge(currentScenarioIndex);
    });
    
    function displayScenario(index) {
        // Reset UI
        scenarioDisplay.textContent = scenarios[index].text;
        truthCheckbox.checked = false;
        beliefCheckbox.checked = false;
        justificationCheckbox.checked = false;
        feedbackPanel.innerHTML = '';
    }
    
    function checkKnowledge(index) {
        const scenario = scenarios[index];
        const userTruth = truthCheckbox.checked;
        const userBelief = beliefCheckbox.checked;
        const userJustification = justificationCheckbox.checked;
        
        const userAssessment = userTruth && userBelief && userJustification;
        const correctAssessment = scenario.isKnowledge;
        
        let feedback = '';
        
        // Check individual conditions
        const truthCorrect = userTruth === scenario.truth;
        const beliefCorrect = userBelief === scenario.belief;
        const justificationCorrect = userJustification === scenario.justification;
        
        if (userAssessment === correctAssessment) {
            feedback += `<p><strong>Correct assessment!</strong> ${scenario.explanation}</p>`;
        } else {
            feedback += `<p><strong>Not quite right.</strong> ${scenario.explanation}</p>`;
        }
        
        feedback += '<p>Conditions assessment:</p><ul>';
        feedback += `<li>Truth: ${truthCorrect ? '✓' : '✗'} ${scenario.truth ? 'The belief is true.' : 'The belief is not true.'}</li>`;
        feedback += `<li>Belief: ${beliefCorrect ? '✓' : '✗'} ${scenario.belief ? 'The subject does believe it.' : 'The subject does not believe it.'}</li>`;
        feedback += `<li>Justification: ${justificationCorrect ? '✓' : '✗'} ${scenario.justification ? 'The belief is justified.' : 'The belief is not justified.'}</li>`;
        feedback += '</ul>';
        
        feedbackPanel.innerHTML = feedback;
    }
}

// ----- GETTIER EXPLORER -----
function initGettierExplorer() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.case-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ----- ARGUMENT ANALYZER -----
function initArgumentAnalyzer() {
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.argument-analyzer .tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.argument-analyzer .tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.argument-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Set up argument analysis checking
    const argumentData = {
        arg1: {
            type: 'deductive',
            validity: 'valid',
            soundness: 'unsound',
            feedback: 'This is a <strong>deductive</strong> argument because its conclusion follows necessarily from its premises. It\'s <strong>valid</strong> because if the premises were true, the conclusion would have to be true. However, it\'s <strong>unsound</strong> because the first premise ("All birds lay eggs") is false. Male birds don\'t lay eggs, and some species of birds (like some parasitic cuckoos) never lay eggs.'
        },
        arg2: {
            type: 'inductive',
            validity: 'valid',
            soundness: 'sound',
            feedback: 'This is an <strong>inductive</strong> argument because it moves from specific observations to a general conclusion. It\'s <strong>strong</strong> (the inductive equivalent of validity) because the premises provide good support for the conclusion. It\'s <strong>cogent</strong> (the inductive equivalent of soundness) because the premises are true. Human physiology consistently responds to heat with pain.'
        },
        arg3: {
            type: 'abductive',
            validity: 'valid',
            soundness: 'sound',
            feedback: 'This is an <strong>abductive</strong> argument because it reasons to the best explanation. It\'s <strong>strong</strong> because strep throat is indeed the best explanation for the symptoms and test results. It\'s <strong>cogent</strong> because the premises appear to be true - the patient does have these symptoms and test results.'
        }
    };
    
    document.querySelectorAll('.check-analysis').forEach(button => {
        button.addEventListener('click', function() {
            const argId = this.getAttribute('data-arg');
            const correctData = argumentData[argId];
            
            // Get user selections
            const userType = document.querySelector(`input[name="${argId}-type"]:checked`)?.value;
            const userValidity = document.querySelector(`input[name="${argId}-validity"]:checked`)?.value;
            const userSoundness = document.querySelector(`input[name="${argId}-soundness"]:checked`)?.value;
            
            // Generate feedback
            let feedback = '';
            
            if (!userType || !userValidity || !userSoundness) {
                feedback = '<div style="color: red;">Please make a selection for all three categories.</div>';
            } else {
                feedback = correctData.feedback;
                
                if (userType === correctData.type && userValidity === correctData.validity && userSoundness === correctData.soundness) {
                    feedback = '<div style="color: green;">Correct analysis!</div>' + feedback;
                } else {
                    feedback = '<div style="color: red;">Not quite right.</div>' + feedback;
                }
            }
            
            document.getElementById(`${argId}-feedback`).innerHTML = feedback;
        });
    });
}

// ----- CORRELATION EXPLORER -----
function initCorrelationExplorer() {
    const checkButton = document.getElementById('check-correlation');
    const feedbackElement = document.getElementById('correlation-feedback');
    
    checkButton.addEventListener('click', function() {
        const selectedValue = document.querySelector('input[name="ice-cream-cause"]:checked')?.value;
        
        if (!selectedValue) {
            feedbackElement.innerHTML = '<div style="color: red;">Please select an explanation.</div>';
            return;
        }
        
        let feedback = '';
        
        if (selectedValue === 'common') {
            feedback = '<div style="color: green;">Correct! The correlation between ice cream sales and drowning deaths is explained by a common cause: summer weather. When it\'s hot, people buy more ice cream AND people swim more, leading to more drowning incidents.</div>';
        } else if (selectedValue === 'direct') {
            feedback = '<div style="color: red;">Incorrect. There is no direct causal relationship between eating ice cream and drowning. This is a common error in causal reasoning.</div>';
        } else if (selectedValue === 'reverse') {
            feedback = '<div style="color: red;">Incorrect. Drowning incidents do not cause people to buy more ice cream. This would be an example of reverse causation, but it\'s not plausible in this case.</div>';
        } else if (selectedValue === 'coincidence') {
            feedback = '<div style="color: red;">Incorrect. While some correlations can be coincidental, this particular correlation is too strong and consistent to be mere coincidence. There is a real relationship here, but it\'s not direct causation.</div>';
        }
        
        feedbackElement.innerHTML = feedback;
    });
}

// ----- VALUES EXPLORER -----
function initValuesExplorer() {
    const stageTabs = document.querySelectorAll('.stage-tab');
    const reflectButtons = document.querySelectorAll('.value-reflect');
    const insightPanel = document.getElementById('value-insight');
    
    // Stage tab switching
    stageTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const stageId = this.getAttribute('data-stage');
            
            // Update active tab
            document.querySelectorAll('.stage-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.stage-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${stageId}-stage`).classList.add('active');
        });
    });
    
    // Value reflection
    reflectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stage = this.getAttribute('data-stage');
            let checkedValues = [];
            
            // Get checked values for the current stage
            document.querySelectorAll(`#${stage}-stage input[type="checkbox"]:checked`).forEach(checkbox => {
                checkedValues.push(checkbox.id);
            });
            
            if (checkedValues.length === 0) {
                document.getElementById(`${stage}-feedback`).innerHTML = 'Please select at least one value to reflect on.';
                return;
            }
            
            // Generate feedback based on selected values
            generateValueFeedback(stage, checkedValues);
        });
    });
    
    function generateValueFeedback(stage, values) {
        const feedbackElement = document.getElementById(`${stage}-feedback`);
        const feedbackMap = {
            // Research Question stage
            'q-economic': 'Economic values may lead researchers to prioritize profitable research directions over socially beneficial ones.',
            'q-epistemic': 'Epistemic values can promote research that fills knowledge gaps rather than solely serving commercial interests.',
            'q-social': 'Social values can guide research toward addressing health disparities and underserved populations.',
            'q-career': 'Career advancement considerations may bias researchers toward trendy or publishable topics rather than important ones.',
            
            // Study Design stage
            'd-efficiency': 'Prioritizing efficiency may lead to smaller sample sizes or shorter study durations, potentially limiting generalizability.',
            'd-safety': 'Safety values are essential but may limit what research questions can be pursued or how.',
            'd-inclusion': 'Inclusion values can enhance generalizability of findings across diverse populations.',
            'd-precision': 'Precision values may increase statistical power but also require larger samples and more resources.',
            
            // Data Analysis stage
            'a-significance': 'Prioritizing statistical significance may lead to p-hacking or publication bias.',
            'a-transparency': 'Transparency values promote reproducibility and trust in research findings.',
            'a-favorable': 'Seeking favorable results can lead to confirmation bias or selective reporting.',
            'a-objectivity': 'Objectivity values help guard against bias but may not fully eliminate unconscious influences.',
            
            // Conclusion stage
            'c-caution': 'Caution in interpretation helps prevent overstatement of findings but may reduce impact.',
            'c-impact': 'Emphasizing impact can increase attention to research but risks overstating importance.',
            'c-clarity': 'Clarity makes research more accessible but may oversimplify complex findings.',
            'c-nuance': 'Nuance preserves complexity but may make findings less accessible to non-experts.'
        };
        
        // Generate feedback
        let feedback = '<ul>';
        values.forEach(value => {
            feedback += `<li>${feedbackMap[value]}</li>`;
        });
        feedback += '</ul>';
        
        feedbackElement.innerHTML = feedback;
        
        // Update insight panel
        let stageTitle = '';
        switch(stage) {
            case 'question': stageTitle = 'Research Question Formulation'; break;
            case 'design': stageTitle = 'Study Design Decisions'; break;
            case 'analysis': stageTitle = 'Data Analysis Choices'; break;
            case 'conclusion': stageTitle = 'Drawing Conclusions'; break;
        }
        
        insightPanel.innerHTML = `<p><strong>${stageTitle}:</strong> Values influence every stage of research. Different values can guide researchers toward different decisions, without any necessarily being "wrong" or "right." Being aware of these values helps researchers make more informed choices.</p>`;
    }
}

// ----- PLURALISM EXPLORER -----
function initPluralismExplorer() {
    const approachButtons = document.querySelectorAll('.explore-approach');
    const insightsPanel = document.getElementById('integration-insights');
    const visualizationContainer = document.getElementById('integration-visualization');
    
    const approachData = {
        physics: {
            strengths: 'Provides quantitative models of greenhouse gas effects, energy balance, and climate system dynamics.',
            limitations: 'May oversimplify complex biological and social feedbacks.',
            contributions: 'Mathematical models of radiation physics, greenhouse effects, and atmospheric circulation.',
            integration: 'Physics models provide foundations for other approaches but may not capture adaptive responses of ecosystems or human societies.'
        },
        ecology: {
            strengths: 'Captures biological complexity and adaptation processes.',
            limitations: 'May lack precision in predicting physical climate changes.',
            contributions: 'Understanding of biodiversity impacts, ecosystem changes, and feedback loops in carbon cycling.',
            integration: 'Ecological insights enrich physical models but may operate at different spatial and temporal scales than economic analyses.'
        },
        economics: {
            strengths: 'Models human behavior, markets, and policy incentives.',
            limitations: 'Often relies on assumptions about rational actors that may not reflect complex human psychology.',
            contributions: 'Cost-benefit analysis, carbon pricing models, and economic impact assessments.',
            integration: 'Economic analyses depend on inputs from physical and ecological models, while using different methodologies and assumptions.'
        },
        sociology: {
            strengths: 'Captures cultural dimensions, justice considerations, and lived experiences.',
            limitations: 'May be difficult to integrate into quantitative modeling frameworks.',
            contributions: 'Understanding vulnerability, climate justice, social movements, and cultural adaptation.',
            integration: 'Sociological perspectives highlight limitations of purely technical approaches but may use different evidence standards than natural sciences.'
        }
    };
    
    approachButtons.forEach(button => {
        button.addEventListener('click', function() {
            const approach = this.getAttribute('data-approach');
            const data = approachData[approach];
            
            // Update insights panel
            insightsPanel.innerHTML = `
                <h4>${approach.toUpperCase()} APPROACH</h4>
                <p><strong>Strengths:</strong> ${data.strengths}</p>
                <p><strong>Limitations:</strong> ${data.limitations}</p>
                <p><strong>Key Contributions:</strong> ${data.contributions}</p>
                <p><strong>Integration Challenges:</strong> ${data.integration}</p>
            `;
            
            // Highlight active approach card
            document.querySelectorAll('.approach-card').forEach(card => {
                if (card.getAttribute('data-approach') === approach) {
                    card.style.borderWidth = '4px';
                } else {
                    card.style.borderWidth = '2px';
                }
            });
            
            // Update visualization (simplified representation)
            visualizationContainer.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p><strong>Multiple Perspectives on Climate Change</strong></p>
                    <p>Each approach provides a partial understanding of the complex phenomenon.</p>
                    <p>No single approach can capture the full complexity of climate change.</p>
                </div>
            `;
        });
    });
}

// ----- TRUST NETWORK SIMULATOR -----
function initTrustNetwork() {
    const runButton = document.getElementById('run-simulation');
    const networkType = document.getElementById('network-type');
    const reliability = document.getElementById('reliability');
    const reliabilityValue = document.getElementById('reliability-value');
    const networkCanvas = document.getElementById('network-canvas');
    const networkMetrics = document.getElementById('network-metrics');
    
    // Update reliability slider value display
    reliability.addEventListener('input', function() {
        reliabilityValue.textContent = `${this.value}%`;
    });
    
    runButton.addEventListener('click', function() {
        const type = networkType.value;
        const relValue = parseInt(reliability.value) / 100;
        
        // Simulate network results based on type and reliability
        let consensusRate, consensusSpeed, correctConsensus;
        
        switch(type) {
            case 'complete':
                // Complete network - fast consensus but higher error risk
                consensusSpeed = 'Fast';
                consensusRate = 95;
                correctConsensus = relValue > 0.7 ? 85 : 60;
                break;
            case 'wheel':
                // Wheel network - medium speed, depends heavily on central node
                consensusSpeed = 'Medium';
                consensusRate = 90;
                correctConsensus = relValue > 0.8 ? 90 : 65;
                break;
            case 'chain':
                // Chain network - slow consensus but more resistant to error
                consensusSpeed = 'Slow';
                consensusRate = 75;
                correctConsensus = relValue > 0.6 ? 95 : 70;
                break;
        }
        
        // Adjust for reliability
        correctConsensus = Math.min(Math.round(correctConsensus * relValue * 1.2), 99);
        
        // Draw network visualization (simplified)
        drawNetwork(type, networkCanvas);
        
        // Update metrics
        networkMetrics.innerHTML = `
            <p><strong>Consensus Rate:</strong> ${consensusRate}%</p>
            <p><strong>Speed to Consensus:</strong> ${consensusSpeed}</p>
            <p><strong>Correct Consensus Rate:</strong> ${correctConsensus}%</p>
            <p><strong>Analysis:</strong> ${getNetworkAnalysis(type, consensusSpeed, correctConsensus)}</p>
        `;
    });
    
    function drawNetwork(type, canvas) {
        // Simplified network visualization
        canvas.innerHTML = `<div style="padding: 20px; text-align: center;">
            <p><strong>${type.charAt(0).toUpperCase() + type.slice(1)} Network Visualization</strong></p>
            <p>This would display an interactive network visualization in a full implementation.</p>
        </div>`;
    }
    
    function getNetworkAnalysis(type, speed, correctRate) {
        switch(type) {
            case 'complete':
                return `Complete networks reach consensus quickly but may prematurely converge on incorrect conclusions. This illustrates Zollman's finding that denser communication can sometimes reduce the chance of finding truth.`;
            case 'wheel':
                return `Wheel networks balance speed and accuracy, but place heavy emphasis on the central node's reliability. This structure is common in hierarchical research teams.`;
            case 'chain':
                return `Chain networks are slower to reach consensus but more likely to converge on correct conclusions. This illustrates how some communication constraints can sometimes benefit collective knowledge.`;
        }
    }
}

// ----- COGNITIVE DIVISION SIMULATOR -----
function initCognitiveDivision() {
    const startButton = document.getElementById('start-simulation');
    const resetButton = document.getElementById('reset-simulation');
    const researcherCount = document.getElementById('researcher-count');
    const researcherCountValue = document.getElementById('researcher-count-value');
    const approachDiversity = document.getElementById('approach-diversity');
    const approachDiversityValue = document.getElementById('approach-diversity-value');
    const communicationDensity = document.getElementById('communication-density');
    const communicationDensityValue = document.getElementById('communication-density-value');
    const canvas = document.getElementById('simulation-canvas');
    const insightElement = document.getElementById('simulation-insight');
    
    let simulationRunning = false;
    
    // Update value displays
    researcherCount.addEventListener('input', function() {
        researcherCountValue.textContent = this.value;
    });
    
    approachDiversity.addEventListener('input', function() {
        approachDiversityValue.textContent = this.value;
    });
    
    communicationDensity.addEventListener('input', function() {
        communicationDensityValue.textContent = `${this.value}%`;
    });
    
    startButton.addEventListener('click', function() {
        if (simulationRunning) return;
        
        simulationRunning = true;
        const researchers = parseInt(researcherCount.value);
        const diversity = parseInt(approachDiversity.value);
        const communication = parseInt(communicationDensity.value);
        
        // Simulate research progress
        runSimulation(researchers, diversity, communication);
    });
    
    resetButton.addEventListener('click', function() {
        simulationRunning = false;
        
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset insight
        insightElement.textContent = 'Run a simulation to see results.';
    });
    
    function runSimulation(researchers, diversity, communication) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate simulation outcomes based on parameters
        const successRate = calculateSuccessRate(researchers, diversity, communication);
        const timeToSolution = calculateTimeToSolution(researchers, diversity, communication);
        const insights = generateInsights(researchers, diversity, communication, successRate);
        
        // Display simple visualization
        ctx.fillStyle = '#000';
        ctx.font = '16px Helvetica';
        ctx.fillText('Simulation Results:', 20, 40);
        ctx.fillText(`Researchers: ${researchers}`, 20, 80);
        ctx.fillText(`Approach Diversity: ${diversity}`, 20, 120);
        ctx.fillText(`Communication Density: ${communication}%`, 20, 160);
        ctx.fillText(`Probability of Finding Solution: ${successRate}%`, 20, 200);
        ctx.fillText(`Relative Time to Solution: ${timeToSolution}`, 20, 240);
        
        // Update insights
        insightElement.innerHTML = insights;
    }
    
    function calculateSuccessRate(researchers, diversity, communication) {
        // A simplified model - in reality this would be much more complex
        let baseRate = 50 + (researchers / 2);
        
        // Diversity increases success chance up to a point
        let diversityEffect = diversity * 5;
        if (diversity > 7) diversityEffect = 35 - (diversity - 7) * 2; // Too much diversity can reduce coordination
        
        // Communication has a complex effect
        let communicationEffect = 0;
        if (communication < 30) {
            communicationEffect = -10; // Too little communication is bad
        } else if (communication > 80) {
            communicationEffect = -5; // Too much can lead to groupthink
        } else {
            communicationEffect = 10; // Optimal range
        }
        
        let rate = Math.min(Math.max(baseRate + diversityEffect + communicationEffect, 10), 95);
        return Math.round(rate);
    }
    
    function calculateTimeToSolution(researchers, diversity, communication) {
        // More researchers can speed up solution but with diminishing returns
        let baseTime = 100 / Math.sqrt(researchers);
        
        // Diversity can slow things down but increase quality
        let diversityEffect = diversity * 2;
        
        // Communication speeds things up to a point
        let communicationEffect = -(communication / 5);
        
        let time = baseTime + diversityEffect + communicationEffect;
        time = Math.max(time, 20); // There's a minimum time regardless of parameters
        
        // Translate to descriptive term
        if (time < 40) return "Very Fast";
        if (time < 60) return "Fast";
        if (time < 80) return "Moderate";
        if (time < 100) return "Slow";
        return "Very Slow";
    }
    
    function generateInsights(researchers, diversity, communication, successRate) {
        let insights = "<p><strong>Simulation Insights:</strong></p>";
        
        if (diversity < 3) {
            insights += "<p>Low diversity of approaches limits the exploration of possible solutions. The community may converge too quickly on suboptimal solutions.</p>";
        } else if (diversity > 7) {
            insights += "<p>Very high diversity can make coordination difficult. Researchers may be working on incompatible paradigms.</p>";
        } else {
            insights += "<p>Moderate diversity of approaches allows exploration while maintaining sufficient focus.</p>";
        }
        
        if (communication < 30) {
            insights += "<p>Low communication means researchers aren't effectively sharing results, leading to duplicated efforts.</p>";
        } else if (communication > 80) {
            insights += "<p>Very high communication may lead to premature consensus and groupthink effects.</p>";
        } else {
            insights += "<p>Balanced communication allows knowledge sharing while preserving independent thought.</p>";
        }
        
        if (successRate > 80) {
            insights += "<p>This configuration appears optimal for solving complex problems. The division of cognitive labor is well-balanced.</p>";
        } else if (successRate < 50) {
            insights += "<p>This configuration appears suboptimal. Consider adjusting parameters to improve outcomes.</p>";
        }
        
        return insights;
    }
}

// ----- REPLICATION SIMULATOR -----
function initReplicationSimulator() {
    const runButton = document.getElementById('run-studies');
    const trueEffect = document.getElementById('true-effect');
    const pHacking = document.getElementById('p-hacking');
    const pHackingValue = document.getElementById('p-hacking-value');
    const sampleSize = document.getElementById('sample-size');
    const resultsDiv = document.getElementById('published-results');
    const insightDiv = document.getElementById('replication-insight');
    
    // Update p-hacking value display
    pHacking.addEventListener('input', function() {
        const value = this.value;
        if (value === '0') {
            pHackingValue.textContent = 'None (0%)';
        } else if (value < 30) {
            pHackingValue.textContent = 'Low (' + value + '%)';
        } else if (value < 70) {
            pHackingValue.textContent = 'Moderate (' + value + '%)';
        } else {
            pHackingValue.textContent = 'High (' + value + '%)';
        }
    });
    
    runButton.addEventListener('click', function() {
        const hasEffect = trueEffect.value === 'yes';
        const pHackLevel = parseInt(pHacking.value) / 100;
        let sampleSizeNum;
        
        switch(sampleSize.value) {
            case 'small': sampleSizeNum = 20; break;
            case 'medium': sampleSizeNum = 100; break;
            case 'large': sampleSizeNum = 500; break;
        }
        
        // Run simulation
        const results = simulateStudies(hasEffect, pHackLevel, sampleSizeNum);
        
        // Display results
        displayResults(results, hasEffect, pHackLevel, sampleSizeNum);
    });
    
    function simulateStudies(hasEffect, pHackLevel, sampleSize) {
        // These values would be calculated using statistical methods in a real implementation
        // Here we're using simplified approximations
        
        // Calculate base positive rate (without p-hacking)
        let positiveRate;
        if (hasEffect) {
            // True effect exists
            switch(sampleSize) {
                case 20: positiveRate = 0.35; break;  // Small sample, low power
                case 100: positiveRate = 0.70; break; // Medium sample, moderate power
                case 500: positiveRate = 0.95; break; // Large sample, high power
            }
        } else {
            // No effect exists (false positive rate should be 5% with p<0.05)
            positiveRate = 0.05;
        }
        
        // Add effect of p-hacking
        const pHackEffect = pHackLevel * 0.5; // P-hacking can increase false positives dramatically
        const adjustedPositiveRate = positiveRate + (1 - positiveRate) * pHackEffect;
        
        // Calculate replication rate
        let replicationRate;
        if (hasEffect) {
            // Studies of real effects should replicate based on statistical power
            replicationRate = Math.max(0.1, positiveRate - (pHackLevel * 0.2));
        } else {
            // Studies of null effects should replicate at false positive rate
            replicationRate = 0.05;
        }
        
        // Apply p-hacking penalty to replication
        if (pHackLevel > 0) {
            replicationRate = replicationRate * (1 - pHackLevel * 0.5);
        }
        
        return {
            originalPositiveRate: Math.round(adjustedPositiveRate * 100),
            replicationRate: Math.round(replicationRate * 100),
            publishedPositives: Math.round(adjustedPositiveRate * 100),
            publishedNegatives: 100 - Math.round(adjustedPositiveRate * 100),
            truePositives: hasEffect ? Math.round(positiveRate * 100) : 0,
            falsePositives: hasEffect ? 
                Math.round(adjustedPositiveRate * 100) - Math.round(positiveRate * 100) : 
                Math.round(adjustedPositiveRate * 100)
        };
    }
    
    function displayResults(results, hasEffect, pHackLevel, sampleSize) {
        // Display chart (simplified text version)
        resultsDiv.innerHTML = `
            <div style="padding: 20px; border: 1px solid black; margin-bottom: 20px;">
                <h4>STUDY RESULTS SUMMARY</h4>
                <p>Total studies run: 100</p>
                <p>Studies with positive results: ${results.publishedPositives}%</p>
                <p>Studies with negative results: ${results.publishedNegatives}%</p>
                <p>True positive results: ${results.truePositives}%</p>
                <p>False positive results: ${results.falsePositives}%</p>
                <p>Successful replications of positive results: ${results.replicationRate}%</p>
            </div>
        `;
        
        // Generate insights
        let insights = "<p><strong>Simulation Insights:</strong></p>";
        
        if (hasEffect && results.replicationRate < 50) {
            insights += "<p>Despite studying a real effect, replication success is low. ";
            
            if (pHackLevel > 0.3) {
                insights += "Questionable research practices are undermining replicability.</p>";
            } else if (sampleSize === 20) {
                insights += "Small sample sizes are reducing statistical power, making results unreliable.</p>";
            } else {
                insights += "Consider using larger samples or more precise measurements.</p>";
            }
        } else if (!hasEffect && results.publishedPositives > 20) {
            insights += "<p>There is no true effect, yet many studies show positive results. ";
            
            if (pHackLevel > 0.3) {
                insights += "This illustrates how questionable research practices can generate false positive findings.</p>";
            } else {
                insights += "This demonstrates the base rate of false positives in scientific research.</p>";
            }
        } else if (hasEffect && results.replicationRate > 80) {
            insights += "<p>High replication rates indicate robust research practices and adequate statistical power.</p>";
        }
        
        if (results.falsePositives > 30) {
            insights += "<p>The high rate of false positives would distort the scientific literature on this topic, potentially misleading future research.</p>";
        }
        
        insightDiv.innerHTML = insights;
    }
}