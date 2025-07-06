// contact.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Dossier Tab Logic ---
    const tabButtons = document.querySelectorAll('.dossier-tab-button');
    const tabContents = document.querySelectorAll('.dossier-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.tab;

            // Update button active state
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update content active state
            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });


    // --- Contact Form Logic (Unchanged from before) ---
    const form = document.getElementById('contactForm');
    const transmissionStatus = document.getElementById('transmission-status');
    const formMessagesContainer = document.getElementById('form-messages-container');
    
    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateForm(inputs)) {
                showTransmissionStatus();
                try {
                    const formData = new FormData(form);
                    const response = await fetch(form.action, {
                        method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
                    });
                    if (response.ok) {
                        hideTransmissionStatus();
                        form.reset();
                        inputs.forEach(input => clearValidation(input));
                        showSuccessMessage();
                    } else {
                        const data = await response.json().catch(() => ({}));
                        throw new Error(data.errors ? data.errors.map(error => error.message).join(", ") : 'Message could not be sent.');
                    }
                } catch (error) {
                    console.error("Form submission error:", error);
                    hideTransmissionStatus();
                    showErrorMessage(error.message || 'Please try again later.');
                }
            }
        });

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearValidation(input));
            input.addEventListener('focus', () => clearValidation(input));
        });
    }

    function validateForm(inputs) {
        let isValid = true;
        inputs.forEach(input => { if (!validateField(input)) isValid = false; });
        return isValid;
    }

    function validateField(input) {
        const validationElement = input.parentElement.querySelector('.terminal-validation');
        if (!validationElement) return true;
        let message = '';
        const labelText = input.labels[0] ? input.labels[0].textContent.trim() : 'This field';

        if (input.hasAttribute('required') && !input.value.trim()) {
            message = `${labelText} is required.`;
        } else if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            message = 'Please enter a valid email address.';
        }
        
        if (message) {
            validationElement.textContent = message;
            input.style.borderColor = '#D32F2F'; return false;
        }
        clearValidation(input);
        return true;
    }

    function clearValidation(input) {
        const validationElement = input.parentElement.querySelector('.terminal-validation');
        if (validationElement) validationElement.textContent = '';
        input.style.borderColor = '#ccc';
    }
    
    function showTransmissionStatus() { if(transmissionStatus) transmissionStatus.classList.add('visible'); }
    function hideTransmissionStatus() { if(transmissionStatus) transmissionStatus.classList.remove('visible'); }

    function displayFormMessage(messageLinesArray, type) {
        if (!formMessagesContainer) return;
        formMessagesContainer.innerHTML = '';
        const msgDiv = document.createElement('div');
        msgDiv.className = type === 'success' ? 'terminal-success' : 'terminal-error';
        messageLinesArray.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            msgDiv.appendChild(p);
        });
        formMessagesContainer.appendChild(msgDiv);
        setTimeout(() => { msgDiv.remove(); }, 7000);
    }

    function showSuccessMessage() {
        displayFormMessage([
            "Message Sent Successfully!",
            "Thank you for reaching out. I'll get back to you as soon as possible."
        ], "success");
    }

    function showErrorMessage(details = "Please try again later.") {
        displayFormMessage([
            "Message Failed to Send.",
            details,
            "You can also reach me directly via email."
        ], "error");
    }
});