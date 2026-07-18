self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil((async function(){
    var ks=await caches.keys();
    await Promise.all(ks.map(function(k){return caches.delete(k);}));
    await self.registration.unregister();
    var cs=await self.clients.matchAll({type:'window'});
    cs.forEach(function(c){try{c.navigate(c.url);}catch(e){}});
  })());
});
