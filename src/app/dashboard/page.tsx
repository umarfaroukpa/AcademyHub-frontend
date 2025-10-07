'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentDashboard from '../../components/StudentsDashboard';
import LecturerDashboard from '../../components/LecturersDashboard';
import AdminDashboard from '../../components/AdminDashboard';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log('Dashboard: Checking authentication...');
    
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        console.log('Dashboard: userData from localStorage:', userData);
        
        if (!userData) {
          console.log('Dashboard: No user data, redirecting to login');
          router.replace('/');
          setIsLoading(false);
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        console.log('Dashboard: Parsed user:', parsedUser);
        
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard: Error loading user:', error);
        localStorage.clear();
        router.replace('/');
        setIsLoading(false);
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(loadUser, 50);
    return () => clearTimeout(timer);
  }, [mounted, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* REMOVED THE DUPLICATE NAV - Header component in layout.tsx handles this */}
      
      <div className="max-w-7xl mx-auto p-6">
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'lecturer' && <LecturerDashboard />}
        {user.role === 'admin' && <AdminDashboard />}

        {!['student', 'lecturer', 'admin'].includes(user.role) && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">Invalid user role: {user.role}</p>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                router.replace('/');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}