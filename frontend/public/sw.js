const CACHE_NAME = 'hydrotrack-v1'

// App shell — static assets to pre-cache on install
const APP_SHELL = ['/', '/manifest.json', '/favicon.svg']

// ── Install: pre-cache app shell ──
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	)
	self.skipWaiting()
})

// ── Activate: clean old caches ──
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			),
	)
	self.clients.claim()
})

// ── Fetch strategy ──
// API calls:      network-first (fall back to cache for offline reads)
// Static assets:  cache-first  (fall back to network)
self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Skip non-GET and chrome-extension requests
	if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return

	// API requests → network-first
	if (url.pathname.startsWith('/api')) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const clone = response.clone()
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(request, clone))
					return response
				})
				.catch(() => caches.match(request)),
		)
		return
	}

	// Everything else → cache-first
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached
			return fetch(request).then((response) => {
				// Only cache same-origin successful responses
				if (response.ok && url.origin === self.location.origin) {
					const clone = response.clone()
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(request, clone))
				}
				return response
			})
		}),
	)
})
