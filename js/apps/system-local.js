(function(){
 'use strict';const L=OS.local,E=L.escape;
 let clockTab='world',alarms=L.read('alarms',[]),elapsed=0,started=0,stopwatch=false,laps=[],timerEnd=0,timerPaused=0;
 const fmt=ms=>{const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
 const world=[['Cupertino','America/Los_Angeles'],['New York','America/New_York'],['London','Europe/London'],['Tokyo','Asia/Tokyo'],['Karachi','Asia/Karachi']];
 function alarmForm(render){L.form('Add Alarm',[{name:'time',label:'Time',type:'time',value:'07:00',required:true},{name:'label',label:'Label',value:'Alarm'}],data=>{alarms.push({...data,id:L.id(),enabled:true});L.save('alarms',alarms);render();});}
 L.register('clock','Clock',container=>{
   function render(){const el=L.section(container,{world:'World Clock',alarm:'Alarms',stopwatch:'Stopwatch',timer:'Timers'}[clockTab],clockTab==='alarm'?L.button('＋','add'):'','local-clock');const body=el.querySelector('.local-content');
    if(clockTab==='world')body.innerHTML=world.map(([name,zone])=>`<div class="world-clock-row"><span>${name}</span><b data-zone="${zone}"></b></div>`).join('');
    if(clockTab==='alarm')body.innerHTML=alarms.map(a=>`<div class="alarm-row"><button data-delete="${a.id}" aria-label="Delete alarm">−</button><div><div class="alarm-time">${a.time}</div><div class="alarm-label">${E(a.label)}</div></div><button class="ios-switch ${a.enabled?'on':''}" data-alarm="${a.id}" aria-label="Toggle alarm"><span class="ios-switch-knob"></span></button></div>`).join('')||'<p class="local-empty">No Alarms</p>';
    if(clockTab==='stopwatch')body.innerHTML=`<div class="local-clock-display" data-stopwatch></div><div class="stopwatch-actions"><button class="clock-round-btn" data-action="lap">${stopwatch?'Lap':'Reset'}</button><button class="clock-round-btn primary" data-action="toggle">${stopwatch?'Stop':'Start'}</button></div><div class="clock-laps">${laps.map((lap,i)=>`<div class="local-row">Lap ${i+1}<b>${fmt(lap)}</b></div>`).join('')}</div>`;
    if(clockTab==='timer')body.innerHTML=`<div class="local-clock-display" data-timer>${fmt(timerPaused)}</div>${!timerEnd&&!timerPaused?'<form class="timer-custom"><label>Minutes<input type="number" name="minutes" min="0" max="999" value="5" required></label><label>Seconds<input type="number" name="seconds" min="0" max="59" value="0" required></label><button class="native-primary">Start</button></form>':`<div class="stopwatch-actions"><button class="clock-round-btn" data-action="cancel">Cancel</button><button class="clock-round-btn primary" data-action="pause">${timerEnd?'Pause':'Resume'}</button></div>`}`;
    body.insertAdjacentHTML('beforeend',L.tabs([['world','World Clock'],['alarm','Alarms'],['stopwatch','Stopwatch'],['timer','Timers']],clockTab));el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{clockTab=b.dataset.tab;render();});
    el.querySelector('[data-action="add"]')?.addEventListener('click',()=>alarmForm(render));
    el.querySelectorAll('[data-alarm]').forEach(b=>b.onclick=()=>{const a=alarms.find(x=>x.id===b.dataset.alarm);a.enabled=!a.enabled;L.save('alarms',alarms);render();});
    el.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{alarms=alarms.filter(x=>x.id!==b.dataset.delete);L.save('alarms',alarms);render();});
    el.querySelector('[data-action="toggle"]')?.addEventListener('click',()=>{if(stopwatch)elapsed+=Date.now()-started;else started=Date.now();stopwatch=!stopwatch;render();});
    el.querySelector('[data-action="lap"]')?.addEventListener('click',()=>{if(stopwatch)laps.push(elapsed+Date.now()-started);else{elapsed=0;laps=[];}render();});
    el.querySelector('.timer-custom')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target),ms=(Number(data.get('minutes'))*60+Number(data.get('seconds')))*1000;if(ms<=0)return;timerEnd=Date.now()+ms;OS.set({timerRunning:true,timerRemaining:ms});render();});
    el.querySelector('[data-action="cancel"]')?.addEventListener('click',()=>{timerEnd=timerPaused=0;OS.set({timerRunning:false,timerRemaining:0});render();});
    el.querySelector('[data-action="pause"]')?.addEventListener('click',()=>{if(timerEnd){timerPaused=Math.max(0,timerEnd-Date.now());timerEnd=0;}else{timerEnd=Date.now()+timerPaused;timerPaused=0;}OS.set('timerRunning',!!timerEnd);render();});tick();
   }render();
 });
 function tick(){document.querySelectorAll('[data-zone]').forEach(el=>el.textContent=new Intl.DateTimeFormat('en-US',{timeZone:el.dataset.zone,hour:'numeric',minute:'2-digit'}).format(new Date()));document.querySelectorAll('[data-stopwatch]').forEach(el=>{const ms=elapsed+(stopwatch?Date.now()-started:0);el.textContent=fmt(ms)+'.'+String(Math.floor(ms%1000/10)).padStart(2,'0');});
   const remaining=timerEnd?Math.max(0,timerEnd-Date.now()):timerPaused;document.querySelectorAll('[data-timer]').forEach(el=>el.textContent=fmt(remaining));
   if(timerEnd){OS.set('timerRemaining',remaining);if(!remaining){timerEnd=0;OS.set('timerRunning',false);L.toast('Timer finished');document.querySelectorAll('.local-clock [data-action="cancel"]').forEach(b=>b.click());}}
 }
 setInterval(tick,100);
 setInterval(()=>{const now=new Date(),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),today=now.toDateString();alarms.forEach(a=>{if(a.enabled&&a.time===time&&a.lastDay!==today){a.lastDay=today;L.save('alarms',alarms);L.toast(a.label||'Alarm');}});},1000);
 OS.apps.clock.tick=tick;

 let settingID=null;const categories=[['profile','Apple Account','person','#999'],['wifi','Wi-Fi','wifi','#007aff'],['bluetooth','Bluetooth','bluetooth','#007aff'],['cellular','Cellular','cellular','#34c759'],['notifications','Notifications','bell','#ff3b30'],['sounds','Sounds & Haptics','speaker','#ff315d'],['focus','Focus','moon','#6155c8'],['general','General','gear','#888'],['display','Display & Brightness','sun','#007aff'],['wallpaper','Wallpaper','image','#49a3db'],['duo','Multitasking','display2','#487ddb'],['accessibility','Accessibility','accessibility','#007aff'],['battery','Battery','battery','#34c759'],['privacy','Privacy & Security','shield','#007aff']];
 const toggle=(label,key)=>`<div class="settings-detail-row"><span>${label}</span><button class="ios-switch ${OS.get(key)?'on':''}" data-toggle="${key}" aria-label="${label}" aria-pressed="${!!OS.get(key)}"><span class="ios-switch-knob"></span></button></div>`;
 const row=(label,value)=>`<div class="settings-detail-row"><span>${label}</span><small>${value}</small></div>`;
 L.register('settings','Settings',(container,opts)=>{
   function detail(target){const cat=categories.find(x=>x[0]===settingID);if(!cat){L.section(target,'Settings').querySelector('.local-content').innerHTML='<div class="local-empty">Select a setting</div>';return;}
    const el=L.section(target,cat[1],L.button('‹ Settings','back'),'local-settings');let html='';
    if(settingID==='profile')html='<div class="local-profile"><span>Y</span><h2>Your iPhone</h2><p>Personalize your local experience.</p></div>'+row('Account','Local profile')+row('iCloud','Not connected');
    if(settingID==='wifi')html=toggle('Wi-Fi','wifiEnabled')+['Home Network','Coffee Shop','Guest Wi-Fi'].map(n=>`<button class="local-row" data-network="${n}">${OS.icons.inline('wifi')}　${n} <small>${L.read('network','Home Network')===n?'Connected':'Tap to connect'}</small></button>`).join('');
    if(settingID==='bluetooth')html=toggle('Bluetooth','bluetoothEnabled')+['AirPods Pro','Keyboard'].map(n=>`<button class="local-row" data-bluetooth="${n}">${n}<small>${L.read('bluetoothDevice','')===n?'Connected':'Not Connected'}</small></button>`).join('');
    if(settingID==='cellular')html=toggle('Cellular Data','cellularEnabled')+toggle('Airplane Mode','airplaneMode')+row('Data Mode','5G Auto');
    if(settingID==='notifications')html=toggle('Allow Notifications','localNotifications')+row('Show Previews','When Unlocked');
    if(settingID==='sounds')html='<label class="local-range">Ringtone and Alerts<input type="range" min="0" max="1" step=".01" value="'+OS.get('volume')+'" data-range="volume"></label>'+toggle('Silent Mode','localSilent');
    if(settingID==='focus')html=toggle('Do Not Disturb','focusMode')+'<p class="local-caption">Keep your attention on what matters.</p>';
    if(settingID==='general')html=row('Name','iPhone Duo')+row('Software','Web experience')+row('Model','iPhone Duo')+row('Storage','On this browser')+'<button class="local-row" data-action="storage">Storage & Backup　›</button>';
    if(settingID==='display')html=toggle('Dark Mode','darkMode')+'<label class="local-range">Brightness<input type="range" min=".1" max="1" step=".01" value="'+OS.get('brightness')+'" data-range="brightness"></label>'+toggle('Bold Text','localBold');
    if(settingID==='wallpaper')html='<div class="local-wallpapers">'+Object.entries(OS.device.WALLPAPERS).map(([name,bg])=>`<button data-wallpaper="${name}" style="background:${bg.includes('url(')?'url(assets/mojave.jpg) center/cover':bg}"><span>${name}</span></button>`).join('')+'</div>';
    if(settingID==='duo')html=toggle('Open Apps Across Display','spanAppsAutomatically')+toggle('Drag Between Apps','crossScreenDrag')+row('Current Display',OS.get('folded')?'Outer':'Inner');
    if(settingID==='accessibility')html=toggle('Reduce Motion','localReduceMotion')+toggle('Bold Text','localBold')+'<p class="local-caption">Keyboard navigation and native text input are supported.</p>';
    if(settingID==='battery')html='<div class="battery-big">'+Math.round(OS.get('batteryPercentage'))+'%</div>'+toggle('Battery Percentage','showBatteryPercent')+toggle('Low Power Mode','lowPowerMode')+toggle('Charging','charging');
    if(settingID==='privacy')html=row('Photos & Files','Stored locally')+row('Camera','Ask when requested')+row('Microphone','Not requested')+'<p class="local-caption">No account, backend, or analytics. Device network switches simulate the interface.</p>';
    el.querySelector('.local-content').innerHTML='<div class="local-group">'+html+'</div>';
    el.querySelector('[data-action="back"]').onclick=()=>{settingID=null;render();};el.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const key=b.dataset.toggle;OS.set(key,!OS.get(key));if(key.startsWith('local'))L.save(key,OS.get(key));applyPreferences();detail(target);});
    el.querySelectorAll('[data-range]').forEach(input=>input.oninput=()=>OS.set(input.dataset.range,Number(input.value)));el.querySelectorAll('[data-wallpaper]').forEach(b=>b.onclick=()=>{OS.set('wallpaper',b.dataset.wallpaper);L.toast('Wallpaper updated');});
    el.querySelectorAll('[data-network]').forEach(b=>b.onclick=()=>{if(OS.get('wifiEnabled')){L.save('network',b.dataset.network);detail(target);}});el.querySelectorAll('[data-bluetooth]').forEach(b=>b.onclick=()=>{if(OS.get('bluetoothEnabled')){L.save('bluetoothDevice',b.dataset.bluetooth);detail(target);}});el.querySelector('[data-action="storage"]')?.addEventListener('click',()=>document.getElementById('help-button').click());
   }
   function render(){if(settingID&&!opts.spanned){detail(container);return;}const el=L.section(container,'Settings','','local-settings');el.querySelector('.local-content').innerHTML='<input class="local-search" placeholder="Search" aria-label="Search settings"><div class="local-group settings-results"></div>';
    function list(q=''){el.querySelector('.settings-results').innerHTML=categories.filter(c=>c[1].toLowerCase().includes(q.toLowerCase())).map(c=>`<button class="local-setting-row" data-setting="${c[0]}"><span style="background:${c[3]}">${OS.icons.glyph(c[2])}</span><strong>${c[1]}</strong><small>›</small></button>`).join('');el.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{settingID=b.dataset.setting;render();});}list();el.querySelector('input').oninput=e=>list(e.target.value);if(opts.spanned)detail(opts.otherContainer);
   }render();
 },true);
 function applyPreferences(){document.documentElement.classList.toggle('local-bold',!!OS.get('localBold'));document.documentElement.classList.toggle('local-reduce-motion',!!OS.get('localReduceMotion'));}
 ['localBold','localReduceMotion','localNotifications','localSilent'].forEach(key=>OS.set(key,L.read(key,key==='localNotifications')));applyPreferences();
})();
