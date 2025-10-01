'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, User, BookOpen, Users } from 'lucide-react';
import { setAuthToken } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        console.log('Already logged in, redirecting...');
        router.push('/dashboard');
      }
    }
  }, [router]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Mock users for testing
  const mockUsers = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'student@test.com', 
      password: 'student123', 
      role: 'student',
      year: 3,
      gpa: 3.7
    },
    { 
      id: 2, 
      name: 'Dr. Sarah Johnson', 
      email: 'lecturer@test.com', 
      password: 'lecturer123', 
      role: 'lecturer',
      department: 'Computer Science'
    },
    { 
      id: 3, 
      name: 'Admin Mike', 
      email: 'admin@test.com', 
      password: 'admin123', 
      role: 'admin',
      department: 'Administration'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    setError('Invalid email or password');
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = 'mock-token-' + Date.now();
  
  try {
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('token', token);
    
    // THIS IS THE KEY LINE - set the token in API headers
    setAuthToken(token);
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  } catch (err) {
    console.error('Error saving to localStorage:', err);
    setError('Failed to save login data');
  }
};

const quickLogin = (role: 'student' | 'lecturer' | 'admin') => {
  const user = mockUsers.find(u => u.role === role);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    const token = 'mock-token-' + Date.now();
    
    try {
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', token);
      
      // THIS IS THE KEY LINE - set the token in API headers
      setAuthToken(token);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Error in quick login:', err);
      setError('Failed to login');
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
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
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </form>

        <div className="border-t border-white/20 pt-6">
          <p className="text-white text-sm text-center mb-3 font-medium">Quick Login (Demo)</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => quickLogin('student')}
              className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">Student Portal</p>
                  <p className="text-blue-200 text-xs">Access courses and assignments</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => quickLogin('lecturer')}
              className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">Lecturer Portal</p>
                  <p className="text-blue-200 text-xs">Manage courses and grade students</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">Admin Portal</p>
                  <p className="text-blue-200 text-xs">Oversee platform and users</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-xs text-center mb-2 font-medium">Test Credentials:</p>
          <div className="space-y-1 text-white/60 text-xs">
            <p>👨‍🎓 Student: student@test.com / student123</p>
            <p>👨‍🏫 Lecturer: lecturer@test.com / lecturer123</p>
            <p>👨‍💼 Admin: admin@test.com / admin123</p>
          </div>
        </div>

        {/* Debug button - remove in production */}
        <button
          type="button"
          onClick={() => {
            console.log('Current localStorage:', {
              user: localStorage.getItem('user'),
              token: localStorage.getItem('token')
            });
          }}
          className="mt-4 w-full p-2 bg-white/5 text-white/50 text-xs rounded"
        >
          Debug: Check localStorage
        </button>
      </div>
    </div>
  );
}
