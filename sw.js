/* Local static app cache. No backend or external API. */
const CACHE='duo-experience-v4';
const ASSETS=["./", "index.html", "manifest.webmanifest", "css/animations.css", "css/apps.css", "css/base.css", "css/device.css", "css/duo.css", "css/icons.css", "css/ios.css", "css/local-apps.css", "js/app.js", "js/asset-manifest.js", "js/control-center.js", "js/device.js", "js/duo.js", "js/gestures.js", "js/icons.js", "js/keyboard.js", "js/local-data.js", "js/multitasking.js", "js/notifications.js", "js/offline.js", "js/state.js", "js/apps/calculator.js", "js/apps/camera.js", "js/apps/clock.js", "js/apps/communication-local.js", "js/apps/explore-local.js", "js/apps/files.js", "js/apps/home.js", "js/apps/media-local.js", "js/apps/messages.js", "js/apps/music.js", "js/apps/native.js", "js/apps/notes.js", "js/apps/photos.js", "js/apps/placeholders.js", "js/apps/productivity.js", "js/apps/safari.js", "js/apps/settings.js", "js/apps/weather.js", "assets/app-icon.svg", "assets/coast.jpg", "assets/dunes.jpg", "assets/forest.jpg", "assets/memory.jpg", "assets/mojave.jpg", "assets/icons/calendar.png", "assets/icons/camera.png", "assets/icons/facetime.png", "assets/icons/files.png", "assets/icons/health.png", "assets/icons/mail.png", "assets/icons/maps.png", "assets/icons/messages.png", "assets/icons/music.png", "assets/icons/notes.png", "assets/icons/phone.png", "assets/icons/photos.png", "assets/icons/reminders.png", "assets/icons/safari.png", "assets/icons/shortcuts.png", "assets/icons/tv.png", "assets/icons/wallet.png", "assets/icons/weather.png"];
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
