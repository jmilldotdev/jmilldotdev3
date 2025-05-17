"use client";

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
    <header className="col-span-2 retro-border p-2.5 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-primary mr-2.5" />
        <span className="text-primary font-bold text-2xl">JMILL</span>
      </div>
      <div className="text-secondary text-sm animate-blink">
        SYSTEM STATUS: NORMAL
      </div>
      <div className="text-white text-sm">T-MINUS {time}</div>
    </header>
  );
}
