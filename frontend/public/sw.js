// ZenPress Service Worker - PWA Cache Strategy + Background Sync
const CACHE_NAME = 'zenpress-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Background Sync Queue
let syncQueue = [];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ZenPress: Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('ZenPress: Background sync triggered');
  
  if (event.tag === 'zenpress-sync') {
    event.waitUntil(
      processSyncQueue()
    );
  }
});

// Process queued actions when connection is restored
async function processSyncQueue() {
  console.log('ZenPress: Processing sync queue', syncQueue.length, 'items');
  
  while (syncQueue.length > 0) {
    const item = syncQueue.shift();
    
    try {
      // Process different types of sync actions
      switch (item.type) {
        case 'user-registration':
          await syncUserRegistration(item.data);
          break;
        case 'technique-favorite':
          await syncTechniqueFavorite(item.data);
          break;
        case 'session-history':
          await syncSessionHistory(item.data);
          break;
        default:
          console.log('ZenPress: Unknown sync type:', item.type);
      }
      
      console.log('ZenPress: Successfully synced item:', item.type);
    } catch (error) {
      console.error('ZenPress: Sync failed for item:', item.type, error);
      // Put item back in queue for retry
      syncQueue.push(item);
      break; // Stop processing queue on error
    }
  }
}

// Sync functions
async function syncUserRegistration(data) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('User registration sync failed');
}

async function syncTechniqueFavorite(data) {
  const response = await fetch(`/api/users/${data.userId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ techniqueId: data.techniqueId })
  });
  if (!response.ok) throw new Error('Favorite sync failed');
}

async function syncSessionHistory(data) {
  const response = await fetch(`/api/users/${data.userId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data.session)
  });
  if (!response.ok) throw new Error('Session history sync failed');
}

// Message handler for adding items to sync queue
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'QUEUE_SYNC') {
    syncQueue.push(event.data.payload);
    console.log('ZenPress: Queued for sync:', event.data.payload.type);
    
    // Register sync event
    self.registration.sync.register('zenpress-sync').catch((err) => {
      console.error('ZenPress: Sync registration failed:', err);
    });
  }
});

// Fetch Strategy - Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a response, clone it and store it in cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If not in cache, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('ZenPress: Background sync triggered');
    // Handle background sync logic here
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova técnica de acupressão disponível!',
    icon: '/images/icon-192.png',
    badge: '/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver técnicas',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ZenPress', options)
  );
});