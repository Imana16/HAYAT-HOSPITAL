self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll([
            '/HAYAT-HOSPITAL/',  // Update this path
            '/HAYAT-HOSPITAL/index.html',  // Update this path
            '/HAYAT-HOSPITAL/hayathospital.css',  // Update this path
            '/HAYAT-HOSPITAL/script.js',  // Update this path
            '/HAYAT-HOSPITAL/favicon_package_v0.16/favicon-32x32.png',  // Update this path
            '/HAYAT-HOSPITAL/favicon_package_v0.16/favicon-16x16.png'  // Update this path
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
