/**
 * Storage Service
 * Handles LocalStorage and IndexedDB for offline data storage
 */

const DB_NAME = 'WeatherFarmDB'
const DB_VERSION = 1
const STORES = {
  WEATHER: 'weather',
  FARMING: 'farming',
  ALERTS: 'alerts',
  SETTINGS: 'settings',
}

let db = null

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Create object stores
      if (!database.objectStoreNames.contains(STORES.WEATHER)) {
        database.createObjectStore(STORES.WEATHER, { keyPath: 'id', autoIncrement: true })
      }
      if (!database.objectStoreNames.contains(STORES.FARMING)) {
        database.createObjectStore(STORES.FARMING, { keyPath: 'id', autoIncrement: true })
      }
      if (!database.objectStoreNames.contains(STORES.ALERTS)) {
        database.createObjectStore(STORES.ALERTS, { keyPath: 'id', autoIncrement: true })
      }
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

export const storageService = {
  /**
   * LocalStorage operations
   */
  localStorage: {
    get(key) {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error('Error reading from localStorage:', error)
        return null
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error('Error writing to localStorage:', error)
        return false
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error('Error removing from localStorage:', error)
        return false
      }
    },

    clear() {
      try {
        localStorage.clear()
        return true
      } catch (error) {
        console.error('Error clearing localStorage:', error)
        return false
      }
    },
  },

  /**
   * IndexedDB operations
   */
  async add(storeName, data) {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async get(storeName, key) {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getAll(storeName) {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async update(storeName, data) {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async delete(storeName, key) {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },
}

