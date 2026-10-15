/* ============================================================
   multitasking.js — dual-screen window manager, app switcher,
   contextual multitasking menu, control center / notification
   center open-close orchestration.
   ============================================================ */
(function () {
  "use strict";

  const apps = {}; // populated by app modules: apps[id] = {id,name,icon,color,duoCapable,mount,unmount}
  let dragPayload = null;

  function registerApp(def) {
    apps[def.id] = def;
  }

  function screenState(side) {
    return side === "left" ? OS.get("leftScreen") : OS.get("rightScreen");
  }
  function setScreenState(side, partial) {
    OS.patch(side === "left" ? "leftScreen" : "rightScreen", partial);
  }

  function trackRunning(id, screen) {
    const running = OS.get("runningApps").filter((r) => r.id !== id);
    running.push({ id, screen, openedAt: Date.now() });
    OS.set("runningApps", running);
  }
  function untrackRunning(id) {
    OS.set("runningApps", OS.get("runningApps").filter((r) => r.id !== id));
  }

  function openApp(appId, target) {
    const def = apps[appId];
    if (!def) return;
    target = target || OS.get("preferredScreen") || "left";
    if (target === "last") target = OS.get("lastUsedScreen") || "left";
    if (OS.get('folded')) target = 'left';
    if (OS.get('deviceLocked')) return;

    if (target === "span") {
      if (!def.duoCapable) target = "left";
    }

    if (target === "span") {
      OS.set("spannedApp", appId);
      setScreenState("left", { mode: "app", app: appId });
      setScreenState("right", { mode: "app", app: appId });
      trackRunning(appId, "span");
    } else {
      if (OS.get("spannedApp")) {
        OS.set("spannedApp", null);
        setScreenState(target === 'left' ? 'right' : 'left', { mode: 'home', app: null });
      }
      setScreenState(target, { mode: "app", app: appId });
      trackRunning(appId, target);
      OS.set("lastUsedScreen", target);
    }
    renderAll();
    animateAppOpen(target);
  }

  function closeApp(side) {
    const st = screenState(side);
    if (st.mode !== "app") return;
    const appId = st.app;
    if (OS.get("spannedApp") === appId) {
      OS.set("spannedApp", null);
      setScreenState("left", { mode: "home", app: null });
      setScreenState("right", { mode: "home", app: null });
    } else {
      setScreenState(side, { mode: "home", app: null });
    }
    untrackRunning(appId);
    const def = apps[appId];
    if (def && def.unmount) def.unmount(side);
    renderAll();
  }

  function moveApp(fromSide, toSide) {
    const st = screenState(fromSide);
    if (st.mode !== "app") return;
    const appId = st.app;
    const other = screenState(toSide);
    setScreenState(fromSide, { mode: other.mode, app: other.app });
    setScreenState(toSide, { mode: "app", app: appId });
    if (OS.get("spannedApp") === appId) OS.set("spannedApp", null);
    trackRunning(appId, toSide);
    OS.set("lastUsedScreen", toSide);
    renderAll();
  }

  function spanCurrentApp(side) {
    const st = screenState(side);
    if (st.mode !== "app") return;
    const def = apps[st.app];
    if (!def || !def.duoCapable) return;
    openApp(st.app, "span");
  }

  function unspanApp() {
    const appId = OS.get("spannedApp");
    if (!appId) return;
    OS.set("spannedApp", null);
    setScreenState("left", { mode: "app", app: appId });
    setScreenState("right", { mode: "home", app: null });
    trackRunning(appId, "left");
    renderAll();
  }

  function animateAppOpen(target) {
    const sides = target === "span" ? ["left", "right"] : [target];
    sides.forEach((side) => {
      const content = document.getElementById("content-" + side);
      if (!content) return;
      content.classList.remove("app-opening");
      void content.offsetWidth;
      content.classList.add("app-opening");
    });
  }

  function renderScreen(side) {
    const spanned = OS.get("spannedApp");
    if (spanned) {
      renderSpannedApp(spanned);
      return;
    }

    const container = document.getElementById("content-" + side);
    if (!container) return;
    const st = screenState(side);
    container.innerHTML = "";

    if (st.mode === "home") {
      OS.apps.home.mount(container, { side });
      return;
    }

    if (st.mode === "app") {
      const def = apps[st.app];
      if (!def) return;
      if (def.mount) def.mount(container, { side, spanned: false, pane: "compact", otherContainer: null });
      renderAppHeader(container, def, side, false);
    }
  }

  /**
   * Spanned apps mount ONCE per render cycle with fixed container roles
   * (left = primary pane, right = secondary pane) so the two screens never
   * race and overwrite each other's content.
   */
  function renderSpannedApp(appId) {
    const def = apps[appId];
    if (!def) return;
    const leftContainer = document.getElementById("content-left");
    const rightContainer = document.getElementById("content-right");
    leftContainer.innerHTML = "";
    rightContainer.innerHTML = "";
    if (def.mount) {
      def.mount(leftContainer, { side: "left", spanned: true, pane: "primary", otherContainer: rightContainer });
    }
    renderAppHeader(leftContainer, def, "left", true);
    renderAppHeader(rightContainer, def, "right", true);
  }

  function renderAppHeader(container, def, side, spanned) {
    const header = document.createElement("div");
    header.className = "app-chrome-header";
    header.innerHTML = `
      <button class="app-header-home" aria-label="Home">
        <span class="home-dot"></span>
      </button>
      <button class="app-header-pill" aria-label="App multitasking menu">
        <span class="app-header-icon">${def.icon}</span>
        <span class="app-header-name">${def.name}${spanned ? " · Spanned" : ""}</span>
        <span class="app-header-chevron">▾</span>
      </button>`;
    container.prepend(header);

    header.querySelector(".app-header-home").addEventListener("click", () => closeApp(side));
    header.querySelector(".app-header-pill").addEventListener("click", (e) => {
      openMultitaskMenu(def.id, side, e.currentTarget);
    });
  }

  function openMultitaskMenu(appId, side, anchorEl) {
    const menu = document.getElementById("context-menu");
    const def = apps[appId];
    const spanned = OS.get("spannedApp") === appId;
    const rect = anchorEl.getBoundingClientRect();
    const screenEl = document.getElementById("screen-" + side);
    const screenRect = screenEl.getBoundingClientRect();
    const scale = OS.device.getScale();
    const top = (rect.bottom - screenRect.top) / scale + 8;
    const left = Math.max(12, (rect.left - screenRect.left) / scale);

    menu.dataset.side = side;
    menu.innerHTML = `
      <div class="ctx-backdrop"></div>
      <div class="ctx-sheet" style="top:${top}px; left:${left}px;">
        <div class="ctx-title">${def.name}</div>
        ${!spanned ? (side === "left" ? '<button class="ctx-item" data-act="moveRight">Move to Right Screen</button>' : '<button class="ctx-item" data-act="moveLeft">Move to Left Screen</button>') : ""}
        ${def.duoCapable ? (spanned ? '<button class="ctx-item" data-act="unspan">Unspan from Duo</button>' : '<button class="ctx-item" data-act="span">Span Across Duo</button>') : ""}
        <button class="ctx-item" data-act="pair">Pair With App…</button>
        <button class="ctx-item danger" data-act="close">Close App</button>
      </div>`;
    menu.classList.add("open");
    OS.set("contextMenuOpen", true);

    menu.querySelector(".ctx-backdrop").addEventListener("click", closeMultitaskMenu);
    menu.querySelectorAll(".ctx-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        closeMultitaskMenu();
        if (act === "moveRight") moveApp("left", "right");
        else if (act === "moveLeft") moveApp("right", "left");
        else if (act === "span") spanCurrentApp(side);
        else if (act === "unspan") unspanApp();
        else if (act === "close") closeApp(side);
        else if (act === "pair") openPairPicker(side);
      });
    });
  }

  function closeMultitaskMenu() {
    const menu = document.getElementById("context-menu");
    menu.classList.remove("open");
    OS.set("contextMenuOpen", false);
    setTimeout(() => { if (!menu.classList.contains("open")) menu.innerHTML = ""; }, 250);
  }

  function openPairPicker(side) {
    const otherSide = side === "left" ? "right" : "left";
    const list = Object.values(apps).filter((a) => a.id !== "home");
    OS.modals.open({
      title: "Pair With App",
      body: `<div class="pair-grid">${list.map((a) => `<button class="pair-item" data-app="${a.id}"><span>${a.icon}</span>${a.name}</button>`).join("")}</div>`,
      onRender: (root) => {
        root.querySelectorAll(".pair-item").forEach((btn) => {
          btn.addEventListener("click", () => {
            openApp(btn.dataset.app, otherSide);
            OS.modals.close();
          });
        });
      },
      buttons: [{ label: "Cancel", role: "cancel" }]
    });
  }

  /* ---------------- Control Center / Notification Center / App Switcher ---------------- */

  function openControlCenter(side) {
    const el = document.getElementById("control-center");
    el.dataset.side = side;
    OS.controlCenter.render();
    el.classList.add("open");
    OS.set("controlCenterOpen", true);
  }
  function closeControlCenter() {
    const el = document.getElementById("control-center");
    el.classList.remove("open");
    OS.set("controlCenterOpen", false);
  }

  function openNotificationCenter(side) {
    const el = document.getElementById("notification-center");
    el.dataset.side = side;
    OS.notifications.render();
    el.classList.add("open");
    OS.set("notificationCenterOpen", true);
  }
  function closeNotificationCenter() {
    const el = document.getElementById("notification-center");
    el.classList.remove("open");
    OS.set("notificationCenterOpen", false);
  }

  function openAppSwitcher(side) {
    const el = document.getElementById("app-switcher");
    el.dataset.side = side;
    renderAppSwitcher();
    el.classList.add("open");
    OS.set("appSwitcherOpen", true);
  }
  function closeAppSwitcher() {
    const el = document.getElementById("app-switcher");
    el.classList.remove("open");
    OS.set("appSwitcherOpen", false);
  }

  function renderAppSwitcher() {
    const el = document.getElementById("app-switcher");
    const running = OS.get("runningApps");
    const seen = new Set();
    const cards = [];
    running.forEach((r) => {
      if (seen.has(r.id + r.screen)) return;
      seen.add(r.id + r.screen);
      const def = apps[r.id];
      if (!def) return;
      cards.push(r);
    });

    el.innerHTML = `
      <div class="switcher-header">App Switcher</div>
      <div class="switcher-track">
        ${cards.length ? cards.map((r) => {
          const def = apps[r.id];
          const tag = r.screen === "span" ? "Spanned" : r.screen === "left" ? "Left Screen" : "Right Screen";
          return `<div class="switcher-card" data-id="${r.id}" data-screen="${r.screen}">
            <div class="switcher-card-preview" style="background:${def.color}22">
              <span class="switcher-card-icon">${def.icon}</span>
            </div>
            <div class="switcher-card-label"><span>${def.name}</span><span class="switcher-tag">${tag}</span></div>
            <button class="switcher-close" data-close="${r.id}" data-screen="${r.screen}" aria-label="Close app">✕</button>
          </div>`;
        }).join("") : '<div class="switcher-empty">No Running Apps</div>'}
      </div>`;

    el.querySelectorAll(".switcher-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".switcher-close")) return;
        const id = card.dataset.id, screen = card.dataset.screen;
        closeAppSwitcher();
        if (screen === "span") openApp(id, "span");
        else openApp(id, screen);
      });
    });
    el.querySelectorAll(".switcher-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.close, screen = btn.dataset.screen;
        const card = btn.closest(".switcher-card");
        card.classList.add("dismissing");
        setTimeout(() => {
          if (screen === "span") { OS.set("spannedApp", null); setScreenState("left", { mode: "home", app: null }); setScreenState("right", { mode: "home", app: null }); untrackRunning(id); }
          else { setScreenState(screen, { mode: "home", app: null }); untrackRunning(id); }
          renderAll();
          renderAppSwitcher();
        }, 180);
      });
    });
  }

  function renderAll() {
    renderScreen("left");
    if (!OS.get('spannedApp')) renderScreen("right");
    document.dispatchEvent(new CustomEvent("os:render"));
  }

  window.OS = window.OS || {};
  window.OS.multitasking = {
    registerApp, apps, openApp, closeApp, moveApp, spanCurrentApp, unspanApp,
    renderScreen, renderAll, openMultitaskMenu, closeMultitaskMenu,
    openControlCenter, closeControlCenter, openNotificationCenter, closeNotificationCenter,
    openAppSwitcher, closeAppSwitcher, renderAppSwitcher,
    setDragPayload: (p) => (dragPayload = p),
    getDragPayload: () => dragPayload,
    clearDragPayload: () => (dragPayload = null)
  };
  window.OS.apps = apps;
})();
