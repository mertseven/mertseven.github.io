// contact.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const transmissionStatus = document.getElementById('transmission-status');
    const formMessagesContainer = document.getElementById('form-messages-container');
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (validateForm()) {
                showTransmissionStatus();
                try {
                    const formData = new FormData(form);
                    const response = await fetch(form.action, {
                        method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
                    });
                    if (response.ok) {
                        hideTransmissionStatus(); resetForm(); showSuccessMessage();
                    } else {
                        const data = await response.json().catch(() => ({})); // Graceful catch for non-JSON errors
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

    function validateForm() {
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
            message = `${labelText} is required.`; // Modernized
        } else if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value)) {
            message = 'Please enter a valid email address.'; // Modernized
        }
        if (message) {
            showValidationMessage(validationElement, message);
            input.style.borderColor = '#D32F2F'; return false;
        }
        clearValidation(input);
        input.style.borderColor = 'var(--border-color-strong)'; return true;
    }

    function showValidationMessage(element, message) { /* ... (no change needed here for text) ... */ 
        element.textContent = message;
        element.style.opacity = 1;
    }
    function clearValidation(input) { /* ... (no change needed here for text) ... */ 
        const validationElement = input.parentElement.querySelector('.terminal-validation');
        if (validationElement) {
            validationElement.textContent = '';
            validationElement.style.opacity = 0;
        }
        input.style.borderColor = 'var(--border-color-strong)';
    }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function showTransmissionStatus() { if(transmissionStatus) transmissionStatus.classList.add('visible'); }
    function hideTransmissionStatus() { if(transmissionStatus) transmissionStatus.classList.remove('visible'); }
    function resetForm() { if(form) form.reset(); inputs.forEach(clearValidation); }

    function displayFormMessage(messageLinesArray, type) { // Expects an array of lines
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
        displayFormMessage([ // Modernized
            "Message Sent Successfully!",
            "Thank you for reaching out.",
            "I'll get back to you as soon as possible."
        ], "success");
    }

    function showErrorMessage(details = "Please try again later.") {
        displayFormMessage([ // Modernized
            "Message Failed to Send.",
            details,
            "You can also reach me directly via email."
        ], "error");
    }

    // Typewriter effect
    const typewriterElements = document.querySelectorAll('.page-header-section-contact h1.typewriter');
    typewriterElements.forEach(element => {
        const text = element.textContent.trim(); 
        element.textContent = ''; 
        let i = 0;
        element.style.borderRightColor = 'var(--text-color-primary)';
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i); i++; setTimeout(type, 90);
            } else {
                element.classList.add('typewriter-active'); 
            }
        }
        setTimeout(type, 500); 
    });
});