// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { GraduationCap, LogOut, Menu, X, User, Settings, Bell } from 'lucide-react';
// import { User as UserType } from '../../types/types';

// export default function DynamicHeader() {
//   const [user, setUser] = useState<UserType | null>(null);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     // Get user data from localStorage
//     const userData = localStorage.getItem('user');
//     const token = localStorage.getItem('token');
    
//     if (userData && token) {
//       try {
//         setUser(JSON.parse(userData));
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//         handleCleanup();
//       }
//     }
    
//     setIsLoading(false);
//   }, []);

//   const handleCleanup = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   const handleLogout = () => {
//     handleCleanup();
//     router.push('/');
//   };

//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-red-500';
//       case 'lecturer':
//         return 'bg-blue-500';
//       case 'student':
//         return 'bg-green-500';
//       default:
//         return 'bg-gray-500';
//     }
//   };

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return '👑';
//       case 'lecturer':
//         return '👨‍🏫';
//       case 'student':
//         return '🎓';
//       default:
//         return '👤';
//     }
//   };

//   // Don't show header on auth pages or while loading
//   const isAuthPage = pathname === '/login' || pathname === '/signup';
  
//   if (isAuthPage || isLoading) {
//     return null;
//   }

//   // Default user for guest state
//   const displayUser = user || { 
//     id: 0, 
//     name: 'Guest', 
//     email: 'guest@example.com', 
//     role: 'guest' 
//   };

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
//           {/* Logo and Brand */}
//           <div className="flex items-center space-x-3">
//             <div 
//               className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center cursor-pointer"
//               onClick={() => router.push(user ? '/dashboard' : '/')}
//             >
//               <GraduationCap className="w-6 h-6 text-white" />
//             </div>
//             <div className="hidden sm:block">
//               <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 AcademiHub
//               </h1>
//               <p className="text-xs text-gray-500">Academic Management</p>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-6">
//             {/* Notifications */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//               >
//                 <Bell className="w-5 h-5" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//               </button>

//               {/* Notifications Dropdown */}
//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
//                   <div className="px-4 py-2 border-b border-gray-100">
//                     <h3 className="font-semibold text-gray-900">Notifications</h3>
//                   </div>
//                   <div className="max-h-96 overflow-y-auto">
//                     <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
//                       <p className="text-sm text-gray-700">
//                         {user ? 'Welcome to AcademiHub!' : 'Please login to see notifications'}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">Just now</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* User Info */}
//             <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
//               <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                 {displayUser.name?.charAt(0).toUpperCase() || 'U'}
//               </div>
//               <div className="text-left">
//                 <p className="text-sm font-semibold text-gray-900">{displayUser.name}</p>
//                 <div className="flex items-center space-x-1">
//                   <span className="text-xs">{getRoleIcon(displayUser.role)}</span>
//                   <span className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(displayUser.role)} text-white rounded-full font-medium`}>
//                     {displayUser.role}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Settings */}
//             <button 
//               className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//               onClick={() => user ? router.push('/settings') : router.push('/login')}
//             >
//               <Settings className="w-5 h-5" />
//             </button>

//             {/* Auth Buttons */}
//             {user ? (
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
//               >
//                 <LogOut className="w-4 h-4" />
//                 <span>Logout</span>
//               </button>
//             ) : (
//               <div className="flex items-center space-x-3">
//                 <button
//                   onClick={() => router.push('/login')}
//                   className="px-4 py-2 text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
//                 >
//                   Login
//                 </button>
//                 <button
//                   onClick={() => router.push('/signup')}
//                   className="px-4 py-2 bg-blue-600 text-white cursor-pointer hover:bg-blue-700 rounded-lg font-medium"
//                 >
//                   Sign Up
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
//           >
//             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden border-t border-gray-200 bg-white">
//             <div className="px-4 py-4 space-y-4">
//               {/* User Info Mobile */}
//               <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
//                   {displayUser.name?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">{displayUser.name}</p>
//                   <p className="text-sm text-gray-600">{displayUser.email}</p>
//                   <span className={`inline-block mt-1 text-xs px-2 py-1 ${getRoleBadgeColor(displayUser.role)} text-white rounded-full font-medium`}>
//                     {getRoleIcon(displayUser.role)} {displayUser.role}
//                   </span>
//                 </div>
//               </div>

//               {/* Mobile Actions */}
//               <div className="space-y-2">
//                 <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
//                   <Bell className="w-5 h-5" />
//                   <span>Notifications</span>
//                   <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
//                 </button>

//                 <button 
//                   className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                   onClick={() => user ? router.push('/profile') : router.push('/login')}
//                 >
//                   <User className="w-5 h-5" />
//                   <span>Profile</span>
//                 </button>

//                 <button 
//                   className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                   onClick={() => user ? router.push('/settings') : router.push('/login')}
//                 >
//                   <Settings className="w-5 h-5" />
//                   <span>Settings</span>
//                 </button>

//                 {user ? (
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
//                   >
//                     <LogOut className="w-5 h-5" />
//                     <span>Logout</span>
//                   </button>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => router.push('/login')}
//                       className="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-left"
//                     >
//                       Login
//                     </button>
//                     <button
//                       onClick={() => router.push('/signup')}
//                       className="w-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-left"
//                     >
//                       Sign Up
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, GraduationCap, Calendar, FileText, TrendingUp, Award, Clock } from 'lucide-react';

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!isMounted) return null;

  const features = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Create, organize, and manage academic courses with ease. Upload syllabi, set schedules, and track progress.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Student Enrollment',
      description: 'Seamless enrollment system for students. Browse courses, enroll instantly, and access all course materials.',
      color: 'purple'
    },
    {
      icon: GraduationCap,
      title: 'Lecturer Tools',
      description: 'Comprehensive tools for educators. Manage multiple courses, track student progress, and share resources.',
      color: 'indigo'
    },
    {
      icon: Calendar,
      title: 'Schedule Tracking',
      description: 'Stay organized with integrated calendar. Never miss a class, assignment, or important deadline.',
      color: 'pink'
    },
    {
      icon: FileText,
      title: 'Resource Sharing',
      description: 'Share and access course materials effortlessly. Upload documents, presentations, and study guides.',
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track performance metrics, enrollment trends, and course statistics with detailed analytics.',
      color: 'orange'
    }
  ];

  const stats = [
    { label: 'Active Courses', value: '500+', icon: BookOpen },
    { label: 'Students Enrolled', value: '10K+', icon: Users },
    { label: 'Expert Lecturers', value: '200+', icon: GraduationCap },
    { label: 'Success Rate', value: '95%', icon: Award }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      pink: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      green: 'bg-green-500/10 text-green-600 border-green-500/20',
      orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">  
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Academic Journey
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform designed for students, lecturers, and administrators. 
            Manage courses, track progress, and enhance the learning experience with powerful tools.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg group"
            >
              Start Free Today
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-lg transition-all font-semibold text-lg border-2 border-gray-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to streamline academic management for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 ${getColorClasses(feature.color)} rounded-xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators using AcademiHub to enhance their academic experience
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}