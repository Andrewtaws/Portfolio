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

   Scroll highlight: letters darken one after another as the paragraph is
   scrolled through, tied to the scroll position (scrubbing back fades them
   again). Faded letters stay at an opacity that still meets WCAG AA.

     <p data-reveal="highlight">…</p>

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
    spoken.className = "visually-hidden reveal__spoken";
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

  // Scroll highlight ------------------------------------------------------
  var FADE = 0.68; // faded letters: lightest navy that still meets 4.5:1
  var SOFT = 10;   // about 10 letters are mid-fade at once
  var highlights = [];

  function splitLetters(el) {
    if (el.children.length) return null; // plain text only
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return null;

    var spoken = document.createElement("span");
    spoken.className = "visually-hidden reveal__spoken";
    spoken.textContent = text;

    var shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    var letters = [];
    Array.from(text).forEach(function (ch) {
      if (ch === " ") {
        shown.appendChild(document.createTextNode(" "));
        return;
      }
      var span = document.createElement("span");
      span.className = "reveal__letter";
      span.textContent = ch;
      shown.appendChild(span);
      letters.push(span);
    });

    el.textContent = "";
    el.appendChild(spoken);
    el.appendChild(shown);
    el.classList.add("reveal", "reveal--highlight");
    return { el: el, letters: letters, lit: -1 };
  }

  // Progress runs from the paragraph's top entering the bottom of the screen
  // to its middle reaching 40% of the way down
  function paint() {
    var vh = window.innerHeight;
    highlights.forEach(function (item) {
      var r = item.el.getBoundingClientRect();
      var start = vh;
      var end = vh * 0.4 - r.height / 2;
      var p = Math.min(Math.max((start - r.top) / (start - end), 0), 1);
      var lit = Math.round(p * (item.letters.length + SOFT) * 4) / 4;
      if (lit === item.lit) return;
      item.lit = lit;
      item.letters.forEach(function (letter, i) {
        var t = Math.min(Math.max((lit - i) / SOFT, 0), 1);
        letter.style.opacity = (FADE + (1 - FADE) * t).toFixed(3);
      });
    });
  }

  var fold = window.innerHeight;

  Array.prototype.forEach.call(targets, function (el) {
    var mode = el.getAttribute("data-reveal");

    if (mode === "highlight") {
      var item = splitLetters(el);
      if (item) highlights.push(item);
      return;
    }

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

  if (highlights.length) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        paint();
      });
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
})();
