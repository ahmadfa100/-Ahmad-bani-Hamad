/**
 * main.js — portfolio interactions
 * - Theme toggle (dark ↔ light, persisted)
 * - Footer year
 * - Active nav link on scroll
 * - Scroll-in reveal for sections
 */

(function () {

  /* ── Theme ──────────────────────────────── */
  var saved = localStorage.getItem('af-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next    = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('af-theme', next);
    });
  }

  /* ── Footer year ────────────────────────── */
  var yrEl = document.getElementById('footer-year');
  if (yrEl) { yrEl.textContent = new Date().getFullYear(); }

  /* ── Active nav on scroll ───────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    var scrollY = window.scrollY + 100;
    sections.forEach(function (sec) {
      var top    = sec.offsetTop;
      var height = sec.offsetHeight;
      var id     = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Scroll-reveal ──────────────────────── */
  if ('IntersectionObserver' in window) {
    var items = document.querySelectorAll(
      '.timeline-item, .project-card, .skills-group, .edu-card, .course-item'
    );

    /* set initial hidden state */
    items.forEach(function (el) {
      el.style.opacity  = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  }

}());