from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'js/device.js'
s=p.read_text(encoding='utf-8')
start=s.index('  function triggerFaceId(onSuccess) {')
end=s.index('  /* ---------------- Dynamic Island', start)
s=s[:start]+'''  function triggerFaceId(onSuccess) {
    // Compatibility name retained for callers; Duo uses side-button Touch ID.
    if (OS.get("faceIdBusy")) return;
    OS.set("faceIdBusy", true);
    const hint = document.querySelector(".lock-swipe-hint span");
    if (hint) hint.textContent = "Touch ID";
    setTimeout(() => {
      OS.set("faceIdBusy", false);
      if (onSuccess) onSuccess();
    }, 220);
  }

'''+s[end:]
s=s.replace('iPhone 18 Duo', 'iPhone Duo')
p.write_text(s,encoding='utf-8')
p=root/'js/app.js'
s=p.read_text(encoding='utf-8').replace('Trigger Face ID','Simulate Touch ID')
p.write_text(s,encoding='utf-8')
p=root/'js/icons.js'
s=p.read_text(encoding='utf-8')
s=s.replace('    const g = GLYPHS[name] || GLYPHS.settings;', '''    if (name === 'calendar') return `<span class="ios-icon live-calendar"><small>${new Date().toLocaleDateString('en-US',{weekday:'short'})}</small><b>${new Date().getDate()}</b></span>`;
    const g = GLYPHS[name] || GLYPHS.settings;''')
# Calendar is date-driven rather than the fixed date on the marketing artwork.
s=s.replace("if (window.DUO_ASSETS && DUO_ASSETS[", "if (name !== 'calendar' && window.DUO_ASSETS && DUO_ASSETS[")
s=s.replace('const g = GLYPHS[name] || GLYPHS.settings;', '''const g = name === 'appstore' ? '<path d="M9 4l10 17M15 4L5 21M3 15h18" stroke="white" stroke-width="2.6" stroke-linecap="round"/>' : (GLYPHS[name] || GLYPHS.settings);''')
p.write_text(s,encoding='utf-8')
p=root/'js/apps/weather.js'
s=p.read_text(encoding='utf-8').replace('San Francisco','Cupertino').replace('68°','89°').replace('Partly Cloudy','Sunny').replace('H:74° L:62°','H:91° L:64°')
p.write_text(s,encoding='utf-8')
