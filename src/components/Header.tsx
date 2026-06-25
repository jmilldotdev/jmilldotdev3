"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDesktop } from "@/contexts/DesktopContext";

export default function Header() {
  const [time, setTime] = useState("");
  const pathname = usePathname();
  const { showDesktop, setShowDesktop } = useDesktop();
  const isHomepage = pathname === "/";

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

  const handleClick = (e: React.MouseEvent) => {
    if (isHomepage && showDesktop) {
      e.preventDefault();
      e.stopPropagation();
      setShowDesktop(false);
    }
  };

  return (
    <header className="w-full p-2.5 flex justify-between items-center h-20 border border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)] backdrop-blur">
      <div className="flex items-center">
        <Link href="/" onClick={handleClick}>
          <div className="text-warm font-bold text-2xl flex items-center before:content-[''] before:inline-block before:w-0 before:h-0 before:border-l-[10px] before:border-l-transparent before:border-r-[10px] before:border-r-transparent before:border-b-[20px] before:border-b-[color:var(--palette-warm)] before:mr-2.5 hover:text-foreground transition-colors cursor-pointer">
            JMILL
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-foreground">{time}</div>
      </div>
    </header>
  );
}
