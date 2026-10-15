/* ============================================================
   apps/music.js — mock playback UI
   ============================================================ */
(function () {
  "use strict";

  const TRACKS = [
    { title: "Nocturne Drift", artist: "Aurora Field", len: 214 },
    { title: "Hinge Line", artist: "Parallel Sky", len: 189 },
    { title: "Two Panes", artist: "Duo Theory", len: 231 }
  ];

  let progressInterval = null;
  let containersOpen = [];

  function mount(container) {
    containersOpen.push(container);
    render(container);
  }
  function unmount() { containersOpen = []; }

  function render(container) {
    const t = TRACKS[OS.get("musicTrack")];
    const playing = OS.get("musicPlaying");
    const progress = OS.get("musicProgress");
    const pct = Math.min(100, (progress / t.len) * 100);
    const el = document.createElement("div");
    el.className = "music-app";
    el.innerHTML = `
      <div class="music-art ${playing ? "spin" : ""}"></div>
      <div class="music-title">${t.title}</div>
      <div class="music-artist">${t.artist}</div>
      <div class="music-progress"><div class="music-progress-fill" style="width:${pct}%"></div></div>
      <div class="music-times"><span>${fmt(progress)}</span><span>${fmt(t.len)}</span></div>
      <div class="music-controls">
        <button id="music-prev" aria-label="Previous">${OS.icons.glyph("skipPrev")}</button>
        <button id="music-toggle" class="music-play-btn" aria-label="Play/Pause">${OS.icons.glyph(playing ? "pause" : "play")}</button>
        <button id="music-next" aria-label="Next">${OS.icons.glyph("skipNext")}</button>
      </div>
      <div class="music-volume"><span class="music-vol-ic">${OS.icons.glyph("volumeLow")}</span><input type="range" min="0" max="1" step="0.01" value="${OS.get("volume")}" id="music-volume"><span class="music-vol-ic">${OS.icons.glyph("volumeHigh")}</span></div>`;
    container.appendChild(el);
    el.querySelector("#music-toggle").addEventListener("click", toggle);
    el.querySelector("#music-next").addEventListener("click", next);
    el.querySelector("#music-prev").addEventListener("click", prev);
    el.querySelector("#music-volume").addEventListener("input", (e) => OS.set("volume", parseFloat(e.target.value)));
  }

  function fmt(s) { const m = Math.floor(s / 60), ss = Math.floor(s % 60); return `${m}:${ss < 10 ? "0" + ss : ss}`; }

  function refreshAll() {
    containersOpen = containersOpen.filter((c) => document.body.contains(c));
    containersOpen.forEach((c) => { c.innerHTML = ""; render(c); });
  }

  function toggle() {
    const playing = !OS.get("musicPlaying");
    OS.set("musicPlaying", playing);
    if (playing) {
      progressInterval = setInterval(() => {
        const t = TRACKS[OS.get("musicTrack")];
        let p = OS.get("musicProgress") + 1;
        if (p >= t.len) { next(); return; }
        OS.set("musicProgress", p);
        refreshAll();
      }, 1000);
    } else {
      clearInterval(progressInterval);
    }
    refreshAll();
  }
  function next() {
    OS.set("musicTrack", (OS.get("musicTrack") + 1) % TRACKS.length);
    OS.set("musicProgress", 0);
    refreshAll();
  }
  function prev() {
    OS.set("musicTrack", (OS.get("musicTrack") - 1 + TRACKS.length) % TRACKS.length);
    OS.set("musicProgress", 0);
    refreshAll();
  }

  OS.multitasking.registerApp({
    id: "music",
    name: "Music",
    icon: OS.icons.svg("music"),
    color: "#fc3158",
    duoCapable: false,
    mount,
    unmount
  });
  window.OS.apps.music.toggle = toggle;
  window.OS.apps.music.next = next;
  window.OS.apps.music.prev = prev;
})();
