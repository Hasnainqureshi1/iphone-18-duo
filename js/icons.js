/* ============================================================
   icons.js — original iOS-style app icon glyphs (SVG).
   Each icon is a simple white glyph on a CSS-gradient rounded
   square (gradient defined in css/icons.css via .ios-icon-<id>).
   Original artwork, not traced from Apple assets.
   ============================================================ */
(function () {
  "use strict";

  const GLYPHS = {
    phone: `<path d="M6.6 3.5c.6-.2 1.2 0 1.5.6l1.3 2.4c.3.5.2 1.1-.2 1.5L8 9.2c.7 1.9 2.1 3.3 4 4l1.2-1.2c.4-.4 1-.5 1.5-.2l2.4 1.3c.6.3.8.9.6 1.5l-.6 1.7c-.2.6-.8 1-1.4 1-6 0-11-5-11-11 0-.6.4-1.2 1-1.4l1.7-.6z" fill="white"/>`,
    messages: `<path d="M12 4c-4.4 0-8 2.9-8 6.5 0 2 1.1 3.8 2.9 5-.1.9-.5 1.8-1.1 2.5-.2.2 0 .5.3.5 1.3-.1 2.6-.6 3.6-1.3.7.2 1.5.3 2.3.3 4.4 0 8-2.9 8-6.5S16.4 4 12 4z" fill="white"/>`,
    facetime: `<rect x="3" y="7" width="13" height="10" rx="3" fill="white"/><path d="M17.5 10.2l3.1-2c.5-.3 1.1.1 1.1.7v6.2c0 .6-.6 1-1.1.7l-3.1-2v-3.6z" fill="white"/>`,
    safari: `<circle cx="12" cy="12" r="9" fill="white" stroke="#c7c7cc" stroke-width="0.5"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" fill="#ff3b30"/><path d="M15.5 8.5L13 11l-2 2 4.5-2.5z" fill="#f2f2f7"/>`,
    mail: `<rect x="3" y="6" width="18" height="12" rx="2.5" fill="white"/><path d="M4 7.3l7.4 5.4c.4.3.9.3 1.3 0L20 7.3" stroke="#0a6cd8" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    photos: `<circle cx="9" cy="9" r="6" fill="#ffd60a"/><circle cx="15" cy="9" r="6" fill="#ff375f"/><circle cx="9" cy="15" r="6" fill="#30d158"/><circle cx="15" cy="15" r="6" fill="#0a84ff"/>`,
    camera: `<path d="M8.2 6.5l.9-1.5h5.8l.9 1.5H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h3.2z" fill="white"/><circle cx="12" cy="13" r="3.4" fill="#1c1c1e"/><circle cx="12" cy="13" r="2.1" fill="#4a4a4e"/>`,
    calculator: `<rect x="5" y="3" width="14" height="18" rx="2.5" fill="white"/><rect x="7" y="5.3" width="10" height="3.6" rx="1" fill="#111"/><circle cx="8.4" cy="12.2" r="1.15" fill="#111"/><circle cx="12" cy="12.2" r="1.15" fill="#111"/><circle cx="15.6" cy="12.2" r="1.15" fill="#ff9f0a"/><circle cx="8.4" cy="15.8" r="1.15" fill="#111"/><circle cx="12" cy="15.8" r="1.15" fill="#111"/><circle cx="15.6" cy="15.8" r="1.15" fill="#ff9f0a"/><circle cx="8.4" cy="19.2" r="1.15" fill="#111"/><circle cx="12" cy="19.2" r="1.15" fill="#111"/><circle cx="15.6" cy="19.2" r="1.15" fill="#ff9f0a"/>`,
    notes: `<rect x="4" y="3" width="16" height="18" rx="2.5" fill="white"/><line x1="7" y1="8" x2="17" y2="8" stroke="#ffb300" stroke-width="1.3"/><line x1="7" y1="12" x2="17" y2="12" stroke="#d9d9de" stroke-width="1.3"/><line x1="7" y1="16" x2="13" y2="16" stroke="#d9d9de" stroke-width="1.3"/>`,
    clock: `<circle cx="12" cy="12" r="9" fill="white"/><circle cx="12" cy="12" r="8.1" fill="none" stroke="#1c1c1e" stroke-width="0.6"/><line x1="12" y1="12" x2="12" y2="7" stroke="#1c1c1e" stroke-width="1.3" stroke-linecap="round"/><line x1="12" y1="12" x2="15.2" y2="13.4" stroke="#1c1c1e" stroke-width="1.3" stroke-linecap="round"/>`,
    weather: `<circle cx="9.5" cy="9.5" r="4.5" fill="#ffd60a"/><path d="M8 17a4 4 0 010-8 5 5 0 019.6 1.4A3.6 3.6 0 0117 17H8z" fill="white"/>`,
    music: `<circle cx="7.5" cy="17.5" r="2.6" fill="white"/><circle cx="16" cy="15.7" r="2.6" fill="white"/><path d="M10 17.5V6.8l8.6-1.8v9" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    files: `<path d="M3.5 7.2A1.7 1.7 0 015.2 5.5h4l1.7 2h8a1.7 1.7 0 011.7 1.7v8.1a1.7 1.7 0 01-1.7 1.7H5.2a1.7 1.7 0 01-1.7-1.7V7.2z" fill="white"/><path d="M3.5 9h17" stroke="#8fc3ff" stroke-width="1"/>`,
    settings: `<path d="M12 3.5l1.2 2 2.3.2 1.2 2 2.1 1-.3 2.3 1.5 1.8-1.5 1.8.3 2.3-2.1 1-1.2 2-2.3.2L12 20.5l-1.2-2-2.3-.2-1.2-2-2.1-1 .3-2.3L4 11l1.5-1.8-.3-2.3 2.1-1 1.2-2 2.3-.2L12 3.5z" fill="white"/><circle cx="12" cy="12" r="3.4" fill="#8e8e93"/>`,
    maps: `<path d="M4 6l6-2 4 2 6-2v14l-6 2-4-2-6 2V6z" fill="white"/><path d="M10 4v14M14 6v14" stroke="#c7c7cc" stroke-width="0.8"/><circle cx="13" cy="10" r="2.6" fill="#ff453a"/><path d="M13 15.5c-2-2.4-2.6-3.7-2.6-5A2.6 2.6 0 1115.6 10.5c0 1.3-.6 2.6-2.6 5z" fill="#ff453a"/>`,
    calendar: `<rect x="4" y="4" width="16" height="16" rx="3" fill="white"/><rect x="4" y="4" width="16" height="4.5" rx="3" fill="#ff3b30"/><text x="12" y="17.5" font-size="9" font-weight="700" text-anchor="middle" fill="#1c1c1e">${new Date().getDate()}</text>`,
    appstore: `<path d="M12 4l2 3.4h3.9L15.9 11 18 14.6h-3.9L12 18l-2.1-3.4H6l2.1-3.6L6 7.4h3.9L12 4z" fill="white"/>`,
    home: `<path d="M4 11.5L12 5l8 6.5" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V19a1 1 0 001 1h3v-5h4v5h3a1 1 0 001-1v-8.5" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  };

  function svg(name, extra) {
    if (name !== 'calendar' && window.DUO_ASSETS && DUO_ASSETS['icons/' + name + '.png']) {
      return `<img class="apple-app-icon" src="assets/icons/${name}.png" alt="" draggable="false">`;
    }
    if (name === 'calendar') return `<span class="ios-icon live-calendar"><small>${new Date().toLocaleDateString('en-US',{weekday:'short'})}</small><b>${new Date().getDate()}</b></span>`;
    const g = name === 'appstore' ? '<path d="M9 4l10 17M15 4L5 21M3 15h18" stroke="white" stroke-width="2.6" stroke-linecap="round"/>' : (GLYPHS[name] || GLYPHS.settings);
    return `<span class="ios-icon ios-icon-${name}${extra ? " " + extra : ""}"><svg viewBox="0 0 24 24" width="100%" height="100%">${g}</svg></span>`;
  }

  // Plain glyph paths (no gradient wrapper) — for use inside contexts that
  // already provide their own colored background: Control Center tiles,
  // Settings rows, notification badges, toolbars.
  const PATHS = {
    wifi: `<path d="M12 17.3a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8zM8.3 13.2a5.3 5.3 0 017.4 0l-1.5 1.6a3.1 3.1 0 00-4.4 0l-1.5-1.6zM5.3 10.1a9.6 9.6 0 0113.4 0l-1.5 1.6a7.4 7.4 0 00-10.4 0L5.3 10.1z" fill="currentColor"/>`,
    bluetooth: `<path d="M11 3l5 4-4 3.5L16 14l-5 4v-6l-3.2 2.8-1.1-1 4.2-3.8-4.2-3.8 1.1-1L11 9V3zm1.2 2.4v3.3l1.8-1.6-1.8-1.7zm0 9.9l1.8-1.6-1.8-1.7v3.3z" fill="currentColor"/>`,
    airplane: `<path d="M21 12l-7-2.3V5.3a1.5 1.5 0 00-3 0v4.4L4 12v2l7-1.8v4.1l-2 1.3V19l3-.7 3 .7v-1.4l-2-1.3v-4.1l7 1.8v-2z" fill="currentColor"/>`,
    cellular: `<rect x="2" y="14" width="3" height="7" rx="0.8" fill="currentColor"/><rect x="7.5" y="10.5" width="3" height="10.5" rx="0.8" fill="currentColor"/><rect x="13" y="7" width="3" height="14" rx="0.8" fill="currentColor"/><rect x="18.5" y="3" width="3" height="18" rx="0.8" fill="currentColor"/>`,
    flashlight: `<path d="M8 2h8l-1 7h2.2L10 22l1.2-9H8.5L8 2z" fill="currentColor"/>`,
    moon: `<path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z" fill="currentColor"/>`,
    lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor"/><path d="M8 10.5V7.8a4 4 0 018 0v2.7" stroke="currentColor" stroke-width="1.8" fill="none"/>`,
    record: `<circle cx="12" cy="12" r="8" fill="currentColor"/>`,
    bell: `<path d="M12 3.3a1.3 1.3 0 011.3 1.3v.6a6 6 0 014.2 5.7v3.4l1.5 2.3H5l1.5-2.3V10.9a6 6 0 014.2-5.7v-.6A1.3 1.3 0 0112 3.3z" fill="currentColor"/><path d="M9.6 18.6a2.4 2.4 0 004.8 0" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    speaker: `<path d="M4 9h3.5L12 5.5v13L7.5 15H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    hourglass: `<path d="M6 3h12M6 21h12M7 3c0 4 3 5.5 5 6.5C10 10.5 7 12 7 16v5M17 3c0 4-3 5.5-5 6.5 2 1 5 2.5 5 6.5v5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    display: `<rect x="3.5" y="5" width="17" height="11.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 20.5h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
    grid: `<rect x="4" y="4" width="6.5" height="6.5" rx="1.4" fill="currentColor"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" fill="currentColor"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" fill="currentColor"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" fill="currentColor"/>`,
    sparkle: `<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="currentColor"/>`,
    battery: `<rect x="2" y="7" width="17.5" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="21" y="10" width="1.6" height="4" rx="0.6" fill="currentColor"/><rect x="4" y="9" width="10" height="6" rx="1.2" fill="currentColor"/>`,
    shield: `<path d="M12 3l7 3v5.5c0 4.7-3 7.7-7 9.5-4-1.8-7-4.8-7-9.5V6l7-3z" fill="currentColor"/>`,
    accessibility: `<circle cx="12" cy="5" r="2" fill="currentColor"/><path d="M4.5 8.5h15M12 7.5v13M8 11l4 2 4-2M8.5 20l3.5-6 3.5 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    search: `<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="15.2" y1="15.2" x2="20" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    chevron: `<path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    check: `<path d="M4 12.5l5.5 5.5L20 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    trash: `<path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    share: `<path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    heart: `<path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 018.5-2 4.5 4.5 0 018.5 2c0 6-8.5 11.5-8.5 11.5z" fill="currentColor"/>`,
    heartOutline: `<path d="M12 20.5S3.5 15 3.5 9a4.5 4.5 0 018.5-2 4.5 4.5 0 018.5 2c0 6-8.5 11.5-8.5 11.5z" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    plus: `<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    close: `<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    calendarBadge: `<rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/>`,
    person: `<circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4.5 20a7.5 7.5 0 0115 0" fill="currentColor"/>`,
    folder: `<path d="M3.5 7.2A1.7 1.7 0 015.2 5.5h4l1.7 2h8a1.7 1.7 0 011.7 1.7v8.1a1.7 1.7 0 01-1.7 1.7H5.2a1.7 1.7 0 01-1.7-1.7V7.2z" fill="currentColor"/>`,
    sun: `<circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="2.5" x2="12" y2="4.8"/><line x1="12" y1="19.2" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="4.8" y2="12"/><line x1="19.2" y1="12" x2="21.5" y2="12"/><line x1="5.1" y1="5.1" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="18.9" y2="18.9"/><line x1="5.1" y1="18.9" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="18.9" y2="5.1"/></g>`,
    calculatorGlyph: `<rect x="4" y="3" width="16" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="6.5" y="5.3" width="11" height="4" rx="0.8" fill="currentColor"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/><circle cx="16" cy="13" r="1" fill="currentColor"/><circle cx="8" cy="17" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/><circle cx="16" cy="17" r="1" fill="currentColor"/>`,
    cameraGlyph: `<path d="M8.2 6.5l.9-1.5h5.8l.9 1.5H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h3.2z" fill="currentColor"/>`,
    play: `<path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor"/>`,
    pause: `<rect x="6" y="4.5" width="4.5" height="15" rx="1" fill="currentColor"/><rect x="13.5" y="4.5" width="4.5" height="15" rx="1" fill="currentColor"/>`,
    skipNext: `<path d="M6 5v14l10-7L6 5z" fill="currentColor"/><rect x="17" y="5" width="2.2" height="14" rx="0.6" fill="currentColor"/>`,
    skipPrev: `<path d="M18 5v14L8 12l10-7z" fill="currentColor"/><rect x="4.8" y="5" width="2.2" height="14" rx="0.6" fill="currentColor"/>`,
    gear: `<path d="M12 3.5l1.2 2 2.3.2 1.2 2 2.1 1-.3 2.3 1.5 1.8-1.5 1.8.3 2.3-2.1 1-1.2 2-2.3.2L12 20.5l-1.2-2-2.3-.2-1.2-2-2.1-1 .3-2.3L4 11l1.5-1.8-.3-2.3 2.1-1 1.2-2 2.3-.2L12 3.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/>`,
    image: `<rect x="3.5" y="4.5" width="17" height="15" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.3" cy="9.3" r="1.6" fill="currentColor"/><path d="M4.5 17l5-5 3 3 4-5 4.5 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
    display2: `<rect x="3" y="4" width="9" height="14" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="13.5" y="4" width="7.5" height="14" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 20h2" stroke="currentColor" stroke-width="1.4"/>`,
    cloud: `<path d="M7 17a4 4 0 010-8 5 5 0 019.6 1.4A3.6 3.6 0 0117 17H7z" fill="currentColor"/>`,
    cloudSun: `<circle cx="7.5" cy="7.5" r="3" fill="currentColor"/><path d="M8 17a4 4 0 010-8 5 5 0 019.6 1.4A3.6 3.6 0 0117 17H8z" fill="currentColor"/>`,
    rain: `<path d="M6 13a4 4 0 010-8 5 5 0 019.6 1.4A3.6 3.6 0 0116 13H6z" fill="currentColor"/><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><line x1="8" y1="16" x2="7" y2="20"/><line x1="12" y1="16" x2="11" y2="20"/><line x1="16" y1="16" x2="15" y2="20"/></g>`,
    cameraFlip: `<path d="M4 8a8 8 0 0113-4.8M20 16a8 8 0 01-13 4.8" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M17 2.5V7h-4.5M7 21.5V17h4.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    bolt: `<path d="M13 2L5 13.5h5.5L11 22l8-11.5h-5.5L13 2z" fill="currentColor"/>`,
    boltOff: `<path d="M13 2L5 13.5h5.5L11 22l8-11.5h-5.5L13 2z" fill="none" stroke="currentColor" stroke-width="1.4"/>`,
    newspaper: `<rect x="3.5" y="4.5" width="13" height="15" rx="1.5" fill="currentColor"/><path d="M16.5 8h4v9a2 2 0 01-2 2h-2z" fill="currentColor" opacity="0.6"/><path d="M6 8h8M6 11h8M6 14h5" stroke="var(--system-bg,#fff)" stroke-width="1.1"/>`,
    palette: `<path d="M12 3a9 9 0 000 18c1.1 0 1.6-.6 1.6-1.4 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H16a5 5 0 005-5c0-4.4-4-8.2-9-8.2z" fill="currentColor"/><circle cx="7.5" cy="10.5" r="1.3" fill="var(--system-bg,#fff)"/><circle cx="8.5" cy="14.5" r="1.3" fill="var(--system-bg,#fff)"/><circle cx="12.5" cy="7.5" r="1.3" fill="var(--system-bg,#fff)"/><circle cx="16" cy="9.5" r="1.3" fill="var(--system-bg,#fff)"/>`,
    docPdf: `<path d="M6 2.5h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1v-17a1 1 0 011-1z" fill="currentColor"/><path d="M14 2.5v4h4" fill="none" stroke="var(--system-bg,#fff)" stroke-width="1"/>`,
    zip: `<path d="M6 2.5h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1v-17a1 1 0 011-1z" fill="currentColor"/><rect x="10" y="4" width="3" height="2" fill="var(--system-bg,#fff)"/><rect x="10" y="8" width="3" height="2" fill="var(--system-bg,#fff)"/><rect x="10" y="12" width="3" height="2" fill="var(--system-bg,#fff)"/>`,
    volumeLow: `<path d="M4 9h3.5L12 5.5v13L7.5 15H4z" fill="currentColor"/><path d="M15.5 10a3 3 0 010 4" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    volumeHigh: `<path d="M4 9h3.5L12 5.5v13L7.5 15H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
    paperclip: `<path d="M8 12.5l6.5-6.5a3 3 0 014.2 4.2l-8 8a5 5 0 01-7-7l7.5-7.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    wrench: `<path d="M14.5 3.5a4.5 4.5 0 00-5.8 5.8L3 15l3 3 5.7-5.7a4.5 4.5 0 005.8-5.8l-3 3-2-2 3-3z" fill="currentColor"/>`,
    compose: `<path d="M4 20l1-4.2L15.3 5.5a1.5 1.5 0 012.1 0l1.1 1.1a1.5 1.5 0 010 2.1L8.2 19l-4.2 1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    smiley: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.1" fill="currentColor"/><circle cx="15" cy="10" r="1.1" fill="currentColor"/><path d="M8.3 14.5a5 5 0 007.4 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    arrowUp: `<path d="M12 19V6M6 11l6-6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    clipboard: `<rect x="5" y="4.5" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="8.5" y="2.5" width="7" height="3.5" rx="1" fill="currentColor"/><line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="14.5" x2="16" y2="14.5" stroke="currentColor" stroke-width="1.3"/>`,
    bookmark: `<path d="M6 3.5h12a1 1 0 011 1V21l-7-4-7 4V4.5a1 1 0 011-1z" fill="currentColor"/>`,
    headphones: `<path d="M4 13v-1a8 8 0 0116 0v1" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="3" y="12.5" width="4" height="6.5" rx="2" fill="currentColor"/><rect x="17" y="12.5" width="4" height="6.5" rx="2" fill="currentColor"/>`,
    chevronLeft: `<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    chevronRight: `<path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    reload: `<path d="M20 12a8 8 0 10-2.6 5.9" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 6.5V12h-5.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    externalLink: `<path d="M9 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 4h6v6M20 4l-9 9" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    globe: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>`
  };

  function glyph(name) {
    return PATHS[name] ? `<svg viewBox="0 0 24 24" width="100%" height="100%">${PATHS[name]}</svg>` : "";
  }

  // Drop-in replacement for an emoji character inside a text string —
  // sized to 1em and baseline-aligned so it flows inline with text.
  function inline(name, cls) {
    return `<span class="inline-ic${cls ? " " + cls : ""}">${glyph(name)}</span>`;
  }

  window.OS = window.OS || {};
  window.OS.icons = { svg, glyph, inline, GLYPHS, PATHS };
})();
