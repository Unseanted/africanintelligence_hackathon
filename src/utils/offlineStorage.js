import { openDB } from "idb";

const DB_NAME = "student-portal-db";
const DB_VERSION = 1;

const STORES = {
  PROGRESS: "progress",
  CHAT_HISTORY: "chat-history",
  COURSE_CONTENT: "course-content",
  SYNC_QUEUE: "sync-queue",
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Progress store
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS, { keyPath: "id" });
        }

        // Chat history store
        if (!db.objectStoreNames.contains(STORES.CHAT_HISTORY)) {
          db.createObjectStore(STORES.CHAT_HISTORY, { keyPath: "id" });
        }

        // Course content store
        if (!db.objectStoreNames.contains(STORES.COURSE_CONTENT)) {
          db.createObjectStore(STORES.COURSE_CONTENT, { keyPath: "id" });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  }

  // Progress tracking methods
  async saveProgress(progress) {
    return this.db.put(STORES.PROGRESS, progress);
  }

  async getProgress(id) {
    return this.db.get(STORES.PROGRESS, id);
  }

  async getAllProgress() {
    return this.db.getAll(STORES.PROGRESS);
  }

  // Chat history methods
  async saveChat(chat) {
    return this.db.put(STORES.CHAT_HISTORY, chat);
  }

  async getChat(id) {
    return this.db.get(STORES.CHAT_HISTORY, id);
  }

  async getAllChats() {
    return this.db.getAll(STORES.CHAT_HISTORY);
  }

  // Course content methods
  async saveCourseContent(content) {
    return this.db.put(STORES.COURSE_CONTENT, content);
  }

  async getCourseContent(id) {
    return this.db.get(STORES.COURSE_CONTENT, id);
  }

  async getAllCourseContent() {
    return this.db.getAll(STORES.COURSE_CONTENT);
  }

  // Sync queue methods
  async addToSyncQueue(item) {
    return this.db.add(STORES.SYNC_QUEUE, {
      ...item,
      timestamp: Date.now(),
      status: "pending",
    });
  }

  async getSyncQueue() {
    return this.db.getAll(STORES.SYNC_QUEUE);
  }

  async updateSyncStatus(id, status) {
    const item = await this.db.get(STORES.SYNC_QUEUE, id);
    if (item) {
      item.status = status;
      return this.db.put(STORES.SYNC_QUEUE, item);
    }
  }

  // Sync method
  async sync() {
    const queue = await this.getSyncQueue();
    const pendingItems = queue.filter((item) => item.status === "pending");

    for (const item of pendingItems) {
      try {
        // Attempt to sync the item
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });

        if (response.ok) {
          await this.updateSyncStatus(item.id, "completed");
        } else {
          await this.updateSyncStatus(item.id, "failed");
        }
      } catch (error) {
        console.error("Sync error:", error);
        await this.updateSyncStatus(item.id, "failed");
      }
    }
  }
}

export const offlineStorage = new OfflineStorage();
