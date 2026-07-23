/**
 * contact.js — Project inquiry form handler for contact.html
 *
 * Submits to POST /api/contacts (Express + MongoDB).
 * Falls back to same-origin if window.KF_API_BASE is not set.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        var form      = document.getElementById('contact-form');
        if (!form) return;

        var submitBtn = document.getElementById('submit-btn');
        var statusEl  = document.getElementById('form-status');
        var textarea  = document.getElementById('message');

        // ── Helpers ──────────────────────────────────────────────────────────

        function valueOf(name) {
            var el = form.elements.namedItem(name);
            return el && typeof el.value === 'string' ? el.value.trim() : '';
        }

        function setStatus(msg, type) {
            if (!statusEl) return;
            statusEl.textContent = msg;
            statusEl.className   = type ? 'visible status-' + type : '';
        }

        function setSubmit(label, disabled) {
            if (!submitBtn) return;
            submitBtn.innerHTML = label;
            submitBtn.disabled  = Boolean(disabled);
        }

        function mapService(val) {
            var map = {
                'data-analytics':       'other',
                'predictive-modeling':  'predictive-analytics',
                'process-automation':   'process-automation',
                'business-intelligence':'business-intelligence',
                'data-engineering':     'data-engineering',
                'data-governance':      'data-governance',
                'consulting':           'strategic-consulting',
                'strategic-consulting': 'strategic-consulting'
            };
            return map[val] || 'other';
        }

        // ── Placeholder UX ───────────────────────────────────────────────────

        form.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
            el.dataset.ph = el.getAttribute('placeholder') || '';
            el.addEventListener('focus', function () { this.setAttribute('placeholder', ''); });
            el.addEventListener('blur',  function () {
                if (this.value.trim() === '') this.setAttribute('placeholder', this.dataset.ph);
            });
        });

        // ── Textarea auto-grow ───────────────────────────────────────────────

        if (textarea) {
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        // ── Live validation ──────────────────────────────────────────────────

        form.querySelectorAll('[required]').forEach(function (field) {
            ['input', 'change'].forEach(function (evt) {
                field.addEventListener(evt, function () {
                    var ok = this.value.trim() !== '' && this.checkValidity();
                    this.classList.toggle('is-valid',   ok);
                    this.classList.toggle('is-invalid', !ok);
                });
            });
        });

        // ── Subject pre-fill from query string ──────────────────────────────

        (function prefillFromQuery() {
            var params  = new URLSearchParams(window.location.search);
            var subject = params.get('subject');
            if (!subject) return;

            var msgEl = document.getElementById('message');
            if (msgEl && !msgEl.value) {
                msgEl.value = subject;
                msgEl.dispatchEvent(new Event('input'));
            }
        }());

        // ── Scroll reveal ────────────────────────────────────────────────────

        (function initReveal() {
            if (!('IntersectionObserver' in window)) {
                document.querySelectorAll('.reveal').forEach(function (el) {
                    el.classList.add('visible');
                });
                return;
            }
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12 });
            document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
        }());

        // ── Nav toggle ───────────────────────────────────────────────────────

        var navToggle = document.getElementById('nav-toggle');
        var navLinks  = document.getElementById('nav-links');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function () {
                navLinks.classList.toggle('open');
            });
        }

        // ── Form submission ──────────────────────────────────────────────────

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            setStatus('', null);

            var valid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                var ok = field.value.trim() !== '' && field.checkValidity();
                field.classList.toggle('is-valid',   ok);
                field.classList.toggle('is-invalid', !ok);
                if (!ok) valid = false;
            });

            if (!valid) {
                var first = form.querySelector('.is-invalid');
                if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus({ preventScroll: true }); }
                setStatus('Please complete all required fields before sending.', 'error');
                return;
            }

            var firstName = valueOf('firstName');
            var lastName  = valueOf('lastName');
            var payload = {
                name:            [firstName, lastName].filter(Boolean).join(' '),
                email:           valueOf('email'),
                phone:           valueOf('phone'),
                company:         valueOf('company'),
                serviceInterest: mapService(valueOf('service')),
                message:         valueOf('message')
            };

            var originalLabel = submitBtn ? submitBtn.innerHTML : '';
            setSubmit('<i class="fas fa-spinner fa-spin me-2"></i>Sending…', true);

            var apiBase  = (window.KF_API_BASE || '').replace(/\/$/, '');
            var endpoint = apiBase + '/api/contacts';

            fetch(endpoint, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            })
            .then(function (res) {
                return res.text().then(function (raw) {
                    var data;
                    try { data = JSON.parse(raw); } catch (_) {
                        throw new Error(
                            'Unexpected server response. Make sure the page is served via http:// ' +
                            'or reach us directly at customersupport@kfsquare.com.'
                        );
                    }
                    if (!res.ok) throw new Error(data.message || data.error || ('Server error ' + res.status));
                    return data;
                });
            })
            .then(function (data) {
                if (!data.success) throw new Error(data.message || 'Submission failed.');

                setSubmit('<i class="fas fa-check me-2"></i>Message Sent!', true);
                setStatus('Thank you — we\'ll respond within one business day.', 'success');

                form.reset();
                if (textarea) textarea.style.height = '';

                form.querySelectorAll('[data-ph]').forEach(function (el) {
                    el.setAttribute('placeholder', el.dataset.ph);
                });
                form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
                    el.classList.remove('is-valid', 'is-invalid');
                });

                setTimeout(function () {
                    setSubmit(originalLabel || '<i class="fas fa-paper-plane me-2"></i>Send Message', false);
                }, 4000);
            })
            .catch(function (err) {
                setSubmit('<i class="fas fa-exclamation-circle me-2"></i>Try Again', false);
                setStatus(
                    err.message && err.message.length < 220
                        ? err.message
                        : 'Something went wrong. Please email us directly at customersupport@kfsquare.com.',
                    'error'
                );
            });
        });

    });

}());

