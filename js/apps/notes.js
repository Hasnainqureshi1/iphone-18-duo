/* ============================================================
   apps/notes.js — Notes (list + editor)
   ============================================================ */
(function () {
  "use strict";

  let selectedId = null;

  function ensureSeed() {
    if (OS.get("notes").length === 0) {
      OS.set("notes", [
        { id: "note1", title: "Duo launch checklist", body: "Duo launch checklist\n- Finalize hinge animation\n- QA cross-screen drag\n- Polish Dynamic Island states", time: Date.now() - 3600000 }
      ]);
    }
    if (!selectedId) selectedId = OS.get("notes")[0].id;
  }

  function mount(container, opts) {
    ensureSeed();
    if (opts.spanned) {
      renderList(container, opts.side, true);
      renderEditor(opts.otherContainer, true);
    } else {
      renderCompact(container, opts.side);
    }
  }

  function renderList(container, side, spanned) {
    const notes = OS.get("notes");
    const el = document.createElement("div");
    el.className = "notes-app";
    el.innerHTML = `<div class="notes-header"><h1>Notes</h1><button class="notes-add" id="notes-add">＋</button></div>
      <div class="notes-list"></div>`;
    container.appendChild(el);
    const list = el.querySelector(".notes-list");
    notes.slice().sort((a, b) => b.time - a.time).forEach((n) => {
      const row = document.createElement("button");
      row.className = "note-row" + (spanned && n.id === selectedId ? " selected" : "");
      const firstLine = (n.body.split("\n")[0] || "New Note");
      const rest = n.body.split("\n").slice(1).join(" ");
      row.innerHTML = `<b>${firstLine}</b><small>${new Date(n.time).toLocaleDateString()} ${rest.slice(0, 40)}</small>`;
      row.addEventListener("click", () => {
        selectedId = n.id;
        if (spanned) {
          list.querySelectorAll(".note-row").forEach((r) => r.classList.remove("selected"));
          row.classList.add("selected");
          OS.multitasking.renderScreen(side === "left" ? "right" : "left");
        } else {
          renderEditorCompact(container, side);
        }
      });
      list.appendChild(row);
    });
    el.querySelector("#notes-add").addEventListener("click", () => {
      const notes2 = OS.get("notes").slice();
      const n = { id: "note" + Date.now(), title: "", body: "", time: Date.now() };
      notes2.push(n);
      OS.set("notes", notes2);
      selectedId = n.id;
      if (spanned) OS.multitasking.renderAll();
      else renderEditorCompact(container, side);
    });
  }

  function renderCompact(container, side) { renderList(container, side, false); }

  function renderEditorCompact(container, side) {
    container.innerHTML = "";
    const back = document.createElement("button");
    back.className = "settings-back";
    back.innerHTML = "‹ Notes";
    back.addEventListener("click", () => { container.innerHTML = ""; renderList(container, side, false); });
    container.appendChild(back);
    const wrap = document.createElement("div");
    container.appendChild(wrap);
    renderEditorInto(wrap, side);
  }

  function renderEditor(container) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    container.appendChild(wrap);
    renderEditorInto(wrap, "right");
  }

  function renderEditorInto(wrap, side) {
    const notes = OS.get("notes");
    const n = notes.find((x) => x.id === selectedId);
    if (!n) { wrap.innerHTML = `<div class="photos-empty">Select a note</div>`; return; }
    wrap.className = "note-editor";
    wrap.innerHTML = `
      <textarea class="note-textarea" readonly>${n.body}</textarea>
      <div class="note-editor-actions"><button class="danger" id="note-delete">${OS.icons.inline("trash")} Delete Note</button></div>`;
    const ta = wrap.querySelector(".note-textarea");
    ta.addEventListener("click", () => {
      OS.keyboard.open({
        getValue: () => ta.value,
        setValue: (v) => {
          ta.value = v;
          n.body = v;
          n.time = Date.now();
          OS.set("notes", OS.get("notes").slice());
        },
        onEnter: () => { ta.value += "\n"; n.body = ta.value; OS.set("notes", OS.get("notes").slice()); }
      }, side);
    });
    wrap.querySelector("#note-delete").addEventListener("click", () => {
      OS.modals.open({
        title: "Delete Note?", icon: OS.icons.glyph("trash"),
        buttons: [{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "danger", onClick: () => {
          const remaining = OS.get("notes").filter((x) => x.id !== n.id);
          OS.set("notes", remaining);
          selectedId = remaining[0] ? remaining[0].id : null;
          OS.multitasking.renderAll();
        } }]
      });
    });
  }

  OS.multitasking.registerApp({
    id: "notes",
    name: "Notes",
    icon: OS.icons.svg("notes"),
    color: "#ffcc00",
    duoCapable: true,
    mount
  });
})();
