import AboutContent from "@/components/AboutContent";

export default function AboutPage() {
  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8 text-[#00FFFF] font-mono">
      {/* About Content */}
      <div className="border border-[#00FFFF] p-6 mb-8">
        <AboutContent />
      </div>

      {/* Vault CTA */}
      <div className="border border-[#00FFFF] p-8 text-center bg-black/40">
        <p className="mb-6 text-base md:text-lg text-[#d1fff7] tracking-wide">
          jmill&apos;s vault has a full archive of notes, bookmarks, and
          projects.
        </p>
        <a
          href="https://vault.jmill.dev"
          className="inline-flex items-center justify-center px-8 py-3 border border-[#ff4800] bg-[#ff4800]/15 text-[#ff855a] font-bold tracking-[0.2em] uppercase hover:bg-[#ff4800] hover:text-black transition-colors"
        >
          Explore the Vault
        </a>
      </div>
    </div>
  );
}
