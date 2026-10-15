/* Adaptive SpringBoard with a memory canvas, widgets, pages and side dock. */
(function () {
  'use strict';
  const pages = [
    ['facetime','calendar','photos','camera','mail','notes','clock','maps','tv','health','reminders','files','shortcuts','appstore','wallet','settings'],
    ['weather','calculator','music','phone','messages','safari']
  ];
  function launch(id, side) { OS.multitasking.openApp(id, OS.get('spanAppsAutomatically') && OS.apps[id]?.duoCapable && !OS.get('folded') ? 'span' : side); }
  function icon(id, side, dock) {
    const def = OS.apps[id];
    const button = document.createElement('button');
    button.className = 'app-icon' + (dock ? ' dock-icon' : '');
    button.setAttribute('aria-label', def ? def.name : id);
    button.innerHTML = `<span class="app-icon-glyph">${OS.icons.svg(id)}</span>${dock ? '' : `<span class="app-icon-label">${def ? def.name : id}</span>`}`;
    let held = false;
    button.addEventListener('click', () => { if (held) { held=false; return; } launch(id, side); });
    OS.gestures.attach(button, { onLongPress: () => {
      held = true;
      OS.modals.open({title: def ? def.name : id, buttons: [
        {label:'Open', onClick:()=>launch(id,side)},
        {label:'Open in other pane', onClick:()=>launch(id,side==='left'?'right':'left')},
        {label:'Cancel'}
      ]});
    }});
    return button;
  }
  function mount(container, {side}) {
    const expanded = !OS.get('folded') && OS.get('leftScreen').mode==='home' && OS.get('rightScreen').mode==='home';
    const wrap = document.createElement('div');
    wrap.className = 'home-screen duo-home' + (expanded && side==='left' ? ' memory-home' : '');
    container.appendChild(wrap);
    if (expanded && side==='left') {
      wrap.innerHTML = `<button class="memory-widget" aria-label="Open Photos memory"><img src="assets/memory.jpg" alt="Sunlit mountain peaks"><span class="memory-caption"><strong>On This Day</strong><small>A LITTLE ADVENTURE</small></span><span class="memory-play">▶</span></button>`;
      wrap.querySelector('button').onclick = ()=>launch('photos','span');
      return;
    }
    const now = new Date();
    const page = Math.min(OS.get(side+'Screen').page || 0, pages.length-1);
    wrap.innerHTML = `<div class="duo-home-main"><div class="duo-widgets">
      <button class="duo-weather" data-open="weather"><span>Cupertino</span><strong>89°</strong><span class="weather-sun">☀</span><small>Sunny<br>H:91° L:64°</small></button>
      <button class="duo-calendar" data-open="calendar"><span>${now.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}</span><strong>${now.getDate()}</strong><small><b>Project Update</b><br>1–2:30 PM</small><small><b>Forecast Meeting</b><br>3–4 PM</small></button>
    </div><div class="duo-app-grid"></div><div class="duo-page-controls">${pages.map((_,i)=>`<button class="duo-page-dot ${i===page?'active':''}" data-page="${i}" aria-label="Home screen page ${i+1}" aria-current="${i===page}"></button>`).join('')}</div></div><div class="duo-dock"></div><button class="duo-search" aria-label="Search apps">${OS.icons.glyph('search')}</button>`;
    pages[page].forEach(id=>wrap.querySelector('.duo-app-grid').appendChild(icon(id,side)));
    ['phone','safari','messages','music'].forEach(id=>wrap.querySelector('.duo-dock').appendChild(icon(id,side,true)));
    wrap.querySelectorAll('[data-open]').forEach(el=>el.onclick=()=>launch(el.dataset.open,side));
    function setPage(value) { OS.patch(side+'Screen',{page:value}); OS.multitasking.renderScreen(side); }
    wrap.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>setPage(Number(el.dataset.page)));
    OS.gestures.attach(wrap.querySelector('.duo-app-grid'),{onDragStart(){},onDragEnd({dx}) {
      if(Math.abs(dx)>40) setPage(Math.max(0,Math.min(pages.length-1,page+(dx<0?1:-1))));
    }});
    wrap.querySelector('.duo-search').onclick=()=>OS.duo.search(side);
  }
  OS.multitasking.registerApp({id:'home',name:'Home',icon:OS.icons.svg('home'),color:'#888',duoCapable:false,mount});
})();
