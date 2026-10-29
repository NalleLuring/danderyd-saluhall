// Intoningar, meny-dropdown (desktop) och mobilmeny

(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Intoningar ----------
  // Ligger först så att ett fel längre ner aldrig kan lämna innehåll osynligt

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

  // Bilder tonas in först när de har laddats, annars poppar de in mitt i övergången
  function reveal(el) {
    var img = el.querySelector('img');
    if (img && !img.complete) {
      var show = function () {
        el.classList.add('is-visible');
      };
      img.addEventListener('load', show, { once: true });
      img.addEventListener('error', show, { once: true });
      return;
    }
    el.classList.add('is-visible');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(reveal);
  } else {
    // Ingen negativ marginal: då kan det som ligger allra längst ner på sidan
    // aldrig nå observationsytan och skulle förbli osynligt
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Säger till skriptet i <head> att intoningarna är igång
  root.classList.add('reveal-ready');

  // ---------- Öppna och stänga med övergång ----------
  // hidden tas bort först och .is-open sätts direkt efter. Vid stängning väntar
  // vi in övergången innan hidden sätts igen.

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

  var menu = document.querySelector('.nav_menu');
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

  // Stäng när man klickar utanför eller väljer en meny
  document.addEventListener('click', function (event) {
    if (!isOpen(dropdown)) return;
    if (!dropdown.contains(event.target) || event.target.closest('a')) setDropdown(false);
  });

  // Stäng när man tabbar vidare förbi menyn
  menu.addEventListener('focusout', function (event) {
    if (isOpen(dropdown) && event.relatedTarget && !menu.contains(event.relatedTarget)) setDropdown(false);
  });

  // ---------- Mobilmeny ----------

  var nav = document.querySelector('.nav');
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

  // Stäng om fokus lämnar sidhuvudet, annars hamnar man bakom menyn med tangentbordet
  nav.addEventListener('focusout', function (event) {
    if (isOpen(mobileMenu) && event.relatedTarget && !nav.contains(event.relatedTarget)) setMobileMenu(false);
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

  // Mobilmenyn ska inte ligga kvar öppen om fönstret blir brett.
  // addListener behövs för Safari före version 14.
  var wide = window.matchMedia('(min-width: 1024px)');
  var onWide = function (event) {
    if (event.matches && isOpen(mobileMenu)) setMobileMenu(false);
  };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else wide.addListener(onWide);
})();
