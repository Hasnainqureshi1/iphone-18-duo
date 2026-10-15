/* ============================================================
   gestures.js — reusable pointer-event gesture engine
   Works with mouse (desktop) and touch identically via Pointer Events.
   ============================================================ */
(function () {
  "use strict";

  const TAP_MAX_MOVE = 10;
  const TAP_MAX_TIME = 300;
  const LONG_PRESS_TIME = 480;
  const SWIPE_MIN_DIST = 28;

  /**
   * attachGestures(el, handlers)
   * handlers: { onTap, onLongPress, onDragStart, onDragMove, onDragEnd,
   *             onSwipe({dir,dx,dy,el}), threshold }
   * Returns a detach function.
   */
  function attachGestures(el, handlers) {
    handlers = handlers || {};
    let startX = 0, startY = 0, lastX = 0, lastY = 0, startT = 0;
    let pointerId = null;
    let longPressTimer = null;
    let longPressFired = false;
    let dragging = false;
    let moved = false;

    function clearLP() {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    function onPointerDown(e) {
      if (pointerId !== null) return;
      if (e.button !== undefined && e.button !== 0) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      startT = performance.now();
      longPressFired = false;
      dragging = false;
      moved = false;

      if (handlers.onLongPress) {
        longPressTimer = setTimeout(() => {
          if (moved) return;
          longPressFired = true;
          handlers.onLongPress({ x: startX, y: startY, el, originalEvent: e });
        }, LONG_PRESS_TIME);
      }

      if (handlers.onPointerDown) handlers.onPointerDown({ x: startX, y: startY, el, originalEvent: e });

      // Deliberately NOT calling setPointerCapture: capture retargets the
      // subsequent native `click` event to the capturing element, which
      // would break every plain click handler nested inside a gesture-
      // wrapped ancestor (e.g. buttons inside the screen containers).
      // Move/up tracking already happens via the window listeners below,
      // so capture isn't needed for drag detection to work off-element.
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }

    function onPointerMove(e) {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (!moved && Math.hypot(dx, dy) > TAP_MAX_MOVE) {
        moved = true;
        clearLP();
      }

      if (moved) {
        if (!dragging) {
          dragging = true;
          if (handlers.onDragStart) handlers.onDragStart({ x: startX, y: startY, dx, dy, el, originalEvent: e });
        } else if (dragging && handlers.onDragMove) {
          handlers.onDragMove({ x: e.clientX, y: e.clientY, dx, dy, el, originalEvent: e });
        }
      }
    }

    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return;
      clearLP();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      const dx = lastX - startX;
      const dy = lastY - startY;
      const dt = performance.now() - startT;

      if (e.type === 'pointercancel') { pointerId = null; dragging = false; return; }

      if (dragging && handlers.onDragEnd) {
        handlers.onDragEnd({ x: lastX, y: lastY, dx, dy, el, originalEvent: e });
      }

      if (dragging && Math.hypot(dx, dy) > SWIPE_MIN_DIST && handlers.onSwipe) {
        const absX = Math.abs(dx), absY = Math.abs(dy);
        let dir;
        if (absX > absY) dir = dx > 0 ? "right" : "left";
        else dir = dy > 0 ? "down" : "up";
        handlers.onSwipe({ dir, dx, dy, dt, el, originalEvent: e });
      }

      if (!moved && !longPressFired && dt < TAP_MAX_TIME && handlers.onTap) {
        handlers.onTap({ x: startX, y: startY, el, originalEvent: e });
      }

      pointerId = null;
      dragging = false;
    }

    el.addEventListener("pointerdown", onPointerDown);

    return function detach() {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      clearLP();
    };
  }

  window.OS = window.OS || {};
  window.OS.gestures = { attach: attachGestures };
})();
