const CACHE_NAME = 'himig-v1'
const STATIC_CACHE = 'himig-static-v1'
const DYNAMIC_CACHE = 'himig-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/generate',
  '/dashboard',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error)
      })
  )
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Ensure the service worker takes control immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests
  if (url.origin !== self.location.origin) {
    return
  }
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful GET requests to specific endpoints
          if (response.status === 200 && url.pathname === '/api/tracks') {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request)
        })
    )
    return
  }
  
  // Handle static files and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone the response
            const responseToCache = response.clone()
            
            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // Network failed, show offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync for offline music generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-music-generation') {
    event.waitUntil(
      // Handle queued music generation requests
      handleBackgroundGeneration()
    )
  }
})

// Push notifications for generation completion
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'Your music generation is complete!',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'music-generation',
      data: {
        url: data.url || '/dashboard'
      },
      actions: [
        {
          action: 'view',
          title: 'View Track'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Himig AI', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// Helper function for background generation
async function handleBackgroundGeneration() {
  try {
    // Get queued requests from IndexedDB
    const queuedRequests = await getQueuedRequests()
    
    for (const request of queuedRequests) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data)
        })
        
        if (response.ok) {
          // Remove from queue and notify user
          await removeFromQueue(request.id)
          
          // Show notification
          self.registration.showNotification('Music Generated!', {
            body: 'Your AI music generation is complete',
            icon: '/icon-192x192.png',
            data: { url: '/dashboard' }
          })
        }
      } catch (error) {
        console.error('Background generation failed:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// IndexedDB helpers (simplified)
async function getQueuedRequests() {
  // Implementation would use IndexedDB to get queued requests
  return []
}

async function removeFromQueue(id) {
  // Implementation would remove request from IndexedDB
  console.log('Removing request from queue:', id)
}
