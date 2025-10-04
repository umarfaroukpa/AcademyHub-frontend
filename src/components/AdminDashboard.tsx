import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../types/types';
import { setAuthToken, clearAuth } from '../../lib/api';
import api from '../../lib/api';

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
    // Restore token from localStorage on mount
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
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
          <button
            onClick={loginAgain}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm">
        <p>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
        <p>User: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</p>
      </div>

      {/* Pending Enrollments */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Enrollments</h2>
        {loading.enrollments ? (
          <div className="text-gray-500">Loading enrollments...</div>
        ) : (
          <div className="space-y-2">
            {enrollments.map(enrollment => (
              <div key={enrollment.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <span className="font-medium">{enrollment.student_name}</span>
                  <span className="text-gray-600 ml-2">wants to enroll in</span>
                  <span className="font-medium ml-2">{enrollment.course_name}</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => updateEnrollment(enrollment.id, 'approved')}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateEnrollment(enrollment.id, 'rejected')}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {enrollments.length === 0 && !loading.enrollments && (
              <p className="text-gray-500">No pending enrollments.</p>
            )}
          </div>
        )}
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Courses</h2>
        {loading.courses ? (
          <div className="text-gray-500">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="border p-4 rounded">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>
                <p className="text-sm text-gray-500">Lecturer: {course.lecturer_name}</p>
              </div>
            ))}
            {courses.length === 0 && !loading.courses && (
              <p className="text-gray-500">No courses available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}