const CACHE_NAME = "mi-tienda-cache-v84";
const URLS_A_CACHEAR = [
  "/",
  "/index.html",
  "/catalogo.html",
  "/carrito.html",
  "/css/styles.css",
  "/js/scripts.js",
  "/js/carrito.js",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/imagenes/logocirculo.png",
  "/imagenes/video_inicio.mp4"  
];



self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_A_CACHEAR).catch(err => {
        console.log("Error cacheando archivos:", err);
      });
    })
  );
  self.skipWaiting();
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
      fetch(event.request).then((respuestaRed) => {
        
          if (
              event.request.method === "GET" && 
              event.request.url.startsWith(self.location.origin) && 
              respuestaRed && respuestaRed.ok &&
              respuestaRed.status !== 206
          ) {
              return caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, respuestaRed.clone());
                  return respuestaRed;
              });
          }
          return respuestaRed; 
      }).catch(() => caches.match(event.request).then((respuestaCache) => {
          return respuestaCache || caches.match("/index.html");
      }))
  );
});




self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});



// self.addEventListener("push", (event) => {
 // const data = event.data.json();
 // self.registration.showNotification(data.title, {
//      body: data.message,
 //     icon: "/icono.png"
 //// });
//});
//