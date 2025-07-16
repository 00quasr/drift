'use client'

import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <main className={`flex-1 relative z-10 ${isHomePage ? '' : 'pt-16'}`}>
      {children}
    </main>
  );
} 