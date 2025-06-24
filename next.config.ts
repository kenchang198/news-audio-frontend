import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  
  async headers() {
    return [
      {
        // APIルートとページ
        source: '/((?!mock/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // 音声ファイル用の特別なヘッダー
        source: '/mock/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
          {
            key: 'Content-Type',
            value: 'audio/mpeg',
          },
        ],
      },
      {
        // JSONファイル用
        source: '/mock/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
