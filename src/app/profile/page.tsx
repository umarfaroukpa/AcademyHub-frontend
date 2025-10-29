'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, User, Mail, Shield,  Users,  Calendar, Edit, Camera, Save, X } from 'lucide-react';
import api from '../../../lib/api'; 

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  created_at: string;
  is_active: boolean;
  avatar_url?: string | null; 
  last_login?: string;
}

interface StudentStats {
  total_courses: number;
  completed_courses: number;
  active_courses: number;
  average_grade: number; 
}

interface LecturerStats {
  total_courses: number;
  total_students: number;
  active_courses: number;
}

interface AdminStats {
  total_users: number;
  total_courses: number;
  pending_enrollments: number;
}

type RoleStats = StudentStats | LecturerStats | AdminStats;


// Utility to safely parse JSON from localStorage
const safeParseJson = (key: string): UserProfile | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Error parsing localStorage item:', e);
    return null;
  }
};


const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Using useCallback for function dependencies
  const fetchRoleStats = useCallback(async (role: UserProfile['role'], userId: number) => {
    try {
      // Clear previous error before a new fetch
      setError('');
      let statsData: RoleStats;

      switch (role) {
        case 'student':
          // NOTE: Assuming the API response structure is { data: StudentStats }
          const studentStatsResponse = await api.get<StudentStats>(`/users/${userId}/stats`);
          statsData = studentStatsResponse.data;
          break;
        case 'lecturer':
          const lecturerStatsResponse = await api.get<LecturerStats>(`/lecturers/${userId}/stats`);
          statsData = lecturerStatsResponse.data;
          break;
        case 'admin':
          const adminStatsResponse = await api.get<AdminStats>('/admin/stats');
          statsData = adminStatsResponse.data;
          break;
        default:
          setStats(null);
          // Exit if role is unknown/default
          return; 
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  }, []); 

  // useEffect dependency array
  useEffect(() => {
    const fetchUserProfile = async () => {
      let userData: UserProfile | null = null;
      
      try {
        setLoading(true);
        // Attempt to fetch from API
        const response = await api.get<UserProfile>('/profile');
        userData = response.data;
        setUser(userData);
        setEditForm({ name: userData.name, email: userData.email });
        
      } catch (apiError) {
        console.error('API Error fetching profile. Attempting local storage fallback:', apiError);
        // API failed, try local storage fallback
        userData = safeParseJson('user');
        
        if (userData) {
          setUser(userData);
          setEditForm({ name: userData.name, email: userData.email });
        } else {
          //  Navigate only if no user data, even from fallback
          setError('User profile not found. Redirecting to login...');
          router.push('/login');
          return; 
        }
      } finally {
        // Only fetch stats if we successfully got user data (from API or localStorage)
        if (userData) {
          // Await/call fetchRoleStats correctly
          await fetchRoleStats(userData.role, userData.id);
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
    // 'fetchRoleStats' to dependency array because it's used inside useEffect
  }, [router, fetchRoleStats]); 

  
  
  //  Type predicates are correct and a good pattern for union types.
  const isStudentStats = (s: RoleStats | null): s is StudentStats => {
    return (s as StudentStats)?.average_grade !== undefined;
  };

  const isLecturerStats = (s: RoleStats | null): s is LecturerStats => {
    return (s as LecturerStats)?.total_students !== undefined;
  };

  const isAdminStats = (s: RoleStats | null): s is AdminStats => {
    return (s as AdminStats)?.pending_enrollments !== undefined;
  };

  

  const handleEditToggle = () => {
    if (isEditing) {
      //  fallback is used if 'user' state is null (though TS should prevent in render)
      setEditForm({ name: user?.name || '', email: user?.email || '' });
      setError('');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return; // Safety check
    // Basic client-side validation
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError('Name and email cannot be empty.');
      return;
    }

    try {
      // Assuming api.put returns { data: UserProfile }
      const response = await api.put<UserProfile>('/profile', editForm); 
      const updatedUser = response.data;
      setUser(updatedUser);
      setIsEditing(false);
      setError('');

      // Update localStorage
      const currentUser = safeParseJson('user');
      if (currentUser) {
        //  Update user in localStorage with *only* the modified fields
        const updatedLocalUser = { ...currentUser, name: updatedUser.name, email: updatedUser.email };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
      }
    } catch (error) {
      //More robust error type for axios/api errors
      const apiError = error as { response?: { data?: { message?: string, error?: string } } };
      setError(apiError.response?.data?.error || apiError.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    //  Use consistent unit for size check (already 5MB)
    if (file.size > 5 * 1024 * 1024) { 
      setError('Image size must be less than 5MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post<UserProfile>('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      
      // Update localStorage
      const currentUser = safeParseJson('user');
      if (currentUser) {
        const updatedLocalUser = { ...currentUser, avatar_url: updatedUser.avatar_url };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string, error?: string } } };
      setError(apiError.response?.data?.error || apiError.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Reset file input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };
  
  const handleRemoveAvatar = async () => {
    try {
      // Assuming api.delete returns { data: UserProfile } which should have avatar_url: null
      const response = await api.delete<UserProfile>('/profile/avatar');
      const updatedUser = response.data;
      setUser(updatedUser);
      setError('');
      
      // Update localStorage
      const currentUser = safeParseJson('user');
      if (currentUser) {
        const updatedLocalUser = { ...currentUser, avatar_url: null };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string, error?: string } } };
      setError(apiError.response?.data?.error || apiError.response?.data?.message || 'Failed to remove avatar');
    }
  };

  // The helper functions getRoleIcon, getRoleBadgeColor, getRoleDisplayName are fine.
  const getRoleIcon = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'lecturer':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'student':
        return <GraduationCap className="h-5 w-5 text-green-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'lecturer':
      case 'student':
        return role.charAt(0).toUpperCase() + role.slice(1);
      default:
        return 'User';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
               href="/login"
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
             >
               Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data found. Please log in.</p>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 -z-50"
      />
      
      <div className="min-h-screen relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account and view your information</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p> 
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <div className="flex gap-2">
                    {isEditing ? (
                      // ... (Save/Cancel Buttons - fine)
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className="relative">
                      {user.avatar_url ? (
                        <Image
                          src={`http://localhost:4000${user.avatar_url}`}
                          alt="Profile"
                          width={96} // Next/Image required props
                          height={96} // Next/Image required props
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                       <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {uploadingAvatar ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                    </div>
                     {user.avatar_url && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove photo
                        </button>
                      )}
                  </div>

                  {/* User Details / Edit Form */}
                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {getRoleDisplayName(user.role)}
                            </span>
                            {user.is_active && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Role-Specific Content - Fine, conditional rendering logic */}
              {user.role === 'student' && stats && isStudentStats(stats) && (
                // ... (Student Stats Block)
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center gap-3 mb-6">
                       <GraduationCap className="h-6 w-6 text-blue-500" />
                       <h2 className="text-xl font-semibold text-gray-900">Academic Progress</h2>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="text-center p-4 bg-blue-50 rounded-lg">
                         <div className="text-2xl font-bold text-blue-600">{stats.total_courses}</div>
                         <div className="text-sm text-blue-600">Total Courses</div>
                       </div>
                       <div className="text-center p-4 bg-green-50 rounded-lg">
                         <div className="text-2xl font-bold text-green-600">{stats.active_courses}</div>
                         <div className="text-sm text-green-600">Active Courses</div>
                       </div>
                       <div className="text-center p-4 bg-purple-50 rounded-lg">
                         <div className="text-2xl font-bold text-purple-600">{stats.completed_courses}</div>
                         <div className="text-sm text-purple-600">Completed</div>
                       </div>
                       <div className="text-center p-4 bg-orange-50 rounded-lg">
                         <div className="text-2xl font-bold text-orange-600">{stats.average_grade}%</div>
                         <div className="text-sm text-orange-600">Average Grade</div>
                       </div>
                     </div>
                   </div>
              )}

              {user.role === 'lecturer' && stats && isLecturerStats(stats) && (
                // ... (Lecturer Stats Block)
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center gap-3 mb-6">
                       <Users className="h-6 w-6 text-blue-500" />
                       <h2 className="text-xl font-semibold text-gray-900">Teaching Overview</h2>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <div className="text-center p-4 bg-blue-50 rounded-lg">
                         <div className="text-2xl font-bold text-blue-600">{stats.total_courses}</div>
                         <div className="text-sm text-blue-600">Total Courses</div>
                       </div>
                       <div className="text-center p-4 bg-green-50 rounded-lg">
                         <div className="text-2xl font-bold text-green-600">{stats.active_courses}</div>
                         <div className="text-sm text-green-600">Active Courses</div>
                       </div>
                       <div className="text-center p-4 bg-purple-50 rounded-lg">
                         <div className="text-2xl font-bold text-purple-600">{stats.total_students}</div>
                         <div className="text-sm text-purple-600">Total Students</div>
                       </div>
                     </div>
                   </div>
              )}

              {user.role === 'admin' && stats && isAdminStats(stats) && (
                // ... (Admin Stats Block)
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center gap-3 mb-6">
                       <Shield className="h-6 w-6 text-red-500" />
                       <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <div className="text-center p-4 bg-red-50 rounded-lg">
                         <div className="text-2xl font-bold text-red-600">{stats.total_users}</div>
                         <div className="text-sm text-red-600">Total Users</div>
                       </div>
                       <div className="text-center p-4 bg-blue-50 rounded-lg">
                         <div className="text-2xl font-bold text-blue-600">{stats.total_courses}</div>
                         <div className="text-sm text-blue-600">Total Courses</div>
                       </div>
                       <div className="text-center p-4 bg-yellow-50 rounded-lg">
                         <div className="text-2xl font-bold text-yellow-600">{stats.pending_enrollments}</div>
                         <div className="text-sm text-yellow-600">Pending Enrollments</div>
                       </div>
                     </div>
                   </div>
              )}
            </div>

            {/* Right Column - Quick Actions / Account Status */}
            <div className="space-y-6">
               {/* Quick Actions and Account Status blocks */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;