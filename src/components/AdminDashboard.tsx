import { useState, useEffect } from 'react';
import { Enrollment, Course } from '../../types/types';
import {setAuthToken} from '../../lib/api';
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
  useEffect(() => {
  // Restore token from localStorage on mount
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
}, []);

  useEffect(() => {
    fetchEnrollments();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    const response = await api.get('/enrollments');
    setEnrollments(response.data as EnrollmentResponse[]);
  };

  const fetchCourses = async () => {
    const response = await api.get('/courses');
    setCourses(response.data as Course[]);
  };

  const updateEnrollment = async (enrollmentId: number, status: string) => {
    await api.put(`/enrollments/${enrollmentId}`, { status });
    fetchEnrollments();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Pending Enrollments */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Enrollments</h2>
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
        </div>
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="border p-4 rounded">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-gray-600">{course.description}</p>
              <p className="text-sm text-gray-500">Lecturer: {course.lecturer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}