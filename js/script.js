/* ═══════════════════════════════════════════════════════════════
   CANDELA CONSTRUCTION — script.js
   Modules: Navbar · Hero Slider · Scroll Reveal · Portfolio Filter
            Portfolio Modal · Contact Form Validation · Active Links
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────── UTILITY */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────── NAVBAR */
(function initNavbar() {
  const navbar     = qs('#navbar');
  const toggle     = qs('#navToggle');
  const mobileMenu = qs('#mobileMenu');
  const desktopLinks = qsa('.nav-links a[href^="#"]');
  const mobileLinks  = qsa('.mobile-menu a[href^="#"]');
  const allNavLinks  = [...desktopLinks, ...mobileLinks];

  // ── Scroll: darken + blur on desktop
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const isOpen = () => mobileMenu.classList.contains('open');

  const closeMenu = () => {
    toggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    toggle.classList.add('open');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };

  // ── Hamburger toggle
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // ── Close when a menu link is tapped
  mobileMenu.addEventListener('click', e => {
    if (e.target.tagName === 'A') closeMenu();
  });

  // ── Close on outside click
  document.addEventListener('click', e => {
    if (isOpen() && !navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // ── Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  // ── Reset on resize to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) closeMenu();
    }, 100);
  });

  // ── Active link highlight on scroll (desktop nav-links)
  const sections = qsa('section[id], footer[id]');

  const updateActive = () => {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let active = null;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid) active = sec.id;
    });
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
    });
  };

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

/* ─────────────────────────────── HERO SLIDER */
(function initHeroSlider() {
  const slides       = qsa('.hero-slide');
  const totalEl      = qs('#totalSlides');
  const currentEl    = qs('#currentSlide');
  const fillEl       = qs('#counterFill');
  const total        = slides.length;
  let   idx          = 0;
  let   timer        = null;
  const INTERVAL     = 5500;

  if (!slides.length || !totalEl || !currentEl || !fillEl) return;
  totalEl.textContent = String(total).padStart(2, '0');

  const goTo = (n) => {
    slides[idx].classList.remove('active');
    idx = (n + total) % total;
    slides[idx].classList.add('active');
    currentEl.textContent = String(idx + 1).padStart(2, '0');
    fillEl.style.width = `${((idx + 1) / total) * 100}%`;
  };

  const autoPlay = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(idx + 1), INTERVAL);
  };

  goTo(0);
  autoPlay();

  // Pause on visibility change to avoid drift
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else autoPlay();
  });
})();

/* ─────────────────────────────── HERO MEDIA SLIDER (right card) */
(function initHeroMediaSlider() {
  const slides = qsa('.hero-media-slide');
  const dotsWrap = qs('#heroMediaDots');
  if (!slides.length || !dotsWrap) return;

  let idx = 0;
  let timer = null;
  const INTERVAL = 4200;

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'hero-media-dot' + (i === idx ? ' active' : '');
      dotsWrap.appendChild(dot);
    });
  };

  const updateDots = () => {
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  const goTo = (n) => {
    slides[idx].classList.remove('active');
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add('active');
    updateDots();
  };

  const autoPlay = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(idx + 1), INTERVAL);
  };

  buildDots();
  goTo(0);
  autoPlay();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else autoPlay();
  });
})();

/* ─────────────────────────────── INTERSECTION OBSERVER — REVEAL ON SCROLL */
(function initReveal() {
  const revealEls = qsa('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────── PORTFOLIO FILTER */
(function initPortfolioFilter() {
  const btns  = qsa('.filter-btn');
  const items = qsa('.portfolio-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });
})();

/* ─────────────────────────────── PORTFOLIO MODAL — PER-PROJECT GALLERY */
(function initPortfolioModal() {
  const overlay     = qs('#modalOverlay');
  const closeBtn    = qs('#modalClose');
  const modalImg    = qs('#modalImg');
  const modalCap    = qs('#modalCaption');
  const modalDots   = qs('#modalDots');
  const modalCtr    = qs('#modalCounter');
  const modalCat    = qs('#modalProjectCat');
  const modalName   = qs('#modalProjectName');
  const prevBtn     = qs('#modalPrev');
  const nextBtn     = qs('#modalNext');

  // State for current project gallery
  let images  = [];   // array of {src, caption}
  let current = 0;

  /* ── Build dot indicators ── */
  const buildDots = () => {
    modalDots.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'modal-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Photo ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      modalDots.appendChild(dot);
    });
  };

  const updateDots = () => {
    qsa('.modal-dot', modalDots).forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  };

  const updateCounter = () => {
    modalCtr.innerHTML = `<em>${current + 1}</em> / ${images.length}`;
  };

  /* ── Load a specific image index with fade ── */
  const goTo = (idx) => {
    current = (idx + images.length) % images.length;
    modalImg.classList.add('fading');
    setTimeout(() => {
      modalImg.src = images[current].src;
      modalImg.alt = images[current].caption || '';
      modalCap.textContent = images[current].caption || '';
      modalImg.classList.remove('fading');
    }, 220);
    updateDots();
    updateCounter();
    // Show/hide nav arrows when only 1 image
    const showNav = images.length > 1;
    prevBtn.style.display = showNav ? '' : 'none';
    nextBtn.style.display = showNav ? '' : 'none';
  };

  /* ── Open modal for a given card element ── */
  const openModal = (cardEl) => {
    // Parse images from data attribute
    try {
      images = JSON.parse(cardEl.dataset.images || '[]');
    } catch {
      images = [];
    }
    if (!images.length) return;

    // Fill project header
    modalCat.textContent  = cardEl.dataset.projectCat || '';
    modalName.textContent = cardEl.dataset.project    || '';

    current = 0;
    buildDots();
    // Set image immediately (no fade on open)
    modalImg.src = images[0].src;
    modalImg.alt = images[0].caption || '';
    modalCap.textContent = images[0].caption || '';
    updateCounter();

    const showNav = images.length > 1;
    prevBtn.style.display = showNav ? '' : 'none';
    nextBtn.style.display = showNav ? '' : 'none';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition to avoid flash on reopen
    setTimeout(() => { modalImg.src = ''; }, 400);
  };

  /* ── Attach zoom buttons ── */
  qsa('.portfolio-item').forEach(item => {
    const btn = qs('.portfolio-zoom', item);
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(item);
    });
  });

  /* ── Controls ── */
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Touch / swipe ── */
  let touchStartX = 0;
  overlay.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });
})();

/* ─────────────────────────────── CONTACT FORM VALIDATION */
(function initContactForm() {
  const form       = qs('#contactForm');
  const successEl  = qs('#formSuccess');
  if (!form) return;

  const validators = {
    name:    v => v.trim().length >= 2,
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    service: v => v !== '',
    message: v => v.trim().length >= 10,
  };

  const validate = (input) => {
    const name = input.name;
    if (!validators[name]) return true;   // optional fields
    const ok = validators[name](input.value);
    input.classList.toggle('error', !ok);
    input.closest('.form-group').classList.toggle('show-error', !ok);
    return ok;
  };

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validate(input);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    let allValid = true;
    form.querySelectorAll('input, select, textarea').forEach(input => {
      if (!validate(input)) allValid = false;
    });

    if (!allValid) return;

    // Simulate submission
    const btn = qs('[type="submit"]', form);
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Enquiry';
      successEl.classList.add('visible');
      setTimeout(() => successEl.classList.remove('visible'), 6000);
    }, 1200);
  });
})();

/* ─────────────────────────────── SMOOTH SCROLL (fallback for older browsers) */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─────────────────────────────── PARALLAX — HERO (subtle) */
(function initHeroParallax() {
  const overlay = qs('.hero-overlay');
  if (!overlay) return;
  // If hero overlay is disabled via CSS, parallax is not needed.
  if (getComputedStyle(overlay).display === 'none') return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y     = window.scrollY;
        const limit = window.innerHeight;
        if (y < limit) {
          const progress = y / limit;
          qs('.hero-content').style.transform = `translateY(${y * 0.35}px)`;
          overlay.style.opacity = 0.6 + progress * 0.35;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
