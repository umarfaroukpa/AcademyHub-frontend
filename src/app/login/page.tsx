'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '../../../lib/api';
import { GraduationCap } from 'lucide-react';
import GoogleSignInWithRole from '../../components/GoogleSignInWithRole';

interface LoginResponse {
  token: string;
  user: any; 
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);

      window.dispatchEvent(new Event('userChanged'));

      console.log('🔑 Token stored, redirecting to dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
    } catch (error: any) {
      console.error('🔴 Login failed:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (data: any) => {
    console.log('✅ Google login successful:', data);
    
    const { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthToken(token);

    window.dispatchEvent(new Event('userChanged'));

    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const quickLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    
    // Use the actual login function instead of simulating form submission
    setTimeout(async () => {
      await handleLogin(new Event('submit') as any);
    }, 0);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
      data-testid="login-page"
    >
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/26265399.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.90) 50%, rgba(240, 147, 251, 0.85) 100%)',
        }}
      />

      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl w-full">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col items-start text-white space-y-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AcademiHub</h1>
              <p className="text-purple-100">Academic Management Platform</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
              Login Your Account
            </h2>
            <p className="text-lg text-purple-100">
              For the purpose of Academy regulation, your details are required.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-1000" />
              <span>24/7 Access</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            {/* Visible on all screen sizes for testing */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800" data-testid="login-title">
                Welcome Back!
              </h2>
              <p className="text-gray-600">Login to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email address*
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter email address"
                  required
                  data-testid="email-input"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                    data-testid="show-password-button"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div 
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  data-testid="error-message"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                data-testid="login-button"
              >
                {isLoading ? 'Logging in...' : 'Login Account'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Component */}
              <div className="mt-4">
                <GoogleSignInWithRole 
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
            </div>

            {/* Quick Login for Testing */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-3">Quick Login (Testing)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickLogin('student@test.com', 'student123')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  data-testid="quick-login-student"
                >
                  Student
                </button>
                <button
                  onClick={() => quickLogin('lecturer@test.com', 'lecturer123')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                  data-testid="quick-login-lecturer"
                >
                  Lecturer
                </button>
                <button
                  onClick={() => quickLogin('admin@test.com', 'admin123')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                  data-testid="quick-login-admin"
                >
                  Admin
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Haven't an Account?{' '}
              <Link 
                href="/signup" 
                className="text-purple-600 hover:text-purple-700 font-semibold"
                data-testid="signup-link"
              >
                Click Here to Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}