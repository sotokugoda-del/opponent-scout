const CACHE='opponent-scout-v67';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('opponent-scout-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isNavigation=e.request.mode==='navigate';
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(isNavigation){
      try{
        const response=await fetch(e.request,{cache:'no-store'});
        if(response.ok)await cache.put(e.request,response.clone());
        return response;
      }catch(err){return await cache.match(e.request)||await cache.match('./index.html')||Response.error()}
    }
    const cached=await cache.match(e.request);
    if(cached)return cached;
    try{
      const response=await fetch(e.request);
      if(response.ok)cache.put(e.request,response.clone());
      return response
    }catch(err){return Response.error()}
  })())
});
