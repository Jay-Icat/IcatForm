import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICAT College of Design & Media | 3D Interactive Experience",
  description: "Experience next-generation design, animation, game art, and media education in full 3D interactive glory at ICAT College.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#050814] text-slate-100 min-h-screen overflow-x-hidden select-none">
        {children}
      </body>
    </html>
  );
}
