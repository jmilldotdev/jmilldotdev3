import Link from "next/link";
import AboutContent from "@/components/AboutContent";

export default function AboutPage() {
  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8 text-[#00FFFF] font-mono">
      {/* About Content */}
      <div className="border border-[#00FFFF] p-6 mb-8">
        <AboutContent />
      </div>

      {/* Navigation */}
      <div className="border border-[#00FFFF] p-6">
        <h2 className="text-lg font-bold mb-4 border-b border-[#00FFFF] border-opacity-30 pb-2">
          NAVIGATION
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/c/index"
            className="block p-4 border border-[#00FFFF] hover:bg-[#00FFFF] hover:bg-opacity-10 transition-colors"
          >
            <div className="text-[#ff4800] font-bold mb-1">Index</div>
            <div className="text-sm opacity-75">Main site index</div>
          </Link>
          <Link
            href="/c/projects"
            className="block p-4 border border-[#00FFFF] hover:bg-[#00FFFF] hover:bg-opacity-10 transition-colors"
          >
            <div className="text-[#ff4800] font-bold mb-1">Projects</div>
            <div className="text-sm opacity-75">My projects and work</div>
          </Link>
          <Link
            href="/t/bookmark"
            className="block p-4 border border-[#00FFFF] hover:bg-[#00FFFF] hover:bg-opacity-10 transition-colors"
          >
            <div className="text-[#ff4800] font-bold mb-1">Bookmarks</div>
            <div className="text-sm opacity-75">
              Cool things from around the web
            </div>
          </Link>
          <Link
            href="/t/entity"
            className="block p-4 border border-[#00FFFF] hover:bg-[#00FFFF] hover:bg-opacity-10 transition-colors"
          >
            <div className="text-[#ff4800] font-bold mb-1">Entities</div>
            <div className="text-sm opacity-75">
              Interesting concepts and ideas
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
