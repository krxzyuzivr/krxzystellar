/* Interstellar Service Worker - Cloudflare Optimized
  Paths are relative to the location of this file in the 'public' folder.
*/

importScripts("assets/bundled/v.bndl.js");
importScripts("assets/bundled/v.cnfg.js");
importScripts("assets/bundled/v.sw.js");

const uv = new UVServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      // Check if the request should be handled by the Ultraviolet proxy
      if (uv.route(event)) {
        return await uv.fetch(event);
      }
      // Otherwise, perform a standard fetch
      return await fetch(event.request);
    })(),
  );
});
