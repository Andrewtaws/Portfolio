/* ==========================================================================
   Text reveal
   --------------------------------------------------------------------------
   Words (or letters) drop into place, one after another, when the text
   scrolls into view. Add the attribute to any element that contains plain
   text only:

     <h2 data-reveal>Overview</h2>                   word by word (0.1s apart)
     <p data-reveal data-reveal-stagger="0.015">…</p> custom gap between words
     <h2 data-reveal="chars">Let's talk</h2>         letter by letter

   Accessibility
   - Screen readers get one hidden copy of the full text. The animated
     pieces are aria-hidden, so text is never read in fragments.
   - Nothing is split or animated when the visitor prefers reduced motion,
     or when the element contains other elements (links, emphasis).
   - Text is only hidden once this script has run, so without JavaScript
     it simply shows. Each reveal plays once and lasts about 2 seconds.
   ========================================================================== */
(function () {
  "use strict";

  var targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function piece(text, index) {
    var span = document.createElement("span");
    span.className = "reveal__piece";
    span.style.setProperty("--i", index);
    span.textContent = text;
    return span;
  }

  function split(el) {
    if (el.children.length) return false; // plain text only
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return false;

    var byChars = el.getAttribute("data-reveal") === "chars";
    var stagger = parseFloat(el.getAttribute("data-reveal-stagger"));
    if (!(stagger >= 0)) stagger = byChars ? 0.04 : 0.1;

    var spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = text;

    var shown = document.createElement("span");
    shown.className = "reveal__text";
    shown.setAttribute("aria-hidden", "true");

    var index = 0;
    text.split(" ").forEach(function (word, n) {
      if (n) shown.appendChild(document.createTextNode(" "));
      if (!byChars) {
        shown.appendChild(piece(word, index++));
        return;
      }
      var wrap = document.createElement("span");
      wrap.className = "reveal__word";
      Array.from(word).forEach(function (ch) {
        wrap.appendChild(piece(ch, index++));
      });
      shown.appendChild(wrap);
    });

    el.textContent = "";
    el.appendChild(spoken);
    el.appendChild(shown);
    el.style.setProperty("--reveal-stagger", stagger + "s");
    el.classList.add("reveal");
    if (byChars) el.classList.add("reveal--chars");
    return true;
  }

  // Start when the top of the text reaches 90% of the way down the screen
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  Array.prototype.forEach.call(targets, function (el) {
    if (split(el)) observer.observe(el);
  });
})();
