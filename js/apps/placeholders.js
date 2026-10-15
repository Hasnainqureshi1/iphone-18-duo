/* ============================================================
   apps/placeholders.js — lightweight concept apps
   (Phone, Mail, Calendar, Maps, App Store)
   ============================================================ */
(function () {
  "use strict";

  function conceptScreen(iconName, title, sub) {
    return `<div class="concept-app">
      <div class="concept-icon">${OS.icons.svg(iconName)}</div>
      <div class="concept-title">${title}</div>
      <div class="concept-sub">${sub}</div>
    </div>`;
  }

  OS.multitasking.registerApp({
    id: "phone",
    name: "Phone",
    icon: OS.icons.svg("phone"),
    color: "#34c759",
    duoCapable: false,
    mount(container) {
      const el = document.createElement("div");
      el.className = "phone-app";
      el.innerHTML = `
        <div class="concept-icon">${OS.icons.svg("phone")}</div>
        <div class="concept-title">Phone</div>
        <div class="concept-sub">Dial pad concept — try an incoming call instead.</div>
        <button class="clock-round-btn primary" id="phone-simulate">Simulate Incoming Call</button>`;
      container.appendChild(el);
      el.querySelector("#phone-simulate").addEventListener("click", () => OS.device.triggerIncomingCall("Jordan Avery"));
    }
  });

  OS.multitasking.registerApp({
    id: "mail",
    name: "Mail",
    icon: OS.icons.svg("mail"),
    color: "#0a84ff",
    duoCapable: false,
    mount(container) { container.innerHTML = conceptScreen("mail", "Mail", "Your inbox concept is being drafted for a future update."); }
  });

  OS.multitasking.registerApp({
    id: "calendar",
    name: "Calendar",
    icon: OS.icons.svg("calendar"),
    color: "#ff3b30",
    duoCapable: false,
    mount(container) { container.innerHTML = conceptScreen("calendar", "Calendar", "Design Review · Today · Studio B, 2nd floor."); }
  });

  OS.multitasking.registerApp({
    id: "maps",
    name: "Maps",
    icon: OS.icons.svg("maps"),
    color: "#34c759",
    duoCapable: false,
    mount(container) { container.innerHTML = conceptScreen("maps", "Maps", "Map rendering concept — coming to a future Duo build."); }
  });

  OS.multitasking.registerApp({
    id: "appstore",
    name: "App Store",
    icon: OS.icons.svg("appstore"),
    color: "#0a84ff",
    duoCapable: false,
    mount(container) { container.innerHTML = conceptScreen("appstore", "App Store", "Duo-optimized apps arriving soon."); }
  });
})();
