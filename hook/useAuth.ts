'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Start as true to avoid rendering protected content before local storage check
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    // Only proceed on the client
    if (typeof window === 'undefined') return;

    const userData = localStorage.getItem('user');
    
    if (!userData) {
      // If no data, user is unauthenticated. Redirect and stop loading.
      router.push('/');
      setIsLoading(false); // Stop loading after redirect
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data, logging out:', error);
      // Clear storage if data is corrupted
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
    // Added setUser and setIsLoading to the dependency array for completeness,
    
  }, [router, setUser, setIsLoading]); 

  const logout = () => {
    // Check is redundant because the hook is 'use client', but harmless.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return { user, isLoading, logout };
}