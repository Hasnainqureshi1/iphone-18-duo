/* ============================================================
   apps/messages.js — Messages (thread list + conversation)
   ============================================================ */
(function () {
  "use strict";

  const SEED = {
    riley: { name: "Riley Chen", color: "#34c759", messages: [
      { from: "them", text: "See you at 6? Bringing the dual-screen prototype.", time: Date.now() - 1800000 },
      { from: "me", text: "Yep, I'll have the Duo charged and ready.", time: Date.now() - 1700000 }
    ] },
    studio: { name: "Studio B Team", color: "#0a84ff", messages: [
      { from: "them", text: "Review moved to Studio B, 2nd floor.", time: Date.now() - 5400000 }
    ] },
    mom: { name: "Mom", color: "#ff2d55", messages: [
      { from: "them", text: "Don't forget to call grandma this weekend 💛", time: Date.now() - 86400000 }
    ] }
  };

  let selectedConv = null;
  let composeDraft = "";

  function ensureSeed() {
    if (Object.keys(OS.get("messages")).length === 0) OS.set("messages", JSON.parse(JSON.stringify(SEED)));
    if (!selectedConv) selectedConv = Object.keys(OS.get("messages"))[0];
  }

  function mount(container, opts) {
    ensureSeed();
    if (opts.spanned) {
      renderList(container, opts.side, true);
      renderThread(opts.otherContainer, true);
    } else {
      renderCompact(container, opts.side);
    }
  }

  function renderList(container, side, spanned) {
    const convs = OS.get("messages");
    const el = document.createElement("div");
    el.className = "messages-app";
    el.innerHTML = `<div class="messages-header"><h1>Messages</h1><button class="messages-compose">${OS.icons.glyph("compose")}</button></div>
      <div class="messages-list"></div>`;
    container.appendChild(el);
    const list = el.querySelector(".messages-list");
    Object.keys(convs).forEach((id) => {
      const c = convs[id];
      const last = c.messages[c.messages.length - 1] || { text: "" };
      const row = document.createElement("button");
      row.className = "message-row" + (spanned && id === selectedConv ? " selected" : "");
      row.innerHTML = `<span class="message-avatar" style="background:${c.color}">${c.name[0]}</span>
        <span class="message-row-text"><b>${c.name}</b><small>${last.text.slice(0, 40)}</small></span>
        <span class="message-time">${OS.notifications.relTime(last.time || Date.now())}</span>`;
      row.addEventListener("click", () => {
        selectedConv = id;
        if (spanned) {
          list.querySelectorAll(".message-row").forEach((r) => r.classList.remove("selected"));
          row.classList.add("selected");
          OS.multitasking.renderScreen(side === "left" ? "right" : "left");
        } else {
          renderThreadCompact(container, side);
        }
      });
      list.appendChild(row);
    });
  }

  function renderCompact(container, side) {
    renderList(container, side, false);
  }

  function renderThreadCompact(container, side) {
    container.innerHTML = "";
    const back = document.createElement("button");
    back.className = "settings-back";
    back.innerHTML = "‹ Messages";
    back.addEventListener("click", () => { container.innerHTML = ""; renderList(container, side, false); });
    container.appendChild(back);
    const wrap = document.createElement("div");
    wrap.className = "message-thread-wrap";
    container.appendChild(wrap);
    renderThreadInto(wrap, side);
  }

  function renderThread(container, spanned) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "message-thread-wrap";
    container.appendChild(wrap);
    renderThreadInto(wrap, "right");
  }

  function renderThreadInto(wrap, side) {
    const convs = OS.get("messages");
    const c = convs[selectedConv];
    if (!c) { wrap.innerHTML = `<div class="photos-empty">Select a conversation</div>`; return; }
    wrap.innerHTML = `
      <div class="thread-header"><span class="message-avatar" style="background:${c.color}">${c.name[0]}</span><b>${c.name}</b></div>
      <div class="thread-messages" id="thread-messages-${side}"></div>
      <div class="thread-compose" data-drop-zone="messages">
        <input type="text" class="thread-input" placeholder="Text Message" readonly value="${composeDraft}">
        <button class="thread-emoji" aria-label="Emoji">${OS.icons.glyph("smiley")}</button>
        <button class="thread-send" aria-label="Send">${OS.icons.glyph("arrowUp")}</button>
      </div>
      <div class="thread-drop-hint">Drop a photo here to attach</div>`;

    const msgList = wrap.querySelector(".thread-messages");
    c.messages.forEach((m) => {
      const bubble = document.createElement("div");
      bubble.className = "msg-bubble " + m.from;
      bubble.innerHTML = m.text;
      msgList.appendChild(bubble);
    });
    msgList.scrollTop = msgList.scrollHeight;

    const input = wrap.querySelector(".thread-input");
    input.addEventListener("click", () => {
      OS.keyboard.open({
        getValue: () => composeDraft,
        setValue: (v) => { composeDraft = v; input.value = v; },
        onEnter: () => send(wrap, side)
      }, side);
    });
    wrap.querySelector(".thread-send").addEventListener("click", () => send(wrap, side));

    const dz = wrap.querySelector(".thread-compose");
    dz.addEventListener("os:drop", (e) => {
      if (e.detail.type === "photo") {
        composeDraft += (composeDraft ? " " : "") + "[photo attached]";
        input.value = composeDraft;
        OS.notifications.push({ app: "Messages", icon: OS.icons.glyph("cameraGlyph"), title: "Photo Attached", body: "Dragged from Photos across the hinge.", color: "#34c759" });
      } else if (e.detail.type === "file") {
        composeDraft += (composeDraft ? " " : "") + `[${e.detail.data.name}]`;
        input.value = composeDraft;
        OS.notifications.push({ app: "Messages", icon: OS.icons.glyph("paperclip"), title: "File Attached", body: `${e.detail.data.name} dragged from Files.`, color: "#34c759" });
      }
    });
  }

  function send(wrap, side) {
    if (!composeDraft.trim()) return;
    const convs = OS.get("messages");
    convs[selectedConv].messages.push({ from: "me", text: composeDraft, time: Date.now() });
    OS.set("messages", Object.assign({}, convs));
    composeDraft = "";
    renderThreadInto(wrap, side);
    OS.keyboard.close();

    setTimeout(() => {
      const typing = document.createElement("div");
      typing.className = "msg-bubble them typing";
      typing.innerHTML = `<span></span><span></span><span></span>`;
      const list = wrap.querySelector(".thread-messages");
      if (list) { list.appendChild(typing); list.scrollTop = list.scrollHeight; }
      setTimeout(() => {
        const convs2 = OS.get("messages");
        const replies = ["Sounds good!", "Got it 👍", "Haha true.", "On my way.", "Nice, thanks!"];
        convs2[selectedConv].messages.push({ from: "them", text: replies[Math.floor(Math.random() * replies.length)], time: Date.now() });
        OS.set("messages", Object.assign({}, convs2));
        renderThreadInto(wrap, side);
      }, 1400);
    }, 500);
  }

  OS.multitasking.registerApp({
    id: "messages",
    name: "Messages",
    icon: OS.icons.svg("messages"),
    color: "#34c759",
    duoCapable: true,
    mount
  });
})();
