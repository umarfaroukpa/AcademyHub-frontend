import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AssignmentSubmission from '../components/AssignmentSubmission';
import { 
  BookOpen, Sparkles, CheckCircle, Clock, XCircle, Search, GraduationCap, 
  AlertCircle, FileText, LayoutDashboard, Users, Zap, Play, Star, 
  Target, TrendingUp, Calendar, Bell, MessageSquare, Download,
  ArrowRight, ChevronRight, Info, AlertTriangle
} from 'lucide-react';

// Define the Course interface locally since the imported one is missing properties
interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  lecturer_name: string;
  credits: number;
  status?: string;
  created_at?: string;
  lecturer_id?: number;
  max_students?: number;
  syllabus_url?: string;
  syllabus_path?: string;
}

interface EnrollmentResponse {
  id: number;
  course_id: number;
  status: 'active' | 'completed' | 'dropped' | 'withdrawn';
}

interface RecommendedCourse {
  id: number;
  title: string;
  description: string;
  code: string;
  lecturer_name: string;
  credits: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_name: string;
  max_score?: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

interface AlertState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface QuizResponse {
  questions?: Array<{
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
  }>;
  topic?: string;
  total_questions?: number;
  time_limit?: number;
}

interface StudyPlanResponse {
  timeframe?: string;
  schedule?: Array<{
    day: string;
    topics: string[];
    duration: string;
    resources: string[];
  }>;
  goals?: string[];
  tips?: string[];
}

interface StudyGroupResponse {
  message?: string;
  group?: {
    id: number;
    name: string;
    topic: string;
    next_meeting: string;
  };
}

type StudentTab = 'dashboard' | 'quick-actions' | 'assignments' | 'my-courses' | 'browse-courses';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Assignment[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    pendingAssignments: 0,
    overallProgress: 0
  });
  const [actionLoading, setActionLoading] = useState({
    quiz: false,
    studyPlan: false,
    studyGroup: false
  });
  const [recentAction, setRecentAction] = useState<{type: string, data: any} | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchQuickActionsData();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get<Course[]>('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await api.get<EnrollmentResponse[]>('/enrollments');
      setEnrollments(response.data);
      
      // Calculate completed courses for stats
      const completedCoursesCount = response.data.filter(
        enrollment => enrollment.status === 'completed'
      ).length;

      const enrolledCoursesCount = courses.filter(course => 
        isCourseEnrolled(course.id)
      ).length;

      setStats(prev => ({
        ...prev,
        totalCourses: enrolledCoursesCount,
        completedCourses: completedCoursesCount,
        overallProgress: enrolledCoursesCount > 0 ? Math.round((completedCoursesCount / enrolledCoursesCount) * 100) : 0
      }));
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const fetchQuickActionsData = async () => {
    try {
      // Fetch upcoming deadlines with proper error handling
      try {
        const deadlinesResponse = await api.get<Assignment[]>('/assignments/upcoming');
        setUpcomingDeadlines(deadlinesResponse.data || []);
      } catch (error) {
        console.log('Upcoming assignments endpoint not available yet');
        setUpcomingDeadlines([]);
      }

      // Fetch recent activity with proper error handling
      try {
        const activityResponse = await api.get<Activity[]>('/users/8/activity');
        setRecentActivity(activityResponse.data || []);
      } catch (error: any) {
        console.log('User activity endpoint not available yet:', error.response?.data?.error);
        // Set mock data for development
        const mockActivity: Activity[] = [
          {
            id: 1,
            type: 'enrollment',
            description: 'Enrolled in Web Development course',
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            type: 'submission',
            description: 'Submitted JavaScript assignment',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];
        setRecentActivity(mockActivity);
      }
      
      // Update pending assignments count
      setStats(prev => ({
        ...prev,
        pendingAssignments: upcomingDeadlines.length
      }));
    } catch (error: any) {
      console.error('Failed to fetch quick actions data:', error);
      // Set empty arrays as fallback
      setUpcomingDeadlines([]);
      setRecentActivity([]);
    }
  };

  const enrollCourse = async (courseId: number) => {
    const isAlreadyEnrolled = enrollments.some(enrollment => 
      enrollment.course_id === courseId && enrollment.status === 'active'
    );

    if (isAlreadyEnrolled) {
      setAlert({
        type: 'error',
        message: 'You are already enrolled in this course!'
      });
      setTimeout(() => setAlert(null), 4000);
      return;
    }

    setLoading(courseId);
    setAlert(null);

    try {
      await api.post(`/courses/${courseId}/enroll`);
      await Promise.all([fetchCourses(), fetchEnrollments()]);
      setAlert({
        type: 'success',
        message: 'Successfully enrolled in the course!'
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      
      if (error.response?.status === 400) {
        setAlert({
          type: 'error',
          message: error.response.data.error || 'You are already enrolled in this course!'
        });
      } else if (error.response?.status === 404) {
        setAlert({
          type: 'error',
          message: 'Course not found'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Enrollment failed. Please try again.'
        });
      }
      
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setLoading(null);
    }
  };

  const getRecommendations = async () => {
    if (!interests.trim()) {
      setAlert({
        type: 'error',
        message: 'Please enter your interests to get recommendations'
      });
      setTimeout(() => setAlert(null), 4000);
      return;
    }

    setIsGettingRecommendations(true);
    setAlert(null);

    try {
      const response = await api.post<RecommendedCourse[]>('/ai/recommend', { interests });
      setRecommendedCourses(response.data);
      setAlert({
        type: 'success',
        message: `Found ${response.data.length} courses matching your interests!`
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error: any) {
      console.error('Failed to get recommendations:', error);
      setAlert({
        type: 'error',
        message: 'Failed to get recommendations. Please try again.'
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setIsGettingRecommendations(false);
    }
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

  const isCourseEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => 
      enrollment.course_id === courseId && enrollment.status === 'active'
    );
  };

  // Quick Action Functions with better feedback and proper typing
  const startQuickQuiz = async () => {
    setActionLoading(prev => ({ ...prev, quiz: true }));
    try {
      setAlert(null);
      const response = await api.post<QuizResponse>('/ai/quick-quiz', {
        topic: 'recent_courses',
        questions: 5
      });
      
      const quizData = response.data;
      setAlert({
        type: 'success',
        message: `🎯 Quick quiz generated! ${quizData.questions?.length || 5} questions ready. Check your assignments tab.`
      });
      setRecentAction({ type: 'quiz', data: quizData });
      
    } catch (error: any) {
      console.log('Quick quiz endpoint not available:', error.response?.data?.error);
      setAlert({
        type: 'error', 
        message: error.response?.data?.error || 'Quick quiz feature coming soon!'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, quiz: false }));
    }
  };

  const generateStudyPlan = async () => {
    setActionLoading(prev => ({ ...prev, studyPlan: true }));
    try {
      setAlert(null);
      const response = await api.post<StudyPlanResponse>('/ai/study-plan', {
        courses: enrolledCourses.map(course => course.id),
        timeframe: 'week'
      });
      
      const studyPlanData = response.data;
      setAlert({
        type: 'success',
        message: `📚 Study plan generated! Check your dashboard for your ${studyPlanData.timeframe || 'weekly'} schedule.`
      });
      setRecentAction({ type: 'studyPlan', data: studyPlanData });
      
    } catch (error: any) {
      console.log('Study plan endpoint not available:', error.response?.data?.error);
      setAlert({
        type: 'error',
        message: error.response?.data?.error || 'Study plan feature coming soon!'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, studyPlan: false }));
    }
  };

  const joinStudyGroup = async () => {
    setActionLoading(prev => ({ ...prev, studyGroup: true }));
    try {
      setAlert(null);
      const response = await api.post<StudyGroupResponse>('/study-groups/join-recommended');
      
      const studyGroupData = response.data;
      setAlert({
        type: 'success',
        message: `👥 ${studyGroupData.message || 'Successfully joined study group!'} Next meeting: ${studyGroupData.group?.next_meeting || 'Check your courses for details.'}`
      });
      setRecentAction({ type: 'studyGroup', data: studyGroupData });
      
    } catch (error: any) {
      console.log('Study groups endpoint not available:', error.response?.data?.error);
      setAlert({
        type: 'error',
        message: error.response?.data?.error || 'Study groups feature coming soon!'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, studyGroup: false }));
    }
  };

  const downloadMaterials = async (courseId: number) => {
    try {
      await api.get(`/courses/${courseId}/materials`);
      setAlert({
        type: 'success',
        message: 'Course materials ready for download!'
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to download materials'
      });
      setTimeout(() => setAlert(null), 4000);
    }
  };

  // Get enrolled courses only
  const enrolledCourses = courses.filter(course => 
    isCourseEnrolled(course.id)
  );

  // Get available courses (not enrolled)
  const availableCourses = courses.filter(course => 
    !isCourseEnrolled(course.id)
  );

  // Get completed courses
  const completedCourses = enrollments.filter(
    enrollment => enrollment.status === 'completed'
  ).map(enrollment => 
    courses.find(course => course.id === enrollment.course_id)
  ).filter(Boolean) as Course[];

  // Alert Message Component
  const AlertMessage = () => {
    if (!alert) return null;

    const alertStyles = {
      success: 'bg-green-50 border-green-200 text-green-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };

    const alertIcons = {
      success: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
      error: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
      info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
    };

    return (
      <div className={`border rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300 ${alertStyles[alert.type]}`}>
        {alertIcons[alert.type]}
        <p className="font-medium flex-1">{alert.message}</p>
        <button 
          onClick={() => setAlert(null)}
          className="ml-auto hover:opacity-70 transition-opacity"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-1 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'quick-actions', label: 'Quick Actions', icon: Zap },
          { id: 'my-courses', label: 'My Courses', icon: GraduationCap },
          { id: 'browse-courses', label: 'Browse Courses', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as StudentTab)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  // Quick Stats Component
  const QuickStats = () => (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">My Courses</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.completedCourses}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingAssignments}</div>
            <div className="text-sm text-gray-600">Pending Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Quick Actions Tab Component
  const QuickActionsTab = () => (
    <div className="space-y-6">
      {/* Recent Action Preview */}
      {recentAction && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Action Completed!</h4>
              <p className="text-blue-700 text-sm">
                {recentAction.type === 'quiz' && 'Your quiz has been generated and saved to your assignments.'}
                {recentAction.type === 'studyPlan' && 'Your personalized study plan is ready to view.'}
                {recentAction.type === 'studyGroup' && 'You have been added to the study group.'}
              </p>
            </div>
            <button 
              onClick={() => setRecentAction(null)}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              <div className="text-sm opacity-90">Active Courses</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">{upcomingDeadlines.filter(d => 
                new Date(d.due_date).toDateString() === new Date().toDateString()
              ).length}</div>
              <div className="text-sm opacity-90">Due Today</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">{completedCourses.length}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">7</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Quick Actions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI-Powered Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={startQuickQuiz}
              disabled={actionLoading.quiz}
              className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {actionLoading.quiz ? (
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {actionLoading.quiz ? 'Generating...' : 'Quick Knowledge Check'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={generateStudyPlan}
              disabled={actionLoading.studyPlan}
              className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {actionLoading.studyPlan ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Target className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {actionLoading.studyPlan ? 'Generating...' : 'Generate Study Plan'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={joinStudyGroup}
              disabled={actionLoading.studyGroup}
              className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {actionLoading.studyGroup ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Users className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {actionLoading.studyGroup ? 'Joining...' : 'Join Study Group'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Quick Course Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Course Tools</h3>
          </div>
          <div className="space-y-3">
            {enrolledCourses.slice(0, 3).map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]">
                    {course.title}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => downloadMaterials(course.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download Materials"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="View Assignments"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-4">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No enrolled courses</p>
                <button
                  onClick={() => setActiveTab('browse-courses')}
                  className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Browse Courses
                </button>
              </div>
            )}
            {enrolledCourses.length > 3 && (
              <button
                onClick={() => setActiveTab('my-courses')}
                className="w-full text-center py-2 text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All Courses ({enrolledCourses.length})
              </button>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
            </div>
            <span className="text-sm text-gray-500">{upcomingDeadlines.length}</span>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.slice(0, 3).map(deadline => (
                <div key={deadline.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg group hover:bg-red-100 transition-colors">
                  <Bell className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{deadline.title}</div>
                    <div className="text-xs text-gray-600">
                      Due {new Date(deadline.due_date).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              </div>
            )}
            {upcomingDeadlines.length > 3 && (
              <button
                onClick={() => setActiveTab('assignments')}
                className="w-full text-center py-2 text-red-600 text-sm font-medium hover:text-red-700"
              >
                View All Deadlines
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <span className="text-sm text-gray-500">{recentActivity.length}</span>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 3).map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'submission' ? 'bg-green-500' :
                    activity.type === 'enrollment' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{activity.description}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Study Templates</span>
              </div>
              <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">Find Tutor</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors group">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Career Resources</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Completion</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{enrolledCourses.length}</div>
                <div className="text-xs text-gray-600">Enrolled</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{completedCourses.length}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('my-courses')}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              View Detailed Progress
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <h4 className="font-semibold text-gray-900">Need Help?</h4>
              <p className="text-sm text-gray-600">Get instant support from our AI assistant</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
              Contact Support
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              Chat with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      <AlertMessage />

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

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Quick Stats */}
          <QuickStats />

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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        getRecommendations();
                      }
                    }}
                  />
                  <button
                    onClick={getRecommendations}
                    disabled={isGettingRecommendations}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-5 h-5" />
                    {isGettingRecommendations ? 'Finding...' : 'Find Courses'}
                  </button>
                </div>
              </div>
            </div>

            {/* Display Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Courses for "{interests}"</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedCourses.map(course => {
                    const isEnrolled = isCourseEnrolled(course.id);
                    const isLoading = loading === course.id;

                    return (
                      <div key={course.id} className="bg-white rounded-xl border border-purple-200 overflow-hidden hover:shadow-lg transition-all">
                        <div className={`p-4 relative overflow-hidden ${
                          isEnrolled 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                        }`}>
                          <BookOpen className="w-8 h-8 text-white/90 mb-2" />
                          <h4 className="text-lg font-bold text-white">{course.title}</h4>
                          {isEnrolled && (
                            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                              <span className="text-white text-xs font-semibold">ENROLLED</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span className="font-medium">Code: {course.code}</span>
                            <span>{course.credits || 3} credits</span>
                          </div>

                          {isEnrolled ? (
                            <div className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Enrolled
                            </div>
                          ) : (
                            <button
                              onClick={() => enrollCourse(course.id)}
                              disabled={isLoading}
                              className={`w-full py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-sm ${
                                isLoading
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              </div>
            )}
          </div>

          {/* Recent Enrollments */}
          {enrolledCourses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                Recent Enrollments
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.slice(0, 3).map(course => (
                  <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.code}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    <button
                      onClick={() => setActiveTab('assignments')}
                      className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Assignments
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions Tab */}
      {activeTab === 'quick-actions' && <QuickActionsTab />}

      {/* My Courses Tab */}
      {activeTab === 'my-courses' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            My Courses
          </h2>
          
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrolled courses</h3>
              <p className="text-gray-600 mb-6">Start by enrolling in courses from the Browse Courses tab</p>
              <button
                onClick={() => setActiveTab('browse-courses')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                <BookOpen className="w-5 h-5" />
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm font-semibold">ENROLLED</span>
                    </div>
                    <BookOpen className="w-12 h-12 text-white/90 mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-green-100 text-sm line-clamp-2">{course.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {course.lecturer_name?.charAt(0).toUpperCase() || 'L'}
                      </div>
                      <span className="font-medium">by {course.lecturer_name || 'Unknown'}</span>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('assignments')}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Assignments
                      </button>
                      <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Course Materials
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse Courses Tab */}
      {activeTab === 'browse-courses' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
          
          {availableCourses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
              <p className="text-gray-600">Check back later for new courses</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map(course => {
                const isLoading = loading === course.id;

                return (
                  <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <BookOpen className="w-12 h-12 text-white/90 mb-3" />
                      <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {course.lecturer_name?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <span className="font-medium">by {course.lecturer_name || 'Unknown'}</span>
                      </div>

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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <AssignmentSubmission />
      )}
    </div>
  );
}