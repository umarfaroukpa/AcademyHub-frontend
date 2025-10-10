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

    loadUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUser();
      }
    };

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

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  if (isAuthPage || isLoading) {
    return null;
  }

  const displayUser = user || { 
    id: 0, 
    name: 'Guest', 
    email: 'guest@example.com', 
    role: 'guest' 
  };

  return (
    <header 
      className="sticky top-0 z-50 shadow-lg relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* Background Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'url(/52911715-new.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Additional Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.90) 50%, rgba(240, 147, 251, 0.85) 100%)',
        }}
      />

      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center cursor-pointer border border-white/30 hover:bg-white/30 transition-all"
              onClick={() => router.push(user ? '/dashboard' : '/')}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">
                AcademiHub
              </h1>
              <p className="text-xs text-purple-100">Academic Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors border border-white/30"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 py-2">
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
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-lg border border-white/30">
              <div className="w-9 h-9 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center text-white font-semibold text-sm border border-white/50">
                {displayUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{displayUser.name}</p>
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
              className="p-2 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors border border-white/30"
              onClick={() => user ? router.push('/profile') : router.push('/login')}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 rounded-lg transition-colors font-medium border border-white/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg font-medium border border-white/30 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 bg-white/30 backdrop-blur-lg text-white hover:bg-white/40 rounded-lg font-medium border border-white/50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg border border-white/30"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Breadcrumbs */}
        {pathname !== '/' && breadcrumbs.length > 1 && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 border-t border-white/20">
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-purple-200 mx-2" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-white font-medium">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => router.push(crumb.path)}
                      className="text-purple-100 hover:text-white transition-colors"
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
          <div className="md:hidden border-t border-white/20 bg-white/10 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 p-4 bg-white/20 backdrop-blur-lg rounded-lg border border-white/30">
                <div className="w-12 h-12 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center text-white font-semibold border border-white/50">
                  {displayUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-white">{displayUser.name}</p>
                  <p className="text-sm text-purple-100">{displayUser.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 ${getRoleBadgeColor(displayUser.role)} text-white rounded-full font-medium`}>
                    {getRoleIcon(displayUser.role)} {displayUser.role}
                  </span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors border border-white/20"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors border border-white/20"
                  onClick={() => user ? router.push('/profile') : router.push('/login')}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors border border-white/20"
                  onClick={() => user ? router.push('/profile') : router.push('/login')}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 rounded-lg transition-colors font-medium border border-white/30"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-4 py-3 text-white hover:bg-white/20 backdrop-blur-lg rounded-lg transition-colors font-medium text-left border border-white/20"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => router.push('/signup')}
                      className="w-full px-4 py-3 bg-white/30 backdrop-blur-lg text-white hover:bg-white/40 rounded-lg transition-colors font-medium text-left border border-white/50"
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

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </header>
  );
}