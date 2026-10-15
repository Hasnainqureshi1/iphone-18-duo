/* ============================================================
   control-center.js — Control Center panel + toggle logic
   ============================================================ */
(function () {
  "use strict";

  function toggle(key) {
    OS.set(key, !OS.get(key));
    render();
    if (key === "airplaneMode" && OS.get("airplaneMode")) {
      OS.set({ wifiEnabled: false, bluetoothEnabled: false, cellularEnabled: false });
    }
  }

  function render() {
    const el = document.getElementById("control-center");
    const s = OS.state;
    el.innerHTML = `
      <div class="cc-sheet">
        <div class="cc-handle"></div>
        <div class="cc-grid">
          <div class="cc-group cc-connectivity">
            <button class="cc-tile ${s.airplaneMode ? "on" : ""}" data-toggle="airplaneMode" aria-label="Airplane Mode">
              <span class="cc-ic">${OS.icons.glyph("airplane")}</span></button>
            <button class="cc-tile ${s.cellularEnabled && !s.airplaneMode ? "on" : ""}" data-toggle="cellularEnabled" aria-label="Cellular">
              <span class="cc-ic">${OS.icons.glyph("cellular")}</span></button>
            <button class="cc-tile ${s.wifiEnabled && !s.airplaneMode ? "on" : ""}" data-toggle="wifiEnabled" aria-label="Wi-Fi">
              <span class="cc-ic">${OS.icons.glyph("wifi")}</span><span class="cc-label">Wi-Fi</span></button>
            <button class="cc-tile ${s.bluetoothEnabled && !s.airplaneMode ? "on" : ""}" data-toggle="bluetoothEnabled" aria-label="Bluetooth">
              <span class="cc-ic">${OS.icons.glyph("bluetooth")}</span><span class="cc-label">Bluetooth</span></button>
          </div>

          <div class="cc-group cc-sliders">
            <div class="cc-slider-tile">
              <span class="cc-slider-ic">${OS.icons.glyph("sun")}</span>
              <input type="range" min="0.1" max="1" step="0.01" value="${s.brightness}" id="cc-brightness" class="cc-vslider" aria-label="Brightness" orient="vertical">
            </div>
            <div class="cc-slider-tile">
              <span class="cc-slider-ic">${OS.icons.glyph("speaker")}</span>
              <input type="range" min="0" max="1" step="0.01" value="${s.volume}" id="cc-volume" class="cc-vslider" aria-label="Volume" orient="vertical">
            </div>
          </div>

          <button class="cc-tile wide ${s.focusMode ? "on" : ""}" data-toggle="focusMode" aria-label="Focus Mode">
            <span class="cc-ic">${OS.icons.glyph("moon")}</span><span class="cc-label">Focus</span></button>

          <button class="cc-tile wide ${s.orientationLocked ? "on" : ""}" data-toggle="orientationLocked" aria-label="Orientation Lock">
            <span class="cc-ic">${OS.icons.glyph("lock")}</span><span class="cc-label">Rotation Lock</span></button>

          <button class="cc-tile small ${s.flashlight ? "on" : ""}" id="cc-flashlight" aria-label="Flashlight">
            <span class="cc-ic">${OS.icons.glyph("flashlight")}</span></button>
          <button class="cc-tile small" id="cc-calculator" aria-label="Calculator">
            <span class="cc-ic">${OS.icons.glyph("calculatorGlyph")}</span></button>
          <button class="cc-tile small" id="cc-camera" aria-label="Camera">
            <span class="cc-ic">${OS.icons.glyph("cameraGlyph")}</span></button>
          <button class="cc-tile small" id="cc-record" aria-label="Screen Recording">
            <span class="cc-ic cc-ic-record">${OS.icons.glyph("record")}</span></button>

          <div class="cc-music-tile ${s.musicPlaying ? "playing" : ""}">
            <div class="cc-music-art"></div>
            <div class="cc-music-meta">
              <div class="cc-music-title">${s.musicPlaying ? "Nocturne Drift" : "Not Playing"}</div>
              <div class="cc-music-artist">${s.musicPlaying ? "Aurora Field" : "—"}</div>
            </div>
            <button class="cc-music-btn" id="cc-music-prev">${OS.icons.glyph("skipPrev")}</button>
            <button class="cc-music-btn" id="cc-music-toggle">${OS.icons.glyph(s.musicPlaying ? "pause" : "play")}</button>
            <button class="cc-music-btn" id="cc-music-next">${OS.icons.glyph("skipNext")}</button>
          </div>
        </div>
      </div>`;

    el.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => toggle(btn.dataset.toggle));
    });

    el.querySelector("#cc-brightness").addEventListener("input", (e) => {
      OS.set("brightness", parseFloat(e.target.value));
    });
    el.querySelector("#cc-volume").addEventListener("input", (e) => {
      OS.set("volume", parseFloat(e.target.value));
    });
    el.querySelector("#cc-flashlight").addEventListener("click", () => {
      toggle("flashlight");
    });
    el.querySelector("#cc-calculator").addEventListener("click", () => {
      OS.multitasking.closeControlCenter();
      OS.multitasking.openApp("calculator");
    });
    el.querySelector("#cc-camera").addEventListener("click", () => {
      OS.multitasking.closeControlCenter();
      OS.multitasking.openApp("camera", "span");
    });
    el.querySelector("#cc-record").addEventListener("click", () => {
      OS.multitasking.closeControlCenter();
      OS.notifications.push({ app: "System", icon: "⏺", title: "Screen Recording", body: "Recording started (simulated).", color: "#ff3b30" });
    });
    el.querySelector("#cc-music-toggle").addEventListener("click", () => {
      OS.apps.music.toggle();
      render();
    });
    el.querySelector("#cc-music-next").addEventListener("click", () => { OS.apps.music.next(); render(); });
    el.querySelector("#cc-music-prev").addEventListener("click", () => { OS.apps.music.prev(); render(); });
  }

  ["wifiEnabled", "bluetoothEnabled", "airplaneMode", "cellularEnabled", "focusMode",
   "orientationLocked", "flashlight", "brightness", "volume", "musicPlaying"].forEach((k) => {
    OS.subscribe(k, () => { if (OS.get("controlCenterOpen")) render(); });
  });

  window.OS = window.OS || {};
  window.OS.controlCenter = { render, toggle };
})();
