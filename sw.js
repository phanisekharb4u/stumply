// Stumply Service Worker v3 — offline support + push notifications
const CACHE = 'stumply-v3';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// ── Install ──────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// ── Fetch: network first so new versions reach users; cache is the offline fallback
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // never touch cloud-sync calls
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(cached => cached || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error()))
    )
  );
});

// ── Show Notification ────────────────────────────────────────────────
// Called by the app via postMessage OR by a push event
function showNotification(title, body, tag, url) {
  return self.registration.showNotification(title, {
    body:    body,
    tag:     tag || 'stumply',
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    vibrate: [100, 50, 100],
    data:    { url: url || '/' },
    actions: [
      { action: 'view', title: '▶ View Live' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ],
    requireInteraction: false,
    renotify: true
  });
}

// ── Message from app → show notification ────────────────────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = e.data;
    e.waitUntil(showNotification(title, body, tag, url));
  }
});

// ── Notification click ───────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Focus existing window if open
      for (let c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.focus();
          c.postMessage({ type: 'NOTIFICATION_CLICK', url });
          return;
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Push event (for future server-side push) ─────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const d = e.data.json();
    e.waitUntil(showNotification(d.title, d.body, d.tag, d.url));
  } catch {
    e.waitUntil(showNotification('Stumply', e.data.text(), 'stumply'));
  }
});
