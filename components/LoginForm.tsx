'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BigButton from './ui/BigButton';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        router.push('/home');
        router.refresh();
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-teal-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🧼</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Zeshto Studio</h1>
          <p className="text-gray-500 mt-1">Your private content creator</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-base bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-base bg-white transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1.5 pl-1">
              Hint: starts with N, ends with 9
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <BigButton type="submit" loading={loading} className="mt-2">
            {loading ? 'Signing in…' : 'Sign in →'}
          </BigButton>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Private app — owner access only
        </p>
      </div>
    </div>
  );
}
