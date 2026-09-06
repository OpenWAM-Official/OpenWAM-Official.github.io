import Link from "next/link";
import { asset } from "@/lib/asset";

import { RESOURCE_LINKS } from "@/lib/resources";

/* This is a one-page project site, so the bar carries the paper's resources
   rather than internal routes. The Leaderboard / Tasks / Blog entries that used
   to sit here were the reference site's pages and still served its content.
   Pending links (arXiv, until the preprint is up) are left out rather than
   rendered dead. */
const NAV_ITEMS = [RESOURCE_LINKS.code, RESOURCE_LINKS.huggingFace].filter(
  (link) => !("pending" in link && link.pending) && link.href,
);

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border"
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={asset("/openwam-mark.png")} alt="" className="h-7 w-7 shrink-0" />
            <span className="text-base font-semibold tracking-tight">
              OpenWAM
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {/* The one internal page: the appendix tables, which are far too
                large to sit on the home page. */}
            <Link
              href="/results"
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:px-3"
            >
              Full results
            </Link>
            {/* Four items do not fit 375px, and these two wrapped to three
                lines inside a fixed-height bar. The footer carries both, so
                the phone keeps only the page it cannot otherwise reach. */}
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:inline-block"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
