"use client";

import { useEffect, useState } from "react";

/* A contents strip that sticks under the navbar and marks where you are.
 *
 * The page is around nine thousand pixels tall, so without this a reader can
 * neither see its shape nor jump within it. It sits below the navbar rather
 * than inside it: the bar already carries three items and has to drop two of
 * them on a phone, and six more would not fit.
 *
 * Active section comes from IntersectionObserver rather than scroll maths —
 * with sections of very different heights (the abstract is a screen, the
 * rollouts are three) a "closest to the top" calculation flickers at the
 * boundaries. */

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "findings", label: "Findings" },
  { id: "model", label: "Model" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "demos", label: "Robot Demos" },
  { id: "citation", label: "Citation" },
] as const;

export default function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  /* Deep links settle immediately. Someone arriving at /#benchmarks should see
     Benchmarks marked without waiting for a scroll to move the observer, and
     the observer does not run at all while the document is hidden. */
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (SECTIONS.some((s) => s.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        if (visible.size === 0) return;
        /* Whichever tracked section fills most of the viewport wins. */
        const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
        setActive(best[0]);
      },
      {
        /* Ignore the strip under the navbar and the tail of the viewport. */
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 1],
      },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Contents"
      className="sticky top-14 z-40 border-b border-border"
      style={{
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* marquee-scroller hides the scrollbar; the row scrolls on a phone,
            where six labels do not fit across 375px. */}
        <ul className="marquee-scroller flex items-center gap-0.5 overflow-x-auto py-1.5">
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`inline-block whitespace-nowrap rounded px-2.5 py-1 text-[12.5px] transition-colors ${
                    on
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
