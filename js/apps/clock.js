/* ============================================================
   apps/clock.js — World Clock / Alarm / Stopwatch / Timer
   ============================================================ */
(function () {
  "use strict";

  let activeTab = "timer";
  let containers = [];

  let swInterval = null;
  let swStart = 0;

  const WORLD_CLOCKS = [
    { city: "San Francisco", offset: -7 },
    { city: "London", offset: 1 },
    { city: "Tokyo", offset: 9 },
    { city: "Sydney", offset: 11 }
  ];
  const ALARMS = [
    { time: "7:00 AM", label: "Wake Up", on: true },
    { time: "8:30 AM", label: "Studio Standup", on: false }
  ];

  function mount(container, opts) {
    containers.push(container);
    render(container);
  }
  function unmount() { containers = []; }

  function render(container) {
    container.innerHTML = "";
    const el = document.createElement("div");
    el.className = "clock-app";
    el.innerHTML = `
      <div class="clock-tabs">
        ${["world", "alarm", "stopwatch", "timer"].map((t) => `<button class="clock-tab ${activeTab === t ? "active" : ""}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
      </div>
      <div class="clock-body"></div>`;
    container.appendChild(el);
    el.querySelectorAll(".clock-tab").forEach((b) => b.addEventListener("click", () => { activeTab = b.dataset.tab; render(container); }));
    renderBody(el.querySelector(".clock-body"), container);
  }

  function renderBody(body, container) {
    if (activeTab === "world") renderWorld(body);
    else if (activeTab === "alarm") renderAlarm(body);
    else if (activeTab === "stopwatch") renderStopwatch(body, container);
    else renderTimer(body, container);
  }

  function renderWorld(body) {
    body.innerHTML = WORLD_CLOCKS.map((c) => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const local = new Date(utc + c.offset * 3600000);
      const h = local.getHours(), m = local.getMinutes();
      return `<div class="world-clock-row"><span>${c.city}</span><b>${h % 12 || 12}:${m < 10 ? "0" + m : m} ${h >= 12 ? "PM" : "AM"}</b></div>`;
    }).join("");
  }

  function renderAlarm(body) {
    body.innerHTML = ALARMS.map((a, i) => `
      <div class="alarm-row">
        <div><div class="alarm-time">${a.time}</div><div class="alarm-label">${a.label}</div></div>
        <button class="ios-switch ${a.on ? "on" : ""}" data-alarm="${i}"><span class="ios-switch-knob"></span></button>
      </div>`).join("");
    body.querySelectorAll("[data-alarm]").forEach((btn) => btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.alarm, 10);
      ALARMS[i].on = !ALARMS[i].on;
      renderAlarm(body);
    }));
  }

  function fmtMs(ms) {
    const totalMs = Math.max(0, ms);
    const m = Math.floor(totalMs / 60000);
    const s = Math.floor((totalMs % 60000) / 1000);
    const cs = Math.floor((totalMs % 1000) / 10);
    return `${m}:${s < 10 ? "0" + s : s}.${cs < 10 ? "0" + cs : cs}`;
  }

  function renderStopwatch(body, container) {
    const running = OS.get("stopwatchRunning");
    body.innerHTML = `
      <div class="stopwatch-display">${fmtMs(OS.get("stopwatchMs"))}</div>
      <div class="stopwatch-actions">
        <button class="clock-round-btn" id="sw-reset">Reset</button>
        <button class="clock-round-btn primary" id="sw-toggle">${running ? "Stop" : "Start"}</button>
      </div>`;
    body.querySelector("#sw-toggle").addEventListener("click", () => {
      if (OS.get("stopwatchRunning")) {
        OS.set("stopwatchRunning", false);
        clearInterval(swInterval);
      } else {
        OS.set("stopwatchRunning", true);
        swStart = performance.now() - OS.get("stopwatchMs");
        swInterval = setInterval(() => {
          OS.set("stopwatchMs", performance.now() - swStart);
          if (activeTab === "stopwatch") renderStopwatch(body, container);
        }, 47);
      }
    });
    body.querySelector("#sw-reset").addEventListener("click", () => {
      OS.set("stopwatchMs", 0);
      OS.set("stopwatchRunning", false);
      clearInterval(swInterval);
      renderStopwatch(body, container);
    });
  }

  let timerInterval = null;
  function renderTimer(body, container) {
    const running = OS.get("timerRunning");
    const remaining = OS.get("timerRemaining");
    const mm = Math.floor(remaining / 60000);
    const ss = Math.floor((remaining % 60000) / 1000);
    body.innerHTML = `
      <div class="timer-display">${running ? `${mm}:${ss < 10 ? "0" + ss : ss}` : "Set a Timer"}</div>
      ${!running ? `<div class="timer-presets">
        <button class="clock-round-btn" data-min="1">1 min</button>
        <button class="clock-round-btn" data-min="5">5 min</button>
        <button class="clock-round-btn" data-min="10">10 min</button>
      </div>` : `<div class="stopwatch-actions"><button class="clock-round-btn" id="timer-cancel">Cancel</button></div>`}`;

    if (!running) {
      body.querySelectorAll("[data-min]").forEach((b) => b.addEventListener("click", () => startTimer(parseInt(b.dataset.min, 10) * 60000, body, container)));
    } else {
      body.querySelector("#timer-cancel").addEventListener("click", () => stopTimer(body, container));
    }
  }

  function startTimer(ms, body, container) {
    OS.set("timerDuration", ms);
    OS.set("timerRemaining", ms);
    OS.set("timerRunning", true);
    clearInterval(timerInterval);
    const end = performance.now() + ms;
    timerInterval = setInterval(() => {
      const rem = Math.max(0, end - performance.now());
      OS.set("timerRemaining", rem);
      if (activeTab === "timer") renderTimer(body, container);
      if (rem <= 0) {
        clearInterval(timerInterval);
        OS.set("timerRunning", false);
        OS.notifications.push({ app: "Clock", icon: "⏱", title: "Timer Done", body: "Your timer has finished.", color: "#ff9500" });
        if (activeTab === "timer") renderTimer(body, container);
      }
    }, 200);
  }
  function stopTimer(body, container) {
    clearInterval(timerInterval);
    OS.set("timerRunning", false);
    OS.set("timerRemaining", 0);
    renderTimer(body, container);
  }

  function tick() {
    containers = containers.filter((c) => document.body.contains(c));
  }

  OS.multitasking.registerApp({
    id: "clock",
    name: "Clock",
    icon: OS.icons.svg("clock"),
    color: "#000000",
    duoCapable: false,
    mount,
    unmount
  });
  window.OS.apps.clock.tick = tick;
})();
