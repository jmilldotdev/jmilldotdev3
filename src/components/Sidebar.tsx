"use client";

import { useEffect, useState } from "react";

export default function Sidebar() {
  const [terminalLines, setTerminalLines] = useState([
    "0xFF872A > Welcome to my personal website!",
    "0xFF872B > Exploring the digital frontier.",
    "0xFF872C > Check out my projects!",
    "0xFF872D > Building the future, one line at a time.",
  ]);

  return (
    <aside className="col-start-2 row-start-2 retro-border p-4 overflow-hidden relative">
      <div className="h-full overflow-y-auto retro-scrollbar pr-2.5">
        <div className="mb-5">
          <h3 className="text-primary mb-2.5 border-b border-primary pb-0.5 text-lg">
            ABOUT ME
          </h3>
          <p className="text-white/80">
            I'm a [Your Profession] with a passion for [Your Interests]. I have
            experience in [List your skills/technologies].
          </p>
        </div>

        <div className="mb-5">
          <h3 className="text-primary mb-2.5 border-b border-primary pb-0.5 text-lg">
            MY SKILLS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="text-white/60">Frontend:</span>
              <span className="text-secondary">HTML, CSS, JavaScript</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Backend:</span>
              <span className="text-secondary">Node.js, Python</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Frameworks:</span>
              <span className="text-secondary">React, Express</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Database:</span>
              <span className="text-secondary">PostgreSQL, MongoDB</span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-primary mb-2.5 border-b border-primary pb-0.5 text-lg">
            CONNECT WITH ME
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="text-white/60">LinkedIn:</span>
              <a href="#" className="text-secondary hover:text-primary">
                [Your LinkedIn]
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">GitHub:</span>
              <a href="#" className="text-secondary hover:text-primary">
                [Your GitHub]
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Email:</span>
              <a href="#" className="text-secondary hover:text-primary">
                [Your Email]
              </a>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-primary mb-2.5 border-b border-primary pb-0.5 text-lg">
            TERMINAL
          </h3>
          <div className="h-[120px] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full animate-scroll">
              {terminalLines.map((line, index) => (
                <div
                  key={index}
                  className="text-secondary text-sm leading-tight"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
