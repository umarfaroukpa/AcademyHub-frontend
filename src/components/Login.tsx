'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '../../lib/api';


interface LoginResponse {
        token: string;
        user: any; 
      }

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with:', email);
      
      

      const response = await api.post<LoginResponse>('/auth/login', { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      console.log('✅ Login successful, received token and user:', user);

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);

      console.log('🔑 Token stored, redirecting to dashboard...');
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('🔴 Login failed:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    
    // Simulate form submission
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleLogin(mockEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AcademiHub</h1>
          <p className="text-blue-100">Academic Management Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="border-t border-white/20 pt-6">
          <p className="text-white text-sm text-center mb-3">Quick Login (Testing)</p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('student@test.com', 'student123')}
              disabled={isLoading}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
            >
              Login as Student
            </button>
            <button
              onClick={() => quickLogin('lecturer@test.com', 'lecturer123')}
              disabled={isLoading}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
            >
              Login as Lecturer
            </button>
            <button
              onClick={() => quickLogin('admin@test.com', 'admin123')}
              disabled={isLoading}
              className="w-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
            >
              Login as Admin
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
         <p className="text-white/80 text-sm">
         Don't have an account?{' '}
         <Link href="/signup" className="text-blue-300 hover:text-blue-200 font-medium">
          Sign up here
        </Link>
         </p>
         </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Using real backend authentication
          </p>
        </div>
      </div>
    </div>
  );
}