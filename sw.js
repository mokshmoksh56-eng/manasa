const CACHE_NAME = 'manasa-pwa-v4'; // تم تحديث الإصدار لإجبار المتصفح على تحميل الأكواد الجديدة
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './talep.html',
  './mester.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 1. تثبيت الـ Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // تفعيل النسخة الجديدة فوراً دون انتظار
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // مسح أي إصدار قديم
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. استراتيجية Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // استثناء طلبات الخرائط (Leaflet) وقواعد بيانات Firebase من الكاش لأنها ديناميكية
  if (
    event.request.url.includes('openstreetmap') || 
    event.request.url.includes('nominatim') ||
    event.request.url.includes('firebaseio.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // تحديث الكاش بالنسخة الجديدة من الإنترنت في الخلفية
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // لو مفيش إنترنت، تجاهل الخطأ لأننا سنعرض الكاش
      });

      // إرجاع الكاش فوراً لسرعة التطبيق، أو انتظار الإنترنت لو لم يكن في الكاش
      return cachedResponse || fetchPromise;
    })
  );
});
