'use client';

import { usePathname } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import Header from '../components/Header'; 
import Footer from '../components/Footer';

export default function LayoutWrapper({ children, }: { children: React.ReactNode; }) {
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  const isErrorPage = 
      pathname?.includes('/404') || 
      pathname?.includes('/500') || 
      pathname?.includes('/error') || 
      pathname?.includes('/not-found');
  if (isErrorPage) {
    return (
      <main className="min-h-screen relative" style={{ zIndex: 1, isolation: 'isolate' }}>
        {children}
      </main>
    );
  }
 
  // If NOT an error page, wrap the full content with the provider.
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="relative min-h-screen">
        <div className="relative" style={{ zIndex: 50 }}>
           <Header />
        </div>
        <main 
          className="min-h-screen relative" 
          style={{ 
            zIndex: 1,
            backgroundColor: !isAuthPage && !isLandingPage ? '#f9fafb' : 'transparent',
            isolation: 'isolate'
          }}>
          {children}
        </main>
        {!isAuthPage && (<div className="relative" style={{ zIndex: 1 }}><Footer /></div>)}
      </div>
    </GoogleOAuthProvider>
  );
}