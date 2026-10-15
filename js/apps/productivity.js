(function () {
  'use strict';
  const L=OS.local,E=L.escape;
  let noteID=null,noteQuery='';
  L.register('notes','Notes',(container,opts)=>{
    function editor(target,note){
      if(!note){L.section(target,'Notes').querySelector('.local-content').innerHTML='<div class="local-empty">Select a note or start something new.</div>';return;}
      const el=L.section(target,'',L.button('‹ Notes','back')+L.button('↓','export')+L.button('Delete','delete'),'local-notes');
      el.querySelector('.local-content').innerHTML=`<p class="local-date">${new Date(note.time).toLocaleString()}</p><textarea class="local-note-editor" aria-label="Note" placeholder="Start writing…"></textarea><div class="local-note-tools"><button data-action="checklist">☑ Checklist</button><span>Saved on this device</span></div>`;
      const input=el.querySelector('textarea');input.value=note.body;
      function save(){note.body=input.value;note.time=Date.now();OS.set('notes',OS.get('notes').slice());}
      input.oninput=save;
      el.querySelector('[data-action="back"]').onclick=()=>{noteID=null;render();};
      el.querySelector('[data-action="checklist"]').onclick=()=>{const start=input.selectionStart;input.setRangeText('\n☐ ',start,input.selectionEnd,'end');save();input.focus();};
      el.querySelector('[data-action="export"]').onclick=()=>L.download(new Blob([note.body],{type:'text/plain'}),(note.body.split('\n')[0].slice(0,40)||'Note')+'.txt');
      el.querySelector('[data-action="delete"]').onclick=()=>{OS.modals.open({title:'Delete this note?',buttons:[{label:'Cancel'},{label:'Delete',role:'danger',onClick:()=>{OS.set('notes',OS.get('notes').filter(n=>n.id!==note.id));noteID=null;render();}}]});};
    }
    function render(){
      const notes=OS.get('notes'),current=notes.find(n=>n.id===noteID);
      if(current&&!opts.spanned){editor(container,current);return;}
      const el=L.section(container,'Notes',L.button('＋','add'),'local-notes');
      el.querySelector('.local-content').innerHTML=`<input class="local-search" placeholder="Search" aria-label="Search notes" value="${E(noteQuery)}"><div class="local-group note-results"></div><p class="local-caption">${notes.length} notes</p>`;
      function list(){const filtered=notes.filter(n=>n.body.toLowerCase().includes(noteQuery.toLowerCase())).sort((a,b)=>b.time-a.time);el.querySelector('.note-results').innerHTML=filtered.map(n=>`<button class="local-row" data-note="${n.id}"><strong>${E(n.body.split('\n')[0]||'New Note')}</strong><small>${new Date(n.time).toLocaleDateString()}　${E(n.body.split('\n').slice(1).join(' ').slice(0,65))}</small></button>`).join('')||'<p class="local-empty">No notes</p>';el.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{noteID=b.dataset.note;render();});}
      el.querySelector('input').oninput=e=>{noteQuery=e.target.value;list();};list();
      el.querySelector('[data-action="add"]').onclick=()=>{const n={id:L.id(),body:'',time:Date.now()};OS.set('notes',[...notes,n]);noteID=n.id;render();};
      if(opts.spanned)editor(opts.otherContainer,current);
    }
    render();
  },true);

  let reminderFilter='all';
  L.register('reminders','Reminders',container=>{
    let items=L.read('reminders',[{id:'r1',text:'Pack for the weekend',date:'',done:false},{id:'r2',text:'Find a new hiking trail',date:'',done:false}]);
    function render(){const el=L.section(container,'Reminders',L.button('＋','add'),'local-reminders');
      el.querySelector('.local-content').innerHTML=`<div class="reminder-summary"><button data-filter="all"><span>☷ All</span><strong>${items.filter(x=>!x.done).length}</strong></button><button data-filter="today"><span>▣ Today</span><strong>${items.filter(x=>x.date===new Date().toLocaleDateString('en-CA')&&!x.done).length}</strong></button><button data-filter="completed"><span>✓ Completed</span><strong>${items.filter(x=>x.done).length}</strong></button></div><h2>${reminderFilter==='completed'?'Completed':'My List'}</h2><div class="local-group">${items.filter(x=>reminderFilter==='completed'?x.done:!x.done&&(reminderFilter!=='today'||x.date===new Date().toLocaleDateString('en-CA'))).map(x=>`<div class="reminder-item"><button data-check="${x.id}" aria-label="${x.done?'Restore':'Complete'} ${E(x.text)}">${x.done?'●':'○'}</button><button data-edit="${x.id}"><strong>${E(x.text)}</strong><small>${E(x.date)}</small></button><button data-remove="${x.id}" aria-label="Delete reminder">×</button></div>`).join('')||'<p class="local-empty">All caught up.</p>'}</div>`;
      function persist(){if(L.save('reminders',items))render();}
      function edit(item){L.form(item?'Edit Reminder':'New Reminder',[{name:'text',label:'Title',value:item?.text,required:true},{name:'date',label:'Due date',type:'date',value:item?.date}],data=>{if(!data.text.trim())return false;if(item)Object.assign(item,data);else items.push({...data,id:L.id(),done:false});persist();});}
      el.querySelector('[data-action="add"]').onclick=()=>edit();el.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{reminderFilter=b.dataset.filter;render();});
      el.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const item=items.find(x=>x.id===b.dataset.check);item.done=!item.done;persist();});
      el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(items.find(x=>x.id===b.dataset.edit)));
      el.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{items=items.filter(x=>x.id!==b.dataset.remove);persist();});
    }render();
  });

  let calendarDate=new Date();
  L.register('calendar','Calendar',container=>{
    let events=L.read('events',[]);
    const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    function render(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth(),day=calendarDate.getDate(),key=dateKey(calendarDate);
      const el=L.section(container,'Calendar',L.button('Today','today')+L.button('＋','add'),'local-calendar');
      el.querySelector('.local-content').innerHTML=`<div class="calendar-navigation"><button data-action="prev" aria-label="Previous month">‹</button><h2>${calendarDate.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h2><button data-action="next" aria-label="Next month">›</button></div><div class="calendar-grid">${'SMTWTFS'.split('').map(x=>'<small>'+x+'</small>').join('')}${'<span></span>'.repeat(new Date(y,m,1).getDay())}${Array.from({length:new Date(y,m+1,0).getDate()},(_,i)=>`<button data-day="${i+1}" class="${day===i+1?'selected':''}">${i+1}</button>`).join('')}</div><h3>${calendarDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h3><div class="local-group">${events.filter(e=>e.date===key).sort((a,b)=>a.time.localeCompare(b.time)).map(e=>`<button class="local-row calendar-event" data-event="${e.id}"><small>${E(e.time||'All day')}</small><strong>${E(e.title)}</strong><small>${E(e.location)}</small></button>`).join('')||'<p class="local-empty">No events today</p>'}</div>`;
      function edit(event){L.form(event?'Edit Event':'New Event',[{name:'title',label:'Title',value:event?.title,required:true},{name:'date',label:'Date',type:'date',value:event?.date||key,required:true},{name:'time',label:'Time',type:'time',value:event?.time||'09:00'},{name:'location',label:'Location',value:event?.location}],data=>{if(!data.title.trim())return false;if(event)Object.assign(event,data);else events.push({...data,id:L.id()});L.save('events',events);render();});}
      el.querySelector('[data-action="add"]').onclick=()=>edit();el.querySelector('[data-action="today"]').onclick=()=>{calendarDate=new Date();render();};
      ['prev','next'].forEach((action,i)=>el.querySelector(`[data-action="${action}"]`).onclick=()=>{calendarDate=new Date(y,m+(i?1:-1),1);render();});
      el.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarDate=new Date(y,m,Number(b.dataset.day));render();});
      el.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>{const event=events.find(x=>x.id===b.dataset.event);OS.modals.open({title:E(event.title),body:`${E(event.date)} · ${E(event.time)}<p>${E(event.location)}</p>`,buttons:[{label:'Edit',onClick:()=>setTimeout(()=>edit(event),0)},{label:'Delete',role:'danger',onClick:()=>{events=events.filter(x=>x.id!==event.id);L.save('events',events);render();}},{label:'Done'}]});});
    }render();
  });

  let folder='On My iPhone',fileQuery='';
  L.register('files','Files',(container,opts)=>{
    let folders=L.read('folders',['On My iPhone','Downloads','Documents']);
    async function render(){const el=L.section(container,'Browse',L.button('New Folder','folder')+L.button('＋','import'),'local-files');
      el.querySelector('.local-content').innerHTML=`<input class="local-search" aria-label="Search files" placeholder="Search" value="${E(fileQuery)}"><div class="folder-chips">${folders.map(x=>`<button data-folder="${E(x)}" class="${x===folder?'active':''}">▰ ${E(x)}</button>`).join('')}</div><input type="file" class="local-file-input" multiple aria-label="Import files"><div class="file-results local-group"><p class="local-empty">Loading…</p></div>`;
      el.querySelector('[data-action="folder"]').onclick=()=>L.form('New Folder',[{name:'name',label:'Name',required:true}],data=>{const name=data.name.trim();if(!name||folders.includes(name))return false;folders.push(name);L.save('folders',folders);folder=name;render();});
      const input=el.querySelector('[type="file"]');el.querySelector('[data-action="import"]').onclick=()=>input.click();
      input.onchange=async()=>{try{for(const file of input.files)await L.blobs('put',{id:L.id(),name:file.name,folder,blob:file,type:file.type,size:file.size,time:Date.now(),kind:'file'});render();}catch(e){L.toast('Unable to save files. Check available storage.');}};
      el.querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>{folder=b.dataset.folder;render();});
      let all;try{all=await L.blobs('getAll');}catch(e){el.querySelector('.file-results').textContent='Storage is unavailable in this browser.';return;}if(!el.isConnected)return;
      function list(){const files=all.filter(f=>f.kind==='file'&&f.folder===folder&&f.name.toLowerCase().includes(fileQuery.toLowerCase()));el.querySelector('.file-results').innerHTML=files.map(f=>`<button class="local-row file-row" data-file="${f.id}"><span>▤</span><div><strong>${E(f.name)}</strong><small>${Math.max(1,Math.round(f.size/1024))} KB · ${new Date(f.time).toLocaleDateString()}</small></div></button>`).join('')||'<p class="local-empty">This folder is empty.<br>Import a file to get started.</p>';el.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>preview(all.find(f=>f.id===b.dataset.file)));}
      el.querySelector('.local-search').oninput=e=>{fileQuery=e.target.value;list();};list();
    }
    async function preview(file){const target=opts.spanned?opts.otherContainer:container;const el=L.section(target,file.name,L.button('‹ Browse','back')+L.button('↓','download')+L.button('•••','more'),'local-files');const body=el.querySelector('.local-content');
      el.querySelector('[data-action="back"]').onclick=render;
      el.querySelector('[data-action="download"]').onclick=()=>L.download(file.blob,file.name);
      el.querySelector('[data-action="more"]').onclick=()=>OS.modals.open({title:E(file.name),buttons:[{label:'Rename',onClick:()=>setTimeout(()=>L.form('Rename',[{name:'name',label:'Name',required:true,value:file.name}],data=>{if(!data.name.trim())return false;file.name=data.name.trim();L.blobs('put',file).then(()=>preview(file)).catch(()=>L.toast('Could not rename file'));}),0)},{label:'Delete',role:'danger',onClick:()=>L.removeAsset(file.id).then(()=>{render();if(opts.spanned)L.section(target,'Files');}).catch(()=>L.toast('Could not delete file'))},{label:'Cancel'}]});
      if(file.type.startsWith('image/')){const img=document.createElement('img');img.className='file-image';img.src=await L.assetURL(file.id);img.alt=file.name;body.appendChild(img);}
      else if(file.type.startsWith('text/')||/\.(txt|md|csv|json)$/i.test(file.name)){const pre=document.createElement('pre');pre.className='file-text';pre.textContent=(await file.blob.text()).slice(0,200000);body.appendChild(pre);}
      else if(file.type.startsWith('audio/')||file.type.startsWith('video/')){const media=document.createElement(file.type.startsWith('audio/')?'audio':'video');media.controls=true;media.src=await L.assetURL(file.id);media.style.width='100%';body.appendChild(media);}
      else body.innerHTML='<div class="local-empty">▤<h2>'+E(file.name)+'</h2><p>Download this file to open it.</p></div>';
    }
    render();if(opts.spanned)L.section(opts.otherContainer,'Files').querySelector('.local-content').innerHTML='<div class="local-empty">Select a file to preview</div>';
  },true);
})();
