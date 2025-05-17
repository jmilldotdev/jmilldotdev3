"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState("24:15:37");

  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, mins, secs] = time.split(":").map(Number);
      let newSecs = secs - 1;
      let newMins = mins;
      let newHours = hours;

      if (newSecs < 0) {
        newSecs = 59;
        newMins -= 1;
        if (newMins < 0) {
          newMins = 59;
          newHours -= 1;
          if (newHours < 0) {
            newHours = 0;
            newMins = 0;
            newSecs = 0;
          }
        }
      }

      setTime(
        `${newHours.toString().padStart(2, "0")}:${newMins
          .toString()
          .padStart(2, "0")}:${newSecs.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

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
        <div className="time">T-MINUS {time}</div>
      </div>
    </header>
  );
}
