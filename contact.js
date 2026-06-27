/**
 * contact.js — Form behavior for the KFSQUARE consultation form.
 *
 * Features:
 *  - Placeholder text clears when users focus/type and returns only when empty.
 *  - Message textarea auto-expands as users type.
 *  - Required-field validation with Bootstrap-style feedback classes.
 *  - Sends form submissions to customersupport@kfsquare.com through FormSubmit.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitBtn = document.getElementById('submit-btn');
        const textarea = document.getElementById('message');
        const status = document.getElementById('form-status');
        const endpoint = 'https://formsubmit.co/ajax/customersupport@kfsquare.com';

        const setStatus = function (message, type) {
            if (!status) return;
            status.textContent = message || '';
            status.className = 'mt-3 text-center small';
            if (type) status.classList.add(type === 'success' ? 'text-success' : 'text-danger');
        };

        const setButton = function (html, disabled, className) {
            if (!submitBtn) return;
            submitBtn.innerHTML = html;
            submitBtn.disabled = Boolean(disabled);
            submitBtn.classList.remove('btn-primary', 'btn-success', 'btn-danger');
            submitBtn.classList.add(className || 'btn-primary');
        };

        // Placeholder handling: hide on focus/input; restore only when the field is empty.
        form.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (field) {
            field.dataset.originalPlaceholder = field.getAttribute('placeholder') || '';

            const hidePlaceholder = function () {
                field.setAttribute('placeholder', '');
            };

            const restorePlaceholderIfEmpty = function () {
                if (field.value.trim() === '') {
                    field.setAttribute('placeholder', field.dataset.originalPlaceholder);
                }
            };

            field.addEventListener('focus', hidePlaceholder);
            field.addEventListener('input', hidePlaceholder);
            field.addEventListener('blur', restorePlaceholderIfEmpty);
        });

        // Auto-grow message box.
        const resizeTextarea = function () {
            if (!textarea) return;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };
        if (textarea) {
            textarea.addEventListener('input', resizeTextarea);
            resizeTextarea();
        }

        // Live validation cleanup.
        form.querySelectorAll('[required]').forEach(function (field) {
            const validateField = function () {
                const valid = field.checkValidity() && field.value.trim() !== '';
                field.classList.toggle('is-invalid', !valid);
                field.classList.toggle('is-valid', valid);
                return valid;
            };

            field.addEventListener('input', validateField);
            field.addEventListener('change', validateField);
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            setStatus('', null);

            let isValid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                const valid = field.checkValidity() && field.value.trim() !== '';
                field.classList.toggle('is-invalid', !valid);
                field.classList.toggle('is-valid', valid);
                if (!valid) isValid = false;
            });

            if (!isValid) {
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus({ preventScroll: true });
                }
                setStatus('Please complete all required fields before sending.', 'error');
                return;
            }

            const originalButtonHtml = submitBtn ? submitBtn.innerHTML : '';
            setButton('<i class="fas fa-spinner fa-spin me-2"></i>Sending...', true, 'btn-primary');

            try {
                const formData = new FormData(form);
                formData.append('_replyto', formData.get('email') || '');

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Form submission failed.');
                }

                setButton('<i class="fas fa-check me-2"></i>Message Sent!', true, 'btn-success');
                setStatus('Thank you. Your message has been sent to customersupport@kfsquare.com.', 'success');

                form.reset();
                if (textarea) textarea.style.height = '';
                form.querySelectorAll('[data-original-placeholder]').forEach(function (field) {
                    field.setAttribute('placeholder', field.dataset.originalPlaceholder);
                });
                form.querySelectorAll('.is-valid, .is-invalid').forEach(function (field) {
                    field.classList.remove('is-valid', 'is-invalid');
                });

                window.setTimeout(function () {
                    setButton(originalButtonHtml || '<i class="fas fa-paper-plane me-2"></i>Send Message', false, 'btn-primary');
                }, 3000);
            } catch (error) {
                setButton('<i class="fas fa-exclamation-circle me-2"></i>Failed — Try Again', false, 'btn-danger');
                setStatus('The message could not be sent. Please try again or email customersupport@kfsquare.com directly.', 'error');

                window.setTimeout(function () {
                    setButton(originalButtonHtml || '<i class="fas fa-paper-plane me-2"></i>Send Message', false, 'btn-primary');
                }, 3000);
            }
        });
    });
}());
