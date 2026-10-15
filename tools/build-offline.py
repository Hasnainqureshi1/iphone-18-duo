"""Regenerate the static offline asset list after adding scripts or assets."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
assets=['./','index.html','manifest.webmanifest']
for folder in ('css','js','assets'):
    assets += [p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file() and p.suffix in ('.css','.js','.png','.jpg','.svg')]
worker='''/* Local static app cache. No backend or external API. */
const CACHE='duo-experience-v4';
const ASSETS=ASSET_LIST;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('duo-experience-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok&&ASSETS.some(path=>new URL(path,self.registration.scope).href===request.url)){
      const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
    }
    return response;
  }).catch(async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    if(request.mode==='navigate')return caches.match('index.html');
    return new Response('Offline',{status:503});
  }));
});
'''.replace('ASSET_LIST',json.dumps(assets))
(root/'sw.js').write_text(worker,encoding='utf-8')
print('Offline assets:',len(assets))
