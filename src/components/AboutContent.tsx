"use client";

import { trackEvent } from "@/lib/analytics";

interface AboutContentProps {
  onOpenProjects?: () => void;
  onOpenWiki?: () => void;
}

export default function AboutContent({
  onOpenProjects,
  onOpenWiki,
}: AboutContentProps) {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div className="space-y-3">
        <p className="leading-relaxed">
          jmill is a software engineer, thought leader (ironic), and practicing
          number shaman.
        </p>
        <p className="leading-relaxed">
          he lives at the intersection of art and technology.
        </p>
        <p className="leading-relaxed">
          check out his{" "}
          <a
            href={onOpenProjects ? "#projects" : "/"}
            onClick={(event) => {
              if (!onOpenProjects) return;
              event.preventDefault();
              onOpenProjects();
            }}
            className="text-warm underline hover:text-foreground transition-colors"
          >
            projects
          </a>{" "}
          or his knowledge{" "}
          <a
            href={onOpenWiki ? "#wiki" : "/"}
            onClick={(event) => {
              if (!onOpenWiki) return;
              event.preventDefault();
              onOpenWiki();
            }}
            className="text-warm underline hover:text-foreground transition-colors"
          >
            wiki
          </a>
          .
        </p>
      </div>

      {/* Currently Building */}
      <div className="space-y-3">
        <h2 className="text-md font-semibold border-b border-[color:var(--palette-border-soft)] pb-1">
          currently:
        </h2>
        <ul className="space-y-2 pl-2">
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>
              <a
                href="https://selfdrivingjazz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm underline hover:text-foreground transition-colors"
              >
                self-driving jazz
              </a>
              <span className="opacity-75">, an autonomous media empire</span>
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-accent mr-2">•</span>
            <span>
              <a
                href="https://mars.college"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm underline hover:text-foreground transition-colors"
              >
                Mars College
              </a>
              <span className="opacity-75">
                {" "}
                - an annual temporary village exploring future technology and
                self-preservation
              </span>
            </span>
          </li>
        </ul>
      </div>

      {/* Presence */}
      <div className="space-y-3">
        <h2 className="text-md font-semibold border-b border-[color:var(--palette-border-soft)] pb-1">
          presence:
        </h2>
        <div className="grid grid-cols-1 gap-2 pl-2">
          <div className="flex items-center">
            <span className="text-accent mr-2">•</span>
            <a
              href="https://x.com/jmilldotdev"
              onClick={() => trackEvent({ name: "contact_open", channel: "x" })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm underline hover:text-foreground transition-colors"
            >
              Twitter
            </a>
          </div>
          <div className="flex items-center">
            <span className="text-accent mr-2">•</span>
            <a
              href="https://github.com/jmilldotdev"
              onClick={() =>
                trackEvent({ name: "contact_open", channel: "github" })
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm underline hover:text-foreground transition-colors"
            >
              Github
            </a>
          </div>
          <div className="flex items-center">
            <span className="text-accent mr-2">•</span>
            <a
              href="mailto:jon@jmill.dev"
              onClick={() =>
                trackEvent({ name: "contact_open", channel: "email" })
              }
              className="text-warm underline hover:text-foreground transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
