/**
 * contact.js — "Get A Free Consultation" form handler
 *
 * Submits to the existing Express /api/contacts endpoint which:
 *  - Saves the contact to MongoDB
 *  - Sends a notification email to customersupport@kfsquare.com via Mailgun
 *  - Sends a confirmation email back to the user
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const form      = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');
        const statusEl  = document.getElementById('form-status');
        const textarea  = document.getElementById('message');

        if (!form) return;

        // ── 1. Placeholder disappears on focus, restores when field is cleared ──
        form.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
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

        // ── 2. Textarea auto-expands as user types ──
        if (textarea) {
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        // ── 3. Inline validation: red border clears as user corrects the field ──
        form.querySelectorAll('[required]').forEach(function (field) {
            ['input', 'change'].forEach(function (evt) {
                field.addEventListener(evt, function () {
                    if (this.value.trim() !== '') {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    }
                });
            });
        });

        // ── 4. Form submission → /api/contacts ──
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Client-side required-field check
            let isValid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                if (field.value.trim() === '') {
                    isValid = false;
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                }
            });

            if (!isValid) {
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                setStatus('Please fill in all required fields.', 'error');
                return;
            }

            // Map form fields to the API schema
            // server.js expects: name, email, message, phone, company, serviceInterest
            const firstName = (document.getElementById('firstName').value || '').trim();
            const lastName  = (document.getElementById('lastName').value  || '').trim();

            const payload = {
                name:            [firstName, lastName].filter(Boolean).join(' '),
                email:           (document.getElementById('email').value       || '').trim(),
                phone:           (document.getElementById('phone').value       || '').trim(),
                company:         (document.getElementById('company').value     || '').trim(),
                serviceInterest: mapService(document.getElementById('service').value),
                budget:          mapBudget(document.getElementById('budget').value),
                industry:        (document.getElementById('industry').value    || ''),
                message:         (textarea.value || '').trim(),
                source:          'website'
            };

            // Loading state
            const originalHTML  = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled  = true;
            setStatus('', '');

            try {
                // API base URL. When the frontend is on a static host (e.g. GitHub
                // Pages) the backend lives on a different origin, so allow overriding
                // via window.KF_API_BASE (set in the HTML). Falls back to same-origin.
                const apiBase  = (window.KF_API_BASE || '').replace(/\/$/, '');
                const endpoint = apiBase + '/api/contacts';

                const response = await fetch(endpoint, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload)
                });

                // Safely parse response — if the server returns HTML (404, crash, nginx
                // error page, or file:// opened directly) JSON.parse would throw the
                // "Unexpected token '<'" error.  Read as text first, then parse.
                const rawText = await response.text();
                let data;
                try {
                    data = JSON.parse(rawText);
                } catch (_) {
                    console.error('Non-JSON server response:', rawText.substring(0, 200));
                    throw new Error(
                        'The server returned an unexpected response. ' +
                        'Make sure the page is opened via the server (http://...) and not as a local file. ' +
                        'You can also reach us at customersupport@kfsquare.com.'
                    );
                }

                if (response.ok && data.success) {
                    // Success
                    submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
                    submitBtn.classList.replace('btn-primary', 'btn-success');
                    setStatus(
                        data.message || 'Thank you! We\'ll respond within 24 hours.',
                        'success'
                    );

                    // Reset form
                    form.reset();
                    if (textarea) textarea.style.height = '';
                    form.querySelectorAll('[data-original-placeholder]').forEach(function (el) {
                        el.setAttribute('placeholder', el.dataset.originalPlaceholder);
                    });
                    form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
                        el.classList.remove('is-valid', 'is-invalid');
                    });

                    // Revert button after 4 s
                    setTimeout(function () {
                        submitBtn.innerHTML = originalHTML;
                        submitBtn.disabled  = false;
                        submitBtn.classList.replace('btn-success', 'btn-primary');
                    }, 4000);

                } else {
                    throw new Error(data.message || 'Submission failed');
                }

            } catch (err) {
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Try Again';
                submitBtn.classList.replace('btn-primary', 'btn-danger');
                setStatus(
                    err.message && err.message.length < 200
                        ? err.message
                        : 'Something went wrong. Please email us directly at customersupport@kfsquare.com.',
                    'error'
                );

                setTimeout(function () {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled  = false;
                    submitBtn.classList.replace('btn-danger', 'btn-primary');
                }, 4000);
            }
        });

        // ── Helpers ──

        function setStatus(msg, type) {
            if (!statusEl) return;
            statusEl.textContent = msg;
            statusEl.className   = 'mt-3 text-center small';
            if (type === 'success') statusEl.classList.add('text-success', 'fw-semibold');
            if (type === 'error')   statusEl.classList.add('text-danger');
        }

        // Map the form's service values to the enum in models/Contact.js
        function mapService(val) {
            const map = {
                'data-analytics':       'other',
                'machine-learning':     'predictive-analytics',
                'ai-integration':       'llm-integration',
                'business-intelligence':'business-intelligence',
                'data-engineering':     'data-engineering',
                'consulting':           'strategic-consulting'
            };
            return map[val] || 'other';
        }

        // Map the form's budget values to the enum in models/Contact.js
        function mapBudget(val) {
            const map = {
                'under-25k':  'under-10k',
                '25k-50k':    '10k-50k',
                '50k-100k':   '50k-100k',
                '100k-250k':  '100k-500k',
                '250k-500k':  '100k-500k',
                'over-500k':  '500k+'
            };
            return map[val] || 'not-specified';
        }

    });

}());

