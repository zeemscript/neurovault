import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroVault",
  description: "NeuroVault is an all-in-one AI & Browser Security Platform that protects organizations from web-borne threats and browsing risks. Our code-free security layer connects seamlessly with any browser to protect every user action across AI tools, SaaS platforms, and web applications.",
  keywords: ["NeuroVault", "AI", "Browser Security", "Code-free", "Security Layer", "AI Tools", "SaaS Platforms", "Web Applications"],
  authors: [{ name: "NeuroVault", url: "https://neurovault.com" }],
  openGraph: {
    title: "NeuroVault",
    description: "NeuroVault is an all-in-one AI & Browser Security Platform that protects organizations from web-borne threats and browsing risks. Our code-free security layer connects seamlessly with any browser to protect every user action across AI tools, SaaS platforms, and web applications.",
    url: "https://neurovault.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <Navbar/>
        {children}
      </body>
    </html>
  );
}
