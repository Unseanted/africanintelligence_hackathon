// Service Worker for push notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Skip waiting to ensure the service worker activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
  // Claim clients so the service worker can control pages right away
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body || 'New notification',
        icon: data.icon || '/graduation-cap.svg',
        badge: data.badge || '/graduation-cap.svg',
        tag: data.tag || 'default',
        data: data.data || {},
        actions: data.actions || [],
        vibrate: [100, 50, 100],
        requireInteraction: data.requireInteraction || false,
        image: data.image || undefined,
        silent: data.silent || false
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'African Intelligence LMS', options)
      );
      
      // Log the notification receipt for debugging
      console.log('Push notification received:', data);
    } catch (error) {
      console.error('Error parsing push notification:', error);
      
      // Fallback notification if JSON parsing fails
      event.waitUntil(
        self.registration.showNotification('African Intelligence LMS', {
          body: 'You have a new notification',
          icon: '/graduation-cap.svg',
          badge: '/graduation-cap.svg'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  console.log('Notification clicked:', event.notification);
  
  // Handle notification click
  if (event.notification.data && event.notification.data.url) {
    // If a specific URL was provided, open that
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already an open window and navigate it to the URL
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        return clients.openWindow(event.notification.data.url);
      })
    );
  } else {
    // Default behavior: open the main app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (const client of windowClients) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification);
});

// Handle message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Handle caching URLs if needed
    console.log('Cache URLs request received', event.data.payload);
  }
  
  // Handle ping to keep service worker alive
  if (event.data && event.data.type === 'PING') {
    console.log('Ping received to keep service worker alive');
    // Send back a pong to confirm service worker is active
    event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
  }
});

// Handle fetch events for offline support if needed
self.addEventListener('fetch', (event) => {
  // This is a minimal implementation
  // For a real app, you would implement proper caching strategies here
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If there's no cached response, return a basic offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
            .then(offlineResponse => {
              return offlineResponse || new Response('You are offline.', {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        }
        
        // Return a simple error for other resources
        return new Response('Offline: Resource unavailable', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
