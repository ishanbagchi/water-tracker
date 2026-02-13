import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Pre-configured Axios instance.
 * – Automatically attaches the JWT from localStorage.
 * – Base URL points at the NestJS backend.
 */
const apiClient = axios.create({
	baseURL: API_URL,
	headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach token ──
apiClient.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('ht_token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
	}
	return config
})

// ── Response interceptor: unwrap data, handle 401 ──
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && typeof window !== 'undefined') {
			localStorage.removeItem('ht_token')
			window.location.href = '/login'
		}
		return Promise.reject(error)
	},
)

export default apiClient
