'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import LayoutWrapper from "../components/LayoutWrapper";
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// import error boundary with no SSR
const AppErrorBoundary = dynamic(
  () => import('../components/ErrorBoundary/AppErrorBoundary'),
  { ssr: false }
);

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <AppErrorBoundary showDetails={isDevelopment}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </GoogleOAuthProvider>
    </AppErrorBoundary>
  );
}