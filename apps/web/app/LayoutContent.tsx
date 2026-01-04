'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <body className="min-h-screen bg-offwhite">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    );
  }

  return (
    <body className="bg-offwhite min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
        <span className="font-bold text-lg text-gray-900">NOLIA</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 min-h-[calc(100vh-65px)] md:min-h-screen overflow-y-auto">
        {children}
      </main>
    </body>
  );
}
