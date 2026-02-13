'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Droplets } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { useRegister } from '@/hooks'

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const register = useRegister()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}

		register.mutate({ email, password })
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				{/* Brand */}
				<div className="text-center">
					<Droplets className="mx-auto h-10 w-10 text-brand-500" />
					<h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
						Create your account
					</h1>
					<p className="text-sm text-gray-500">
						Start tracking your hydration today
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
							placeholder="At least 6 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
							autoComplete="new-password"
						/>
						<Input
							label="Confirm Password"
							type="password"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							autoComplete="new-password"
						/>

						{(error || register.isError) && (
							<p className="text-sm text-red-500">
								{error ||
									(register.error as any)?.response?.data
										?.message ||
									'Registration failed'}
							</p>
						)}

						<Button
							type="submit"
							className="w-full"
							isLoading={register.isPending}
						>
							Create Account
						</Button>
					</form>
				</Card>

				<p className="text-center text-sm text-gray-500">
					Already have an account?{' '}
					<Link
						href="/login"
						className="font-medium text-brand-600 hover:text-brand-500"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	)
}
