import axios from 'axios'
import { removeUserToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const apiClient = axios.create({
	baseURL: API_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true,
})

apiClient.interceptors.request.use((config) => config)

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && typeof window !== 'undefined') {
			removeUserToken()
			window.location.href = '/login'
		}
		return Promise.reject(error)
	},
)

export default apiClient
