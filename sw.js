self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll([
            '/CB014174/',  // Update this path
            '/CB014174/index.html',  // Update this path
            '/CB014174/hayathospital.css',  // Update this path
            '/CB014174/script.js',  // Update this path
            '/CB014174/favicon_package_v0.16/favicon-32x32.png',  // Update this path
            '/CB014174/favicon_package_v0.16/favicon-16x16.png'  // Update this path
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