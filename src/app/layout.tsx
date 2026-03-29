import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '식물식물해',
  description: '일조량 기반 식물 추천을 위한 PlantFit MVP workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
