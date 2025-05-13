// Notification service for handling push notifications
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.subscription = null;
    this.registration = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return true;
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser');
      return false;
    }

    // Update permission state
    this.permission = Notification.permission;
    
    try {
      // Register service worker if not already registered
      this.registration = await navigator.serviceWorker.register('/notification-worker.js');
      console.log('Service Worker registered successfully:', this.registration);
      
      // If permission is already granted, initialize subscription
      if (this.permission === 'granted') {
        await this.initializeSubscription();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        await this.initializeSubscription();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async initializeSubscription() {
    try {
      if (!this.registration) {
        console.error('Service worker registration not found');
        return false;
      }
      
      // Get existing subscription
      const existingSubscription = await this.registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('Using existing push subscription:', existingSubscription);
        return true;
      }
      
      // Otherwise, create new subscription
      const response = await fetch('/api/notifications/vapidPublicKey');
      const data = await response.json();
      const publicKey = data.publicKey;
      
      if (!publicKey) {
        console.error('No VAPID public key found');
        return false;
      }
      
      // Convert public key to array buffer
      const applicationServerKey = this.urlBase64ToUint8Array(publicKey);
      
      // Subscribe to push service
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      console.log('New push subscription created:', this.subscription);
      return true;
    } catch (error) {
      console.error('Failed to initialize push subscription:', error);
      return false;
    }
  }

  async registerWithServer(token) {
    if (!this.subscription) {
      console.error('No subscription available');
      return false;
    }
    
    try {
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          subscription: this.subscription
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register subscription with server');
      }
      
      const data = await response.json();
      console.log('Subscription registered with server:', data);
      return true;
    } catch (error) {
      console.error('Error registering subscription with server:', error);
      return false;
    }
  }

  displayNotification(title, options = {}) {
    if (!('Notification' in window) || this.permission !== 'granted') {
      console.log('Cannot display notification: permission not granted');
      return;
    }
    
    try {
      return new Notification(title, options);
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  // Helper function to convert base64 string to Uint8Array for the applicationServerKey
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  // Send a test notification to verify service worker is working
  async testNotification() {
    try {
      const title = "Test Notification";
      const options = {
        body: "This is a test notification from the LMS platform.",
        icon: "/graduation-cap.svg",
        badge: "/graduation-cap.svg",
        tag: "test-notification",
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View App'
          }
        ]
      };
      
      // Try to display using service worker first
      if (this.registration) {
        await this.registration.showNotification(title, options);
        console.log('Test notification sent via service worker');
        return true;
      }
      
      // Fall back to regular Notification API
      this.displayNotification(title, options);
      console.log('Test notification sent via Notification API');
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  // Check if browser supports push notifications
  supportsPushNotifications() {
    return 'PushManager' in window;
  }

  // Keep the service worker alive with periodic messages
  keepServiceWorkerAlive() {
    if (!this.registration || !navigator.serviceWorker.controller) {
      return;
    }
    
    // Send a ping every 5 minutes to keep service worker active
    setInterval(() => {
      navigator.serviceWorker.controller.postMessage({
        type: 'PING',
        timestamp: Date.now()
      });
    }, 5 * 60 * 1000);
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
