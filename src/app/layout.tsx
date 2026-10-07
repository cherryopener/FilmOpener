import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FilmOpener | 필름오프너 - 아날로그 필름 & 촬영·현상·스캔 통합 관리",
  description: "보유 필름, 카메라/렌즈, 다중 출사일 날씨 기록, 자가현상 약품 누적 및 스캔 아카이브를 관리하는 올인원 반응형 아날로그 포토그래피 앱",
  keywords: ["필름카메라", "필름보관", "자가현상", "필름스캔", "아날로그사진", "FilmOpener"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FilmOpener",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f1217",
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
