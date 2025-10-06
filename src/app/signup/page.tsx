'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '../../../lib/api';

interface SignupResponse {
  token: string;
  user: any;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'lecturer'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<SignupResponse>('/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role
      });
      
      const { token, user } = response.data;

      // ✅ Consider using httpOnly cookies instead of localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);

      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('🔴 Signup failed:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors: ValidationErrors = {};
        error.response.data.errors.forEach((err: any) => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.error || 'Signup failed. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AcademiHub</h1>
          <p className="text-blue-100">Create Your Account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.name ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.email ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="student" className="bg-gray-800">Student</option>
              <option value="lecturer" className="bg-gray-800">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.password ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="At least 8 characters with uppercase, lowercase & number"
              required
            />
            {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.general && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-white/80 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-300 hover:text-blue-200 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}