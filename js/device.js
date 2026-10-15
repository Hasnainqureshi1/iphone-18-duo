/* ============================================================
   device.js — boot, lock screen, status bar, Dynamic Island,
   system gestures, modals, HUDs, hardware buttons.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Boot ---------------- */
  function boot() {
    const bootLayer = document.getElementById("boot-layer");
    setTimeout(() => {
      bootLayer.classList.add("fade");
      setTimeout(() => {
        bootLayer.hidden = true;
        OS.set("booted", true);
        applyTheme();
        applyWallpaper();
        applyBrightness();
        seedNotifications();
        seedPhotos();
        renderLockScreen();
        startClock();
      }, 700);
    }, 1400);
  }

  /* ---------------- Clock / status bar ---------------- */
  function startClock() {
    updateClock();
    setInterval(updateClock, 1000 * 15);
    setInterval(updateClock, 1000, true);
  }
  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    h = h % 12; if (h === 0) h = 12;
    const str = `${h}:${m < 10 ? "0" + m : m}`;
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    ["left", "right"].forEach((side) => {
      const el = document.getElementById("status-time-" + side);
      if (el) el.textContent = str;
    });
    document.querySelectorAll(".lock-time").forEach((el) => (el.textContent = str));
    document.querySelectorAll(".lock-date").forEach((el) => (el.textContent = dateStr));
    OS.apps.clock && OS.apps.clock.tick && OS.apps.clock.tick();
  }

  function renderStatusIcons() {
    const s = OS.state;
    ["left", "right"].forEach((side) => {
      const wifi = document.getElementById("icon-wifi-" + side);
      const pct = document.getElementById("battery-pct-" + side);
      const fill = document.getElementById("battery-fill-" + side);
      const focusDot = document.getElementById("focus-dot-" + side);
      if (wifi) wifi.style.opacity = s.wifiEnabled && !s.airplaneMode ? "1" : "0.25";
      if (pct) { pct.style.display = s.showBatteryPercent ? "inline" : "none"; pct.textContent = Math.round(s.batteryPercentage) + "%"; }
      if (fill) {
        const w = Math.max(1, (s.batteryPercentage / 100) * 18);
        fill.setAttribute("width", w.toFixed(1));
        fill.setAttribute("fill", s.batteryPercentage <= 20 ? "#ff453a" : "currentColor");
      }
      if (focusDot) focusDot.hidden = !s.focusMode;
      const bar = document.getElementById("status-bar-" + side);
      if (bar) bar.classList.toggle("charging", s.charging);
    });
  }
  ["wifiEnabled", "airplaneMode", "showBatteryPercent", "batteryPercentage", "focusMode", "charging"].forEach((k) => OS.subscribe(k, renderStatusIcons));

  /* battery drain simulation */
  setInterval(() => {
    if (!OS.get("booted")) return;
    let b = OS.get("batteryPercentage");
    if (OS.get("charging")) b = Math.min(100, b + 1.5);
    else b = Math.max(1, b - 0.05);
    OS.set("batteryPercentage", Math.round(b * 10) / 10);
    if (Math.round(b) === 20 && !OS.get("charging")) maybeLowBatteryModal();
  }, 8000);

  function maybeLowBatteryModal() {
    OS.modals.open({
      title: "Low Battery",
      icon: OS.icons.glyph("battery"),
      body: `<p class="modal-text">20% battery remaining.</p>`,
      buttons: [{ label: "Low Power Mode", role: "primary", onClick: () => OS.set("lowPowerMode", true) }, { label: "Dismiss", role: "cancel" }]
    });
  }

  /* ---------------- Lock screen ---------------- */
  function renderLockScreen() {
    const notifs = OS.get("notifications").slice(0, 3);
    ["left", "right"].forEach((side) => {
      const container = document.getElementById("content-" + side);
      container.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "lock-screen";
      wrap.innerHTML = `
        <div class="lock-top">
          <div class="lock-lockicon">${OS.icons.glyph("lock")}</div>
          <div class="lock-time">9:41</div>
          <div class="lock-date">Loading…</div>
        </div>
        <div class="lock-notifs">${side === "left" ? notifs.map((n) => `
          <div class="lock-notif" style="--accent:${n.color}">
            <span class="lock-notif-icon">${n.icon}</span>
            <div class="lock-notif-body"><b>${n.app}</b><span>${n.title}</span></div>
          </div>`).join("") : ""}
        </div>
        <div class="lock-bottom">
          ${side === "left" ? `<button class="lock-shortcut" id="lock-flashlight" aria-label="Flashlight">${OS.icons.glyph("flashlight")}</button>` : `<button class="lock-shortcut" id="lock-camera" aria-label="Camera">${OS.icons.glyph("cameraGlyph")}</button>`}
          <div class="lock-swipe-hint"><div class="lock-swipe-chevron">︿</div><span>swipe up to unlock</span></div>
        </div>`;
      container.appendChild(wrap);

      OS.gestures.attach(wrap, {
        threshold: 6,
        onDragStart: () => wrap.classList.add("dragging"),
        onDragMove: ({ dy }) => {
          if (dy > 0) return;
          const dist = Math.min(Math.abs(dy), 340);
          wrap.style.transform = `translateY(${-dist}px)`;
          wrap.style.opacity = String(1 - dist / 400);
        },
        onDragEnd: ({ dy }) => {
          wrap.classList.remove("dragging");
          wrap.style.transform = "";
          wrap.style.opacity = "";
          if (dy < -110) unlock(side);
        }
      });

      const flash = wrap.querySelector("#lock-flashlight");
      if (flash) flash.addEventListener("click", (e) => { e.stopPropagation(); OS.set("flashlight", !OS.get("flashlight")); });
      const cam = wrap.querySelector("#lock-camera");
      if (cam) cam.addEventListener("click", (e) => { e.stopPropagation(); unlock(side, "camera"); });
    });
    updateClock();
  }

  function unlock(side, openAppId) {
    triggerFaceId(() => {
      OS.set("deviceLocked", false);
      ["left", "right"].forEach((s) => {
        const el = document.querySelector("#content-" + s + " .lock-screen");
        if (el) el.classList.add("unlocking");
      });
      setTimeout(() => {
        OS.multitasking.renderAll();
        if (openAppId) OS.multitasking.openApp(openAppId, side);
      }, 380);
    });
  }

  function lockDevice() {
    OS.set("deviceLocked", true);
    OS.multitasking.closeControlCenter();
    OS.multitasking.closeNotificationCenter();
    OS.multitasking.closeAppSwitcher();
    renderLockScreen();
  }

  /* ---------------- Face ID simulation ---------------- */
  function triggerFaceId(onSuccess) {
    // Compatibility name retained for callers; Duo uses side-button Touch ID.
    if (OS.get("faceIdBusy")) return;
    OS.set("faceIdBusy", true);
    const hint = document.querySelector(".lock-swipe-hint span");
    if (hint) hint.textContent = "Touch ID";
    setTimeout(() => {
      OS.set("faceIdBusy", false);
      if (onSuccess) onSuccess();
    }, 220);
  }

  /* ---------------- Dynamic Island ---------------- */
  let diTimer = null;
  function diShow(html, opts) {
    opts = opts || {};
    const di = document.getElementById("dynamic-island");
    const content = document.getElementById("di-content");
    content.innerHTML = html;
    di.classList.add("expanded");
    if (opts.className) di.classList.add(opts.className);
    clearTimeout(diTimer);
    if (opts.duration) {
      diTimer = setTimeout(() => diCollapse(opts.className), opts.duration);
    }
  }
  function diCollapse(className) {
    const di = document.getElementById("dynamic-island");
    di.classList.remove("expanded");
    if (className) di.classList.remove(className);
    document.getElementById("di-content").innerHTML = "";
  }

  function diMusicSync() {
    const di = document.getElementById("dynamic-island");
    if (!OS.get("musicPlaying")) {
      if (di.classList.contains("music")) diCollapse("music");
      return;
    }
    diShow(`<div class="di-music"><div class="di-music-art"></div><div class="di-music-bars"><span></span><span></span><span></span></div></div>`, { className: "music" });
  }
  OS.subscribe("musicPlaying", diMusicSync);

  function diTimerSync() {
    const di = document.getElementById("dynamic-island");
    if (!OS.get("timerRunning")) {
      if (di.classList.contains("timer")) diCollapse("timer");
      return;
    }
    const secs = Math.max(0, Math.ceil(OS.get("timerRemaining") / 1000));
    const mm = Math.floor(secs / 60), ss = secs % 60;
    diShow(`<div class="di-timer">${OS.icons.glyph("hourglass")} <span>${mm}:${ss < 10 ? "0" + ss : ss}</span></div>`, { className: "timer" });
  }
  OS.subscribe("timerRunning", diTimerSync);
  OS.subscribe("timerRemaining", diTimerSync);

  function diChargingPulse() {
    if (!OS.get("charging")) return;
    diShow(`<div class="di-charge">${OS.icons.glyph("bolt")} Charging</div>`, { className: "charge", duration: 1800 });
  }
  OS.subscribe("charging", diChargingPulse);

  /* ---------------- Incoming call ---------------- */
  function triggerIncomingCall(name) {
    name = name || "Jordan Avery";
    const di = document.getElementById("dynamic-island");
    diShow(`<div class="di-call">${OS.icons.glyph("phone")} <span>${name}</span></div>`, { className: "call" });
    OS.modals.open({
      title: name,
      icon: OS.icons.glyph("person"),
      subtitle: "iPhone Duo · mobile",
      body: `<div class="call-pulse"></div>`,
      isCall: true,
      buttons: [
        { label: "Decline", role: "danger", onClick: () => { diCollapse("call"); } },
        { label: "Accept", role: "primary", onClick: () => { diCollapse("call"); OS.notifications.push({ app: "Phone", icon: OS.icons.glyph("phone"), title: name, body: "Call connected (simulated)", color: "#34c759" }); } }
      ]
    });
  }

  /* ---------------- Modals ---------------- */
  function openModal(cfg) {
    const layer = document.getElementById("modal-layer");
    OS.set("activeModal", cfg.title || true);
    layer.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-card ${cfg.isCall ? "modal-call" : ""}">
        ${cfg.icon ? `<div class="modal-icon">${cfg.icon}</div>` : ""}
        <div class="modal-title">${cfg.title || ""}</div>
        ${cfg.subtitle ? `<div class="modal-subtitle">${cfg.subtitle}</div>` : ""}
        <div class="modal-body">${cfg.body || ""}</div>
        <div class="modal-buttons">
          ${(cfg.buttons || [{ label: "OK", role: "primary" }]).map((b, i) => `<button class="modal-btn ${b.role || ""}" data-idx="${i}">${b.label}</button>`).join("")}
        </div>
      </div>`;
    layer.classList.add("open");
    if (cfg.onRender) cfg.onRender(layer);
    layer.querySelector(".modal-backdrop").addEventListener("click", () => closeModal());
    layer.querySelectorAll(".modal-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const b = (cfg.buttons || [])[i];
        closeModal();
        if (b && b.onClick) b.onClick();
      });
    });
  }
  function closeModal() {
    const layer = document.getElementById("modal-layer");
    layer.classList.remove("open");
    OS.set("activeModal", null);
    setTimeout(() => { if (!layer.classList.contains("open")) layer.innerHTML = ""; }, 250);
  }

  window.OS = window.OS || {};
  OS.modals = { open: openModal, close: closeModal };

  /* ---------------- HUDs (volume / brightness) ---------------- */
  let volHudTimer = null, brightHudTimer = null;
  function showVolumeHud() {
    const hud = document.getElementById("volume-hud");
    document.getElementById("volume-hud-fill").style.width = Math.round(OS.get("volume") * 100) + "%";
    hud.classList.add("show");
    clearTimeout(volHudTimer);
    volHudTimer = setTimeout(() => hud.classList.remove("show"), 1200);
  }
  function showBrightnessHud() {
    const hud = document.getElementById("brightness-hud");
    document.getElementById("brightness-hud-fill").style.width = Math.round(OS.get("brightness") * 100) + "%";
    hud.classList.add("show");
    clearTimeout(brightHudTimer);
    brightHudTimer = setTimeout(() => hud.classList.remove("show"), 1200);
  }
  OS.subscribe("volume", showVolumeHud);
  OS.subscribe("brightness", () => { showBrightnessHud(); applyBrightness(); });

  function applyBrightness() {
    document.getElementById("device-frame").style.setProperty("--brightness", OS.get("brightness"));
  }

  /* ---------------- Theme / wallpaper / text size ---------------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", OS.get("darkMode") ? "dark" : "light");
    document.documentElement.setAttribute("data-text-size", OS.get("textSizeStep"));
  }
  OS.subscribe("darkMode", applyTheme);
  OS.subscribe("textSizeStep", applyTheme);

  const WALLPAPERS = {
    dunes: 'url("../assets/mojave.jpg")',
    aurora: "linear-gradient(160deg,#0b1e3d 0%,#1e3a6e 35%,#5b3a8e 65%,#e0716b 100%)",
    midnight: "linear-gradient(160deg,#000000 0%,#101418 45%,#1c2733 100%)",
    citrus: "linear-gradient(160deg,#ff9a56 0%,#ff6a88 45%,#845ec2 100%)",
    mono: "linear-gradient(160deg,#3a3a3c 0%,#1c1c1e 100%)"
  };
  function applyWallpaper() {
    const w = WALLPAPERS[OS.get("wallpaper")] || WALLPAPERS.aurora;
    document.getElementById("device-frame").style.setProperty("--wallpaper", w);
  }
  OS.subscribe("wallpaper", applyWallpaper);

  /* ---------------- Flashlight ---------------- */
  function applyFlashlight() {
    document.getElementById("flashlight-glow").classList.toggle("on", OS.get("flashlight"));
  }
  OS.subscribe("flashlight", applyFlashlight);

  /* ---------------- Hardware buttons ---------------- */
  function wireHardwareButtons() {
    document.getElementById("btn-power").addEventListener("click", () => {
      if (OS.get("deviceLocked")) {
        unlock("left");
      } else {
        lockDevice();
      }
    });
    document.getElementById("btn-action").addEventListener("click", () => {
      OS.set("flashlight", !OS.get("flashlight"));
    });
    document.getElementById("btn-vol-up").addEventListener("click", () => {
      OS.set("volume", Math.min(1, OS.get("volume") + 0.1));
    });
    document.getElementById("btn-vol-down").addEventListener("click", () => {
      OS.set("volume", Math.max(0, OS.get("volume") - 0.1));
    });
  }

  /* ---------------- Edge gestures per screen (CC / NC / App Switcher) ---------------- */
  function wireScreenGestures(side) {
    const screenEl = document.getElementById("screen-" + side);
    OS.gestures.attach(screenEl, {
      onDragStart: (info) => {
        const rect = screenEl.getBoundingClientRect();
        const relY = info.y - rect.top;
        const relX = info.x - rect.left;
        screenEl._gestureZone = relY < 46 ? (relX > rect.width * 0.55 ? "cc" : "notif") : (relY > rect.height - 40 ? "home" : null);
      },
      onDragEnd: ({ dy, dx }) => {
        const zone = screenEl._gestureZone;
        if (zone === "cc" && dy > 20 && !OS.get("deviceLocked")) OS.multitasking.openControlCenter(side);
        else if (zone === "notif" && dy > 20 && !OS.get("deviceLocked")) OS.multitasking.openNotificationCenter(side);
        else if (zone === "home" && dy < -60 && !OS.get("deviceLocked")) {
          if (dy < -140) OS.multitasking.openAppSwitcher(side);
          else {
            const st = side === "left" ? OS.get("leftScreen") : OS.get("rightScreen");
            if (st.mode === "app") OS.multitasking.closeApp(side);
          }
        }
        screenEl._gestureZone = null;
      }
    });
  }

  function wireOverlayDismiss() {
    document.getElementById("control-center").addEventListener("click", (e) => {
      if (e.target.id === "control-center") OS.multitasking.closeControlCenter();
    });
    document.getElementById("notification-center").addEventListener("click", (e) => {
      if (e.target.id === "notification-center") OS.multitasking.closeNotificationCenter();
    });
    ["control-center", "notification-center"].forEach((id) => {
      const el = document.getElementById(id);
      OS.gestures.attach(el, {
        onDragEnd: ({ dy }) => {
          if (dy < -40) {
            if (id === "control-center") OS.multitasking.closeControlCenter();
            else OS.multitasking.closeNotificationCenter();
          }
        }
      });
    });
    document.getElementById("app-switcher").addEventListener("click", (e) => {
      if (e.target.id === "app-switcher") OS.multitasking.closeAppSwitcher();
    });
  }

  /* ---------------- Notification seed ---------------- */
  function seedNotifications() {
    OS.notifications.push({ app: "Weather", icon: OS.icons.glyph("cloudSun"), title: "Cloudy conditions", body: "It's 68° right now, feels like 66°.", color: "#5ac8fa" });
    OS.notifications.push({ app: "Messages", icon: OS.icons.glyph("messages"), title: "Riley Chen", body: "See you at 6? Bringing the dual-screen prototype.", color: "#34c759", onOpen: () => OS.multitasking.openApp("messages", "span") });
    OS.notifications.push({ app: "Calendar", icon: OS.icons.glyph("calendarBadge"), title: "Design Review", body: "Starts in 45 minutes · Studio B", color: "#ff9500" });
  }

  function seedPhotos() {
    if (OS.get("photos").length) return;
    const gradients = [
      "linear-gradient(135deg,#ff9a56,#ff6a88)",
      "linear-gradient(135deg,#43cbff,#9708cc)",
      "linear-gradient(135deg,#0ba360,#3cba92)",
      "linear-gradient(135deg,#f7971e,#ffd200)",
      "linear-gradient(135deg,#7f00ff,#e100ff)",
      "linear-gradient(135deg,#00c6ff,#0072ff)"
    ];
    const photos = gradients.map((g, i) => ({ id: "p" + i, gradient: g, time: Date.now() - i * 3600000, favorite: false }));
    OS.set("photos", photos);
  }

  function getScale() {
    const device = document.getElementById("device");
    return parseFloat(getComputedStyle(device).getPropertyValue("--scale")) || 1;
  }

  window.OS.device = {
    boot, renderLockScreen, unlock, lockDevice, triggerFaceId, triggerIncomingCall,
    diShow, diCollapse, wireHardwareButtons, wireScreenGestures, wireOverlayDismiss,
    applyTheme, applyWallpaper, applyBrightness, applyFlashlight, WALLPAPERS, getScale
  };
})();
