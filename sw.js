/* =========================================================
   SERVICE WORKER – sorgt dafür, dass die App offline läuft.

   Strategie "erst Netz, dann Speicher":
   - Mit Internet: Die Dateien werden frisch geladen und
     gleichzeitig im Speicher (Cache) abgelegt.
     => Deine Änderungen sind sofort auf dem iPhone sichtbar.
   - Ohne Internet: Die App nimmt die Dateien aus dem Cache.
   ========================================================= */

const CACHE_NAME = "aufgabe-v1";

// Diese Dateien werden beim ersten Start sofort gespeichert.
// Wenn du eine neue Datei hinzufügst, trag sie hier ein.
const DATEIEN = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// Installation: alle Dateien in den Cache legen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(DATEIEN))
  );
  self.skipWaiting();
});

// Aktivierung: alte Caches (andere Versionsnamen) löschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Jede Anfrage: erst Netz versuchen, bei Fehler den Cache nehmen
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
