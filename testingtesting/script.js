document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit-button');
    const errorMessageDiv = document.getElementById('error-message');

    const donationAmountRadios = document.querySelectorAll('input[name="donation_amount"]');
    const customAmountInput = document.getElementById('custom-amount');

    const paymentFormSection = document.getElementById('payment-form-section');
    const thankYouSection = document.getElementById('thank-you-section');
    const thankYouMessageText = document.getElementById('thank-you-message-text');
    const donateAgainButton = document.getElementById('donate-again-button');

    // Enable/disable custom amount input based on radio selection
    donationAmountRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'custom') {
                customAmountInput.disabled = false;
                customAmountInput.required = true;
                customAmountInput.focus();
            } else {
                customAmountInput.disabled = true;
                customAmountInput.required = false;
                customAmountInput.value = '';
            }
        });
    });

    // Basic card number formatting (add spaces)
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
    });

    // Basic expiry date formatting (MM/YY)
    const expiryDateInput = document.getElementById('expiry-date');
    expiryDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });


    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        // --- Form Data ---
        const formData = new FormData(paymentForm);
        const data = Object.fromEntries(formData.entries());

        // --- Basic Validation ---
        let errors = [];
        if (!data.full_name.trim()) errors.push("Full name is required.");
        if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.push("Valid email is required.");

        let donationValue = data.donation_amount;
        if (donationValue === 'custom') {
            if (!data.custom_amount || parseFloat(data.custom_amount) <= 0) {
                errors.push("Please enter a valid custom donation amount.");
            } else {
                donationValue = parseFloat(data.custom_amount);
            }
        } else {
            donationValue = parseFloat(donationValue);
        }

        // Card details validation (very basic)
        const cardNumber = data.card_number.replace(/\s+/g, '');
        if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
            errors.push("Invalid card number.");
        }
        if (!data.expiry_date.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            errors.push("Invalid expiry date format (MM/YY).");
        } else {
            const [month, year] = data.expiry_date.split('/');
            const expiry = new Date(`20${year}`, month - 1); // Month is 0-indexed
            const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth());
            if (expiry < currentMonth) {
                errors.push("Card has expired.");
            }
        }
        if (!data.cvv || data.cvv.length < 3 || data.cvv.length > 4 || !/^\d+$/.test(data.cvv)) {
            errors.push("Invalid CVV.");
        }

        if (errors.length > 0) {
            errorMessageDiv.innerHTML = errors.join('<br>');
            errorMessageDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Donate Now';
            return;
        }

        // --- Simulate Payment ---
        console.log('Simulating payment with data:', data);
        // In a real app, you'd send this to your backend for processing with a payment gateway.
        setTimeout(() => {
            // Show thank you message
            paymentFormSection.classList.add('hidden');
            thankYouSection.classList.remove('hidden');
            thankYouMessageText.textContent = `Your generous donation of $${donationValue.toFixed(2)} has been "processed". We deeply appreciate your support for animal welfare. A confirmation email has been "sent" to ${data.email}.`;

            // Reset button for this demo
            submitButton.disabled = false;
            submitButton.textContent = 'Donate Now';
        }, 2000); // Simulate 2 seconds processing time
    });

    donateAgainButton.addEventListener('click', () => {
        thankYouSection.classList.add('hidden');
        paymentFormSection.classList.remove('hidden');
        paymentForm.reset();
        customAmountInput.disabled = true; // Reset custom amount state
        customAmountInput.required = false;
        // Ensure the first radio button is checked again
        if(donationAmountRadios.length > 0) {
            donationAmountRadios[0].checked = true;
        }
        errorMessageDiv.style.display = 'none';
    });
});