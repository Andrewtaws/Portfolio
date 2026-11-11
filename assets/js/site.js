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
   - "Pause animations" button: adds .motion-paused to <html>, which stops
     every animation and transition (WCAG 2.2.2). Its name switches between
     "Pause animations" and "Play animations", and a status message
     confirms the change for screen readers. Escape hides its tooltip. The choice is saved in localStorage and re-applied by a
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

  /* Pause animations button ---------------------------------------------- */
  var motion = header.querySelector(".motion-toggle");

  if (motion) {
    var label = motion.querySelector(".motion-toggle__label");
    var status = document.createElement("p");
    status.className = "visually-hidden";
    status.setAttribute("role", "status");
    document.body.appendChild(status);

    var sync = function () {
      label.textContent = root.classList.contains("motion-paused") ? "Play animations" : "Pause animations";
    };
    sync();

    motion.addEventListener("click", function () {
      var paused = !root.classList.contains("motion-paused");
      root.classList.toggle("motion-paused", paused);
      sync();
      status.textContent = paused ? "Animations paused" : "Animations playing";
      try {
        if (paused) localStorage.setItem("motion", "paused");
        else localStorage.removeItem("motion");
      } catch (e) { /* storage blocked: applies to this page only */ }
      document.dispatchEvent(new CustomEvent("motionchange", { detail: { paused: paused } }));
    });

    // Tooltip: Escape hides it (WCAG 1.4.13) until the pointer leaves or
    // focus moves away
    var showTip = function () { motion.classList.remove("is-tip-hidden"); };
    motion.addEventListener("keydown", function (event) {
      // Only when the label is a tooltip (not in the phone menu, where
      // Escape closes the menu instead)
      var isTip = getComputedStyle(label).position === "absolute";
      if (event.key === "Escape" && isTip && !motion.classList.contains("is-tip-hidden")) {
        motion.classList.add("is-tip-hidden");
        event.stopPropagation();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && motion.matches(":hover")) motion.classList.add("is-tip-hidden");
    });
    motion.addEventListener("mouseleave", showTip);
    motion.addEventListener("blur", showTip);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(header);
  } else {
    window.addEventListener("resize", measure);
  }
})();
