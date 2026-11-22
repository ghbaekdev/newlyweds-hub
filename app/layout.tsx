import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import SiteNavigation from '@/widgets/site-navigation/ui/SiteNavigation';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'newlyweds-test',
  description: '신혼부부 공고·혜택 API 테스트',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteNavigation />
        {children}
      </body>
    </html>
  );
}
