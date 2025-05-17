"use client";

export default function Footer() {
  return (
    <footer className="col-span-2 row-start-3 retro-border p-2.5">
      <div className="flex items-center w-full">
        <span className="text-primary mr-2.5">NERV&gt;</span>
        <input
          type="text"
          className="retro-input"
          placeholder="ENTER COMMAND"
          defaultValue="DISPLAY PROJECTS"
        />
      </div>
    </footer>
  );
}
