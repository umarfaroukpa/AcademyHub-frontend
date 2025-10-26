'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  return (
    <div className="relative min-h-screen">
      {/* Landing page background - only show on landing page */}
      {isLandingPage && (
        <div 
          className="fixed inset-0 -z-50" 
          style={{ 
            backgroundImage: `url('/26265399.jpg')`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: 0.9, 
            background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.85), rgba(126, 34, 206, 0.9), rgba(236, 72, 153, 0.85))'
          }}
        />
      )}
      
      {/* Solid background for all other pages (except auth and landing) */}
      {!isAuthPage && !isLandingPage && (
        <div 
          className="fixed inset-0"
          style={{ 
            backgroundColor: '#f9fafb',
            zIndex: 0
          }}
        />
      )}
      
      {/* Header wrapper with isolation */}
      <div className="relative" style={{ zIndex: 50 }}>
        <Header />
      </div>
      
      {/* Main content with solid background for non-landing pages */}
      <main 
        className="min-h-screen relative" 
        style={{ 
          zIndex: 1,
          backgroundColor: !isAuthPage && !isLandingPage ? '#f9fafb' : 'transparent',
          isolation: 'isolate'
        }}
      >
        {children}
      </main>
      
      {/* Footer */}
      {!isAuthPage && (
        <div className="relative" style={{ zIndex: 1 }}>
          <Footer />
        </div>
      )}
    </div>
  );
}