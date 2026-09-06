import { RESOURCE_LINKS } from "@/lib/resources";

/* Pending links (no href yet) are omitted rather than rendered dead. */
const FOOTER_LINKS = [
  RESOURCE_LINKS.code,
  RESOURCE_LINKS.arxiv,
  RESOURCE_LINKS.huggingFace,
].filter((link) => !("pending" in link && link.pending));

function TinyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M5.5 4.5h6v6M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-medium text-foreground">OpenWAM</p>
          <div className="flex gap-5 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <TinyIcon />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
