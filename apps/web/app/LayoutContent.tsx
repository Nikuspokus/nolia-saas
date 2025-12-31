'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <body className="flex bg-offwhite">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </body>
  );
}
