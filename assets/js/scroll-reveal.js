/* ==========================================================================
   Scroll reveal
   --------------------------------------------------------------------------
   Content below the fold fades gently up into view as the page scrolls.
   Anything already on screen when the page loads is left alone, so the
   first view never waits on an animation.

     <section data-reveal>…</section>              fade up (default)
     <h2 data-reveal="words">Let's talk</h2>      words rise in one by one
     <h2 data-reveal="words" data-reveal-stagger="0.04">…</h2>

   Intro text, as on the original Framer site: letters or words blur into
   focus as they rise. These also play on load when already on screen.

     <p data-reveal="intro-chars">Alreet!</p>
     <h1 data-reveal="intro-words" data-reveal-delay="0.3">…</h1>

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

  // Split plain text into animated pieces: by word, or by letter (letters
  // stay grouped per word so lines still wrap between words)
  function split(el, byChars, defaultStagger) {
    if (el.children.length) return false; // plain text only
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return false;

    var stagger = parseFloat(el.getAttribute("data-reveal-stagger"));
    if (!(stagger >= 0)) stagger = defaultStagger;
    var delay = parseFloat(el.getAttribute("data-reveal-delay")) || 0;

    var spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = text;

    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    var index = 0;
    var piece = function (content) {
      var span = document.createElement("span");
      span.className = "reveal__piece";
      span.style.setProperty("--i", index++);
      span.textContent = content;
      return span;
    };

    text.split(" ").forEach(function (word, n) {
      if (n) shown.appendChild(document.createTextNode(" "));
      if (!byChars) {
        shown.appendChild(piece(word));
        return;
      }
      var group = document.createElement("span");
      group.className = "reveal__word";
      Array.from(word).forEach(function (ch) {
        group.appendChild(piece(ch));
      });
      shown.appendChild(group);
    });

    el.textContent = "";
    el.appendChild(spoken);
    el.appendChild(shown);
    el.style.setProperty("--reveal-stagger", stagger + "s");
    el.style.setProperty("--reveal-delay", delay + "s");
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
    var mode = el.getAttribute("data-reveal");

    // Intro text: animate whenever it comes into view, including on load
    if (mode === "intro-chars" || mode === "intro-words") {
      var chars = mode === "intro-chars";
      if (split(el, chars, chars ? 0.05 : 0.04)) {
        el.classList.add("reveal", "reveal--intro");
        if (chars) el.classList.add("reveal--chars");
        observer.observe(el);
      }
      return;
    }

    // Everything else: already on screen, or above it, shows as is
    if (el.getBoundingClientRect().top < fold) return;

    var words = mode === "words" && split(el, false, 0.04);
    el.classList.add("reveal", words ? "reveal--words" : "reveal--fade");
    observer.observe(el);
  });
})();
