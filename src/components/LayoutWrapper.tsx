'use client';

import { usePathname } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import Header from '../components/Header'; 
import Footer from '../components/Footer';

export default function LayoutWrapper({
 children,
}: {
 children: React.ReactNode;
}) {
 const pathname = usePathname();

 // Re-added missing variable definitions
 const isAuthPage = pathname === '/login' || pathname === '/signup';
 const isLandingPage = pathname === '/';

  const isErrorPage = 
      pathname.includes('/404') || 
      pathname.includes('/500') || 
      pathname.includes('/error') || 
      pathname.includes('/not-found');

// If it's an error page, return ONLY the children wrapped in a minimal div.
 if (isErrorPage) {
      return (
       <main className="min-h-screen relative" style={{ zIndex: 1, isolation: 'isolate' }}>
      {children}
       </main>
    );
 }
 
 return (
 // Wrap the standard layout content with all your Context Providers
 <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="relative min-h-screen">
 
      {/* Header wrapper with isolation */}
 <div className="relative" style={{ zIndex: 50 }}>
      <Header />
     </div>
 
     {/* Main content */}
      <main 
       className="min-h-screen relative" 
       style={{ 
         zIndex: 1,
        // These now have defined variables!
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
 </GoogleOAuthProvider>
  );
}