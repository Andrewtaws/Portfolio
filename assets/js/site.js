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

  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(header);
  } else {
    window.addEventListener("resize", measure);
  }
})();
