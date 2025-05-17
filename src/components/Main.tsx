"use client";

import { useEffect } from "react";

export default function Main() {
  useEffect(() => {
    // Add scattered Hebrew characters
    const hebrewChars = "אבגדהוזחטיכסעפצקרשת";
    const main = document.querySelector("main");
    if (main) {
      for (let i = 0; i < 15; i++) {
        const char = document.createElement("div");
        char.className = "hebrew-char absolute text-primary/40 text-sm z-0";
        char.textContent =
          hebrewChars[Math.floor(Math.random() * hebrewChars.length)];
        char.style.left = `${Math.random() * 90 + 5}%`;
        char.style.top = `${Math.random() * 90 + 5}%`;
        char.style.opacity = `${0.1 + Math.random() * 0.3}`;
        main.appendChild(char);
      }
    }

    // Create grid lines
    const gridLines = document.querySelector(".grid-lines");
    if (gridLines) {
      for (let i = 1; i < 10; i++) {
        const hLine = document.createElement("div");
        hLine.className = "h-line absolute h-px w-full bg-white/10";
        hLine.style.top = `${i * 10}%`;
        gridLines.appendChild(hLine);

        const vLine = document.createElement("div");
        vLine.className = "v-line absolute w-px h-full bg-white/10";
        vLine.style.left = `${i * 10}%`;
        gridLines.appendChild(vLine);
      }
    }
  }, []);

  return (
    <main className="col-start-1 row-start-2 retro-border relative flex flex-col justify-center items-center text-center p-8">
      <div className="grid-lines absolute inset-0 pointer-events-none -z-10" />

      <h1 className="text-4xl text-secondary mb-5">[Your Name]</h1>
      <p className="text-white text-lg mb-8 max-w-[80%] leading-relaxed">
        Hello! I'm a [Your Profession/Passion]. This is my personal website,
        built with a love for retro aesthetics and modern web technology. I'm
        passionate about [Your Interests]. Explore my projects and get in touch!
      </p>

      <div className="flex justify-center gap-5 mt-5">
        <a href="#project1" className="retro-link text-xl">
          Project 1
        </a>
        <a href="#project2" className="retro-link text-xl">
          Project 2
        </a>
        <a href="#contact" className="retro-link text-xl">
          Contact
        </a>
      </div>
    </main>
  );
}
