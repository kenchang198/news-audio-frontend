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
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Produce by: Ken Sasamoto</p>
              <p className="pt-1">BGM: <a href="https://dova-s.jp/bgm/play19264.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">NITE CITY</a> by <a href="https://dova-s.jp/_contents/author/profile129.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">POLARIS PLUS</a></p>
              <p className="pt-2">※1. コンテンツの生成・読み上げはAIが自動で行っているため、情報に誤りが含まれる場合があります。</p>
              <p>※2. 当サービスは<a href="https://b.hatena.ne.jp/hotentry/it" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">はてなブックマーク［テクノロジー］カテゴリの人気記事</a>を基にしたサービスですが、公式サイトではありません。</p>
            </div>
          </div>
        </footer>
      </div>
    </AudioProvider>
  );
};

export default Layout;

