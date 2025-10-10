import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../types/types';
import { setAuthToken, clearAuth } from '../../lib/api';
import api from '../../lib/api';
import { Shield, Users, BookOpen, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface EnrollmentResponse {
  id: number;
  student_name: string;
  course_name: string;
  status: string;
}

export default function AdminDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState({ enrollments: true, courses: true });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('🏁 AdminDashboard mounted');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Token from localStorage:', token ? 'exists' : 'missing');
    console.log('🔍 User from localStorage:', user);
    
    if (token) {
      setAuthToken(token);
      console.log('🔑 Token restored from localStorage');
    } else {
      console.log('🔑 No token found in localStorage');
      setError('No authentication token found');
    }
  }, []);

  useEffect(() => {
    if (error) return;
    
    console.log('📡 Fetching data...');
    fetchEnrollments();
    fetchCourses();
  }, [error]);

  const fetchEnrollments = async () => {
    try {
      console.log('📡 Fetching enrollments...');
      const response = await api.get('/enrollments');
      const enrollmentsData = response.data as EnrollmentResponse[];
      console.log('✅ Enrollments fetched successfully:', enrollmentsData.length, 'items');
      setEnrollments(enrollmentsData);
    } catch (error: any) {
      console.error('🔴 Error fetching enrollments:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to fetch enrollments: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(prev => ({ ...prev, enrollments: false }));
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('📡 Fetching courses...');
      const response = await api.get('/courses');
      const coursesData = response.data as Course[];
      console.log('✅ Courses fetched successfully:', coursesData.length, 'items');
      setCourses(coursesData);
    } catch (error: any) {
      console.error('🔴 Error fetching courses:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to fetch courses: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const updateEnrollment = async (enrollmentId: number, status: string) => {
    try {
      await api.put(`/enrollments/${enrollmentId}`, { status });
      alert(`Enrollment ${status} successfully!`);
      fetchEnrollments();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update enrollment');
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    clearAuth();
    router.replace('/');
  };

  const loginAgain = () => {
    clearAuth();
    router.replace('/');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={loginAgain}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage enrollments and oversee all courses</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{enrollments.length}</div>
              <div className="text-sm text-gray-600">Pending Enrollments</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Enrollments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-yellow-600" />
          Pending Enrollments
        </h2>
        
        {loading.enrollments ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enrollments...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No pending enrollments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map(enrollment => (
              <div key={enrollment.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {enrollment.student_name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{enrollment.student_name}</span>
                        <p className="text-sm text-gray-600">wants to enroll in <span className="font-medium text-gray-900">{enrollment.course_name}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEnrollment(enrollment.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateEnrollment(enrollment.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Courses</h2>
        
        {loading.courses ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600">Courses will appear here once created</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <BookOpen className="w-10 h-10 text-white/90 mb-3" />
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {course.lecturer_name?.charAt(0).toUpperCase() || 'L'}
                    </div>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Lecturer:</span> {course.lecturer_name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}