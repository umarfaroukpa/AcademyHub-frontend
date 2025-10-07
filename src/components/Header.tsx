'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GraduationCap, LogOut, Menu, X, User, Settings, Bell, ChevronRight } from 'lucide-react';
import { User as UserType } from '../../types/types';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function DynamicHeader() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load user data and listen for changes
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          handleCleanup();
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    // Initial load
    loadUser();

    // Listen for storage changes (when user logs in/out in another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUser();
      }
    };

    // Custom event for same-tab updates
    const handleUserChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  // Generate breadcrumbs based on current route
  useEffect(() => {
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
      const pathSegments = pathname.split('/').filter(Boolean);
      const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

      let currentPath = '';
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbItems.push({ label, path: currentPath });
      });

      return breadcrumbItems;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [pathname]);

  const handleCleanup = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userChanged'));
  };

  const handleLogout = () => {
    handleCleanup();
    router.push('/');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'lecturer':
        return 'bg-blue-500';
      case 'student':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'lecturer':
        return '👨‍🏫';
      case 'student':
        return '🎓';
      default:
        return '👤';
    }
  };

  // Don't show header on auth pages or while loading
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  if (isAuthPage || isLoading) {
    return null;
  }

  // Default user for guest state
  const displayUser = user || { 
    id: 0, 
    name: 'Guest', 
    email: 'guest@example.com', 
    role: 'guest' 
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center cursor-pointer"
              onClick={() => router.push(user ? '/dashboard' : '/')}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AcademiHub
              </h1>
              <p className="text-xs text-gray-500">Academic Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-700">
                        {user ? `Welcome back, ${user.name}!` : 'Please login to see notifications'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Just now</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {displayUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{displayUser.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{getRoleIcon(displayUser.role)}</span>
                  <span className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(displayUser.role)} text-white rounded-full font-medium`}>
                    {displayUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => user ? router.push('/settings') : router.push('/login')}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 bg-blue-600 text-white cursor-pointer hover:bg-blue-700 rounded-lg font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Breadcrumbs - Show only when not on home/landing page */}
        {pathname !== '/' && breadcrumbs.length > 1 && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-100">
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => router.push(crumb.path)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {displayUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{displayUser.name}</p>
                  <p className="text-sm text-gray-600">{displayUser.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 ${getRoleBadgeColor(displayUser.role)} text-white rounded-full font-medium`}>
                    {getRoleIcon(displayUser.role)} {displayUser.role}
                  </span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => user ? router.push('/profile') : router.push('/login')}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => user ? router.push('/settings') : router.push('/login')}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => router.push('/signup')}
                      className="w-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-left"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}