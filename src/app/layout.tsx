import React from "react";
import type { Metadata } from "next";
import "./globals.css";
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
          <div
            id="app"
            className="grid grid-rows-[80px_1fr] h-screen p-2.5 gap-2.5"
          >
            <Header />
            <main className="relative border border-gray-700 bg-gray-900/70 flex flex-col justify-start overflow-auto">
              {children}
            </main>
          </div>
        </QuickSwitcher>
      </body>
    </html>
  );
};

export default Layout;
