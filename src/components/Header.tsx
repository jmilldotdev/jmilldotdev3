"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <header className="w-full p-2.5 flex justify-between items-center h-20 bg-gray-900">
      <div className="flex items-center">
        <Link href="/">
          <div className="logo">JMILL</div>
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="status">SYSTEM STATUS: NORMAL</div>
      </div>
      <div className="hidden lg:block">
        <div className="time">{time}</div>
      </div>
    </header>
  );
}
