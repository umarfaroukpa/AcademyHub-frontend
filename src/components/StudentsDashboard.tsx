import { useState, useEffect } from 'react';
import { Course, Enrollment } from '../../types/types';
import api from '../../lib/api';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [interests, setInterests] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    const response = await api.get('/courses');
    setCourses(response.data);
  };

  const fetchEnrollments = async () => {
    const response = await api.get('/enrollments');
    setEnrollments(response.data);
  };

  const enrollCourse = async (courseId: number) => {
    await api.post(`/courses/${courseId}/enroll`);
    fetchCourses();
    fetchEnrollments();
  };

  const getRecommendations = async () => {
    const response = await api.post('/ai/recommend', { interests });
    console.log('Recommended courses:', response.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* AI Recommendations */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Course Recommendations</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your interests..."
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={getRecommendations} className="bg-green-500 text-white px-4 py-2 rounded">
            Get Recommendations
          </button>
        </div>
      </div>

      {/* Available Courses */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="border p-4 rounded">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-gray-600 mb-2">{course.description}</p>
              <p className="text-sm text-gray-500">Lecturer: {course.lecturer_name}</p>
              {!course.enrolled ? (
                <button
                  onClick={() => enrollCourse(course.id)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Enroll
                </button>
              ) : (
                <span className="mt-2 text-green-600">Enrolled</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My Enrollments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Enrollments</h2>
        <div className="space-y-2">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="border p-3 rounded">
              <span className="font-medium">Course ID: {enrollment.course_id}</span>
              <span className={`ml-4 px-2 py-1 rounded text-sm ${
                enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                enrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {enrollment.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}