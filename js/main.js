(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. MOBILE NAVIGATION
     --------------------------------------------------------- */
  const navToggle  = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    primaryNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    const desktop = window.matchMedia('(min-width: 900px)');
    desktop.addEventListener('change', function (e) { if (e.matches) closeNav(); });
  }

  /* ---------------------------------------------------------
     2. HEADER SHADOW ON SCROLL
     --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    let ticking = false;
    const update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     3. COUNTDOWN — 7 Jan 2027, 4:00 PM WAT
     --------------------------------------------------------- */
  const targetDate = new Date('2027-01-07T16:00:00+01:00').getTime();
  const cd = {
    days:    document.querySelector('[data-cd="days"]'),
    hours:   document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]')
  };
  const pad = function (n) { return String(n).padStart(2, '0'); };
  let cdTimer;

  function updateCountdown() {
    if (!cd.days) return;
    const diff = targetDate - Date.now();
    if (diff <= 0) {
      cd.days.textContent = cd.hours.textContent = cd.minutes.textContent = cd.seconds.textContent = '00';
      clearInterval(cdTimer);
      return;
    }
    const s = Math.floor(diff / 1000);
    cd.days.textContent    = pad(Math.floor(s / 86400));
    cd.hours.textContent   = pad(Math.floor((s % 86400) / 3600));
    cd.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    cd.seconds.textContent = pad(s % 60);
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------
     4. SCROLL REVEAL
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     5. SCROLLSPY
     --------------------------------------------------------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map(function (l) { return l.getAttribute('href'); })
    .filter(function (h) { return h && h.length > 1; })
    .map(function (h) { return document.querySelector(h); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ---------------------------------------------------------
     6. REGISTRATION FORM → MAILTO
     --------------------------------------------------------- */
  const form   = document.getElementById('registerForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    const showStatus = function (message, type) {
      status.textContent = message;
      if (type === 'error') {
        status.style.background  = 'rgba(220,60,40,.12)';
        status.style.borderColor = 'rgba(255,120,100,.5)';
        status.style.color       = '#FFB3A5';
      } else {
        status.style.background  = 'rgba(223,177,91,.1)';
        status.style.borderColor = 'var(--gold-primary)';
        status.style.color       = 'var(--gold-bright)';
      }
      status.classList.add('is-visible');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name     = form.fullName.value.trim();
      const email    = form.email.value.trim();
      const phone    = form.phone.value.trim();
      const country  = form.country.value.trim();
      const interest = form.interest.value;
      const message  = form.message.value.trim();

      if (!name || !email || !phone || !country) {
        return showStatus('Please complete all required fields before submitting.', 'error');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showStatus('Please enter a valid email address.', 'error');
      }

      const subject = encodeURIComponent('Face of Diaspora Global 2027 — ' + interest);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Country: ' + country + '\n' +
        'Interest: ' + interest + '\n\n' +
        'Message:\n' + (message || '—')
      );

      window.location.href =
        'mailto:faceofdiasporaglobal@gmail.com?subject=' + subject + '&body=' + body;

      showStatus('Thank you, ' + name + '! Your email app is opening — send the message to complete your registration.', 'success');
    });
  }

  /* ---------------------------------------------------------
     7. FOOTER YEAR
     --------------------------------------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = Math.max(new Date().getFullYear(), 2027);
})();