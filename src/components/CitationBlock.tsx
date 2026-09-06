"use client";

import { useState } from "react";

export default function CitationBlock({ bibtex }: { bibtex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  return (
    <div className="not-prose group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy citation"
        className="absolute right-2 top-2 z-10 rounded border border-border bg-background/85 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/70 shadow-sm backdrop-blur transition-colors hover:border-foreground/40 hover:bg-background hover:text-foreground"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 pr-16 text-xs leading-relaxed">
        {bibtex}
      </pre>
    </div>
  );
}
