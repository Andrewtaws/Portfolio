/* ==========================================================================
   Scroll reveal
   --------------------------------------------------------------------------
   Content below the fold fades gently up into view as the page scrolls.
   Anything already on screen when the page loads is left alone, so the
   first view never waits on an animation.

     <section data-reveal>…</section>              fade up (default)
     <h2 data-reveal="words">Let's talk</h2>      words rise in one by one
     <h2 data-reveal="words" data-reveal-stagger="0.04">…</h2>

   Accessibility
   - Off when the visitor prefers reduced motion, and without JavaScript:
     the content simply shows.
   - "words" only splits plain text. Screen readers get one hidden copy of
     the full text and the animated pieces are aria-hidden.
   - Anything that receives keyboard focus shows at once (see CSS).
   ========================================================================== */
(function () {
  "use strict";

  var targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function splitWords(el) {
    if (el.children.length) return false; // plain text only
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return false;

    var stagger = parseFloat(el.getAttribute("data-reveal-stagger"));
    if (!(stagger >= 0)) stagger = 0.04;

    var spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = text;

    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    text.split(" ").forEach(function (word, i) {
      if (i) shown.appendChild(document.createTextNode(" "));
      var piece = document.createElement("span");
      piece.className = "reveal__piece";
      piece.style.setProperty("--i", i);
      piece.textContent = word;
      shown.appendChild(piece);
    });

    el.textContent = "";
    el.appendChild(spoken);
    el.appendChild(shown);
    el.style.setProperty("--reveal-stagger", stagger + "s");
    return true;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  var fold = window.innerHeight;

  Array.prototype.forEach.call(targets, function (el) {
    // Already on screen, or above it (e.g. returning mid-page): show as is
    if (el.getBoundingClientRect().top < fold) return;

    var words = el.getAttribute("data-reveal") === "words" && splitWords(el);
    el.classList.add("reveal", words ? "reveal--words" : "reveal--fade");
    observer.observe(el);
  });
})();
