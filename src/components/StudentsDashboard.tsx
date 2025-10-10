import { useState, useEffect } from 'react';
import { Course, Enrollment } from '../../types/types';
import api from '../../lib/api';
import { BookOpen, Sparkles, CheckCircle, Clock, XCircle, Search, GraduationCap, AlertCircle } from 'lucide-react';

interface EnrollmentResponse {
  id: number;
  course_id: number;
  status: 'active' | 'completed' | 'dropped' | 'withdrawn';
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data as Course[]);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments');
      setEnrollments(response.data as EnrollmentResponse[]);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const enrollCourse = async (courseId: number) => {
    // Check if already enrolled locally first
    const isAlreadyEnrolled = enrollments.some(enrollment => 
      enrollment.course_id === courseId && enrollment.status === 'active'
    );

    if (isAlreadyEnrolled) {
      setError('You are already enrolled in this course!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(courseId);
    setError(null);

    try {
      await api.post(`/courses/${courseId}/enroll`);
      // Refresh both courses and enrollments to get updated data
      await Promise.all([fetchCourses(), fetchEnrollments()]);
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      
      if (error.response?.status === 400) {
        setError(error.response.data.error || 'You are already enrolled in this course!');
      } else if (error.response?.status === 404) {
        setError('Course not found');
      } else {
        setError('Enrollment failed. Please try again.');
      }
      
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(null);
    }
  };

  const getRecommendations = async () => {
    const response = await api.post('/ai/recommend', { interests });
    console.log('Recommended courses:', response.data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'dropped':
      case 'withdrawn':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      dropped: 'bg-red-100 text-red-700 border-red-200',
      withdrawn: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Check if a course is enrolled
  const isCourseEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => 
      enrollment.course_id === courseId && enrollment.status === 'active'
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Explore courses and track your learning journey</p>
          </div>
        </div>
      </div>

      {/* AI Course Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Course Recommendations</h2>
            <p className="text-gray-600 mb-4">Tell us what you're interested in and we'll suggest the perfect courses</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Web Development, Machine Learning, Data Science..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
              />
              <button
                onClick={getRecommendations}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Courses
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Enrollments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          My Enrollments
        </h2>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No enrollments yet. Start by enrolling in a course below!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map(enrollment => {
              const course = courses.find(c => c.id === enrollment.course_id);
              return (
                <div key={enrollment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(enrollment.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {course?.title || `Course ID: ${enrollment.course_id}`}
                        </h3>
                        {course && (
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(enrollment.status)}`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
        
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600">Check back later for new courses</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const isEnrolled = isCourseEnrolled(course.id);
              const isLoading = loading === course.id;

              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
                  {/* Course Header */}
                  <div className={`p-6 relative overflow-hidden ${
                    isEnrolled 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <BookOpen className="w-12 h-12 text-white/90 mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    {isEnrolled && (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-semibold">ENROLLED</span>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {course.lecturer_name?.charAt(0).toUpperCase() || 'L'}
                      </div>
                      <span className="font-medium">by {course.lecturer_name || 'Unknown'}</span>
                    </div>

                    {isEnrolled ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-200">
                        <CheckCircle className="w-5 h-5" />
                        Enrolled
                      </div>
                    ) : (
                      <button
                        onClick={() => enrollCourse(course.id)}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 ${
                          isLoading
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}