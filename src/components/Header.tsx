"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QuickSwitcherTrigger from "./QuickSwitcherTrigger";

export default function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full p-2.5 flex justify-between items-center h-20 border border-gray-700 bg-black/50">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-[#FF4800] font-bold text-2xl flex items-center before:content-[''] before:inline-block before:w-0 before:h-0 before:border-l-[10px] before:border-l-transparent before:border-r-[10px] before:border-r-transparent before:border-b-[20px] before:border-b-[#FF4800] before:mr-2.5">JMILL</div>
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="text-[#00FFFF] text-sm animate-blink">SYSTEM STATUS: NORMAL</div>
      </div>
      <div className="flex items-center gap-4">
        <QuickSwitcherTrigger />
        <div className="hidden lg:block">
          <div className="text-white">{time}</div>
        </div>
      </div>
    </header>
  );
}
