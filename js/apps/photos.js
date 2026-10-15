/* ============================================================
   apps/photos.js — Photos gallery (grid + viewer)
   ============================================================ */
(function () {
  "use strict";

  let selectedId = null;

  function mount(container, opts) {
    if (opts.spanned) {
      renderGrid(container, opts.side, true);
      renderViewer(opts.otherContainer, true);
    } else {
      renderCompact(container, opts.side);
    }
  }

  function renderGrid(container, side, spanned) {
    const photos = OS.get("photos");
    if (!selectedId && photos.length) selectedId = photos[0].id;
    const el = document.createElement("div");
    el.className = "photos-app";
    el.innerHTML = `<div class="photos-header"><h1>Photos</h1><span class="photos-count">${photos.length} Photos</span></div>
      <div class="photos-grid"></div>`;
    container.appendChild(el);
    const grid = el.querySelector(".photos-grid");
    if (!photos.length) {
      grid.innerHTML = `<div class="photos-empty">No Photos Yet<br><small>Capture one from the Camera app.</small></div>`;
    }
    photos.forEach((p) => {
      const cell = document.createElement("button");
      cell.className = "photo-cell" + (spanned && p.id === selectedId ? " selected" : "");
      cell.style.background = p.gradient;
      if (p.favorite) cell.innerHTML = `<span class="photo-fav-badge">${OS.icons.glyph("heart")}</span>`;

      OS.gestures.attach(cell, {
        onTap: () => {
          selectedId = p.id;
          if (spanned) {
            grid.querySelectorAll(".photo-cell").forEach((c) => c.classList.remove("selected"));
            cell.classList.add("selected");
            OS.multitasking.renderScreen(side === "left" ? "right" : "left");
          } else {
            renderViewerCompact(container, side);
          }
        },
        onLongPress: () => openPhotoMenu(p, cell, side)
      });

      if (OS.get("crossScreenDrag")) {
        cell.draggable = false;
        cell.addEventListener("pointerdown", (e) => startCrossScreenDrag(e, p, cell));
      }
      grid.appendChild(cell);
    });
  }

  function renderCompact(container, side) {
    renderGrid(container, side, false);
  }

  function renderViewerCompact(container, side) {
    container.innerHTML = "";
    const back = document.createElement("button");
    back.className = "settings-back";
    back.innerHTML = "‹ Photos";
    back.addEventListener("click", () => { container.innerHTML = ""; renderGrid(container, side, false); });
    container.appendChild(back);
    const wrap = document.createElement("div");
    container.appendChild(wrap);
    renderViewerInto(wrap, side);
  }

  function renderViewer(container, spanned) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    container.appendChild(wrap);
    renderViewerInto(wrap, "right");
  }

  function renderViewerInto(wrap, side) {
    const photos = OS.get("photos");
    const p = photos.find((x) => x.id === selectedId) || photos[0];
    if (!p) { wrap.innerHTML = `<div class="photos-empty">Select a photo</div>`; return; }
    wrap.className = "photo-viewer";
    wrap.innerHTML = `
      <div class="photo-viewer-image" style="background:${p.gradient}"></div>
      <div class="photo-viewer-meta">${new Date(p.time).toLocaleString()}</div>
      <div class="photo-viewer-actions">
        <button data-act="fav">${OS.icons.glyph(p.favorite ? "heart" : "heartOutline")}<span>${p.favorite ? "Favorited" : "Favorite"}</span></button>
        <button data-act="share">${OS.icons.glyph("share")}<span>Share</span></button>
        <button data-act="delete" class="danger">${OS.icons.glyph("trash")}<span>Delete</span></button>
      </div>`;
    wrap.querySelector('[data-act="fav"]').addEventListener("click", () => {
      p.favorite = !p.favorite;
      OS.set("photos", photos.slice());
      renderViewerInto(wrap, side);
    });
    wrap.querySelector('[data-act="share"]').addEventListener("click", () => {
      OS.notifications.push({ app: "Photos", icon: OS.icons.glyph("share"), title: "Share Sheet", body: "Photo ready to send (simulated).", color: "#34c759" });
    });
    wrap.querySelector('[data-act="delete"]').addEventListener("click", () => {
      OS.modals.open({
        title: "Delete Photo?", icon: OS.icons.glyph("trash"),
        body: `<p class="modal-text">This photo will be removed.</p>`,
        buttons: [{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "danger", onClick: () => {
          const remaining = OS.get("photos").filter((x) => x.id !== p.id);
          OS.set("photos", remaining);
          selectedId = remaining[0] ? remaining[0].id : null;
          OS.multitasking.renderAll();
        } }]
      });
    });
  }

  function openPhotoMenu(p, anchorEl, side) {
    const menu = document.getElementById("context-menu");
    const rect = anchorEl.getBoundingClientRect();
    const screenRect = document.getElementById("screen-" + side).getBoundingClientRect();
    const scale = OS.device.getScale();
    const top = (rect.top - screenRect.top) / scale;
    const left = Math.min(screenRect.width / scale - 190, (rect.left - screenRect.left) / scale);
    menu.dataset.side = side;
    menu.innerHTML = `<div class="ctx-backdrop"></div>
      <div class="ctx-sheet" style="top:${top}px; left:${left}px;">
        <button class="ctx-item" data-act="copy">Copy</button>
        <button class="ctx-item" data-act="share">Share</button>
        <button class="ctx-item" data-act="fav">${p.favorite ? "Remove Favorite" : "Favorite"}</button>
        <button class="ctx-item danger" data-act="delete">Delete</button>
      </div>`;
    menu.classList.add("open");
    OS.set("contextMenuOpen", true);
    menu.querySelector(".ctx-backdrop").addEventListener("click", () => { menu.classList.remove("open"); OS.set("contextMenuOpen", false); });
    menu.querySelectorAll(".ctx-item").forEach((b) => b.addEventListener("click", () => {
      menu.classList.remove("open");
      OS.set("contextMenuOpen", false);
      if (b.dataset.act === "fav") { p.favorite = !p.favorite; OS.set("photos", OS.get("photos").slice()); OS.multitasking.renderAll(); }
      else if (b.dataset.act === "delete") { OS.set("photos", OS.get("photos").filter((x) => x.id !== p.id)); OS.multitasking.renderAll(); }
      else if (b.dataset.act === "copy") OS.notifications.push({ app: "Photos", icon: OS.icons.glyph("clipboard"), title: "Copied", body: "Photo copied to clipboard (simulated).", color: "#34c759" });
      else if (b.dataset.act === "share") OS.notifications.push({ app: "Photos", icon: OS.icons.glyph("share"), title: "Share Sheet", body: "Photo ready to send (simulated).", color: "#34c759" });
    }));
  }

  /* ---- cross-screen drag: drag a photo cell across the hinge into Messages ---- */
  function startCrossScreenDrag(downEvent, photo, cellEl) {
    if (!OS.get("crossScreenDrag")) return;
    let ghost = null;
    let moved = false;
    const onMove = (e) => {
      if (!ghost) {
        moved = true;
        ghost = document.createElement("div");
        ghost.className = "drag-ghost";
        ghost.style.background = photo.gradient;
        document.body.appendChild(ghost);
        OS.multitasking.setDragPayload({ type: "photo", data: photo });
      }
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      document.querySelectorAll(".drop-hover").forEach((n) => n.classList.remove("drop-hover"));
      const dropZone = target && target.closest("[data-drop-zone]");
      if (dropZone) dropZone.classList.add("drop-hover");
    };
    const onUp = (e) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (ghost) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const dropZone = target && target.closest("[data-drop-zone]");
        if (dropZone) {
          dropZone.classList.remove("drop-hover");
          dropZone.dispatchEvent(new CustomEvent("os:drop", { detail: { type: "photo", data: photo } }));
        }
        ghost.remove();
      }
      OS.multitasking.clearDragPayload();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function addCapturedPhoto(gradient) {
    const photos = OS.get("photos").slice();
    photos.unshift({ id: "p" + Date.now(), gradient, time: Date.now(), favorite: false });
    OS.set("photos", photos);
  }

  OS.multitasking.registerApp({
    id: "photos",
    name: "Photos",
    icon: OS.icons.svg("photos"),
    color: "#ff9500",
    duoCapable: true,
    mount
  });

  window.OS.apps.photos.addCapturedPhoto = addCapturedPhoto;
})();
