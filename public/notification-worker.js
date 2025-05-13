// This is the service worker for handling push notifications

self.addEventListener('install', event => {
  console.log('Notification Service Worker installing...');
  // Skip waiting to ensure the service worker activates immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('Notification Service Worker activated!');
  // Claim any clients that match, so the service worker starts controlling them
  event.waitUntil(self.clients.claim());
});

// Handle incoming push messages
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received:', event);
  
  if (!event.data) {
    console.log('Push event has no data. Using default notification content.');
    event.waitUntil(
      self.registration.showNotification('African Intelligence LMS', {
        body: 'You have a new notification',
        icon: '/graduation-cap.svg',
        badge: '/graduation-cap.svg'
      })
    );
    return;
  }
  
  try {
    const data = event.data.json();
    console.log('Push data received:', data);
    
    const title = data.title || 'African Intelligence LMS';
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/graduation-cap.svg',
      badge: data.badge || '/graduation-cap.svg',
      tag: data.tag || 'default',
      data: data.data || {},
      vibrate: [100, 50, 100],
      // Required for notification actions
      actions: data.actions || [],
      // Show notification even when page is in foreground
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
      // Image to show in notification
      image: data.image || undefined,
      // Don't show a sound/vibration
      silent: data.silent || false
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification if JSON parsing fails
    event.waitUntil(
      self.registration.showNotification('African Intelligence LMS', {
        body: 'You have a new notification',
        icon: '/graduation-cap.svg',
        badge: '/graduation-cap.svg'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  notification.close();
  
  // Extract data payload
  const data = notification.data || {};
  
  // Get URL to open (default to /)
  const url = data.url || '/';
  
  // Focus existing window/tab if available, or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if any client already exists and focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open with the URL, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch(err => console.error('Error handling notification click:', err))
  );
});

// Handle notification close event
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification);
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Handle caching URLs if needed
    console.log('Cache URLs request received', event.data.payload);
  }
  
  // Handle ping to keep service worker alive
  if (event.data && event.data.type === 'PING') {
    console.log('Ping received to keep service worker alive');
    // Send back a pong to confirm service worker is active
    if (event.ports && event.ports.length > 0) {
      event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
    }
  }
});

// Simple fetch handler for offline support
self.addEventListener('fetch', event => {
  // Only attempt to handle GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Return the network response
        return response;
      })
      .catch(() => {
        // If network fetch fails, try to return from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            // If we have a cached response, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If the request is for a page navigation, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html')
                .then(offlineResponse => {
                  return offlineResponse || new Response('You are offline and page is not cached.', {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
            }
            
            // Return a simple error for other resources (images, etc.)
            return new Response('Network error occurred.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Keep service worker alive
self.addEventListener('periodicsync', event => {
  if (event.tag === 'keep-alive') {
    console.log('Periodic sync to keep service worker alive');
  }
});
