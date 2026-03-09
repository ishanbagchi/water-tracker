'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) return

		navigator.serviceWorker
			.register('/sw.js')
			.catch((err) => console.warn('SW registration failed:', err))

		let refreshing = false
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (refreshing) return
			refreshing = true
			window.location.reload()
		})
	}, [])

	return null
}
