
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppErrorBoundary } from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: "AcademiHub - Academic Management Platform",
  description: "Manage courses, enrollments, and academic activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const isDevelopment = process.env.NODE_ENV === 'development';
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppErrorBoundary showDetails={isDevelopment}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </GoogleOAuthProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}