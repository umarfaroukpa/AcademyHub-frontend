'use client';

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GraduationCap, Users, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function GoogleSignInWithRole({ onSuccess, onError }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      console.log('🔐 Google OAuth successful, sending to backend...');
      
      // Use your api instance which already has the correct baseURL
      const response = await api.post('/auth/google/signin', {
        googleToken: credentialResponse.credential,
        role: selectedRole
      });

      console.log('✅ Backend authentication successful:', response.data);

      if (response.status === 200 || response.status === 201) {
        onSuccess(response.data);
      } else {
        onError(response.data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      const errorMessage = error.response?.data?.error || 'Google sign-in failed';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google OAuth failed');
    onError('Google sign-in failed');
  };

  return (
    <div className="space-y-4">
      {/* Role Selection */}
      {showRoleSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Your Role
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedRole('student')}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                selectedRole === 'student'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Student</div>
              <div className="text-sm opacity-75">Enroll in courses</div>
            </button>
            
            <button
              onClick={() => setSelectedRole('lecturer')}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                selectedRole === 'lecturer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Lecturer</div>
              <div className="text-sm opacity-75">Create courses</div>
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <strong>Note:</strong> Your role determines what you can do in the system. 
                Students enroll in courses, lecturers create and manage courses.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Button */}
      <div className={`${showRoleSelection ? 'mt-4' : ''}`}>
        {!showRoleSelection && (
          <button
            onClick={() => setShowRoleSelection(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        )}
        
        {showRoleSelection && (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            text="continue_with"
            shape="rectangular"
            locale="en"
          />
        )}
        
        {loading && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Signing in with {selectedRole} account...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}