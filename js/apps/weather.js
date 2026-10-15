/* ============================================================
   apps/weather.js — mock weather interface
   ============================================================ */
(function () {
  "use strict";

  const HOURLY = [68, 67, 66, 65, 64, 66, 69, 72, 74, 73, 70];
  const WEEKLY = [
    { d: "Today", hi: 74, lo: 62, ic: "cloudSun" },
    { d: "Tue", hi: 71, lo: 60, ic: "cloudSun" },
    { d: "Wed", hi: 69, lo: 58, ic: "rain" },
    { d: "Thu", hi: 73, lo: 61, ic: "sun" },
    { d: "Fri", hi: 75, lo: 63, ic: "sun" },
    { d: "Sat", hi: 70, lo: 59, ic: "cloudSun" },
    { d: "Sun", hi: 68, lo: 57, ic: "rain" }
  ];

  function mount(container) {
    const el = document.createElement("div");
    el.className = "weather-app";
    el.innerHTML = `
      <div class="weather-bg"><div class="weather-cloud c1"></div><div class="weather-cloud c2"></div></div>
      <div class="weather-current">
        <div class="weather-city">Cupertino</div>
        <div class="weather-temp">89°</div>
        <div class="weather-desc">Sunny</div>
        <div class="weather-hilo">H:91° L:64°</div>
      </div>
      <div class="weather-hourly">
        ${HOURLY.map((t, i) => `<div class="weather-hour"><span>${i === 0 ? "Now" : (i % 12 || 12) + (i < 12 ? "AM" : "PM")}</span><span class="weather-hour-ic">${OS.icons.glyph(i % 3 === 0 ? "cloudSun" : "cloudSun")}</span><b>${t}°</b></div>`).join("")}
      </div>
      <div class="weather-weekly">
        ${WEEKLY.map((d) => `<div class="weather-day-row"><span>${d.d}</span><span class="weather-day-ic">${OS.icons.glyph(d.ic)}</span><span class="weather-bar"><i style="width:${((d.hi - 55) / 25) * 100}%"></i></span><span>${d.hi}°</span><span class="weather-lo">${d.lo}°</span></div>`).join("")}
      </div>`;
    container.appendChild(el);
  }

  OS.multitasking.registerApp({
    id: "weather",
    name: "Weather",
    icon: OS.icons.svg("weather"),
    color: "#5ac8fa",
    duoCapable: false,
    mount
  });
})();
