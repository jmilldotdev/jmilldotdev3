export default function AboutContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#00FFFF] border-opacity-30 pb-4">
        <h1 className="text-lg font-bold mb-2">JMILL OPERATING SYSTEM v2.1</h1>
        <p className="text-sm opacity-75">Copyright (c) 2025 SDJ Industries</p>
        <p className="text-sm opacity-75">All rights reserved.</p>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <p className="leading-relaxed">
          jmill is a software engineer, thought leader (ironic), and practicing
          number shaman.
        </p>
        <p className="leading-relaxed">
          he lives at the intersection of art and technology.
        </p>
      </div>

      {/* Currently Building */}
      <div className="space-y-3">
        <h2 className="text-md font-semibold border-b border-[#00FFFF] border-opacity-20 pb-1">
          jmill is currently building:
        </h2>
        <ul className="space-y-2 pl-2">
          <li className="flex items-start">
            <span className="text-[#00FFFF] mr-2">•</span>
            <span>
              <a
                href="https://eden.art"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff4800] underline hover:text-white transition-colors"
              >
                Eden
              </a>
              <span className="opacity-75">
                , a platform for autonomous agent artists
              </span>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-[#00FFFF] mr-2">•</span>
            <span>
              <a
                href="https://selfdrivingjazz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff4800] underline hover:text-white transition-colors"
              >
                self-driving jazz
              </a>
              <span className="opacity-75">
                , the world&apos;s first future trillion dollar creative studio
              </span>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-[#00FFFF] mr-2">•</span>
            <span>
              <a
                href="https://mars.college"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff4800] underline hover:text-white transition-colors"
              >
                Mars College
              </a>
              <span className="opacity-75">
                {" "}
                - an annual off-grid village exploring future technology and
                self-preservation
              </span>
            </span>
          </li>
        </ul>
      </div>

      {/* Presence */}
      <div className="space-y-3">
        <h2 className="text-md font-semibold border-b border-[#00FFFF] border-opacity-20 pb-1">
          presence:
        </h2>
        <div className="grid grid-cols-1 gap-2 pl-2">
          <div className="flex items-center">
            <span className="text-[#00FFFF] mr-2">•</span>
            <a
              href="https://x.com/jmilldotdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4800] underline hover:text-white transition-colors"
            >
              Twitter
            </a>
          </div>
          <div className="flex items-center">
            <span className="text-[#00FFFF] mr-2">•</span>
            <a
              href="https://github.com/jmilldotdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4800] underline hover:text-white transition-colors"
            >
              Github
            </a>
          </div>
          <div className="flex items-center">
            <span className="text-[#00FFFF] mr-2">•</span>
            <a
              href="mailto:jon@jmill.dev"
              className="text-[#ff4800] underline hover:text-white transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
