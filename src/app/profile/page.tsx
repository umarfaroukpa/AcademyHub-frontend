'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {   GraduationCap, User, Mail, Shield, BookOpen, Users, Settings, Calendar, Award, FileText, Edit, Clock, Camera, Save, X, Upload, Zap } from 'lucide-react';
import api from '../../../lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  created_at: string;
  is_active: boolean;
  avatar_url?: string;
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

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | LecturerStats | AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const response = await api.get<UserProfile>('/profile');
      const userData = response.data;
      setUser(userData);
      setEditForm({ name: userData.name, email: userData.email });

      await fetchRoleStats(userData.role, userData.id);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData) as UserProfile;
          setUser(parsedUser);
          setEditForm({ name: parsedUser.name, email: parsedUser.email });
        } else {
          router.push('/login');
          return;
        }
      } catch (localError) {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const isStudentStats = (stats: any): stats is StudentStats => {
    return stats && 'average_grade' in stats;
  };

  const isLecturerStats = (stats: any): stats is LecturerStats => {
    return stats && 'total_students' in stats;
  };

  const isAdminStats = (stats: any): stats is AdminStats => {
    return stats && 'pending_enrollments' in stats;
  };

  const fetchRoleStats = async (role: string, userId: number) => {
    try {
      switch (role) {
        case 'student':
          const studentStatsData = await api.get<StudentStats>(`/users/${userId}/stats`);
          setStats(studentStatsData.data);
          break;
        case 'lecturer':
          const lecturerStatsData = await api.get<LecturerStats>(`/lecturers/${userId}/stats`);
          setStats(lecturerStatsData.data);
          break;
        case 'admin':
          const adminStatsData = await api.get<AdminStats>('/admin/stats');
          setStats(adminStatsData.data);
          break;
        default:
          setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      const defaultStats = {
        total_courses: 0,
        completed_courses: 0,
        active_courses: 0,
        average_grade: 0,
        total_students: 0,
        total_users: 0,
        pending_enrollments: 0
      };
      setStats(defaultStats as any);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({ name: user?.name || '', email: user?.email || '' });
      setError('');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.put<UserProfile>('/profile', editForm);
      setUser(response.data);
      setIsEditing(false);
      setError('');
      
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        userObj.name = response.data.name;
        userObj.email = response.data.email;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
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

      setUser(response.data);
      
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        userObj.avatar_url = response.data.avatar_url;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await api.delete<UserProfile>('/profile/avatar');
      setUser(response.data);
      setError('');
      
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        userObj.avatar_url = null;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to remove avatar');
    }
  };

  const getRoleIcon = (role: string) => {
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

  const getRoleBadgeColor = (role: string) => {
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'lecturer':
        return 'Lecturer';
      case 'student':
        return 'Student';
      default:
        return 'User';
    }
  };

  // Navigation handler for student dashboard
  const navigateToStudentDashboard = () => {
    router.push('/dashboard');
  };

  // Navigation handler for quick actions
  const navigateToQuickActions = () => {
    router.push('/dashboard?tab=quick-actions');
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
            <button
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data found</p>
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
      {/* Fixed background layers to prevent gradient bleed */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 -z-50"
        style={{ backgroundColor: '#f9fafb' }}
      />
      
      <div 
        className="min-h-screen relative"
        style={{ 
          backgroundColor: '#f9fafb',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Additional solid layer */}
        <div 
          className="absolute inset-0 bg-gray-50"
          style={{ 
            backgroundColor: '#f9fafb',
            zIndex: -1 
          }}
        />
        
        {/* Content wrapper */}
        <div className="relative z-10 py-8">
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
                          <img
                            src={`http://localhost:4000${user.avatar_url}`}
                            alt="Profile"
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

                    {/* User Details */}
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

                {/* Role-Specific Content */}
                {user.role === 'student' && stats && isStudentStats(stats) && (
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

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {user.role === 'student' && (
                      <>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <span>Browse Courses</span>
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <GraduationCap className="h-5 w-5 text-green-500" />
                          <span>My Courses</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'lecturer' && (
                      <>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <span>My Courses</span>
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FileText className="h-5 w-5 text-green-500" />
                          <span>Create Course</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Users className="h-5 w-5 text-blue-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <BookOpen className="h-5 w-5 text-purple-500" />
                          <span>Manage Courses</span>
                        </Link>
                      </>
                    )}
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Settings className="h-5 w-5 text-gray-500" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member since</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Role</span>
                      <span className="text-gray-900 font-medium">{getRoleDisplayName(user.role)}</span>
                    </div>
                    {user.last_login && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last login</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(user.last_login).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;