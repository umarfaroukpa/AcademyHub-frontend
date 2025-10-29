import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken, clearAuth } from '../../lib/api';
import api from '../../lib/api';
import { AxiosError } from 'axios';
import { Shield, Users, BookOpen, CheckCircle, XCircle, Clock, AlertCircle, GraduationCap, Settings, BarChart3, Filter, Search, Trash2, UserPlus, BookPlus } from 'lucide-react';


interface Course {
    id: number;
    code: string;
    title: string;
    description: string;
    credits: number;
    max_students: number;
    lecturer_id: number;
    lecturer_name?: string; 
    created_at: string;
}

interface EnrollmentResponse {
    id: number;
    student_id: number;
    student_name: string;
    course_id: number;
    course_name: string;
    status: 'pending' | 'active' | 'completed' | 'dropped' | 'withdrawn'; 
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    is_active: boolean;
    created_at: string;
    last_login?: string;
}

interface SystemStats {
    total_students: number;
    total_lecturers: number;
    total_courses: number;
    active_enrollments: number;
    pending_enrollments: number;
    completed_courses: number;
}


export default function AdminDashboard() {
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'enrollments'>('overview');
    const [loading, setLoading] = useState({
        enrollments: true,
        courses: true,
        users: true,
        stats: true
    });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
    const router = useRouter();


    const loginAgain = useCallback(() => {
        clearAuth();
        router.replace('/');
    }, [router]);

    const handleError = useCallback((error: unknown, context: string) => {
        const axiosError = error as AxiosError;
        console.error(`Error fetching ${context}:`, axiosError);
        // Standard check for 401/403
        if (axiosError.response?.status === 401) {
            setError('Authentication failed. Please login again.');
            // loginAgain(); // Auto-redirect logic
        } else if (axiosError.response?.status === 403) {
            setError('Access denied. Admin privileges required.');
        } else {
            // Safely extract error message
            const errorMessage = (axiosError.response?.data as { error?: string })?.error ||
                                (axiosError.message || `An unknown error occurred while fetching ${context}`);
            setError(`Failed to fetch ${context}: ${errorMessage}`);
        }
    }, []);

   

    const fetchStats = useCallback(async () => {
        setLoading(prev => ({ ...prev, stats: true }));
        try {
            const response = await api.get<SystemStats>('/admin/stats');
            setStats(response.data);
        } catch (error: unknown) {
            handleError(error, 'stats');
            setStats({
                total_students: 0,
                total_lecturers: 0,
                total_courses: 0,
                active_enrollments: 0,
                pending_enrollments: 0,
                completed_courses: 0
            }); // Set to zero on failure to prevent null rendering issues
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    }, [handleError]);

    const fetchEnrollments = useCallback(async () => {
        setLoading(prev => ({ ...prev, enrollments: true }));
        try {
            const response = await api.get<EnrollmentResponse[]>('/admin/enrollments');
            setEnrollments(response.data);
        } catch (error: unknown) {
            handleError(error, 'enrollments');
        } finally {
            setLoading(prev => ({ ...prev, enrollments: false }));
        }
    }, [handleError]);

    const fetchCourses = useCallback(async () => {
        setLoading(prev => ({ ...prev, courses: true }));
        try {
            const response = await api.get<Course[]>('/admin/courses');
            setCourses(response.data);
        } catch (error: unknown) {
            handleError(error, 'courses');
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    }, [handleError]);

    const fetchUsers = useCallback(async () => {
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const response = await api.get<User[]>('/admin/users');
            setUsers(response.data);
        } catch (error: unknown) {
            handleError(error, 'users');
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    }, [handleError]);

    // Initial Auth Check and Token Setting
    useEffect(() => {
        console.log('🏁 AdminDashboard mounted');
        const token = localStorage.getItem('token');

        if (token) {
            setAuthToken(token);
        } else {
            setError('No authentication token found');
            // loginAgain(); // Optional: auto-redirect on missing token
        }
    }, []);

    
    useEffect(() => {
        // Only fetch data if there's no fatal error (like 401/403)
        if (error.includes('Authentication failed') || error.includes('Access denied')) return;

        fetchStats(); 

        switch (activeTab) {
            case 'overview':
                // Only fetch for overview if the initial fetch hasn't run or is needed
                fetchEnrollments();
                fetchCourses();
                fetchUsers();
                break;
            case 'users':
                fetchUsers();
                break;
            case 'courses':
                fetchCourses();
                break;
            case 'enrollments':
                fetchEnrollments();
                break;
        }
    }, [activeTab, error, fetchStats, fetchEnrollments, fetchCourses, fetchUsers]);

    const updateEnrollmentStatus = async (enrollmentId: number, newStatus: EnrollmentResponse['status']) => {
        try {
            await api.put(`/admin/enrollments/${enrollmentId}`, { status: newStatus });

            const statusLabels = {
                active: 'activated',
                completed: 'marked as completed',
                dropped: 'dropped',
                withdrawn: 'withdrawn',
                pending: 'marked as pending' 
            };

            alert(`Enrollment ${statusLabels[newStatus]} successfully!`);
            fetchEnrollments();
            fetchStats();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            alert((axiosError.response?.data as { error?: string })?.error || 'Failed to update enrollment');
        }
    };

    const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            await api.put(`/admin/users/${userId}`, { is_active: !currentStatus });
            alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            fetchUsers();
            fetchStats();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            alert((axiosError.response?.data as { error?: string })?.error || 'Failed to update user');
        }
    };

    const deleteCourse = async (courseId: number) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/admin/courses/${courseId}`);
            alert('Course deleted successfully!');
            fetchCourses();
            fetchStats();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            alert((axiosError.response?.data as { error?: string })?.error || 'Failed to delete course');
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role')
            };

            await api.post('/admin/users', userData);
            alert('User created successfully!');
            setShowAddUserModal(false);
            fetchUsers();
            fetchStats();
            (e.target as HTMLFormElement).reset();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            alert((axiosError.response?.data as { error?: string })?.error || 'Failed to create user');
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            const courseData = {
                code: formData.get('code'),
                title: formData.get('title'),
                description: formData.get('description'),
                credits: parseInt(formData.get('credits') as string) || 3,
                max_students: parseInt(formData.get('max_students') as string) || 50,
                // Ensure lecturer_id is not 0 if not selected, and is parsed as number
                lecturer_id: parseInt(formData.get('lecturer_id') as string) || null, 
            };

            await api.post('/admin/courses', courseData);
            alert('Course created successfully!');
            setShowCreateCourseModal(false);
            fetchCourses();
            fetchStats();
            (e.target as HTMLFormElement).reset();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            alert((axiosError.response?.data as { error?: string })?.error || 'Failed to create course');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEnrollments = enrollments.filter(enrollment =>
        enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lecturers = users.filter(user => user.role === 'lecturer');

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Complete system administration and management</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex space-x-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'courses', label: 'Courses', icon: BookOpen },
                        { id: 'enrollments', label: 'Enrollments', icon: GraduationCap }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as unknown as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
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

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats?.total_students || 0}</div>
                                    <div className="text-sm text-gray-600">Total Students</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-8 h-8 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats?.total_lecturers || 0}</div>
                                    <div className="text-sm text-gray-600">Total Lecturers</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats?.total_courses || 0}</div>
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
                                    <div className="text-3xl font-bold text-gray-900">{stats?.pending_enrollments || 0}</div>
                                    <div className="text-sm text-gray-600">Pending Enrollments</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowAddUserModal(true)}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-center"
                                >
                                    <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <span className="text-sm font-medium cursor-pointer text-blue-700">Add User</span>
                                </button>
                                <button
                                    onClick={() => setShowCreateCourseModal(true)}
                                    className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-center"
                                >
                                    <BookPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <span className="text-sm font-medium cursor-pointer text-green-700">Create Course</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {enrollments.slice(0, 3).map(enrollment => (
                                    <div key={enrollment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {enrollment.student_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">{enrollment.student_name}</span> enrolled in{' '}
                                                <span className="font-medium">{enrollment.course_name}</span>
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            enrollment.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : enrollment.status === 'active'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {enrollment.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>

                    {loading.users ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-600">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.role === 'lecturer'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                                            user.is_active
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                        <button
                            onClick={() => setShowCreateCourseModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                        >
                            <BookPlus className="w-4 h-4" />
                            Create Course
                        </button>
                    </div>

                    {loading.courses ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading courses...</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No courses found</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
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
                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => deleteCourse(course.id)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Enrollments Tab */}
            {activeTab === 'enrollments' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Management</h2>

                    {loading.enrollments ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading enrollments...</p>
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No enrollments found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEnrollments.map(enrollment => (
                                <div key={enrollment.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {enrollment.student_name?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-900">{enrollment.student_name}</span>
                                                    <p className="text-sm text-gray-600">enrolled in <span className="font-medium text-gray-900">{enrollment.course_name}</span></p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Enrolled on {new Date(enrollment.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {enrollment.status !== 'active' && (
                                                <button
                                                    onClick={() => updateEnrollmentStatus(enrollment.id, 'active')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                            )}
                                            {enrollment.status === 'active' && (
                                                <button
                                                    onClick={() => updateEnrollmentStatus(enrollment.id, 'completed')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Complete
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateEnrollmentStatus(enrollment.id, 'withdrawn')}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {enrollment.status === 'active' ? 'Withdraw' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add User Modal (Completed JSX) */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                                <button
                                    onClick={() => setShowAddUserModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="e.g., John Doe"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="e.g., john@example.com"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white"
                                        required
                                        // Added default selection to prevent unhandled state
                                        defaultValue="student" 
                                    >
                                        <option value="student">Student</option>
                                        <option value="lecturer">Lecturer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Create User
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Course Modal (Added Missing JSX) */}
            {showCreateCourseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                                <button
                                    onClick={() => setShowCreateCourseModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="title"
                                        type="text"
                                        placeholder="e.g., Introduction to React"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="code"
                                        type="text"
                                        placeholder="e.g., CS101"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Brief summary of the course content"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Credits
                                        </label>
                                        <input
                                            name="credits"
                                            type="number"
                                            min="1"
                                            defaultValue="3"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Students
                                        </label>
                                        <input
                                            name="max_students"
                                            type="number"
                                            min="1"
                                            defaultValue="50"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Lecturer <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="lecturer_id"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors bg-white"
                                        required
                                    >
                                        <option value="">-- Select Lecturer --</option>
                                        {lecturers.map(lecturer => (
                                            <option key={lecturer.id} value={lecturer.id}>
                                                {lecturer.name} ({lecturer.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    <BookPlus className="w-5 h-5" />
                                    Create Course
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
