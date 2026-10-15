/* Browser experience controls. Hardware and online services remain simulated. */
(function () {
  'use strict';
  const frame = document.getElementById('device-frame');
  const foldButton = document.querySelector('[data-device-action="fold"]');
  function sync() {
    const home = OS.get('leftScreen').mode==='home' && OS.get('rightScreen').mode==='home';
    frame.classList.toggle('is-locked',OS.get('deviceLocked'));
    frame.classList.toggle('is-home',home && !OS.get('deviceLocked'));
    frame.classList.toggle('is-split',!home && !OS.get('deviceLocked'));
    frame.classList.toggle('is-folded',!!OS.get('folded'));
    foldButton.textContent = OS.get('folded') ? 'Unfold' : 'Fold';
    foldButton.setAttribute('aria-pressed',String(!!OS.get('folded')));
  }
  function dismiss() {
    OS.multitasking.closeControlCenter();
    OS.multitasking.closeNotificationCenter();
    OS.multitasking.closeAppSwitcher();
    OS.multitasking.closeMultitaskMenu();
    OS.keyboard.close();
  }
  function home() {
    dismiss();
    OS.set({deviceLocked:false,spannedApp:null,leftScreen:{mode:'home',app:null,page:0},rightScreen:{mode:'home',app:null,page:0}});
    OS.multitasking.renderAll();
  }
  function fold() {
    dismiss();
    const folded = !OS.get('folded');
    if (folded && OS.get('spannedApp')) OS.multitasking.unspanApp();
    if (folded && OS.get('leftScreen').mode==='home' && OS.get('rightScreen').mode==='app') {
      OS.multitasking.moveApp('right','left');
    }
    OS.set('folded',folded);
    if (OS.get('deviceLocked')) OS.device.renderLockScreen();
    else OS.multitasking.renderAll();
  }
  function search(side) {
    OS.modals.open({title:'Search',body:'<input class="duo-search-input" aria-label="Search apps" placeholder="Apps, photos, and more" autocomplete="off"><div class="search-apps"></div>',buttons:[{label:'Cancel'}],onRender(layer) {
      const input=layer.querySelector('input'),results=layer.querySelector('.search-apps');
      function update() {
        results.replaceChildren();
        Object.values(OS.apps).filter(a=>a.id!=='home' && a.name.toLowerCase().includes(input.value.toLowerCase())).forEach(a=>{
          const button=document.createElement('button');
          button.innerHTML=OS.icons.svg(a.id);
          const label=document.createElement('span');label.textContent=a.name;button.appendChild(label);
          button.onclick=()=>{OS.modals.close();OS.multitasking.openApp(a.id,side);};results.appendChild(button);
        });
        if(!results.children.length) results.textContent='No matching apps';
      }
      input.oninput=update;update();setTimeout(()=>input.focus(),100);
    }});
  }
  document.querySelectorAll('[data-device-action]').forEach(button=>button.onclick=()=>{
    switch(button.dataset.deviceAction) {
      case 'home': home();break;
      case 'fold': fold();break;
      case 'split': home();OS.set('folded',false);OS.multitasking.openApp('messages','left');OS.multitasking.openApp('photos','right');break;
      case 'lock': OS.get('deviceLocked')?OS.device.unlock('left'):OS.device.lockDevice();break;
      case 'controls': if(OS.get('deviceLocked')) home();OS.get('controlCenterOpen')?OS.multitasking.closeControlCenter():OS.multitasking.openControlCenter(OS.get('folded')?'left':'right');break;
    }
  });
  document.getElementById('help-button').onclick=()=>OS.modals.open({title:'Make yourself at home.',body:'<p>Swipe up to unlock, or click the side button. Open apps with a tap. Swipe down from the top right for Control Center and from the top left for notifications.</p><p>Use the home bar to return home. Hold an app icon for options. Try Split View, or Fold to continue on the outer display.</p><p><small>Independent browser simulation. Calls, Touch ID, weather, media, and Apple services are demonstrations.</small></p>'});
  ['left','right'].forEach(side=>{
    const bar=document.getElementById('home-indicator-'+side);
    bar.setAttribute('role','button');bar.setAttribute('tabindex','0');bar.setAttribute('aria-label','Go Home');
    bar.onclick=()=>OS.get('deviceLocked')?OS.device.unlock(side):home();
    bar.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();bar.click();}};
  });
  ['deviceLocked','folded','leftScreen','rightScreen'].forEach(key=>OS.subscribe(key,sync));
  document.addEventListener('os:render',sync);
  // A lightweight asset migration keeps existing notes, messages, and captures.
  if(!localStorage.getItem('duo.artwork.v2')) {
    OS.set({wallpaper:'dunes',darkMode:false,brightness:1});
    const retained=OS.get('photos').filter(p=>!/^p[0-5]$/.test(p.id));
    OS.set('photos',[...retained,...['memory','coast','forest','dunes'].map((name,i)=>({id:'sample-'+name,gradient:`url("assets/${name}.jpg")`,time:Date.now()-i*86400000,favorite:i===0}))]);
    try{localStorage.setItem('duo.artwork.v2','1');}catch(e){}
  }
  document.title='iPhone Duo — Interactive Experience';
  document.getElementById('debug-toggle').innerHTML=OS.icons.glyph('gear');
  document.getElementById('stage-hint').textContent='Swipe up to unlock · Click the side button for Touch ID · Ctrl+Shift+D for developer tools';
  OS.duo={home,fold,search};sync();
})();
