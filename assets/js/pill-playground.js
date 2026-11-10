/* ==========================================================================
   Pill playground
   --------------------------------------------------------------------------
   Turns a list of pills into a little physics toy: on load the pills drop in
   and bounce; visitors can drag them and throw them; on phones, shaking the
   device scatters them before they drift back into place.

     <ul class="pill-list" data-playground aria-label="…"> <li class="pill">…

   Accessibility and performance
   - The list itself never changes, so screen readers hear it as normal.
     Pills aren't focusable: dragging is a bonus, not a function.
   - Off for reduced motion and without JavaScript (pills show as a static
     row). Pills stay inside their area, so they never cover other content.
   - Only touching a pill starts a drag (touch-action: none on pills only),
     so the page still scrolls normally on phones.
   - The animation loop sleeps when nothing moves, and pauses when the area
     is off screen or the tab is hidden.
   - iPhone asks for motion access the first time a pill is touched (Apple
     only allows that request after a tap). Android and Chrome need no
     prompt, so shaking works straight away there.
   ========================================================================== */
(function () {
  "use strict";

  var list = document.querySelector("[data-playground]");
  if (!list || !("PointerEvent" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var GRAVITY = 2400;   // px/s²
  var BOUNCE = 0.45;    // floor restitution
  var WALL = 0.55;      // wall restitution
  var FRICTION = 0.86;  // horizontal damping while touching the floor
  var MAX_SPEED = 2600;

  var pills = Array.prototype.slice.call(list.children);
  var items = [];
  var width = 0;
  var height = 0;
  var running = false;
  var onScreen = true;
  var lastTime = 0;
  var restFrames = 0;
  var returnAt = 0;

  // -- Layout: tidy "home" positions, bottom-aligned rows ------------------
  function measureHomes() {
    list.classList.remove("is-live");
    list.style.height = "";
    pills.forEach(function (el) { el.style.transform = ""; });
    var box = list.getBoundingClientRect();
    width = list.clientWidth;
    height = list.clientHeight;
    // Keep this height once the pills are lifted out of the flow, so the
    // area always fits them (e.g. with larger text or spacing)
    list.style.height = height + "px";
    var rects = pills.map(function (el) {
      var r = el.getBoundingClientRect();
      return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
    });
    var bottom = Math.max.apply(null, rects.map(function (r) { return r.y + r.h; }));
    var shift = height - bottom; // sit the rows on the floor
    return rects.map(function (r) { return { x: r.x, y: r.y + shift, w: r.w, h: r.h }; });
  }

  function setup(drop) {
    var homes = measureHomes();
    // Drop the bottom row first, so the pills land in their tidy order
    var order = homes.map(function (h, i) { return i; }).sort(function (a, b) {
      return homes[b].y - homes[a].y || homes[a].x - homes[b].x;
    });
    items = pills.map(function (el, i) {
      var home = homes[i];
      var old = items[i];
      return {
        el: el,
        w: home.w,
        h: home.h,
        hx: home.x,
        hy: home.y,
        x: home.x,
        y: drop ? -home.h - 40 - order.indexOf(i) * 70 : home.y,
        vx: 0,
        vy: 0,
        entered: !drop,
        dragging: false,
        returning: false,
        pointer: old ? old.pointer : null
      };
    });
    list.classList.add("is-live");
    render();
    // after the bounce, ease each pill into its exact place
    if (drop) returnAt = performance.now() + 900 + items.length * 120;
    wake();
  }

  function render() {
    items.forEach(function (it) {
      it.el.style.transform = "translate(" + it.x.toFixed(1) + "px," + it.y.toFixed(1) + "px)";
    });
  }

  // -- Physics -------------------------------------------------------------
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function step(dt) {
    // While pills drift home, the ones already back wait for the rest, so
    // none can fall through a pill that hasn't arrived yet
    var homing = items.some(function (it) { return it.returning; });
    items.forEach(function (it) {
      if (it.dragging) return;
      if (homing && !it.returning) {
        it.vx = it.vy = 0;
        return;
      }

      if (it.returning) {
        // Ease gently back home (slows as it arrives)
        var k = 1 - Math.exp(-dt * 3);
        it.x += (it.hx - it.x) * k;
        it.y += (it.hy - it.y) * k;
        it.vx = it.vy = 0;
        if (Math.abs(it.hx - it.x) < 0.5 && Math.abs(it.hy - it.y) < 0.5) {
          it.x = it.hx;
          it.y = it.hy;
          it.returning = false;
        }
        return;
      }

      it.vy += GRAVITY * dt;
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      if (it.y >= 0) it.entered = true;

      if (it.x < 0) { it.x = 0; it.vx = -it.vx * WALL; }
      if (it.x + it.w > width) { it.x = width - it.w; it.vx = -it.vx * WALL; }
      if (it.entered && it.y < 0) { it.y = 0; it.vy = -it.vy * WALL; }
      if (it.y + it.h > height) {
        it.y = height - it.h;
        it.vy = Math.abs(it.vy) < 80 ? 0 : -it.vy * BOUNCE;
        it.vx *= FRICTION;
        if (Math.abs(it.vx) < 4) it.vx = 0;
      }
    });

    if (homing) return;

    // Pill-to-pill collisions (axis-aligned boxes, equal mass)
    for (var pass = 0; pass < 3; pass++) {
      for (var i = 0; i < items.length; i++) {
        for (var j = i + 1; j < items.length; j++) {
          collide(items[i], items[j]);
        }
      }
    }
  }

  function collide(a, b) {
    if (a.returning || b.returning || !a.entered || !b.entered) return;
    var ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox <= 0 || oy <= 0) return;

    var share = a.dragging ? [0, 1] : b.dragging ? [1, 0] : [0.5, 0.5];
    if (ox < oy) {
      var sx = a.x < b.x ? -1 : 1;
      a.x += sx * ox * share[0];
      b.x -= sx * ox * share[1];
      exchange(a, b, "vx");
    } else {
      var sy = a.y < b.y ? -1 : 1;
      a.y += sy * oy * share[0];
      b.y -= sy * oy * share[1];
      exchange(a, b, "vy");
      // the one on top rests on the one below
      var top = a.y < b.y ? a : b;
      top.vx *= FRICTION;
    }
    a.x = clamp(a.x, 0, width - a.w);
    b.x = clamp(b.x, 0, width - b.w);
  }

  function exchange(a, b, axis) {
    if (a.dragging || b.dragging) {
      var moving = a.dragging ? b : a;
      var hand = a.dragging ? a : b;
      moving[axis] = hand[axis] * 0.6;
      return;
    }
    var va = a[axis];
    var vb = b[axis];
    a[axis] = vb * 0.6 + va * 0.1;
    b[axis] = va * 0.6 + vb * 0.1;
  }

  // -- Loop: runs only while something moves -------------------------------
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.033, (now - (lastTime || now)) / 1000) || 0.016;
    lastTime = now;

    if (returnAt && now >= returnAt) {
      returnAt = 0;
      items.forEach(function (it) { if (!it.dragging) it.returning = true; });
    }

    step(dt / 2);
    step(dt / 2);
    render();

    var moving = items.some(function (it) {
      return it.dragging || it.returning || !it.entered ||
        Math.abs(it.vx) > 3 || Math.abs(it.vy) > 3;
    });
    restFrames = moving ? 0 : restFrames + 1;
    if (restFrames > 20 && !returnAt) {
      running = false;
      return;
    }
    window.requestAnimationFrame(frame);
  }

  function wake() {
    if (running || !onScreen || document.hidden) return;
    running = true;
    restFrames = 0;
    lastTime = 0;
    window.requestAnimationFrame(frame);
  }

  // -- Drag and throw ------------------------------------------------------
  var motionAsked = false;

  function askForMotion() {
    // iPhone/iPad only allow this inside a tap
    if (motionAsked || typeof DeviceMotionEvent === "undefined" ||
        typeof DeviceMotionEvent.requestPermission !== "function") return;
    motionAsked = true;
    DeviceMotionEvent.requestPermission().then(function (state) {
      if (state === "granted") listenForShake();
    }).catch(function () {});
  }

  list.addEventListener("pointerdown", function (event) {
    var el = event.target.closest(".pill");
    if (!el || !list.classList.contains("is-live")) return;
    var it = items[pills.indexOf(el)];
    if (!it) return;
    event.preventDefault();
    el.setPointerCapture(event.pointerId);
    var box = list.getBoundingClientRect();
    it.dragging = true;
    it.returning = false;
    it.entered = true;
    it.offX = event.clientX - box.left - it.x;
    it.offY = event.clientY - box.top - it.y;
    it.trackX = event.clientX;
    it.trackY = event.clientY;
    it.trackT = performance.now();
    it.vx = it.vy = 0;
    el.classList.add("is-dragging");
    wake();
  });

  list.addEventListener("pointermove", function (event) {
    var el = event.target.closest(".pill");
    var it = el && items[pills.indexOf(el)];
    if (!it || !it.dragging) return;
    var box = list.getBoundingClientRect();
    it.x = clamp(event.clientX - box.left - it.offX, 0, width - it.w);
    it.y = clamp(event.clientY - box.top - it.offY, 0, height - it.h);
    var now = performance.now();
    var dt = Math.max(1, now - it.trackT) / 1000;
    // smoothed pointer velocity, used for the throw
    it.vx = it.vx * 0.5 + ((event.clientX - it.trackX) / dt) * 0.5;
    it.vy = it.vy * 0.5 + ((event.clientY - it.trackY) / dt) * 0.5;
    it.trackX = event.clientX;
    it.trackY = event.clientY;
    it.trackT = now;
  });

  function release(event) {
    var el = event.target.closest(".pill");
    var it = el && items[pills.indexOf(el)];
    if (!it || !it.dragging) return;
    it.dragging = false;
    if (performance.now() - it.trackT > 80) it.vx = it.vy = 0; // held still
    it.vx = clamp(it.vx, -MAX_SPEED, MAX_SPEED);
    it.vy = clamp(it.vy, -MAX_SPEED, MAX_SPEED);
    el.classList.remove("is-dragging");
    askForMotion();
    wake();
  }

  list.addEventListener("pointerup", release);
  list.addEventListener("pointercancel", release);

  // -- Shake to scatter (phones) -------------------------------------------
  var shakeListening = false;
  var lastShake = 0;
  var prev = null;

  function listenForShake() {
    if (shakeListening) return;
    shakeListening = true;
    window.addEventListener("devicemotion", function (event) {
      var a = event.accelerationIncludingGravity;
      if (!a || a.x === null) return;
      if (prev) {
        var jolt = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);
        var now = performance.now();
        if (jolt > 30 && now - lastShake > 900) {
          lastShake = now;
          scatter();
        }
      }
      prev = { x: a.x, y: a.y, z: a.z };
    });
  }

  function scatter() {
    if (!onScreen) return;
    items.forEach(function (it) {
      if (it.dragging) return;
      it.returning = false;
      it.entered = true;
      it.vx = (Math.random() < 0.5 ? -1 : 1) * (700 + Math.random() * 900);
      it.vy = -(900 + Math.random() * 900);
    });
    returnAt = performance.now() + 1400; // fly about, then drift home
    wake();
  }

  if (typeof DeviceMotionEvent !== "undefined") {
    if (typeof DeviceMotionEvent.requestPermission !== "function") {
      listenForShake(); // no permission needed
    } else {
      // Some browsers (e.g. Chrome) grant this without asking; iPhone
      // refuses outside a tap, so we ask again when a pill is touched
      DeviceMotionEvent.requestPermission().then(function (state) {
        if (state === "granted") {
          motionAsked = true;
          listenForShake();
        }
      }).catch(function () {});
    }
  }

  // -- Start, pause and resize ---------------------------------------------
  if ("IntersectionObserver" in window) {
    var started = false;
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen && !started) {
        started = true;
        setup(true); // first time in view: drop in
      } else if (onScreen) {
        wake();
      }
    }).observe(list);
  } else {
    setup(true);
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) wake();
  });

  // Re-lay out when the area's width or a pill's size changes (window
  // resize, zoom, text spacing)
  var lastWidth = 0;
  var sizes = pills.map(function () { return ""; });
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () {
      var w = Math.round(list.parentElement.clientWidth);
      if (lastWidth && w !== lastWidth && items.length) setup(false);
      lastWidth = w;
    }).observe(list.parentElement);

    var pending = 0;
    var pillWatcher = new ResizeObserver(function () {
      var changed = false;
      pills.forEach(function (el, i) {
        var size = el.offsetWidth + "x" + el.offsetHeight;
        if (sizes[i] && sizes[i] !== size) changed = true;
        sizes[i] = size;
      });
      if (changed && items.length && !items.some(function (it) { return it.dragging; })) {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(function () { setup(false); });
      }
    });
    pills.forEach(function (el) { pillWatcher.observe(el); });
  }
})();
