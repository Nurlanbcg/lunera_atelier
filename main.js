/* ═══════════════════════════════════════════════════════
   LUNERA ATELIER — Main JavaScript
   ═══════════════════════════════════════════════════════ */

import './style.css';
import { translations } from './translations.js';

// ── Force scroll to top on refresh ──
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ═══════════════════════════════════════
// LANGUAGE SWITCHER
// ═══════════════════════════════════════
let currentLang = localStorage.getItem('lunera-lang') || 'az';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lunera-lang', lang);
    const t = translations[lang];
    if (!t) return;

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update innerHTML (for tags like <br>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key]) el.innerHTML = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // Update active button
    document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
}

// Initialize language on load
setLanguage(currentLang);

// ── DOM Elements ──
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const consultationForm = document.getElementById('consultationForm');
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');

// ── Mobile Nav Overlay ──
const navOverlay = document.createElement('div');
navOverlay.classList.add('nav-overlay');
document.body.appendChild(navOverlay);

// ── Language Switcher Buttons ──
document.querySelectorAll('.lang-switcher__btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// ═══════════════════════════════════════
// STICKY HEADER
// ═══════════════════════════════════════
let lastScroll = 0;

function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = scrollY;
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll(); // initial check

// ═══════════════════════════════════════
// MOBILE HAMBURGER MENU
// ═══════════════════════════════════════
function toggleMenu() {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
    hamburger.classList.remove('active');
    nav.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMenu);
navOverlay.addEventListener('click', closeMenu);

// Close menu on nav link click
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// ═══════════════════════════════════════
// SMOOTH SCROLL WITH OFFSET
// ═══════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const headerHeight = 80; // fixed header height
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// ═══════════════════════════════════════
// SCROLL REVEAL (Intersection Observer)
// ═══════════════════════════════════════
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    }
);

revealElements.forEach(el => revealObserver.observe(el));

// ═══════════════════════════════════════
// FAQ ACCORDION — Details toggle icon
// ═══════════════════════════════════════
// The native <details> element handles open/close.
// We just add a class for the +/× icon rotation (handled by CSS).
// No extra JS needed thanks to [open] CSS selector.

// ═══════════════════════════════════════
// DATE INPUT MASK (DD/MM/YYYY)
// ═══════════════════════════════════════
const dateInput = document.getElementById('eventDate');
if (dateInput) {
    dateInput.addEventListener('input', function (e) {
        let val = this.value.replace(/[^0-9]/g, ''); // digits only
        if (val.length > 8) val = val.slice(0, 8);

        let formatted = '';
        if (val.length > 0) formatted = val.slice(0, 2);
        if (val.length > 2) formatted += '/' + val.slice(2, 4);
        if (val.length > 4) formatted += '/' + val.slice(4, 8);

        this.value = formatted;
    });

    dateInput.addEventListener('keydown', function (e) {
        // Allow backspace, delete, tab, arrows
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        // Allow only digits
        if (!/^\d$/.test(e.key)) e.preventDefault();
        // Block if already at max length
        if (this.value.length >= 10 && !e.ctrlKey) e.preventDefault();
    });
}

// ═══════════════════════════════════════
// CONSULTATION FORM
// ═══════════════════════════════════════
consultationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Gather form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    console.log('Consultation request:', data);

    // Show success modal
    successModal.classList.add('active');

    // Reset form
    this.reset();
});

// Close modal
modalClose.addEventListener('click', () => {
    successModal.classList.remove('active');
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        successModal.classList.remove('active');
        closeMenu();
    }
});

// ═══════════════════════════════════════
// PARALLAX-LIKE HERO EFFECT
// ═══════════════════════════════════════
const heroBg = document.querySelector('.hero__bg img');

function handleHeroParallax() {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrollY < heroHeight) {
        const translate = scrollY * 0.3;
        heroBg.style.transform = `scale(1.05) translateY(${translate}px)`;
    }
}

window.addEventListener('scroll', handleHeroParallax, { passive: true });

// ═══════════════════════════════════════
// CURRENT YEAR (Footer)
// ═══════════════════════════════════════
const yearEl = document.querySelector('.footer__bottom p');
if (yearEl) {
    yearEl.innerHTML = yearEl.innerHTML.replace('2026', new Date().getFullYear());
}
