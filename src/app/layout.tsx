import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Script from "next/script";
import QuickSwitcher from "@/components/QuickSwitcher";
import { getQuickSwitcherData } from "@/lib/quick-switcher-data";

export const metadata: Metadata = {
  title: "jmill",
  description: "jmill's digital shrine to himself.",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pageMetadata, tagData } = getQuickSwitcherData();

  return (
    <html lang="en">
      <Script
        defer
        src="https://umami-tawny-theta.vercel.app/script.js"
        data-website-id="016992b7-62de-4ef5-84aa-b0274ddaabb0"
      />
      <body className="min-h-screen bg-black">
        <QuickSwitcher pageMetadata={pageMetadata} tagData={tagData}>
          <div id="app" className="flex flex-col h-screen p-2 gap-2">
            <Header />
            <main className="flex flex-col justify-start flex-1 relative border border-gray-700 bg-opacity-70 bg-gray-900 overflow-auto">
              {children}
            </main>
            <Footer />
          </div>
        </QuickSwitcher>
      </body>
    </html>
  );
};

export default Layout;
