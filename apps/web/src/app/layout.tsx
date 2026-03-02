import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Using Inter - a modern, highly readable font designed for screens
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CollabCode - Collaborative VS Code IDE",
  description: "Real-time collaborative coding environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased dark bg-black text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
