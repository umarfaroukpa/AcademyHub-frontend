'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppErrorBoundary } from '../components/ErrorBoundary';
import LayoutWrapper from "../components/LayoutWrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
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