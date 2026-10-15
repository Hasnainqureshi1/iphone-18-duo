/* ============================================================
   notifications.js — Notification Center
   ============================================================ */
(function () {
  "use strict";

  let idCounter = 1;

  function push(notif) {
    const n = Object.assign({
      id: "n" + idCounter++,
      time: Date.now(),
      app: "System",
      icon: OS.icons.glyph("bell"),
      title: "",
      body: "",
      color: "#8e8e93"
    }, notif);
    const list = OS.get("notifications").slice();
    list.unshift(n);
    OS.set("notifications", list);
    bumpBadge(n.app);
    return n;
  }

  function dismiss(id) {
    OS.set("notifications", OS.get("notifications").filter((n) => n.id !== id));
  }

  function clearAll() {
    OS.set("notifications", []);
  }

  function bumpBadge(appId) {
    document.dispatchEvent(new CustomEvent("os:badge", { detail: { appId } }));
  }

  function relTime(ts) {
    const diff = Math.max(0, Date.now() - ts);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  function render(side) {
    const el = document.getElementById("notification-center");
    const list = OS.get("notifications");
    const grouped = {};
    list.forEach((n) => {
      grouped[n.app] = grouped[n.app] || [];
      grouped[n.app].push(n);
    });

    let html = `<div class="nc-sheet">
      <div class="nc-handle"></div>
      <div class="nc-header">
        <span>Notification Center</span>
        ${list.length ? '<button class="nc-clear" id="nc-clear-all">Clear All</button>' : ""}
      </div>
      <div class="nc-list">`;

    if (!list.length) {
      html += `<div class="nc-empty">No Notifications</div>`;
    } else {
      Object.keys(grouped).forEach((app) => {
        const items = grouped[app];
        html += `<div class="nc-group">`;
        items.forEach((n, idx) => {
          html += `<div class="nc-card" data-id="${n.id}" style="--accent:${n.color}">
            <div class="nc-card-icon">${n.icon}</div>
            <div class="nc-card-body">
              <div class="nc-card-top"><span class="nc-app">${n.app}</span><span class="nc-time">${relTime(n.time)}</span></div>
              <div class="nc-title">${n.title}</div>
              <div class="nc-text">${n.body}</div>
            </div>
            <button class="nc-dismiss" data-dismiss="${n.id}" aria-label="Dismiss">✕</button>
          </div>`;
        });
        html += `</div>`;
      });
    }
    html += `</div></div>`;
    el.innerHTML = html;

    el.querySelectorAll(".nc-dismiss").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dismiss(btn.dataset.dismiss);
      });
    });
    el.querySelectorAll(".nc-card").forEach((card) => {
      card.addEventListener("click", () => {
        const n = list.find((x) => x.id === card.dataset.id);
        if (n && n.onOpen) n.onOpen();
        OS.multitasking && OS.multitasking.closeNotificationCenter();
      });
    });
    const clearBtn = document.getElementById("nc-clear-all");
    if (clearBtn) clearBtn.addEventListener("click", clearAll);
  }

  OS.subscribe("notifications", () => {
    if (OS.get("notificationCenterOpen")) render();
  });

  window.OS = window.OS || {};
  window.OS.notifications = { push, dismiss, clearAll, render, relTime };
})();
