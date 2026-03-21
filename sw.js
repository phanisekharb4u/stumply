// Stumply Service Worker v2 — offline support + push notifications
const CACHE = 'stumply-v2';
const ASSETS = ['/', '/index.html'];

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

// ── Fetch (offline cache) ────────────────────────────────────────────
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match('/index.html'))
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
