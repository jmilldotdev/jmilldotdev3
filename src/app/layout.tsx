import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Your Name - Personal Website",
  description: "Personal website with retro CRT aesthetic",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        <div id="app" className="flex flex-col h-screen p-2 gap-2">
          <Header />
          <main className="flex-1 relative border border-gray-700 bg-opacity-70 bg-gray-900 overflow-hidden">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
};

export default Layout;
