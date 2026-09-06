"use client";

import { useState } from "react";

import {
  ARCHITECTURE,
  DATA_SOURCES,
  DATA_TOTALS,
  DATA_TYPES,
  DEPLOYMENT,
  TRAINING,
} from "@/lib/alpha";

/* The composition, as a chain rather than a grid: each stage feeds the next,
 * and each carries the study question that settled it. Frozen modules are
 * marked because that is the first thing anyone reproducing this needs. */
function Architecture() {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ARCHITECTURE.map((step, i) => (
        <li
          key={step.stage}
          className="relative rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {step.stage}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
              {step.from !== "—" ? step.from : ""}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="font-mono text-[13.5px] font-semibold text-foreground">
              {step.value}
            </span>
            {step.frozen && (
              <span
                title="Weights frozen during training"
                className="rounded border border-border px-1 py-px text-[9px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                frozen
              </span>
            )}
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/75">
            {step.detail}
          </p>
          <span
            aria-hidden="true"
            className="absolute -bottom-px left-4 right-4 h-px bg-border sm:hidden"
            style={{ display: i === ARCHITECTURE.length - 1 ? "none" : undefined }}
          />
        </li>
      ))}
    </ol>
  );
}

/* The mixture, three ways: what proportion of each epoch each data type
 * supplies, how much survived curation, and what each source actually is. */
function DataMixture() {
  const [hovered, setHovered] = useState<string | null>(null);
  const keptFrames = (DATA_TOTALS.frames / DATA_TOTALS.fullFrames) * 100;

  return (
    <div>
      {/* Per-epoch sample share by data type. */}
      <div className="flex h-9 w-full overflow-hidden rounded-md">
        {DATA_TYPES.map((t) => (
          <div
            key={t.type}
            className="flex items-center justify-center transition-opacity"
            style={{
              width: `${t.share}%`,
              backgroundColor: t.color,
              opacity: hovered && hovered !== t.type ? 0.35 : 1,
            }}
            onMouseEnter={() => setHovered(t.type)}
            onMouseLeave={() => setHovered(null)}
            title={`${t.type} — ${t.share}% of each epoch`}
          >
            <span className="px-1 font-mono text-[11px] font-semibold tabular-nums text-white">
              {t.share}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        {DATA_TYPES.map((t) => (
          <span key={t.type} className="flex items-center gap-1.5 text-[11.5px]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-foreground/80">{t.type}</span>
          </span>
        ))}
        <span className="text-[11.5px] text-muted-foreground">
          per-epoch sample share under proportional sampling
        </span>
      </div>

      {/* Raw pool to training set. The discarded majority is the point. */}
      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
            {DATA_TOTALS.fullFrames.toLocaleString()}M frames
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            →
          </span>
          <span className="font-mono text-[16px] font-semibold tabular-nums text-foreground">
            {DATA_TOTALS.frames.toLocaleString()}M frames
          </span>
          <span className="text-[12px] text-muted-foreground">
            after curation and per-source subsampling
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${keptFrames}%` }}
          />
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          {keptFrames.toFixed(0)}% of a {DATA_TOTALS.fullHours.toLocaleString()}-hour
          raw pool kept — {DATA_TOTALS.hours.toLocaleString()} hours across{" "}
          {DATA_TOTALS.embodiments} embodiments.
        </p>
      </div>

      {/* Per source. */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-border text-[10.5px] uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 text-right font-medium">Emb.</th>
              <th className="pb-2 font-medium">Coverage</th>
              <th className="pb-2 text-right font-medium">Frames (M)</th>
              <th className="pb-2 text-right font-medium">Hours</th>
              <th className="pb-2 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {DATA_SOURCES.map((s) => (
              <tr key={s.source}>
                <td className="py-2 pr-3">
                  <span className="font-medium text-foreground/90">{s.source}</span>
                  {s.ours && (
                    <span className="ml-1.5 rounded bg-foreground/85 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-background">
                      ours
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-foreground/70">{s.type}</td>
                <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground/70">
                  {s.embodiments}
                </td>
                <td className="py-2 pr-3 text-[11.5px] text-foreground/65">
                  {s.coverage.join(" · ")}
                </td>
                <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground/80">
                  {s.frames}
                </td>
                <td className="py-2 pr-3 text-right font-mono tabular-nums text-foreground/80">
                  {s.hours.toLocaleString()}
                </td>
                <td className="py-2 text-right font-mono tabular-nums font-semibold text-foreground">
                  {s.share}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FactList({
  items,
}: {
  items: readonly { label: string; value: string; detail: string }[];
}) {
  return (
    <dl className="divide-y divide-border/70">
      {items.map((f) => (
        <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {f.label}
          </dt>
          <dd>
            <span className="font-mono text-[13px] font-semibold text-foreground">
              {f.value}
            </span>
            <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/75">
              {f.detail}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
}

const TABS = [
  { id: "architecture", label: "Architecture" },
  { id: "data", label: "Pretraining data" },
  { id: "training", label: "Training" },
  { id: "deployment", label: "Deployment" },
] as const;

export default function AlphaSpec() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("architecture");

  return (
    <div>
      <div
        role="tablist"
        aria-label="OpenWAM-α specification"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors ${
                on
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {tab === "architecture" && <Architecture />}
        {tab === "data" && <DataMixture />}
        {tab === "training" && <FactList items={TRAINING} />}
        {tab === "deployment" && <FactList items={DEPLOYMENT} />}
      </div>
    </div>
  );
}
