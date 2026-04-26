/* ================================================================
   ELLOLING Corporation — nav.js  (Production Build)
   Security: XSS sanitisation, input validation, CSP-safe,
             honeypot spam protection, rate-limiting, CSRF token
   Contact : info@elloling.com | support@elloling.com
   Phone   : +91 73057 92178
   ================================================================ */
'use strict';

/* ── Security helpers ── */
const SEC = {
    /* Escape HTML to prevent XSS */
    escHtml: s => String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;'),

    /* Validate email */
    validEmail: e => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(String(e).trim()),

    /* Validate phone — Indian formats */
    validPhone: p => !p || /^[\+\d\s\-()]{7,15}$/.test(String(p).trim()),

    /* Validate pincode — 6 digit Indian */
    validPin: p => /^\d{6}$/.test(String(p).trim()),

    /* Strip script/event tags from any text */
    sanitise: s => String(s).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/<[^>]+>/g, '').trim().slice(0, 2000),

    /* Rate limiter — max N calls per window ms */
    rateLimit(key, max, windowMs) {
        const now = Date.now();
        const k = 'el_rl_' + key;
        let data;
        try { data = JSON.parse(sessionStorage.getItem(k) || '{"n":0,"t":0}'); } catch (e) { data = { n: 0, t: 0 }; }
        if (now - data.t > windowMs) { data = { n: 0, t: now }; }
        data.n++;
        try { sessionStorage.setItem(k, JSON.stringify(data)); } catch (e) {}
        return data.n <= max;
    },

    /* Generate simple CSRF token stored in sessionStorage */
    csrfToken() {
        let t;
        try { t = sessionStorage.getItem('el_csrf'); } catch (e) {}
        if (!t) {
            t = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
            try { sessionStorage.setItem('el_csrf', t); } catch (e) {}
        }
        return t;
    }
};

/* ── Inject CSRF token into all forms ── */
function seedCsrfTokens() {
    const token = SEC.csrfToken();
    document.querySelectorAll('form').forEach(form => {
        if (!form.querySelector('input[name="_csrf"]')) {
            const inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = '_csrf';
            inp.value = token;
            form.appendChild(inp);
        }
        /* Inject honeypot field (bot trap — hidden from real users) */
        if (!form.querySelector('input[name="_trap"]')) {
            const trap = document.createElement('input');
            trap.type = 'text';
            trap.name = '_trap';
            trap.tabIndex = -1;
            trap.autocomplete = 'off';
            trap.setAttribute('aria-hidden', 'true');
            trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
            form.appendChild(trap);
        }
    });
}

/* ── Success dialog modal ── */
(function injectDialog() {
    if (document.getElementById('el-success-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'el-success-modal';
    /* Use textContent only — no innerHTML with user data */
    const overlay = document.createElement('div');
    overlay.id = 'el-modal-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(10,10,20,0.78);z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

    const box = document.createElement('div');
    box.style.cssText = 'background:#ffffff;border-radius:16px;padding:48px 40px 40px;max-width:440px;width:90%;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.3);position:relative;';

    const icon = document.createElement('div');
    icon.style.cssText = 'width:72px;height:72px;border-radius:50%;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2rem;';
    icon.textContent = '✅';

    const title = document.createElement('h2');
    title.id = 'el-modal-title';
    title.style.cssText = "font-family:'Lato',Arial,sans-serif;font-size:1.35rem;font-weight:900;color:#1A1A2E;margin-bottom:10px;";
    title.textContent = 'Message Sent!';

    const body = document.createElement('p');
    body.id = 'el-modal-body';
    body.style.cssText = "font-family:'Lato',Arial,sans-serif;font-size:.9rem;color:#555b6e;line-height:1.7;margin-bottom:28px;";
    body.textContent = 'Thank you for reaching out. Our team will respond within one business day.';

    const btn = document.createElement('button');
    btn.id = 'el-modal-close';
    btn.style.cssText = 'background:#E42527;color:white;border:none;border-radius:8px;font-family:Lato,Arial,sans-serif;font-weight:700;font-size:.95rem;padding:13px 36px;cursor:pointer;width:100%;';
    btn.textContent = 'Back to Home';

    box.append(icon, title, body, btn);
    overlay.appendChild(box);
    modal.appendChild(overlay);
    document.body.appendChild(modal);

    /* Animation */
    const style = document.createElement('style');
    style.textContent = '@keyframes elModalIn{from{opacity:0;transform:scale(.88) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}} #el-modal-close:hover{background:#c41e20!important;transform:translateY(-1px);}';
    document.head.appendChild(style);
    box.style.animation = 'none';

    const goHome = () => {
        overlay.style.display = 'none';
        window.location.replace('index.html');
    };
    btn.addEventListener('click', goHome);
    overlay.addEventListener('click', e => { if (e.target === overlay) goHome(); });
    /* Keyboard accessibility */
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.style.display === 'flex') goHome(); });
})();

window.showSuccessDialog = function(title, body) {
    const overlay = document.getElementById('el-modal-overlay');
    if (!overlay) return;
    /* Use textContent — never innerHTML — to prevent XSS */
    document.getElementById('el-modal-title').textContent = String(title || 'Done!').slice(0, 100);
    document.getElementById('el-modal-body').textContent = String(body || '').slice(0, 300);
    overlay.style.display = 'flex';
    /* Animate */
    const box = overlay.firstElementChild;
    box.style.animation = 'none';
    requestAnimationFrame(() => { box.style.animation = 'elModalIn .35s cubic-bezier(.34,1.56,.64,1) forwards'; });
};

/* ── Nav scroll shadow ── */
const navEl = document.querySelector('.nav');
if (navEl) window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

/* ── Mobile hamburger ── */
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobile-menu');
if (ham && mob) {
    ham.addEventListener('click', () => {
        mob.classList.toggle('open');
        const open = mob.classList.contains('open');
        const sp = ham.querySelectorAll('span');
        sp[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
        sp[1].style.opacity = open ? '0' : '1';
        sp[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
}

/* ── Scroll reveal (IntersectionObserver — no layout thrash) ── */
const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revObs.unobserve(e.target);
        }
    });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── Counter animation ── */
function animCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    const start = performance.now();
    const tick = now => {
        const p = Math.min((now - start) / 1800, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            animCounter(e.target);
            cntObs.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {

    seedCsrfTokens();

    /* ── Form submission handler ── */
    ['contact-form', 'support-form', 'cctv-form'].forEach(id => {
        const form = document.getElementById(id);
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            /* ── Bot / honeypot check ── */
            const trap = this.querySelector('input[name="_trap"]');
            if (trap && trap.value.trim() !== '') {
                console.warn('Bot submission blocked.');
                return;
            }

            /* ── Rate limiting — max 3 submissions per 10 min ── */
            if (!SEC.rateLimit('form_' + id, 3, 10 * 60 * 1000)) {
                window.showSuccessDialog('Too Many Requests', 'Please wait a few minutes before submitting again.');
                return;
            }

            /* ── Input validation ── */
            const emailEl = this.querySelector('input[type="email"]');
            const phoneEl = this.querySelector('input[type="tel"]');

            if (emailEl && !SEC.validEmail(emailEl.value)) {
                emailEl.focus();
                emailEl.style.borderColor = '#E42527';
                emailEl.setAttribute('aria-invalid', 'true');
                setTimeout(() => {
                    emailEl.style.borderColor = '';
                    emailEl.removeAttribute('aria-invalid');
                }, 3000);
                return;
            }
            if (phoneEl && !SEC.validPhone(phoneEl.value)) {
                phoneEl.focus();
                return;
            }

            /* ── Sanitise all text inputs before sending ── */
            this.querySelectorAll('input[type="text"],textarea').forEach(inp => {
                inp.value = SEC.sanitise(inp.value);
            });

            const btn = this.querySelector('button[type="submit"],.submit-btn');
            const origText = btn ? btn.textContent : '';
            if (btn) {
                btn.textContent = 'Sending\u2026';
                btn.disabled = true;
            }

            /* ── Formspree live submission ── */
            const FORMSPREE_IDS = {
                'contact-form': 'xyklayek',
                'support-form': 'xdayvoeq',
                'cctv-form': 'myklaywk'
            };
            const endpoint = 'https://formspree.io/f/' + (FORMSPREE_IDS[id] || FORMSPREE_IDS['contact-form']);

            fetch(endpoint, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                })
                .then(r => {
                    if (!r.ok) return r.json().then(d => { throw new Error(d.error || 'Server error'); });
                    this.reset();
                    seedCsrfTokens();
                    showFormDialog(id);
                })
                .catch(err => {
                    console.error('Formspree error:', err);
                    if (btn) {
                        btn.textContent = 'Error — Please Try Again';
                        btn.disabled = false;
                    }
                })
                .finally(() => {
                    if (btn) {
                        btn.textContent = origText;
                        btn.disabled = false;
                    }
                });
        });
    });

    function showFormDialog(formId) {
        const msgs = {
            'support-form': ['Support Request Submitted!', 'Your ticket is logged. We will respond within your SLA time. For P1 emergencies call +91 73057 92178.'],
            'cctv-form': ['Survey Booked!', 'Our technician will confirm your site survey within 4 working hours. We will call you shortly.'],
            'contact-form': ['Message Sent!', 'Thank you for reaching out. Our team will get back to you within one business day at info@elloling.com.']
        };
        const [t, b] = msgs[formId] || msgs['contact-form'];
        window.showSuccessDialog(t, b);
    }

    /* ── Tab navigation ── */
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            if (!target) return;
            const wrap = btn.closest('.tab-wrap') || document;
            wrap.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            wrap.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });

    /* ── FAQ accordion ── */
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    /* ── Pincode enter key ── */
    const pinInput = document.getElementById('pincode-input');
    if (pinInput) {
        pinInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); if (window.checkPincode) window.checkPincode(); }
        });
        /* Only allow digits */
        pinInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });
    }

});

/* ── Pincode checker ── */
(function() {
    const covered = new Set();
    for (let i = 1; i <= 130; i++) covered.add(String(600000 + i));
    ['603001', '603002', '603103', '603104', '603110', '603202', '603211', '603302', '603401'].forEach(p => covered.add(p));

    window.checkPincode = function() {
        if (!SEC.rateLimit('pincode', 20, 60000)) return; /* max 20 checks/min */
        const input = document.getElementById('pincode-input');
        const result = document.getElementById('pincode-result');
        const bookBtn = document.getElementById('pincode-book');
        if (!input || !result) return;
        const val = input.value.trim();

        if (!SEC.validPin(val)) {
            result.style.display = 'block';
            result.className = 'pincode-result unavailable';
            result.textContent = 'Please enter a valid 6-digit pincode.';
            if (bookBtn) bookBtn.style.display = 'none';
            return;
        }
        result.style.display = 'block';
        if (covered.has(val)) {
            result.className = 'pincode-result available';
            /* Safe: use textContent, not innerHTML, for user-supplied val */
            result.textContent = '\u2713 We service pincode ' + val + '. A technician can visit within 24\u201348 hours.';
            if (bookBtn) bookBtn.style.display = 'inline-flex';
        } else {
            result.className = 'pincode-result unavailable';
            result.textContent = "We\u2019re not yet in pincode " + val + " \u2014 expanding monthly! Leave your details and we\u2019ll notify you.";
            if (bookBtn) bookBtn.style.display = 'none';
        }
    };
})();

/* ── Disable right-click context menu on images (basic protection) ── */
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
});

/* ── Console warning for would-be hackers ── */
console.log('%c\u26a0\ufe0f ELLOLING Corporation', 'color:#E42527;font-size:18px;font-weight:bold;');
console.log('%cThis is a production website. Unauthorised attempts to tamper with this site are logged and may be reported.', 'color:#555;font-size:12px;');