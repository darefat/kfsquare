/**
 * contact.js — Form behaviour for the "Get A Free Consultation" form
 *
 * Features:
 *  - Placeholder text disappears the moment a field is focused and
 *    is restored only when the field is left empty.
 *  - The message textarea grows automatically as the user types.
 *  - Required-field validation with inline error highlighting.
 *  - Async submission to web3forms with loading / success / error states.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const form      = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');
        const textarea  = document.getElementById('message');

        if (!form) return; // only run on pages that have this form

        // ──────────────────────────────────────────────
        // 1. Placeholder behaviour
        //    • Disappears immediately on focus
        //    • Restored only if the field is still empty on blur
        // ──────────────────────────────────────────────
        form.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {

            // Save the original placeholder text once
            el.dataset.originalPlaceholder = el.getAttribute('placeholder');

            el.addEventListener('focus', function () {
                this.setAttribute('placeholder', '');
            });

            el.addEventListener('blur', function () {
                if (this.value.trim() === '') {
                    this.setAttribute('placeholder', this.dataset.originalPlaceholder);
                }
            });
        });

        // ──────────────────────────────────────────────
        // 2. Textarea auto-expand
        //    Grows with content; never shows a scrollbar
        // ──────────────────────────────────────────────
        if (textarea) {
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        // ──────────────────────────────────────────────
        // 3. Real-time validation feedback
        //    Red border clears as soon as the user starts correcting
        // ──────────────────────────────────────────────
        form.querySelectorAll('[required]').forEach(function (field) {
            field.addEventListener('input', function () {
                if (this.value.trim() !== '') {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });

            field.addEventListener('change', function () {
                if (this.value.trim() !== '') {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        });

        // ──────────────────────────────────────────────
        // 4. Form submission
        // ──────────────────────────────────────────────
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate all required fields
            let isValid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                if (field.value.trim() === '') {
                    isValid = false;
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            if (!isValid) {
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }

            // Show loading state
            const originalHTML  = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled  = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: new FormData(form)
                });

                const data = await response.json();

                if (response.ok) {
                    // Success state
                    submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
                    submitBtn.classList.replace('btn-primary', 'btn-success');

                    // Reset form and textarea height
                    form.reset();
                    if (textarea) textarea.style.height = '';

                    // Restore all placeholders after reset
                    form.querySelectorAll('[data-original-placeholder]').forEach(function (el) {
                        el.setAttribute('placeholder', el.dataset.originalPlaceholder);
                    });

                    // Remove validation classes
                    form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
                        el.classList.remove('is-valid', 'is-invalid');
                    });

                    // Revert button after 3 s
                    setTimeout(function () {
                        submitBtn.innerHTML = originalHTML;
                        submitBtn.disabled  = false;
                        submitBtn.classList.replace('btn-success', 'btn-primary');
                    }, 3000);

                } else {
                    throw new Error(data.message || 'Submission failed');
                }

            } catch (err) {
                // Error state
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Failed — Try Again';
                submitBtn.classList.replace('btn-primary', 'btn-danger');

                setTimeout(function () {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled  = false;
                    submitBtn.classList.replace('btn-danger', 'btn-primary');
                }, 3000);
            }
        });

    });

}());
