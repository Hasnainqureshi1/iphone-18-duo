/* ============================================================
   apps/safari.js — real browser: any URL loads in a live iframe.
   Sites that send X-Frame-Options/CSP frame-ancestors (Google,
   GitHub, DuckDuckGo, most social apps) can't be embedded by any
   client-side trick — that's the browser enforcing the site's own
   security policy. We navigate a real iframe for everything, and
   always offer "Open in new tab" as a one-click real fallback.
   ============================================================ */
(function () {
  "use strict";

  const FAVORITES = [
    { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Special:Random", color: "#000000", icon: "newspaper" },
    { name: "Bing", url: "https://www.bing.com", color: "#008373", icon: "search" },
    { name: "Hacker News", url: "https://news.ycombinator.com", color: "#ff6600", icon: "newspaper" },
    { name: "MDN Docs", url: "https://developer.mozilla.org", color: "#0a84ff", icon: "docPdf" },
    { name: "Example", url: "https://example.com", color: "#8e8e93", icon: "globe" }
  ];

  let tabs = [{ id: "t1", entries: [{ type: "start" }], index: 0 }];
  let activeTab = "t1";
  let addressDraft = "";
  let editingAddress = false;

  function tab() { return tabs.find((t) => t.id === activeTab); }
  function entry() { const t = tab(); return t.entries[t.index]; }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
  }

  function resolveInput(raw) {
    const trimmed = (raw || "").trim();
    if (!trimmed) return null;
    const looksLikeUrl = !trimmed.includes(" ") && /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?([/?#]\S*)?$/i.test(trimmed);
    if (looksLikeUrl) return /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
    return "https://www.bing.com/search?q=" + encodeURIComponent(trimmed);
  }

  function pushEntry(newEntry) {
    const t = tab();
    t.entries = t.entries.slice(0, t.index + 1);
    t.entries.push(newEntry);
    t.index = t.entries.length - 1;
  }

  function navigateTo(raw) {
    const url = resolveInput(raw);
    if (!url) return;
    pushEntry({ type: "url", url });
  }

  function goStart() { pushEntry({ type: "start" }); }
  function goBack() { const t = tab(); if (t.index > 0) t.index--; }
  function goForward() { const t = tab(); if (t.index < t.entries.length - 1) t.index++; }

  function mount(container, opts) {
    editingAddress = false;
    if (opts.spanned) {
      renderBrowser(container, opts.side, true);
      renderSidePanel(opts.otherContainer, "right");
    } else {
      renderCompactBrowser(container, opts.side);
    }
  }

  function renderBrowser(container, side, spanned) {
    const el = document.createElement("div");
    el.className = "safari-app";
    const cur = entry();
    const addressValue = editingAddress ? addressDraft : (cur.type === "url" ? cur.url : "");
    el.innerHTML = `
      <div class="safari-toolbar">
        <button class="safari-nav-btn" data-act="back" ${tab().index === 0 ? "disabled" : ""} aria-label="Back">${OS.icons.glyph("chevronLeft")}</button>
        <button class="safari-nav-btn" data-act="fwd" ${tab().index === tab().entries.length - 1 ? "disabled" : ""} aria-label="Forward">${OS.icons.glyph("chevronRight")}</button>
        <div class="safari-address" data-act="edit-address">
          ${cur.type === "url" ? OS.icons.inline("lock") : ""}
          <input type="text" class="safari-address-input" id="safari-address-input" placeholder="Search or enter website name" value="${addressValue.replace(/"/g, "&quot;")}" readonly>
        </div>
        ${cur.type === "url" ? `<button class="safari-nav-btn" data-act="reload" aria-label="Reload">${OS.icons.glyph("reload")}</button>` : ""}
        ${cur.type === "url" ? `<button class="safari-nav-btn" data-act="newtab" aria-label="Open in new browser tab">${OS.icons.glyph("externalLink")}</button>` : ""}
      </div>
      <div class="safari-loadbar" id="safari-loadbar"></div>
      <div class="safari-content">${cur.type === "start" ? renderStart() : renderFrame(cur.url)}</div>`;
    container.appendChild(el);

    el.querySelector('[data-act="back"]').addEventListener("click", () => { goBack(); rerender(container, side, spanned); });
    el.querySelector('[data-act="fwd"]').addEventListener("click", () => { goForward(); rerender(container, side, spanned); });
    const reloadBtn = el.querySelector('[data-act="reload"]');
    if (reloadBtn) reloadBtn.addEventListener("click", () => {
      const frame = el.querySelector(".safari-iframe");
      if (frame) { showLoading(el); frame.src = frame.src; }
    });
    const newTabBtn = el.querySelector('[data-act="newtab"]');
    if (newTabBtn) newTabBtn.addEventListener("click", () => window.open(cur.url, "_blank", "noopener,noreferrer"));

    const addrInput = el.querySelector("#safari-address-input");
    const addrWrap = el.querySelector(".safari-address");
    addrWrap.addEventListener("click", () => {
      editingAddress = true;
      addressDraft = cur.type === "url" ? cur.url : "";
      addrInput.value = addressDraft;
      addrInput.focus();
      addrInput.select();
      OS.keyboard.open({
        getValue: () => addressDraft,
        setValue: (v) => { addressDraft = v; addrInput.value = v; },
        onEnter: () => {
          editingAddress = false;
          OS.keyboard.close();
          navigateTo(addressDraft);
          rerender(container, side, spanned);
        }
      }, side);
    });

    const frame = el.querySelector(".safari-iframe");
    if (frame) {
      showLoading(el);
      frame.addEventListener("load", () => hideLoading(el), { once: true });
    }

    el.querySelectorAll("[data-fav]").forEach((b) => b.addEventListener("click", () => {
      pushEntry({ type: "url", url: b.dataset.fav });
      rerender(container, side, spanned);
    }));
  }

  function renderStart() {
    return `<div class="safari-start">
        <h2>Favorites</h2>
        <div class="safari-favgrid">
          ${FAVORITES.map((f) => `<button class="safari-fav" data-fav="${f.url}">
            <span class="safari-fav-icon" style="background:${f.color}">${OS.icons.glyph(f.icon)}</span>
            <span>${f.name}</span>
          </button>`).join("")}
        </div>
        <p class="safari-start-hint">Type any address in the bar above to browse the real web. Sites that block embedding (Google, GitHub, most social apps) will offer an "Open in new tab" button instead.</p>
      </div>`;
  }

  function renderFrame(url) {
    return `<iframe class="safari-iframe" src="${url.replace(/"/g, "&quot;")}" title="Web content" referrerpolicy="no-referrer-when-downgrade" allow="clipboard-write; encrypted-media; picture-in-picture"></iframe>`;
  }

  function showLoading(el) { const bar = el.querySelector("#safari-loadbar"); if (bar) bar.classList.add("active"); }
  function hideLoading(el) { const bar = el.querySelector("#safari-loadbar"); if (bar) bar.classList.remove("active"); }

  function rerender(container, side, spanned) {
    container.innerHTML = "";
    if (spanned) renderBrowser(container, side, true);
    else renderCompactBrowser(container, side);
  }

  function renderSidePanel(container, side) {
    const el = document.createElement("div");
    el.className = "safari-side-panel";
    el.innerHTML = `
      <div class="safari-panel-tabs">
        <div class="safari-panel-title">Tabs</div>
        ${tabs.map((t) => {
          const e = t.entries[t.index];
          const label = e.type === "start" ? "Start Page" : hostOf(e.url);
          return `<div class="safari-tab-row ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">
            <span>${label}</span>
            <button class="safari-tab-close" data-close="${t.id}" aria-label="Close tab">${OS.icons.inline("close")}</button>
          </div>`;
        }).join("")}
        <button class="safari-new-tab" id="safari-new-tab">+ New Tab</button>
      </div>
      <div class="safari-panel-bookmarks">
        <div class="safari-panel-title">Favorites</div>
        ${FAVORITES.map((f) => `<button class="safari-bookmark-row" data-goto="${f.url}">${OS.icons.inline("bookmark")} ${f.name}</button>`).join("")}
      </div>`;
    container.appendChild(el);

    el.querySelectorAll("[data-tab]").forEach((row) => row.addEventListener("click", (e) => {
      if (e.target.closest(".safari-tab-close")) return;
      activeTab = row.dataset.tab;
      OS.multitasking.renderScreen("left");
    }));
    el.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (tabs.length === 1) return;
      tabs = tabs.filter((t) => t.id !== btn.dataset.close);
      if (activeTab === btn.dataset.close) activeTab = tabs[0].id;
      OS.multitasking.renderAll();
    }));
    el.querySelector("#safari-new-tab").addEventListener("click", () => {
      const id = "t" + (tabs.length + 1) + Date.now() % 1000;
      tabs.push({ id, entries: [{ type: "start" }], index: 0 });
      activeTab = id;
      OS.multitasking.renderAll();
    });
    el.querySelectorAll("[data-goto]").forEach((btn) => btn.addEventListener("click", () => {
      pushEntry({ type: "url", url: btn.dataset.goto });
      OS.multitasking.renderScreen("left");
    }));
  }

  function renderCompactBrowser(container, side) {
    renderBrowser(container, side, false);
    const bar = document.createElement("div");
    bar.className = "safari-compact-bar";
    bar.innerHTML = `<button id="safari-show-tabs">Tabs (${tabs.length}) &amp; Favorites ▾</button>`;
    container.appendChild(bar);
    bar.querySelector("#safari-show-tabs").addEventListener("click", () => {
      container.innerHTML = "";
      const back = document.createElement("button");
      back.className = "settings-back";
      back.innerHTML = "‹ Safari";
      back.addEventListener("click", () => { container.innerHTML = ""; renderCompactBrowser(container, side); });
      container.appendChild(back);
      renderSidePanel(container, side);
    });
  }

  OS.multitasking.registerApp({
    id: "safari",
    name: "Safari",
    icon: OS.icons.svg("safari"),
    color: "#0a84ff",
    duoCapable: true,
    mount
  });
})();
