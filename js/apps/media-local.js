(function(){
  'use strict';
  const L=OS.local,E=L.escape;
  const samples=['memory','coast','forest','dunes'].map((name,i)=>({id:'local-'+name,name:['Mountain escape','By the lake','Into the woods','Desert light'][i],src:'assets/'+name+'.jpg',favorite:i===0,album:'Favorites',time:Date.now()-i*86400000}));
  let photos=L.read('photoLibrary',samples),photoTab='library',selectedPhoto=null;
  const savePhotos=()=>L.save('photoLibrary',photos);
  async function src(photo){return photo.asset?await L.assetURL(photo.asset):photo.src;}
  async function addPhoto(blob,name){const asset=L.id();await L.blobs('put',{id:asset,blob,name,type:blob.type,kind:'photo',size:blob.size});const p={id:L.id(),asset,name,time:Date.now(),favorite:false,album:'Recents'};photos.unshift(p);if(!savePhotos()){photos.shift();await L.removeAsset(asset);throw Error('Storage unavailable');}return p;}
  async function importPhotos(files){for(const file of files){if(!file.type.startsWith('image/'))continue;await addPhoto(file,file.name);}}
  L.register('photos','Photos',(container,opts)=>{
    let query='';
    async function viewer(target,p){const el=L.section(target,'',L.button('‹ Photos','back')+L.button(p.favorite?'♥':'♡','favorite')+L.button('↓','download')+L.button('•••','more'),'local-photos photo-detail');
      const url=await src(p);if(!el.isConnected)return;
      el.querySelector('.local-content').innerHTML=`<img class="photo-full" src="${E(url)}" alt="${E(p.name)}"><p class="local-caption">${E(p.name)} · ${new Date(p.time).toLocaleDateString()}</p><div class="photo-edit-controls"><label>Light <input type="range" min="50" max="150" value="${p.light||100}" aria-label="Photo brightness"></label><label>Color <input type="range" min="0" max="200" value="${p.color??100}" aria-label="Photo saturation"></label></div>`;
      const image=el.querySelector('img');function filter(){image.style.filter=`brightness(${p.light||100}%) saturate(${p.color??100}%)`; }filter();
      el.querySelectorAll('input').forEach((input,i)=>input.oninput=()=>{p[i?'color':'light']=Number(input.value);filter();savePhotos();});
      el.querySelector('[data-action="back"]').onclick=()=>{selectedPhoto=null;render();};
      el.querySelector('[data-action="favorite"]').onclick=e=>{p.favorite=!p.favorite;savePhotos();e.currentTarget.textContent=p.favorite?'♥':'♡';};
      el.querySelector('[data-action="download"]').onclick=async()=>{try{const blob=p.asset?(await L.blobs('get',p.asset)).blob:await(await fetch(url)).blob();L.download(blob,p.name.includes('.')?p.name:p.name+'.jpg');}catch(e){L.toast('This photo could not be downloaded.');}};
      el.querySelector('[data-action="more"]').onclick=()=>OS.modals.open({title:'Photo',buttons:[{label:'Add to Album',onClick:()=>setTimeout(()=>L.form('Album',[{name:'album',label:'Album name',value:p.album,required:true}],data=>{p.album=data.album.trim()||'Recents';savePhotos();}),0)},{label:'Delete Photo',role:'danger',onClick:async()=>{const next=photos.filter(x=>x.id!==p.id);if(L.save('photoLibrary',next)){photos=next;if(p.asset)await L.removeAsset(p.asset);selectedPhoto=null;render();}}},{label:'Cancel'}]});
      image.draggable=true;image.ondragstart=e=>e.dataTransfer.setData('application/x-duo-photo',JSON.stringify({id:p.id,src:url,name:p.name}));
    }
    async function render(){const current=photos.find(p=>p.id===selectedPhoto);if(current&&!opts.spanned){viewer(container,current);return;}
      const el=L.section(container,'Photos',L.button('＋','import'),'local-photos');
      el.querySelector('.local-content').innerHTML=`<input class="local-search" placeholder="Search your library" aria-label="Search photos" value="${E(query)}"><input type="file" multiple accept="image/*" class="local-file-input" aria-label="Import photos"><div class="photo-memory"><img src="assets/memory.jpg" alt="Mountain landscape"><strong>Your days.<br>Your memories.</strong></div><div class="photo-album-filters"></div><div class="local-photo-grid"></div><p class="local-caption">${photos.length} photos · On this device</p>${L.tabs([['library','Library'],['favorites','Favorites'],['albums','Albums']],photoTab)}`;
      el.querySelector('[data-action="import"]').onclick=()=>el.querySelector('[type=file]').click();
      el.querySelector('[type=file]').onchange=async e=>{try{await importPhotos(e.target.files);render();}catch(_){L.toast('Unable to import photos. Check available storage.');}};
      let album='';if(photoTab==='albums'){const albums=[...new Set(photos.map(p=>p.album||'Recents'))];el.querySelector('.photo-album-filters').innerHTML=albums.map(a=>`<button data-album="${E(a)}">${E(a)}</button>`).join('');el.querySelectorAll('[data-album]').forEach(b=>b.onclick=()=>{album=b.dataset.album;grid();});}
      let generation=0;
      async function grid(){const version=++generation;const results=photos.filter(p=>(photoTab!=='favorites'||p.favorite)&&(!album||p.album===album)&&p.name.toLowerCase().includes(query.toLowerCase()));const urls=await Promise.all(results.map(src));if(!el.isConnected||version!==generation)return;el.querySelector('.local-photo-grid').innerHTML=results.map((p,i)=>`<button data-photo="${p.id}" aria-label="${E(p.name)}"><img src="${E(urls[i])}" alt="${E(p.name)}" draggable="true">${p.favorite?'<span>♥</span>':''}</button>`).join('')||'<p class="local-empty">No photos here yet</p>';el.querySelectorAll('[data-photo]').forEach(b=>{b.onclick=()=>{selectedPhoto=b.dataset.photo;render();};b.querySelector('img').ondragstart=e=>{const p=photos.find(x=>x.id===b.dataset.photo);e.dataTransfer.setData('application/x-duo-photo',JSON.stringify({id:p.id,src:e.target.src,name:p.name}));};});}
      el.querySelector('.local-search').oninput=e=>{query=e.target.value;grid();};el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{photoTab=b.dataset.tab;render();});grid();
      if(opts.spanned){if(current)viewer(opts.otherContainer,current);else L.section(opts.otherContainer,'Photos').querySelector('.local-content').innerHTML='<div class="local-empty">Choose a photo<br><small>Drag it into Messages in Split View.</small></div>';}
    }render();
  },true);
  OS.apps.photos.addCapturedPhoto=gradient=>{const match=/url\(["']?([^"')]+)/.exec(gradient);photos.unshift({id:L.id(),name:'Camera capture',src:match?match[1]:'assets/memory.jpg',time:Date.now(),album:'Recents'});savePhotos();};

  let stream=null,live=false,facing='environment',scene=0,cameraMode='photo';
  const stopCamera=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;live=false;};
  L.register('camera','Camera',(container,opts)=>{
    const target=opts.spanned?opts.otherContainer:null;
    const el=L.section(container,'',L.button('⚡','flash')+L.button('Use Camera','live'),'local-camera');
    el.querySelector('.local-content').innerHTML=`<div class="local-viewfinder"><img src="assets/${['memory','coast','forest'][scene]}.jpg" alt="Camera preview"><video autoplay muted playsinline></video><div class="camera-thirds"></div><span class="camera-preview-label">PREVIEW</span></div><div class="camera-bottom"><div class="camera-mode-options">${['photo','portrait'].map(m=>`<button data-mode="${m}" class="${m===cameraMode?'active':''}">${m.toUpperCase()}</button>`).join('')}</div><div class="camera-shoot-row"><button data-action="library" aria-label="Photo library">▧</button><button class="local-shutter" data-action="capture" aria-label="Take photo"></button><button data-action="flip" aria-label="Switch camera">⟳</button></div><p>Swipe through your moments.</p></div>`;
    const video=el.querySelector('video'),preview=el.querySelector('.local-viewfinder img');
    function attach(){video.hidden=!live;preview.hidden=live;if(stream)video.srcObject=stream;el.querySelector('.camera-preview-label').textContent=live?'LIVE':'PREVIEW';el.querySelector('[data-action="live"]').textContent=live?'Stop Camera':'Use Camera';}
    attach();
    async function start(){if(!navigator.mediaDevices?.getUserMedia){L.toast('Camera requires localhost or HTTPS. Preview mode is available.');return;}try{const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing},audio:false});if(!el.isConnected||OS.get('deviceLocked')){next.getTracks().forEach(t=>t.stop());return;}stopCamera();stream=next;live=true;attach();}catch(e){L.toast('Camera access is unavailable. You can still capture the preview.');}}
    el.querySelector('[data-action="live"]').onclick=()=>{if(live){stopCamera();attach();}else start();};
    el.querySelector('[data-action="flip"]').onclick=()=>{if(live){facing=facing==='environment'?'user':'environment';stopCamera();start();}else{scene=(scene+1)%3;preview.src='assets/'+['memory','coast','forest'][scene]+'.jpg';}};
    el.querySelector('[data-action="flash"]').onclick=e=>{e.currentTarget.classList.toggle('active');};
    el.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{cameraMode=b.dataset.mode;el.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));preview.style.filter=cameraMode==='portrait'?'contrast(1.06) saturate(.85)':'';});
    el.querySelector('[data-action="library"]').onclick=()=>OS.multitasking.openApp('photos',opts.side);
    el.querySelector('[data-action="capture"]').onclick=async()=>{try{let blob;if(live){if(!video.videoWidth)return;const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.9));}else blob=await(await fetch(preview.src)).blob();await addPhoto(blob,'IMG_'+Date.now()+'.jpg');el.classList.add('captured');setTimeout(()=>el.classList.remove('captured'),180);L.toast('Saved to Photos');}catch(e){L.toast('Photo could not be saved.');}};
    if(target)L.section(target,'Duo Preview').querySelector('.local-content').innerHTML='<div class="camera-preview-card"><img src="assets/'+['memory','coast','forest'][scene]+'.jpg" alt="Preview scene"><h2>A little more room to create.</h2><p>Capture photos on the left. View and organize them in Photos.</p></div>';
  },true);
  function cameraVisibility(){const visible=['left','right'].some(side=>OS.get(side+'Screen').app==='camera'&&(!OS.get('folded')||side==='left'));if(!visible||OS.get('deviceLocked'))stopCamera();}
  document.addEventListener('os:render',cameraVisibility);OS.subscribe('deviceLocked',cameraVisibility);window.addEventListener('pagehide',stopCamera);

  const audio=new Audio();let tracks=L.read('tracks',[]),trackID=tracks[0]?.id||null;
  audio.onplay=()=>OS.set('musicPlaying',true);audio.onpause=()=>OS.set('musicPlaying',false);
  async function selectTrack(id){trackID=id;const t=tracks.find(x=>x.id===id);if(t)audio.src=await L.assetURL(t.asset);}
  async function play(){try{if(!audio.src&&trackID)await selectTrack(trackID);if(!audio.src){L.toast('Import a song to start listening.');return;}if(audio.paused)await audio.play();else audio.pause();}catch(e){L.toast('This audio format cannot be played.');}}
  async function next(delta=1){if(!tracks.length)return;await selectTrack(tracks[(tracks.findIndex(t=>t.id===trackID)+delta+tracks.length)%tracks.length].id);try{await audio.play();}catch(_){L.toast('Unable to play this track.');}}
  audio.onended=()=>next();OS.subscribe('volume',v=>audio.volume=v);
  L.register('music','Music',container=>{
    const el=L.section(container,'Library',L.button('＋ Add Music','import'),'local-music');
    el.querySelector('.local-content').innerHTML=`<input type="file" accept="audio/*" multiple class="local-file-input" aria-label="Import music"><div class="local-album-art"><span>♫</span></div><h2 class="player-title"></h2><p class="local-caption">Your music, on this device</p><input class="player-seek" type="range" min="0" max="100" value="0" aria-label="Playback position"><div class="player-transport"><button data-action="prev" aria-label="Previous song">◀◀</button><button data-action="play" aria-label="Play or pause">▶</button><button data-action="next" aria-label="Next song">▶▶</button></div><div class="local-group track-list"></div>`;
    function update(){if(!el.isConnected){audio.removeEventListener('timeupdate',update);audio.removeEventListener('play',update);audio.removeEventListener('pause',update);return;}el.querySelector('.player-title').textContent=tracks.find(t=>t.id===trackID)?.name||'Make room for your favorites.';el.querySelector('[data-action="play"]').textContent=audio.paused?'▶':'Ⅱ';el.querySelector('.player-seek').value=audio.duration?audio.currentTime/audio.duration*100:0;}
    function list(){el.querySelector('.track-list').innerHTML=tracks.map(t=>`<button class="local-row" data-track="${t.id}"><strong>♫　${E(t.name)}</strong><small>On My iPhone</small></button>`).join('')||'<p class="local-empty">Add audio files to your library.</p>';el.querySelectorAll('[data-track]').forEach(b=>b.onclick=async()=>{await selectTrack(b.dataset.track);await play();update();});update();}
    const input=el.querySelector('[type=file]');el.querySelector('[data-action="import"]').onclick=()=>input.click();input.onchange=async()=>{try{for(const file of input.files){const asset=L.id();await L.blobs('put',{id:asset,blob:file,kind:'audio'});tracks.push({id:L.id(),asset,name:file.name.replace(/\.[^.]+$/,'')});}L.save('tracks',tracks);if(!trackID)trackID=tracks[0]?.id;list();}catch(e){L.toast('Unable to save music.');}};
    el.querySelector('[data-action="play"]').onclick=play;el.querySelector('[data-action="prev"]').onclick=()=>next(-1);el.querySelector('[data-action="next"]').onclick=()=>next();el.querySelector('.player-seek').oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value)/100*audio.duration;};
    ['timeupdate','play','pause'].forEach(event=>audio.addEventListener(event,update));list();
  });
  Object.assign(OS.apps.music,{toggle:play,next:()=>next(),prev:()=>next(-1)});
  L.register('tv','TV',container=>{
    const el=L.section(container,'Watch Now',L.button('＋ Open Video','open'),'local-tv');el.querySelector('.local-content').innerHTML='<input type="file" accept="video/*" class="local-file-input" aria-label="Open video"><div class="tv-cover"><img src="assets/coast.jpg" alt="Mountain lake"><h2>Your own big picture.</h2><p>Bring a video from your device.</p></div><video class="local-video" controls playsinline hidden></video>';
    el.querySelector('[data-action="open"]').onclick=()=>el.querySelector('input').click();el.querySelector('input').onchange=e=>{const file=e.target.files[0];if(!file)return;const video=el.querySelector('video');video.src=URL.createObjectURL(file);video.onloadeddata=()=>URL.revokeObjectURL(video.src);video.hidden=false;el.querySelector('.tv-cover').hidden=true;video.play().catch(()=>{});};
  });
  OS.photoLibrary={all:()=>photos,src,addPhoto};
})();
