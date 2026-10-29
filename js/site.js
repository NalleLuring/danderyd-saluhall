// Meny-dropdown (desktop), mobilmeny och intoningar

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Öppnar/stänger med övergång: hidden tas bort först, .is-open sätts nästa
  // bildruta och vid stängning väntar vi in övergången innan hidden sätts igen
  function setOpen(el, open, closeDuration) {
    clearTimeout(el._closeTimer);
    if (open) {
      el.hidden = false;
      el.getBoundingClientRect();
      el.classList.add('is-open');
    } else {
      el.classList.remove('is-open');
      el._closeTimer = setTimeout(function () {
        el.hidden = true;
      }, reduceMotion ? 0 : closeDuration);
    }
  }

  function isOpen(el) {
    return el.classList.contains('is-open');
  }

  // ---------- Meny-dropdown ----------

  var dropdownToggle = document.querySelector('[data-dropdown-toggle]');
  var dropdown = document.getElementById('meny-dropdown');

  function setDropdown(open) {
    dropdownToggle.setAttribute('aria-expanded', String(open));
    setOpen(dropdown, open, 300);
  }

  dropdownToggle.addEventListener('click', function (event) {
    event.stopPropagation();
    setDropdown(!isOpen(dropdown));
  });

  document.addEventListener('click', function (event) {
    if (isOpen(dropdown) && !dropdown.contains(event.target)) setDropdown(false);
  });

  // ---------- Mobilmeny ----------

  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.getElementById('mobilmeny');

  // Ordningen styr fördröjningen när länkarna glider upp
  mobileMenu.querySelectorAll('.mobile-menu_link, .mobile-menu_contact').forEach(function (el, i) {
    el.style.setProperty('--i', i);
  });

  function setMobileMenu(open) {
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
    setOpen(mobileMenu, open, 300);
    document.body.classList.toggle('is-locked', open);
  }

  mobileToggle.addEventListener('click', function () {
    setMobileMenu(!isOpen(mobileMenu));
  });

  // Stäng mobilmenyn när man väljer en länk
  mobileMenu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMobileMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (isOpen(dropdown)) {
      setDropdown(false);
      dropdownToggle.focus();
    }
    if (isOpen(mobileMenu)) {
      setMobileMenu(false);
      mobileToggle.focus();
    }
  });

  // Mobilmenyn ska inte ligga kvar öppen om fönstret blir brett
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
    if (event.matches && isOpen(mobileMenu)) setMobileMenu(false);
  });

  // ---------- Intoningar ----------

  var revealEls = document.querySelectorAll('[data-reveal]');

  revealEls.forEach(function (el) {
    // Syskon som tonas in samtidigt kommer en i taget
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
      return child.hasAttribute('data-reveal');
    });
    el.style.setProperty('--reveal-delay', siblings.indexOf(el) * 90 + 'ms');

    if (el.getAttribute('data-reveal') === 'lines') {
      Array.prototype.forEach.call(el.children, function (row, i) {
        row.style.setProperty('--row-delay', i * 80 + 'ms');
      });
    }
  });

  function reveal(el) {
    el.classList.add('is-visible');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(reveal);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();
