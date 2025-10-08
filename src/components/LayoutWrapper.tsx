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

  return (
    <>
      <Header />
      <main className={`min-h-screen ${isAuthPage ? '' : 'bg-gray-50'}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}