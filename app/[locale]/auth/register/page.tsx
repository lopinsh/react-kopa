'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/actions/auth';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await registerUser(formData);
            if (!res.success) {
                setError(res.error || 'Registration failed');
                setLoading(false);
                return;
            }

            // Immediately sign in after registration
            const signInRes = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError('Could not sign in automatically.');
                setLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Reģistrēties</h1>
                    <p className="mt-2 text-sm text-foreground-muted">
                        Create your Ejam Kopā account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Vārds (Name)
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            E-pasts (Email)
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Parole (Password)
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <a href="/auth/signin" className="text-primary hover:underline">
                        Already have an account? Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}