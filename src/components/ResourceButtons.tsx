"use client";

import { RESOURCE_LINKS } from "@/lib/resources";

/* ------------------------------------------------------------------ */
/* Brand icons                                                        */
/* ------------------------------------------------------------------ */

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.52 7.52 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function ArxivIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path
        d="m5 15 4.8-10M15 15 10.2 5M6.3 10h7.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 4.4c1.8 0 3.3 1 4.6 3M16 15.6c-1.8 0-3.3-1-4.6-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function HuggingFaceIcon() {
  return (
    <span aria-hidden="true" className="text-[12px] leading-none">
      🤗
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Button style — sharp brand-colored filled rectangles with bold      */
/* white text (dark text on the yellow Hugging Face one for contrast). */
/* No rounded corners; hover dims the bg slightly.                     */
/* ------------------------------------------------------------------ */

export const RESOURCE_BUTTONS = [
  {
    link: RESOURCE_LINKS.code,
    icon: <GitHubIcon />,
    bg: "#181717",
    bgHover: "#000000",
    text: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.arxiv,
    icon: <ArxivIcon />,
    bg: "#B31B1B",
    bgHover: "#8f1515",
    text: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.huggingFace,
    icon: <HuggingFaceIcon />,
    bg: "#FFD21E",
    bgHover: "#e8bd00",
    // White doesn't read on yellow — use a near-black text + dark icon.
    text: "#181717",
  },
  {
    link: RESOURCE_LINKS.xPolicyLab,
    icon: <GitHubIcon />,
    // XPolicyLab's own wordmark blue. Also a GitHub repository, but a second
    // black pill beside Code would read as one button split in two.
    bg: "#3079f0",
    bgHover: "#1f63d6",
    text: "#ffffff",
  },
] as const;

const PILL_BASE =
  "group inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide leading-none transition-colors";

export default function ResourceButtons() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {RESOURCE_BUTTONS.map((item) => {
        const { link } = item;
        const pending = "pending" in link && link.pending;

        /* Not published yet — render the same pill, muted and inert, with a
           "soon" tail so the slot is visibly reserved rather than missing. */
        if (pending) {
          return (
            <span
              key={link.label}
              className={`${PILL_BASE} cursor-default bg-muted text-muted-foreground`}
              title={`${link.label} link coming soon`}
            >
              <span className="inline-flex opacity-60">{item.icon}</span>
              {link.label}
              <span className="ml-0.5 text-[10px] font-medium normal-case tracking-normal opacity-70">
                soon
              </span>
            </span>
          );
        }

        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={PILL_BASE}
            style={{
              backgroundColor: item.bg,
              color: item.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = item.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = item.bg;
            }}
          >
            <span className="inline-flex">{item.icon}</span>
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
