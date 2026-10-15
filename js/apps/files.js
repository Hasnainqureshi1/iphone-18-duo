/* ============================================================
   apps/files.js — fictional Files browser (drag source demo)
   ============================================================ */
(function () {
  "use strict";

  const FS = {
    "On My Duo": [
      { id: "f1", name: "Duo Keynote.pdf", kind: "pdf", size: "4.2 MB" },
      { id: "f2", name: "Hinge Spec.docx", kind: "doc", size: "812 KB" },
      { id: "f3", name: "Launch Budget.xlsx", kind: "sheet", size: "128 KB" }
    ],
    "Design Assets": [
      { id: "f4", name: "Icon Grid.sketch", kind: "design", size: "9.8 MB" },
      { id: "f5", name: "Wallpapers.zip", kind: "zip", size: "22.1 MB" }
    ]
  };
  const ICONS = { pdf: "docPdf", doc: "docPdf", sheet: "docPdf", design: "palette", zip: "zip" };
  const ICON_COLORS = { pdf: "#ff3b30", doc: "#0a84ff", sheet: "#34c759", design: "#ff9500", zip: "#8e8e93" };

  let currentFolder = "On My Duo";
  let selectedFile = null;

  function mount(container, opts) {
    if (opts.spanned) {
      renderBrowser(container, opts.side, true);
      renderPreview(opts.otherContainer);
    } else {
      renderCompact(container, opts.side);
    }
  }

  function renderBrowser(container, side, spanned) {
    const el = document.createElement("div");
    el.className = "files-app";
    el.innerHTML = `
      <div class="files-header"><h1>Files</h1></div>
      <div class="files-folders">
        ${Object.keys(FS).map((f) => `<button class="files-folder-btn ${f === currentFolder ? "active" : ""}" data-folder="${f}">${OS.icons.inline("folder")} ${f}</button>`).join("")}
      </div>
      <div class="files-list"></div>`;
    container.appendChild(el);
    el.querySelectorAll("[data-folder]").forEach((b) => b.addEventListener("click", () => {
      currentFolder = b.dataset.folder;
      container.innerHTML = "";
      renderBrowser(container, side, spanned);
    }));
    const list = el.querySelector(".files-list");
    FS[currentFolder].forEach((f) => {
      const row = document.createElement("div");
      row.className = "files-row" + (spanned && selectedFile === f.id ? " selected" : "");
      row.innerHTML = `<span class="files-icon" style="background:${ICON_COLORS[f.kind]}">${OS.icons.glyph(ICONS[f.kind])}</span><span class="files-name">${f.name}</span><span class="files-size">${f.size}</span>`;
      row.addEventListener("click", () => {
        selectedFile = f.id;
        if (spanned) {
          list.querySelectorAll(".files-row").forEach((r) => r.classList.remove("selected"));
          row.classList.add("selected");
          OS.multitasking.renderScreen(side === "left" ? "right" : "left");
        }
      });
      if (OS.get("crossScreenDrag")) {
        row.addEventListener("pointerdown", (e) => startDrag(e, f, row));
      }
      list.appendChild(row);
    });
  }

  function renderCompact(container, side) { renderBrowser(container, side, false); }

  function renderPreview(container) {
    container.innerHTML = "";
    const f = Object.values(FS).flat().find((x) => x.id === selectedFile);
    const wrap = document.createElement("div");
    wrap.className = "files-preview";
    if (!f) {
      wrap.innerHTML = `<div class="photos-empty">Select a file</div>`;
    } else {
      wrap.innerHTML = `<div class="files-preview-icon" style="background:${ICON_COLORS[f.kind]}">${OS.icons.glyph(ICONS[f.kind])}</div>
        <div class="files-preview-name">${f.name}</div>
        <div class="files-preview-size">${f.size}</div>
        <div class="files-preview-hint">Drag this file across the hinge to attach it elsewhere.</div>`;
    }
    container.appendChild(wrap);
  }

  function startDrag(downEvent, file, rowEl) {
    let ghost = null;
    const onMove = (e) => {
      if (!ghost) {
        ghost = document.createElement("div");
        ghost.className = "drag-ghost file-ghost";
        ghost.style.background = ICON_COLORS[file.kind];
        ghost.innerHTML = OS.icons.glyph(ICONS[file.kind]);
        document.body.appendChild(ghost);
      }
      ghost.style.left = e.clientX + "px";
      ghost.style.top = e.clientY + "px";
      document.querySelectorAll(".drop-hover").forEach((n) => n.classList.remove("drop-hover"));
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const dz = target && target.closest("[data-drop-zone]");
      if (dz) dz.classList.add("drop-hover");
    };
    const onUp = (e) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (ghost) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const dz = target && target.closest("[data-drop-zone]");
        if (dz) { dz.classList.remove("drop-hover"); dz.dispatchEvent(new CustomEvent("os:drop", { detail: { type: "file", data: file } })); }
        ghost.remove();
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  OS.multitasking.registerApp({
    id: "files",
    name: "Files",
    icon: OS.icons.svg("files"),
    color: "#0a84ff",
    duoCapable: true,
    mount
  });
})();
