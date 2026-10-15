/* ============================================================
   apps/settings.js — Settings app (categories + detail panel)
   ============================================================ */
(function () {
  "use strict";

  const CATEGORIES = [
    { id: "profile", name: "Osama Munir", icon: "person", sub: "Apple Account, iCloud" },
    { id: "duo", name: "Duo Display", icon: "display2", accent: "#0a84ff", featured: true },
    { id: "wifi", name: "Wi-Fi", icon: "wifi", accent: "#0a84ff" },
    { id: "bluetooth", name: "Bluetooth", icon: "bluetooth", accent: "#0a84ff" },
    { id: "cellular", name: "Mobile Service", icon: "cellular", accent: "#34c759" },
    { id: "notifications", name: "Notifications", icon: "bell", accent: "#ff3b30" },
    { id: "sounds", name: "Sounds & Haptics", icon: "speaker", accent: "#ff2d55" },
    { id: "focus", name: "Focus", icon: "moon", accent: "#5856d6" },
    { id: "screentime", name: "Screen Time", icon: "hourglass", accent: "#5856d6" },
    { id: "general", name: "General", icon: "gear", accent: "#8e8e93" },
    { id: "display", name: "Display & Brightness", icon: "sun", accent: "#0a84ff" },
    { id: "homescreen", name: "Home Screen", icon: "grid", accent: "#8e8e93" },
    { id: "accessibility", name: "Accessibility", icon: "accessibility", accent: "#0a84ff" },
    { id: "wallpaper", name: "Wallpaper", icon: "image", accent: "#ff9500" },
    { id: "siri", name: "Siri & Intelligence", icon: "sparkle", accent: "#5856d6" },
    { id: "battery", name: "Battery", icon: "battery", accent: "#34c759" },
    { id: "privacy", name: "Privacy & Security", icon: "shield", accent: "#8e8e93" }
  ];

  let selected = "duo";

  function mount(container, opts) {
    if (opts.spanned) {
      renderList(container, opts.side, true);
      renderDetail(opts.otherContainer, true);
    } else {
      renderCompact(container, opts.side);
    }
  }

  function renderList(container, side, spanned) {
    const el = document.createElement("div");
    el.className = "settings-app";
    el.innerHTML = `
      <div class="settings-header"><h1>Settings</h1></div>
      <div class="settings-search">${OS.icons.inline("search")} Search</div>
      <div class="settings-list" id="settings-list-${side}"></div>`;
    container.appendChild(el);
    const list = el.querySelector(".settings-list");
    CATEGORIES.forEach((c) => {
      const row = document.createElement("button");
      row.className = "settings-row" + (spanned && selected === c.id ? " selected" : "");
      row.innerHTML = `<span class="settings-row-icon" style="background:${c.accent || "#636366"}">${OS.icons.glyph(c.icon)}</span>
        <span class="settings-row-text"><b>${c.name}</b>${c.sub ? `<small>${c.sub}</small>` : ""}</span>
        <span class="settings-row-chevron">›</span>`;
      row.addEventListener("click", () => {
        selected = c.id;
        if (spanned) {
          OS.multitasking.renderScreen(side === "left" ? "right" : "left");
          list.querySelectorAll(".settings-row").forEach((r) => r.classList.remove("selected"));
          row.classList.add("selected");
        } else {
          renderDetailCompact(container, side);
        }
      });
      list.appendChild(row);
    });
  }

  function renderCompact(container, side) {
    renderList(container, side, false);
  }

  function renderDetailCompact(container, side) {
    container.innerHTML = "";
    const back = document.createElement("button");
    back.className = "settings-back";
    back.innerHTML = "‹ Settings";
    back.addEventListener("click", () => { container.innerHTML = ""; renderList(container, side, false); });
    container.appendChild(back);
    const detailWrap = document.createElement("div");
    detailWrap.className = "settings-detail-wrap";
    container.appendChild(detailWrap);
    renderDetailInto(detailWrap, side);
  }

  function renderDetail(container, spanned) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "settings-detail-wrap";
    container.appendChild(wrap);
    renderDetailInto(wrap, "right");
  }

  function row(label, controlHtml) {
    return `<div class="settings-detail-row"><span>${label}</span>${controlHtml}</div>`;
  }
  function toggleHtml(key, checked) {
    return `<button class="ios-switch ${checked ? "on" : ""}" data-toggle="${key}"><span class="ios-switch-knob"></span></button>`;
  }

  function renderDetailInto(wrap, side) {
    const cat = CATEGORIES.find((c) => c.id === selected);
    const s = OS.state;
    let html = `<div class="settings-detail-title"><span class="settings-detail-icon" style="background:${cat.accent || "#636366"}">${OS.icons.glyph(cat.icon)}</span>${cat.name}</div><div class="settings-detail-card">`;

    if (selected === "duo") {
      html += row("Display Mode", `<select class="ios-select" data-select="duoDisplayMode">
          <option value="automatic" ${s.duoDisplayMode === "automatic" ? "selected" : ""}>Automatic</option>
          <option value="independent" ${s.duoDisplayMode === "independent" ? "selected" : ""}>Independent</option>
          <option value="extended" ${s.duoDisplayMode === "extended" ? "selected" : ""}>Extended</option>
        </select>`);
      html += row("Hinge Awareness", toggleHtml("hingeAwareness", s.hingeAwareness));
      html += row("Cross-Screen Drag", toggleHtml("crossScreenDrag", s.crossScreenDrag));
      html += row("Preferred Screen", `<select class="ios-select" data-select="preferredScreen">
          <option value="left" ${s.preferredScreen === "left" ? "selected" : ""}>Left</option>
          <option value="right" ${s.preferredScreen === "right" ? "selected" : ""}>Right</option>
          <option value="last" ${s.preferredScreen === "last" ? "selected" : ""}>Last Used</option>
        </select>`);
      html += row("Span Apps Automatically", toggleHtml("spanAppsAutomatically", s.spanAppsAutomatically));
      html += row("Mirror Screens", toggleHtml("mirrorScreens", s.mirrorScreens));
      html += row("Dual Wallpaper", toggleHtml("dualWallpaper", s.dualWallpaper));
    } else if (selected === "wifi") {
      html += row("Wi-Fi", toggleHtml("wifiEnabled", s.wifiEnabled));
      html += `</div><div class="settings-detail-card">`;
      ["Studio Loft 6E", "Duo Labs 5G", "iPhone 17 (Legacy)"].forEach((n, i) => {
        html += `<div class="settings-detail-row"><span>${OS.icons.inline("wifi")} ${n}</span>${i === 0 ? `<span class="settings-check">${OS.icons.inline("check")}</span>` : ""}</div>`;
      });
    } else if (selected === "bluetooth") {
      html += row("Bluetooth", toggleHtml("bluetoothEnabled", s.bluetoothEnabled));
      html += `</div><div class="settings-detail-card">`;
      ["AirPods Max", "Studio Keyboard", "Duo Watch"].forEach((n) => {
        html += `<div class="settings-detail-row"><span>${OS.icons.inline("headphones")} ${n}</span><small>Not Connected</small></div>`;
      });
    } else if (selected === "cellular") {
      html += row("Cellular Data", toggleHtml("cellularEnabled", s.cellularEnabled));
      html += row("Data Mode", `<span class="settings-value">5G Auto</span>`);
    } else if (selected === "display") {
      html += row("Dark Mode", toggleHtml("darkMode", s.darkMode));
      html += row("Brightness", `<input type="range" class="ios-slider" min="0.1" max="1" step="0.01" value="${s.brightness}" data-range="brightness">`);
      html += row("Text Size", `<input type="range" class="ios-slider" min="0" max="4" step="1" value="${s.textSizeStep}" data-range="textSizeStep">`);
      html += row("True Tone", toggleHtml("_truetone", true));
    } else if (selected === "wallpaper") {
      html += `</div><div class="wallpaper-grid">`;
      Object.keys(OS.device.WALLPAPERS).forEach((w) => {
        html += `<button class="wallpaper-swatch ${s.wallpaper === w ? "selected" : ""}" data-wallpaper="${w}" style="background:${OS.device.WALLPAPERS[w]}"></button>`;
      });
      html += `</div><div class="settings-detail-card">`;
      html += row("Dual Wallpaper (continuous)", toggleHtml("dualWallpaper", s.dualWallpaper));
    } else if (selected === "battery") {
      html += row("Battery Percentage", toggleHtml("showBatteryPercent", s.showBatteryPercent));
      html += row("Low Power Mode", toggleHtml("lowPowerMode", s.lowPowerMode));
      html += row("Charging", toggleHtml("charging", s.charging));
      html += `</div><div class="settings-detail-card"><div class="battery-big">${Math.round(s.batteryPercentage)}%</div></div>`;
    } else if (selected === "focus") {
      html += row("Focus Mode", toggleHtml("focusMode", s.focusMode));
      html += `<div class="settings-hint">Silences notifications and dims the lock screen previews across both displays.</div>`;
    } else if (selected === "homescreen") {
      html += `<div class="settings-hint">Long-press any icon to edit the Home Screen, remove apps, or share them.</div>`;
    } else if (selected === "accessibility") {
      html += row("Bold Text", toggleHtml("_bold", false));
      html += row("Reduce Motion", toggleHtml("_motion", false));
      html += row("VoiceOver", toggleHtml("_voiceover", false));
    } else if (selected === "profile") {
      html += `<div class="profile-card"><div class="profile-avatar">OM</div><div><b>Osama Munir</b><br><small>osama.munir16@icloud.com</small></div></div>`;
    } else {
      html += `<div class="settings-hint">This section is a concept placeholder — nothing to configure yet.</div>`;
    }
    html += `</div>`;
    wrap.innerHTML = html;

    wrap.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.toggle;
        if (key.startsWith("_")) { btn.classList.toggle("on"); return; }
        OS.set(key, !OS.get(key));
        renderDetailInto(wrap, side);
      });
    });
    wrap.querySelectorAll("[data-select]").forEach((sel) => {
      sel.addEventListener("change", () => OS.set(sel.dataset.select, sel.value));
    });
    wrap.querySelectorAll("[data-range]").forEach((r) => {
      r.addEventListener("input", () => {
        const key = r.dataset.range;
        OS.set(key, key === "textSizeStep" ? parseInt(r.value, 10) : parseFloat(r.value));
      });
    });
    wrap.querySelectorAll("[data-wallpaper]").forEach((sw) => {
      sw.addEventListener("click", () => {
        OS.set("wallpaper", sw.dataset.wallpaper);
        renderDetailInto(wrap, side);
      });
    });
  }

  OS.multitasking.registerApp({
    id: "settings",
    name: "Settings",
    icon: OS.icons.svg("settings"),
    color: "#8e8e93",
    duoCapable: true,
    mount
  });
})();
