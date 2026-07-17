/* 攻殻機動隊
   网络优先：拿到最新代码即用，用户无需重装桌面图标；离线回退缓存。
   只处理【同源 GET】——AI 接口/NovelAI 中转/生图等跨域请求一律放行、绝不拦截。 */
const CACHE = 'gits-v2';
const SHELL = ['/'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async function () {
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        const c = await caches.open(CACHE); c.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') { const shell = await caches.match('/'); if (shell) return shell; }
      throw err;
    }
  })());
});
