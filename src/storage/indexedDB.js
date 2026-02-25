export default class IndexedDB {
    constructor() {
        this.db = null;
        this.openingPromise = null;
    }

    async openDB() {
        if (this.db) return;
        if (this.openingPromise) return this.openingPromise;

        this.openingPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('ScratchExtensionEditor', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('extensions')) {
                    db.createObjectStore('extensions', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });

        return this.openingPromise;
    }

    async ensureDB() {
        if (!this.db) {
            await this.openDB();
        }
    }

    async saveExtension(extension) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['extensions'], 'readwrite');
            const store = transaction.objectStore('extensions');
            const request = store.put(extension);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getExtension(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['extensions'], 'readonly');
            const store = transaction.objectStore('extensions');
            const request = store.get(id);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async deleteExtension(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['extensions'], 'readwrite');
            const store = transaction.objectStore('extensions');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllExtensions() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['extensions'], 'readonly');
            const store = transaction.objectStore('extensions');
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async clearExtensions() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['extensions'], 'readwrite');
            const store = transaction.objectStore('extensions');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
}