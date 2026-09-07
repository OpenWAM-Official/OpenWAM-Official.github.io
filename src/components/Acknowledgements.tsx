import { asset } from "@/lib/asset";

import { PARTNERS } from "@/lib/paper";

/* Acknowledgements.
 *
 * Mirrors the paper's own section rather than restating it: Wuji Technology
 * supplied the compute the project ran on, and the dexterous-hand platform the
 * fourth real-robot experiment was built around. The wordmark is a monochrome
 * SVG drawn in currentColor, so it takes the page's ink rather than sitting on
 * it as a coloured badge. */
export default function Acknowledgements() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Acknowledgements
      </h2>

      {PARTNERS.map((partner) => (
        <div
          key={partner.name}
          className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-border bg-card px-6 py-6 sm:flex-row sm:gap-7 sm:px-7"
        >
          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-foreground/85 transition-opacity hover:opacity-70"
            aria-label={partner.name}
          >
            <img
              src={asset(partner.logo)}
              alt={partner.name}
              /* The wordmark is 320×90 in its own units, so a fixed height
                 and automatic width keep it from being stretched. */
              loading="lazy"
              className="h-6 w-auto"
            />
          </a>
          <p className="text-center text-[14px] leading-relaxed text-foreground/80 sm:text-left">
            {partner.thanks}
          </p>
        </div>
      ))}
    </div>
  );
}
