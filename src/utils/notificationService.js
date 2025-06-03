class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.registration = null;
    this.init();
  }

  async init() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        this.registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        this.hasPermission = await this.checkPermission();
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  async checkPermission() {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    const permission = await Notification.requestPermission();
    this.hasPermission = permission === "granted";
    return this.hasPermission;
  }

  async subscribeToPush() {
    if (!this.hasPermission) {
      throw new Error("Notification permission not granted");
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      throw error;
    }
  }

  async unsubscribeFromPush() {
    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Notify server about unsubscribe
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push:", error);
      throw error;
    }
  }

  // Local notification methods
  showNotification(title, options = {}) {
    if (!this.hasPermission) {
      return;
    }

    const defaultOptions = {
      icon: "/assets/logo.png",
      badge: "/assets/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    this.registration.showNotification(title, {
      ...defaultOptions,
      ...options,
    });
  }

  // Notification types
  showProgressNotification(progress) {
    this.showNotification("Progress Update", {
      body: `You've completed ${progress.completed}% of ${progress.courseName}`,
      tag: "progress",
      requireInteraction: true,
    });
  }

  showAssignmentNotification(assignment) {
    this.showNotification("New Assignment", {
      body: `New assignment available: ${assignment.title}`,
      tag: "assignment",
      requireInteraction: true,
    });
  }

  showDeadlineNotification(deadline) {
    this.showNotification("Upcoming Deadline", {
      body: `${deadline.title} is due in ${deadline.timeLeft}`,
      tag: "deadline",
      requireInteraction: true,
    });
  }

  showAchievementNotification(achievement) {
    this.showNotification("Achievement Unlocked!", {
      body: `Congratulations! You've earned: ${achievement.title}`,
      tag: "achievement",
      requireInteraction: true,
    });
  }
}

export const notificationService = new NotificationService();
