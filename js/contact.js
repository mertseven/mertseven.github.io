document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const transmissionStatus = document.getElementById('transmission-status');
    const inputs = form.querySelectorAll('input, textarea');

    // Form validation and submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            showTransmissionStatus();
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    hideTransmissionStatus();
                    resetForm();
                    showSuccessMessage();
                } else {
                    throw new Error('Transmission failed');
                }
            } catch (error) {
                hideTransmissionStatus();
                showErrorMessage();
            }
        }
    });

    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });

        input.addEventListener('focus', () => {
            clearValidation(input);
        });
    });

    function validateForm() {
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    function validateField(input) {
        const validation = input.parentElement.querySelector('.terminal-validation');
        
        if (!input.value) {
            showValidationMessage(validation, `${input.name} required`);
            return false;
        }

        if (input.type === 'email' && !isValidEmail(input.value)) {
            showValidationMessage(validation, 'invalid transmission frequency');
            return false;
        }

        clearValidation(input);
        return true;
    }

    function showValidationMessage(element, message) {
        element.textContent = message;
        element.style.opacity = 1;
    }

    function clearValidation(input) {
        const validation = input.parentElement.querySelector('.terminal-validation');
        validation.textContent = '';
        validation.style.opacity = 0;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showTransmissionStatus() {
        transmissionStatus.classList.add('visible');
    }

    function hideTransmissionStatus() {
        transmissionStatus.classList.remove('visible');
    }

    function resetForm() {
        form.reset();
    }

    function showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.className = 'terminal-success';
        successMsg.innerHTML = `
            <p>> TRANSMISSION COMPLETE</p>
            <p>> MESSAGE SUCCESSFULLY SENT</p>
            <p>> AWAIT RESPONSE...</p>
        `;
        form.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 5000);
    }

    function showErrorMessage() {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'terminal-error';
        errorMsg.innerHTML = `
            <p>> TRANSMISSION FAILED</p>
            <p>> PLEASE TRY AGAIN LATER</p>
        `;
        form.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 5000);
    }

    // Typewriter effect for headings
    const typewriterElements = document.querySelectorAll('.typewriter');
    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            }
        }
        
        type();
    });
});