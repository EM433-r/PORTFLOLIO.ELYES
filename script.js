'use strict';

/* ================================================================
   SPLASH FOOD — script.js
   Sticky nav · Active section · Hamburger · Scroll animations
   ================================================================ */


// ── DOM references ─────────────────────────────────────────────
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const navMobile   = document.getElementById('nav-mobile');
const navLinks    = document.querySelectorAll('[data-nav]');
const mobileLinks = document.querySelectorAll('[data-nav-mobile]');
const sections    = document.querySelectorAll('section[id]');
const fadeEls     = document.querySelectorAll('.fade-up');


// ── 1. Sticky header ───────────────────────────────────────────
function updateHeader () {
  header.classList.toggle('scrolled', window.scrollY > 50);
}


// ── 2. Active nav link (IntersectionObserver) ──────────────────
const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === id);
      });
    });
  },
  { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
);

sections.forEach(s => sectionObserver.observe(s));


// ── 3. Scroll-triggered fade-up animations ─────────────────────
const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.10 }
);

fadeEls.forEach(el => fadeObserver.observe(el));


// ── 4. Hamburger menu ──────────────────────────────────────────
function setMenuOpen (open) {
  hamburger.classList.toggle('open', open);
  navMobile.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  // Prevent body scroll when menu is open
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => {
  setMenuOpen(!navMobile.classList.contains('open'));
});

// Close on mobile link click
mobileLinks.forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// Close on outside click
document.addEventListener('click', e => {
  if (!header.contains(e.target) && navMobile.classList.contains('open')) {
    setMenuOpen(false);
  }
});

// Close on resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) setMenuOpen(false);
}, { passive: true });


// ── 5. Smooth scroll for anchor links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ── 6. Menu carousel (prev / next + dots) ──────────────────────
(function initCarousel () {
  const carousel = document.getElementById('menuCarousel');
  const btnPrev  = document.getElementById('menuPrev');
  const btnNext  = document.getElementById('menuNext');
  const dots     = document.querySelectorAll('.carousel-dot');
  if (!carousel || !btnPrev || !btnNext) return;

  const scrollStep = () => carousel.offsetWidth * 0.75;

  btnPrev.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });
  btnNext.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });

  function updateUI () {
    const left     = carousel.scrollLeft;
    const maxLeft  = carousel.scrollWidth - carousel.clientWidth;
    const atStart  = left <= 1;
    const atEnd    = left >= maxLeft - 1;

    btnPrev.style.opacity       = atStart ? '0' : '1';
    btnPrev.style.pointerEvents = atStart ? 'none' : 'auto';
    btnNext.style.opacity       = atEnd   ? '0' : '1';
    btnNext.style.pointerEvents = atEnd   ? 'none' : 'auto';

    // Update dots
    if (dots.length) {
      const cards     = carousel.querySelectorAll('.menu-card');
      const cardWidth = cards[0] ? cards[0].offsetWidth : 1;
      const active    = Math.round(left / (cardWidth + 20));
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }
  }

  carousel.addEventListener('scroll', updateUI, { passive: true });
  updateUI();

  // Drag-to-scroll (desktop)
  let isDown = false, startX, scrollStart;
  carousel.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
  });
  document.addEventListener('mouseup',   () => { isDown = false; });
  carousel.addEventListener('mouseleave',() => { isDown = false; });
  carousel.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    carousel.scrollLeft = scrollStart - (e.pageX - carousel.offsetLeft - startX);
  });
}());


// ── Init ───────────────────────────────────────────────────────
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader(); // Set initial state
