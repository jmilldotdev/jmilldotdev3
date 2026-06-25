import AboutContent from "@/components/AboutContent";

export default function AboutPage() {
  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8 text-accent font-mono">
      {/* About Content */}
      <div className="border border-[color:var(--palette-border)] bg-[color:var(--palette-surface-muted)] p-6 mb-8">
        <AboutContent />
      </div>

      {/* Vault CTA */}
      <div className="border border-[color:var(--palette-border)] p-8 text-center bg-[color:var(--palette-surface-muted)]">
        <p className="mb-6 text-base md:text-lg text-foreground tracking-wide">
          jmill&apos;s vault has a full archive of notes, bookmarks, and
          projects.
        </p>
        <a
          href="https://vault.jmill.dev"
          className="inline-flex items-center justify-center px-8 py-3 border border-[color:var(--palette-warm)] bg-[color:var(--palette-warm-soft)] text-warm font-bold tracking-[0.2em] uppercase hover:bg-[color:var(--palette-warm)] hover:text-black transition-colors"
        >
          Explore the Vault
        </a>
      </div>
    </div>
  );
}
