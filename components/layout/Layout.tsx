import React, { ReactNode } from 'react';
import Header from './Header';
import FooterPlayer from '@/components/ui/FooterPlayer';
import { AudioProvider } from '@/contexts/AudioContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AudioProvider>
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {children}
          </div>
        </main>
        <FooterPlayer />
      </div>
    </AudioProvider>
  );
};

export default Layout;

