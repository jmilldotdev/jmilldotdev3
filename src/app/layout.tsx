import React from "react";
import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen flex flex-col">
        <div
          id="app"
          className="grid h-screen grid-rows-[80px_1fr_80px] gap-2 p-2"
        >
          <header className="overflow-hidden whitespace-nowrap overflow-ellipsis bg-gray-800 text-white p-4 flex justify-between items-center border border-gray-700">
            <div className="logo">JMILL</div>
            <div className="status">SYSTEM STATUS: NORMAL</div>
            <div className="time">T-MINUS 24:15:37</div>
          </header>
          <main className="flex-grow relative border border-gray-700 bg-opacity-70 bg-gray-900">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-4 border border-gray-700">
            <div className="command-line">
              <span className="command-prompt">CMD&gt;</span>
              <input
                type="text"
                className="command-input"
                placeholder="ENTER COMMAND"
                defaultValue="ANALYZE SPHERE COMPOSITION"
              />
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default Layout;
