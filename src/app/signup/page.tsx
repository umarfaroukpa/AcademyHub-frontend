'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '../../../lib/api';
import { GraduationCap, Lock, Crown } from 'lucide-react';
import GoogleSignInWithRole from '../../components/GoogleSignInWithRole';
import type { AxiosError } from 'axios';


interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  is_active?: boolean;
}

interface SignupResponse {
  token: string;
  user: User;
}

interface ValidationErrors {
  [key: string]: string;
}

// Interface for the error data structure returned by the API
interface ApiErrorData {
    error?: string; // For general errors
    errors?: Array<{ path: string; msg: string }>; // For validation errors
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  developerCode?: string;
}

interface ApiErrorData {
  error?: string; 
  errors?: Array<{ path: string; msg: string }>; 
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'lecturer' | 'admin'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const router = useRouter();

  // Developer access configuration
  const DEVELOPER_CONFIG = {
    // Must match backend
    secretCode: 'ADMIN_ACCESS_2025',
    allowedEmails: ['yasmarfaq@yahoo.com', 'yasmarfaq51@gmail.com', 'yahayanepa@yahoo.com', 'yahaya.test2025@test.com', 'gabasawa@yahoo.com']
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase & number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Admin role validation
    if (formData.role === 'admin' && !developerMode) {
      newErrors.role = 'Admin registration requires developer access';
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const enableDeveloperMode = () => {
    if (secretCode === DEVELOPER_CONFIG.secretCode) {
      setDeveloperMode(true);
      setErrors(prev => ({ ...prev, role: '', general: '' })); // Clear previous general error
    } else {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Invalid developer access code' 
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Additional validation for admin role
    if (formData.role === 'admin') {
      const isDeveloperEmail = DEVELOPER_CONFIG.allowedEmails.includes(formData.email.toLowerCase());
      if (!isDeveloperEmail && !developerMode) {
        setErrors({ 
          general: 'Admin registration is restricted to authorized developer emails only' 
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: SignupPayload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      // Add developer code if trying to register as admin with developer mode
      if (formData.role === 'admin' && developerMode) {
        payload.developerCode = DEVELOPER_CONFIG.secretCode;
      }

      console.log('📤 Sending signup request:', { 
        email: payload.email, 
        role: payload.role,
        hasDeveloperCode: !!payload.developerCode 
      });

      const response = await api.post<SignupResponse>('/auth/signup', payload);
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);

      window.dispatchEvent(new Event('userChanged'));

      console.log('✅ Signup successful, redirecting to dashboard...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
    // AxiosError for type-safety
    } catch (error: unknown) {
      console.error('🔴 Signup failed:', error);

      // Cast the error to AxiosError to access response data
      const axiosError = error as AxiosError<ApiErrorData>;
      
      // Handle different error responses
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        if (data.error) {
          setErrors({ 
            general: data.error 
          });
        } else if (data.errors) {
          const serverErrors: ValidationErrors = {};
          data.errors.forEach((err) => {
        serverErrors[err.path] = err.msg;
 });
          setErrors(serverErrors);
        } else {
          setErrors({ 
            general: 'Signup failed: Unknown server response. Please try again.' 
          });
        }
      } else if (axiosError.message) {
        setErrors({ 
          general: `Signup failed: ${axiosError.message}` 
        });
      } else {
        setErrors({ 
          general: 'Signup failed. Please check your connection and try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (data: SignupResponse) => {
    console.log('✅ Google signup successful:', data);
    
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
    setErrors({ general: errorMessage });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* Background Pattern Overlay with Gradient Cover */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/26265399.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Additional Gradient Overlay to Cover Background More */}
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
        <div className="hidden md:flex -mt-16 flex-col items-start text-white space-y-6 max-w-md">
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
              Create Your Account
            </h2>
            <p className="text-lg text-purple-100">
              Join thousands of students and educators using our platform to enhance their academic experience.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Free Registration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-1000" />
              <span>Instant Access</span>
            </div>
          </div>

          {/* Developer Access Notice */}
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Admin Access</span>
            </div>
            <p className="text-sm text-purple-100">
              Administrator registration is restricted. Use developer access code or authorized email.
            </p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-6 md:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Get Started!</h2>
              <p className="text-gray-600">Create your account</p>
            </div>

            {/* Developer Access Section */}
            {!developerMode && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">Developer Access</span>
                </div>
                <p className="text-xs text-yellow-700 mb-3">
                  Admin registration requires developer authorization
                </p>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter access code"
                    className="flex-1 px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    onClick={enableDeveloperMode}
                    className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Unlock
                  </button>
                </div>
                {errors.general && errors.general.includes('developer access code') && (
                    <p className="text-red-500 text-xs mt-1">{errors.general}</p>
                )}
              </div>
            )}

            {developerMode && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Developer Mode Active</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  You can now register as administrator
                </p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.name ? 'border-red-400' : 'border-gray-200'
                  } focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  } focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400`}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Role*
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.role ? 'border-red-400' : 'border-gray-200'
                  } focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 ${
                    formData.role === 'admin' && !developerMode ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  required
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option 
                    value="admin" 
                    disabled={!developerMode}
                    className={!developerMode ? 'text-gray-400 bg-gray-100' : ''}
                  >
                    Administrator {!developerMode && '(Restricted)'}
                  </option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                
                {/* Admin role explanation */}
                {formData.role === 'admin' && developerMode && (
                  <p className="text-xs text-green-600 mt-1">
                    ⚠️ Administrator accounts have full system access
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.password ? 'border-red-400' : 'border-gray-200'
                    } focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                    } focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 text-gray-800 placeholder-gray-400`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
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

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an Account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Click Here to Login
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