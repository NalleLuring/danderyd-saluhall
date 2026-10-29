// Meny-dropdown (desktop) och mobilmeny

(function () {
  var dropdownToggle = document.querySelector('[data-dropdown-toggle]');
  var dropdown = document.getElementById('meny-dropdown');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.getElementById('mobilmeny');

  function setDropdown(open) {
    dropdownToggle.setAttribute('aria-expanded', String(open));
    dropdown.hidden = !open;
  }

  function setMobileMenu(open) {
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  }

  dropdownToggle.addEventListener('click', function (event) {
    event.stopPropagation();
    setDropdown(dropdown.hidden);
  });

  document.addEventListener('click', function (event) {
    if (!dropdown.hidden && !dropdown.contains(event.target)) setDropdown(false);
  });

  mobileToggle.addEventListener('click', function () {
    setMobileMenu(mobileMenu.hidden);
  });

  // Stäng mobilmenyn när man väljer en länk
  mobileMenu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMobileMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!dropdown.hidden) {
      setDropdown(false);
      dropdownToggle.focus();
    }
    if (!mobileMenu.hidden) {
      setMobileMenu(false);
      mobileToggle.focus();
    }
  });

  // Mobilmenyn ska inte ligga kvar öppen om fönstret blir brett
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
    if (event.matches) setMobileMenu(false);
  });
})();
