import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ICAT College of Design & Media | 3D Interactive Experience",
  description: "Experience next-generation design, animation, game art, and media education in full 3D interactive glory at ICAT College.",
  icons: {
    icon: "/icat-emblem.png",
    shortcut: "/icat-emblem.png",
    apple: "/icat-emblem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#050814] text-slate-100 min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
