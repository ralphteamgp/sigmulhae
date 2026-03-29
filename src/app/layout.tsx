import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '식물식물해',
  description: 'AI 기반 실내 식물 추천 서비스 — 일조량 분석으로 우리 집에 딱 맞는 식물을 찾아드려요',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
