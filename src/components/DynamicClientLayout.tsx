// 'use client';

// import dynamic from 'next/dynamic';
// import React from 'react';

// // Disables SSR for the component and its children
// const ClientLayout = dynamic(() => import('../app/client-layout'), { 
//   ssr: false, 
//   loading: () => <div className="min-h-screen"></div> 
// });

// export function DynamicClientLayout({ children }: { children: React.ReactNode }) {
//     return <ClientLayout>{children}</ClientLayout>;
// }