/* ============================================================
   apps/camera.js — simulated Camera (viewfinder + controls)
   ============================================================ */
(function () {
  "use strict";

  const VIEWFINDER_GRADIENTS = [
    "radial-gradient(circle at 30% 20%,#3a4a63,#0d1420 70%)",
    "radial-gradient(circle at 70% 80%,#4a3a2f,#12100d 70%)",
    "radial-gradient(circle at 50% 40%,#2f4a3a,#0d1512 70%)"
  ];
  let vfIndex = 0;
  let zoom = 1;

  function mount(container, opts) {
    if (opts.spanned) {
      renderViewfinder(container, "left");
      renderControls(opts.otherContainer, "right");
    } else {
      renderCombined(container, opts.side);
    }
  }

  function renderViewfinder(container, side) {
    const el = document.createElement("div");
    el.className = "camera-app";
    el.innerHTML = `
      <div class="camera-viewfinder" id="camera-vf-${side}" style="background:${VIEWFINDER_GRADIENTS[vfIndex]}; transform:scale(${zoom})">
        <div class="camera-grid"></div>
        <div class="camera-flash-overlay" id="camera-flash-${side}"></div>
        <div class="camera-mode-badge">${OS.get("cameraMode").toUpperCase()}</div>
      </div>`;
    container.appendChild(el);
  }

  function renderControls(container, side) {
    const el = document.createElement("div");
    el.className = "camera-controls-panel";
    const photos = OS.get("photos").slice(0, 6);
    el.innerHTML = `
      <div class="camera-modes">
        ${["photo", "video", "portrait"].map((m) => `<button class="camera-mode-btn ${OS.get("cameraMode") === m ? "active" : ""}" data-mode="${m}">${m.toUpperCase()}</button>`).join("")}
      </div>
      <div class="camera-zoom-row">
        ${[1, 2, 3].map((z) => `<button class="camera-zoom-btn ${zoom === z ? "active" : ""}" data-zoom="${z}">${z}×</button>`).join("")}
      </div>
      <div class="camera-actions-row">
        <button class="camera-flip" id="camera-flip" aria-label="Switch camera">${OS.icons.glyph("cameraFlip")}</button>
        <button class="camera-shutter" id="camera-shutter" aria-label="Take photo"><span></span></button>
        <button class="camera-flash-toggle ${OS.get("flashlight") ? "on" : ""}" id="camera-flash-toggle" aria-label="Flash">${OS.icons.glyph(OS.get("flashlight") ? "bolt" : "boltOff")}</button>
      </div>
      <div class="camera-filmstrip">
        ${photos.map((p) => `<div class="camera-thumb" style="background:${p.gradient}"></div>`).join("") || '<div class="camera-empty">No captures yet</div>'}
      </div>`;
    container.appendChild(el);

    el.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      OS.set("cameraMode", b.dataset.mode);
      OS.multitasking.renderAll();
    }));
    el.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
      zoom = parseInt(b.dataset.zoom, 10);
      OS.multitasking.renderAll();
    }));
    el.querySelector("#camera-flip").addEventListener("click", () => {
      OS.set("cameraFacing", OS.get("cameraFacing") === "back" ? "front" : "back");
      vfIndex = (vfIndex + 1) % VIEWFINDER_GRADIENTS.length;
      OS.multitasking.renderAll();
    });
    el.querySelector("#camera-flash-toggle").addEventListener("click", () => OS.set("flashlight", !OS.get("flashlight")));
    el.querySelector("#camera-shutter").addEventListener("click", () => capture(side === "right" ? "left" : side));
  }

  function renderCombined(container, side) {
    const el = document.createElement("div");
    el.className = "camera-app camera-compact";
    el.innerHTML = `
      <div class="camera-viewfinder" style="background:${VIEWFINDER_GRADIENTS[vfIndex]}; transform:scale(${zoom})">
        <div class="camera-grid"></div>
        <div class="camera-flash-overlay" id="camera-flash-${side}"></div>
        <div class="camera-mode-badge">${OS.get("cameraMode").toUpperCase()}</div>
      </div>
      <div class="camera-compact-bar">
        <div class="camera-modes">
          ${["photo", "video", "portrait"].map((m) => `<button class="camera-mode-btn ${OS.get("cameraMode") === m ? "active" : ""}" data-mode="${m}">${m.toUpperCase()}</button>`).join("")}
        </div>
        <div class="camera-actions-row">
          <button class="camera-flip" id="camera-flip" aria-label="Switch camera">${OS.icons.glyph("cameraFlip")}</button>
          <button class="camera-shutter" id="camera-shutter" aria-label="Take photo"><span></span></button>
          <div class="camera-thumb small" style="background:${(OS.get("photos")[0] || {}).gradient || "#222"}"></div>
        </div>
      </div>`;
    container.appendChild(el);
    el.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { OS.set("cameraMode", b.dataset.mode); OS.multitasking.renderAll(); }));
    el.querySelector("#camera-flip").addEventListener("click", () => { vfIndex = (vfIndex + 1) % VIEWFINDER_GRADIENTS.length; OS.multitasking.renderAll(); });
    el.querySelector("#camera-shutter").addEventListener("click", () => capture(side));
  }

  function capture(side) {
    const flashEl = document.getElementById("camera-flash-" + side) || document.querySelector(".camera-flash-overlay");
    const shutterBtn = document.getElementById("camera-shutter");
    if (shutterBtn) { shutterBtn.classList.add("pressed"); setTimeout(() => shutterBtn.classList.remove("pressed"), 150); }
    if (flashEl) {
      flashEl.classList.add("flash");
      setTimeout(() => flashEl.classList.remove("flash"), 220);
    }
    OS.apps.photos.addCapturedPhoto(VIEWFINDER_GRADIENTS[vfIndex]);
    OS.notifications.push({ app: "Camera", icon: OS.icons.glyph("cameraGlyph"), title: "Photo Captured", body: "Saved to Photos.", color: "#ff9500" });
    setTimeout(() => OS.multitasking.renderAll(), 120);
  }

  OS.multitasking.registerApp({
    id: "camera",
    name: "Camera",
    icon: OS.icons.svg("camera"),
    color: "#1c1c1e",
    duoCapable: true,
    mount
  });
})();
