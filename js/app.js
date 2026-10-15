/* ============================================================
   app.js — entry point: wiring, responsive scaling, debug panel
   ============================================================ */
(function () {
  "use strict";

  function scaleStage() {
    const stage = document.getElementById("stage");
    const device = document.getElementById("device");
    const availW = stage.clientWidth - 32;
    const availH = stage.clientHeight - 190;
    const baseW = OS.get('folded') ? 410 : 900, baseH = 610;
    const scale = Math.min(1, availW / baseW, availH / baseH);
    device.style.setProperty("--scale", scale);
  }

  function wireGlobalKeys() {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        toggleDebugPanel();
      } else if (e.key === "Escape") {
        if (OS.get("contextMenuOpen")) OS.multitasking.closeMultitaskMenu();
        else if (OS.get("controlCenterOpen")) OS.multitasking.closeControlCenter();
        else if (OS.get("notificationCenterOpen")) OS.multitasking.closeNotificationCenter();
        else if (OS.get("appSwitcherOpen")) OS.multitasking.closeAppSwitcher();
        else if (OS.get("activeModal")) OS.modals.close();
        else if (OS.keyboard.isOpen()) OS.keyboard.close();
      }
    });
  }

  function toggleDebugPanel() {
    const panel = document.getElementById("debug-panel");
    panel.hidden = !panel.hidden;
  }

  function buildDebugPanel() {
    const grid = document.getElementById("debug-grid");
    const actions = [
      ["Trigger Notification", () => OS.notifications.push({ app: "Debug", icon: OS.icons.glyph("wrench"), title: "Test Notification", body: "This is a simulated system notification.", color: "#8e8e93" })],
      ["Trigger Incoming Call", () => OS.device.triggerIncomingCall("Sam Rivera")],
      ["Battery 10%", () => OS.set("batteryPercentage", 10)],
      ["Battery 100%", () => OS.set("batteryPercentage", 100)],
      ["Start Charging", () => OS.set("charging", true)],
      ["Stop Charging", () => OS.set("charging", false)],
      ["Simulate Touch ID", () => OS.device.triggerFaceId(() => {})],
      ["Start Timer (10s)", () => { OS.multitasking.openApp("clock", "left"); setTimeout(() => { OS.set("timerDuration", 10000); OS.set("timerRemaining", 10000); OS.set("timerRunning", true); const end = performance.now() + 10000; const iv = setInterval(() => { const rem = Math.max(0, end - performance.now()); OS.set("timerRemaining", rem); if (rem <= 0) { clearInterval(iv); OS.set("timerRunning", false); OS.notifications.push({ app: "Clock", icon: "⏱", title: "Timer Done", body: "Your timer has finished.", color: "#ff9500" }); } }, 200); }, 100); }],
      ["Toggle Dark Mode", () => OS.set("darkMode", !OS.get("darkMode"))],
      ["Lock Device", () => OS.device.lockDevice()],
      ["Span Photos App", () => OS.multitasking.openApp("photos", "span")],
      ["Reset Simulator", () => { if (confirm("Reset all simulator data?")) OS.resetSimulator(); }]
    ];
    actions.forEach(([label, fn]) => {
      const btn = document.createElement("button");
      btn.className = "debug-btn";
      btn.textContent = label;
      btn.addEventListener("click", fn);
      grid.appendChild(btn);
    });

    document.getElementById("debug-toggle").addEventListener("click", toggleDebugPanel);
    document.getElementById("debug-close").addEventListener("click", toggleDebugPanel);
  }

  function wireStageBackdropTap() {
    document.getElementById("stage-hint").addEventListener("click", () => {
      document.getElementById("stage-hint").style.opacity = "0";
    });
    setTimeout(() => { const h = document.getElementById("stage-hint"); if (h) h.style.opacity = "0"; }, 6000);
  }

  function init() {
    OS.keyboard.build();
    OS.device.wireHardwareButtons();
    OS.device.wireScreenGestures("left");
    OS.device.wireScreenGestures("right");
    OS.device.wireOverlayDismiss();
    wireGlobalKeys();
    buildDebugPanel();
    wireStageBackdropTap();
    OS.device.applyTheme();
    OS.device.applyWallpaper();
    scaleStage();
    window.addEventListener("resize", scaleStage);
    OS.subscribe('folded', scaleStage);
    OS.device.boot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
