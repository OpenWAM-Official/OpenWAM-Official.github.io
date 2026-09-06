"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

import {
  BAR_WIDTH,
  BASELINE_INK,
  COLUMNS,
  COLUMN_SLOTS,
  GRID_ROWS,
  LEGEND,
  MODEL_BY_KEY,
  MUTED,
  NEUTRAL,
  format,
  type Bar,
  type Model,
  type Panel,
} from "@/lib/grid";

/* Figure 13, reproduced rather than reinterpreted: vertical bars, the
 * highlighted model always in the leftmost slot, the rest ascending, the mark
 * and the value stacked above each bar and the model name below it.
 *
 * Layout follows scripts/benchmark_grid.py — panels fill down each column, and
 * each column is sized to its busiest panel so that one bar slot is the same
 * width across the whole figure. */

/* Room above the tallest bar for its value label and mark, as a fraction of the
 * plot box. The script solves this in points; here the plot area is a fixed
 * pixel height, so a constant does the same job. */
const HEADROOM = 0.26;

function Mark({ model, size }: { model: Model; size: number }) {
  if (model.glyph) {
    return (
      <span
        className="inline-flex items-baseline font-serif leading-none text-[#111]"
        style={{ fontSize: size }}
      >
        {model.glyph.base}
        {model.glyph.sub && (
          <span style={{ fontSize: size * 0.44 }}>{model.glyph.sub}</span>
        )}
      </span>
    );
  }
  if (model.logo) {
    return (
      <img
        src={asset(model.logo)}
        alt=""
        style={{ height: size, width: "auto" }}
        className="object-contain"
      />
    );
  }
  if (model.badge) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-[3px] font-semibold text-white"
        style={{
          height: size,
          minWidth: size,
          backgroundColor: model.badge.fill,
          fontSize: size * 0.62,
          paddingInline: size * 0.14,
        }}
      >
        {model.badge.text}
      </span>
    );
  }
  return null;
}

function Column({
  bar,
  decimals,
  slotWidth,
  dim,
  onHover,
}: {
  bar: Bar;
  decimals: number;
  /** A CSS width; slots are a percentage of the panel. */
  slotWidth: string;
  dim: boolean;
  onHover: (key: string | null) => void;
}) {
  const markSize = bar.highlight ? 23 : 15;
  const barHeight = `${bar.frac * (1 - HEADROOM) * 100}%`;

  return (
    <div
      className="flex h-full flex-col items-center justify-end transition-opacity"
      style={{ width: slotWidth, opacity: dim ? 0.32 : 1 }}
      onMouseEnter={() => onHover(bar.model.key)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex flex-col items-center" style={{ paddingBottom: 3 }}>
        <Mark model={bar.model} size={markSize} />
        <span
          className={`mt-[3px] font-serif tabular-nums leading-none ${
            bar.highlight ? "font-bold text-[#111]" : "text-[#333]"
          }`}
          style={{ fontSize: bar.highlight ? 12.5 : 11.5 }}
        >
          {format(bar.value, decimals)}
        </span>
      </div>
      <div
        className="w-full"
        style={{
          height: barHeight,
          minHeight: 2,
          paddingInline: `${((1 - BAR_WIDTH) / 2) * 100}%`,
        }}
      >
        <div
          className="h-full w-full rounded-t-[3px]"
          style={{
            backgroundColor: bar.highlight ? bar.model.color : NEUTRAL,
          }}
        />
      </div>
    </div>
  );
}

function PanelBlock({
  panel,
  slots,
  hover,
  onHover,
}: {
  panel: Panel;
  slots: number;
  hover: string | null;
  onHover: (key: string | null) => void;
}) {
  /* Bars keep a constant slot width; a panel with fewer models simply leaves
     the rest of its column empty rather than stretching. */
  const slotPct = 100 / slots;

  return (
    <figure className="flex min-w-0 flex-col">
      <div className="relative h-[132px] w-full sm:h-[150px]">
        <div className="absolute inset-0 flex items-end">
          {panel.bars.map((bar) => (
            <Column
              key={bar.model.key}
              bar={bar}
              decimals={panel.decimals}
              slotWidth={`${slotPct}%`}
              dim={hover !== null && hover !== bar.model.key}
              onHover={onHover}
            />
          ))}
        </div>
      </div>

      {/* The axis line the script draws under every panel. */}
      <div
        className="h-px w-full"
        style={{ backgroundColor: BASELINE_INK, opacity: 0.85 }}
      />

      {/* Labels are not truncated: "OpenWAM-α" is wider than one slot, and the
          figure lets it run into the neighbouring gap rather than clipping it —
          the label beside it is always a short one. */}
      <div className="flex w-full">
        {panel.bars.map((bar) => (
          <span
            key={bar.model.key}
            className={`whitespace-nowrap pt-[3px] text-center font-serif leading-tight transition-opacity ${
              bar.highlight ? "font-bold text-[#111]" : ""
            }`}
            style={{
              width: `${slotPct}%`,
              /* The highlight label is the longest by far and sits in the
                 narrowest slot of every panel; a step down keeps it inside
                 its slot instead of running into its neighbour. */
              fontSize: bar.highlight ? 8.2 : 9,
              letterSpacing: bar.highlight ? "-0.03em" : undefined,
              color: bar.highlight ? undefined : MUTED,
              opacity: hover !== null && hover !== bar.model.key ? 0.32 : 1,
            }}
            title={bar.model.label}
          >
            {bar.model.short}
          </span>
        ))}
      </div>

      <figcaption className="mt-1.5 text-center font-serif text-[13px] font-bold tracking-tight text-[#111]">
        {panel.title}
      </figcaption>
      {panel.floor > 0 && (
        <span className="mt-0.5 text-center font-serif text-[8.5px] text-muted-foreground/70">
          axis starts at {panel.floor}
        </span>
      )}
    </figure>
  );
}

export default function BenchmarkStandings() {
  const [hover, setHover] = useState<string | null>(null);
  const totalSlots = COLUMN_SLOTS.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div
        className="grid gap-x-7 gap-y-9"
        style={{
          gridTemplateColumns: COLUMN_SLOTS.map((s) => `${s}fr`).join(" "),
        }}
      >
        {/* Panels fill down each column, so the grid is written column by
            column and each cell placed explicitly. */}
        {COLUMNS.map((column, c) =>
          column.map((panel, r) => (
            <div
              key={panel.title}
              style={{ gridColumn: c + 1, gridRow: r + 1 }}
              className="min-w-0"
            >
              <PanelBlock
                panel={panel}
                slots={COLUMN_SLOTS[c]}
                hover={hover}
                onHover={setHover}
              />
            </div>
          )),
        )}
      </div>

      {/* Legend, in the JSON's own order. */}
      <div
        className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-5"
        style={{ minWidth: 0 }}
      >
        {LEGEND.map((key) => {
          const m = MODEL_BY_KEY.get(key);
          if (!m) return null;
          const on = hover === key;
          const dim = hover !== null && !on;
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setHover(key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(key)}
              onBlur={() => setHover(null)}
              className="inline-flex items-center gap-2 rounded px-1 py-0.5 transition-opacity"
              style={{ opacity: dim ? 0.32 : 1 }}
            >
              <Mark model={m} size={18} />
              <span
                className="font-serif text-[12px]"
                style={{
                  color: m.key === "openwam" ? m.color : "#333",
                  fontWeight: m.key === "openwam" ? 600 : 400,
                }}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        One panel per simulation leaderboard, {totalSlots} bar slots across{" "}
        {GRID_ROWS} rows. Within each panel OpenWAM-α holds the leftmost slot and
        the baselines are ordered ascending, exactly as in the paper. Where a
        panel&rsquo;s scores are too bunched for zero-based bars to separate, the
        axis floor is noted under the title.
      </p>
    </div>
  );
}
