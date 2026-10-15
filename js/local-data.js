/* Local-only persistence and shared UI helpers. No accounts or remote services. */
(function () {
  'use strict';
  const prefix = 'duo.local.';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key, fallback) {
    try { const value = localStorage.getItem(prefix + key); return value ? JSON.parse(value) : structuredClone(fallback); }
    catch (_) { return structuredClone(fallback); }
  }
  function save(key, value) {
    try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
    catch (_) { toast('Storage is full. Export your data or remove a few imported items.'); return false; }
    return true;
  }
  function toast(body) { OS.notifications.push({app:'iPhone',title:body,body:'',color:'#007aff'}); }
  function section(container, title, actions = '', classes = '') {
    const chrome=container.querySelector(':scope > .app-chrome-header');
    if(chrome)chrome.remove();
    container.innerHTML = `<section class="local-app ${classes}"><header class="local-heading"><h1>${escape(title)}</h1><div>${actions}</div></header><div class="local-content"></div></section>`;
    if(chrome)container.prepend(chrome);
    return container.querySelector('.local-app');
  }
  function button(text, action, cls = '') { return `<button class="${cls}" data-action="${action}">${text}</button>`; }
  function tabs(items, active) { return `<nav class="local-tabs">${items.map(([id,label])=>`<button data-tab="${id}" class="${id===active?'active':''}">${label}</button>`).join('')}</nav>`; }
  function register(id, name, mount, duoCapable = false) {
    OS.multitasking.registerApp({id,name,icon:OS.icons.svg(id),color:'#007aff',duoCapable,mount});
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function form(title, fields, onSave) {
    OS.modals.open({title,body:`<form class="local-form">${fields.map(f=>`<label>${escape(f.label)}${f.type==='textarea'?`<textarea name="${f.name}" rows="5">${escape(f.value||'')}</textarea>`:`<input name="${f.name}" type="${f.type||'text'}" value="${escape(f.value||'')}" ${f.required?'required':''}>`}</label>`).join('')}<button class="native-primary" type="submit">Save</button></form>`,buttons:[{label:'Cancel'}],onRender(layer){
      layer.querySelector('form').onsubmit = e => {e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));if(onSave(data)!==false)OS.modals.close();};
    }});
  }
  let database;
  function db() {
    if (!database) database = new Promise((resolve,reject)=>{
      const request=indexedDB.open('duo-assets',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    return database;
  }
  async function blobs(action,value) {
    const database=await db();
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('files',action==='get'||action==='getAll'?'readonly':'readwrite');
      const store=tx.objectStore('files'), request=value===undefined?store[action]():store[action](value);
      tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  }
  const urls=new Map();
  async function assetURL(id) {if(!urls.has(id)){const item=await blobs('get',id);if(item)urls.set(id,URL.createObjectURL(item.blob));}return urls.get(id);}
  async function removeAsset(id){await blobs('delete',id);if(urls.has(id)){URL.revokeObjectURL(urls.get(id));urls.delete(id);}}
  function id(){return crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2);}
  const views = {};
  OS.local={read,save,escape,toast,section,button,tabs,register,download,form,blobs,assetURL,removeAsset,id,views};
})();
