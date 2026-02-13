'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Droplets } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { useLogin } from '@/hooks'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const login = useLogin()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		login.mutate({ email, password })
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				{/* Brand */}
				<div className="text-center">
					<Droplets className="mx-auto h-10 w-10 text-brand-500" />
					<h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
						Welcome back
					</h1>
					<p className="text-sm text-gray-500">
						Sign in to your HydroTrack account
					</p>
				</div>

				<Card>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label="Email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
						<Input
							label="Password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
						/>

						{login.isError && (
							<p className="text-sm text-red-500">
								{(login.error as any)?.response?.data
									?.message || 'Invalid credentials'}
							</p>
						)}

						<Button
							type="submit"
							className="w-full"
							isLoading={login.isPending}
						>
							Sign In
						</Button>
					</form>
				</Card>

				<p className="text-center text-sm text-gray-500">
					Don&apos;t have an account?{' '}
					<Link
						href="/register"
						className="font-medium text-brand-600 hover:text-brand-500"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}
