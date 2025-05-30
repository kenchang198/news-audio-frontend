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
        <footer className="bg-white mt-12 py-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} はてブ Tech Radio
            </p>
          </div>
        </footer>
        <FooterPlayer />
      </div>
    </AudioProvider>
  );
};

export default Layout;

