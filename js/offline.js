(function(){
  'use strict';
  const L=OS.local;
  let installPrompt=null;
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  if('serviceWorker' in navigator && location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  function readBlob(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}
  async function exportData(){
    try{
      const records=await L.blobs('getAll'),assets=[];
      for(const record of records)assets.push({...record,blob:undefined,data:await readBlob(record.blob)});
      const preferences={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('duo.local.'))preferences[key]=localStorage.getItem(key);}
      const payload={format:'duo-local-backup',version:1,preferences,notes:OS.get('notes'),assets};
      L.download(new Blob([JSON.stringify(payload)],{type:'application/json'}),'iphone-duo-backup.json');
    }catch(e){L.toast('Backup could not be created.');}
  }
  async function importData(file){
    try{
      const data=JSON.parse(await file.text());
      if(data.format!=='duo-local-backup'||data.version!==1||!Array.isArray(data.assets)||!Array.isArray(data.notes)||!data.preferences||typeof data.preferences!=='object')throw Error('Invalid backup');
      const records=[];
      for(const record of data.assets){if(typeof record.id!=='string'||typeof record.data!=='string'||!/^data:[^,]*;base64,/.test(record.data))throw Error('Invalid asset');const blob=await(await fetch(record.data)).blob();const {data:ignored,...metadata}=record;records.push({...metadata,blob});}
      for(const [key,value] of Object.entries(data.preferences)){if(!key.startsWith('duo.local.')||typeof value!=='string')throw Error('Invalid preferences');JSON.parse(value);}
      if(!data.notes.every(n=>n&&typeof n.id==='string'&&typeof n.body==='string'&&Number.isFinite(n.time)))throw Error('Invalid notes');
      OS.modals.open({title:'Restore this backup?',body:'This replaces local app lists and notes with the backup. Imported files are added to this device.',buttons:[{label:'Cancel'},{label:'Restore',onClick:async()=>{try{for(const record of records)await L.blobs('put',record);for(const [key,value]of Object.entries(data.preferences))localStorage.setItem(key,value);OS.set('notes',data.notes);setTimeout(()=>location.reload(),300);}catch(_){L.toast('Restore failed. Your browser may be out of storage.');}}}]});
    }catch(e){L.toast('That file is not a valid iPhone Duo backup.');}
  }
  document.getElementById('help-button').onclick=()=>OS.modals.open({title:'Make yourself at home.',body:'<p>Swipe up to unlock. Tap an app to open it. Use the top app menu for Split View, or Fold to continue on the outer display.</p><p>Notes, reminders, events, messages, and imported media stay in this browser. Phone calls, FaceTime, weather, maps, and payments use local demo data.</p><div class="storage-actions"><button data-storage="export">Export backup</button><button data-storage="import">Restore backup</button><button data-storage="install">Install app</button></div><input type="file" accept="application/json" hidden><p class="storage-status"></p>',onRender(layer){
    layer.querySelector('[data-storage="export"]').onclick=exportData;
    layer.querySelector('[data-storage="import"]').onclick=()=>layer.querySelector('input').click();
    layer.querySelector('input').onchange=e=>{if(e.target.files[0])importData(e.target.files[0]);};
    layer.querySelector('[data-storage="install"]').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else layer.querySelector('.storage-status').textContent='Use your browser’s Install app or Add to Home Screen command. Offline use is available after the first visit finishes caching.';};
    if(navigator.storage?.estimate)navigator.storage.estimate().then(s=>{if(layer.querySelector('.storage-status'))layer.querySelector('.storage-status').textContent='Local storage used: '+(s.usage/1024/1024).toFixed(1)+' MB';});
  }});
})();
