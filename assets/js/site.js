/* ==========================================================================
   Site-wide behaviour: sticky header bar
   --------------------------------------------------------------------------
   - Adds .js to <html> so CSS can switch to the enhanced header.
   - Toggles .is-stuck on the header once the page is scrolled, which turns
     it into the floating rounded bar.
   - Measures the header and exposes its height as --header-height, so
     scroll-padding keeps focused elements and anchor targets out from
     under the bar (WCAG 2.4.11 Focus Not Obscured).
   - Small screens: the "Menu" disclosure button shows and hides the nav.
     Escape closes it and returns focus to the button, and it closes when
     focus leaves the header or a link is chosen.
   - "Motion" switch (role="switch"): turning it off adds .motion-paused to
     <html>, which stops every animation and transition (WCAG 2.2.2).
   - Theme picker: moon (Dark mode) and sun (Light mode) toggle buttons
     (aria-pressed) set data-theme="dark" or "light" on <html>. Until one is
     used, the site follows the device setting (and the buttons show that). Choices are stored in localStorage and
     re-applied by the head script before anything is drawn. The choice is saved in localStorage and re-applied by a
     one-line script in each page's <head> before anything is drawn.
     Other scripts hear about changes through a "motionchange" event.
   Without JavaScript the header is still sticky, on a solid background,
   and the nav links are always visible.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  root.classList.add("js");
  if (!header) return;

  var threshold = 8;
  var ticking = false;

  function update() {
    header.classList.toggle("is-stuck", window.scrollY > threshold);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function measure() {
    root.style.setProperty("--header-height", header.offsetHeight + "px");
  }

  update();
  measure();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu button ---------------------------------------------------------- */
  var toggle = header.querySelector(".nav-toggle");
  var nav = header.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.hidden = false;

    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    header.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    header.addEventListener("focusout", function (event) {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) {
        setOpen(false);
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  /* Motion switch -------------------------------------------------------- */
  var motion = header.querySelector(".motion-toggle");

  if (motion) {
    var motionState = motion.querySelector(".motion-toggle__state");
    var sync = function () {
      var on = !root.classList.contains("motion-paused");
      motion.setAttribute("aria-checked", on ? "true" : "false");
      if (motionState) motionState.textContent = on ? "\u00a0on" : "\u00a0off";
    };
    sync();

    motion.addEventListener("click", function () {
      var paused = !root.classList.contains("motion-paused");
      root.classList.toggle("motion-paused", paused);
      sync();
      try {
        if (paused) localStorage.setItem("motion", "paused");
        else localStorage.removeItem("motion");
      } catch (e) { /* storage blocked: applies to this page only */ }
      document.dispatchEvent(new CustomEvent("motionchange", { detail: { paused: paused } }));
    });
  }

  /* Theme picker (moon / sun) ------------------------------------------- */
  var themeButtons = header.querySelectorAll("[data-theme-choice]");

  if (themeButtons.length) {
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    var current = function () {
      return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
    };
    var syncTheme = function () {
      var active = current();
      Array.prototype.forEach.call(themeButtons, function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-theme-choice") === active ? "true" : "false");
      });
    };
    syncTheme();
    if (systemDark.addEventListener) systemDark.addEventListener("change", syncTheme);

    Array.prototype.forEach.call(themeButtons, function (btn) {
      btn.addEventListener("click", function () {
        var choice = btn.getAttribute("data-theme-choice");
        root.setAttribute("data-theme", choice);
        syncTheme();
        try { localStorage.setItem("theme", choice); } catch (e) { /* this page only */ }
      });
    });
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(header);
  } else {
    window.addEventListener("resize", measure);
  }
})();
