/* Figure 13, reproduced.
 *
 * This mirrors scripts/benchmark_grid.py in OpenWAM-Figures rather than
 * reinterpreting it, so the web version and the paper figure agree on layout,
 * ordering and — the part that is easy to get wrong — where the bar axis
 * starts. The constants below are that script's, named the same way. */

import raw from "@/data/benchmark-grid.json";

export const BAR_WIDTH = 0.86;
export const NEUTRAL = "#E9E9E9";
export const BASELINE_INK = "#2B2F36";
export const MUTED = "#9AA1AC";
export const COLUMN_GAP = 0.03;

/* Zero-based bars stop separating once the scores are this tightly bunched —
 * LIBERO runs 94.4 to 99.3 — so the floor drops, but only that far. */
const BASELINE_TRIGGER = 0.6;
const BASELINE_HEADROOM = 0.3;

export type Kind = "ours" | "VLA" | "WAM";

export type Model = {
  key: string;
  /** Display form; the JSON carries LaTeX because matplotlib renders mathtext. */
  label: string;
  short: string;
  kind: Kind;
  color: string;
  /** An image in /public/marks, when one exists for this model. */
  logo?: string;
  /** Otherwise a letterform, drawn as a filled rounded square. */
  badge?: { text: string; fill: string };
  /** π₀ and π₀.₅ are set as glyphs in the figure, not logos. */
  glyph?: { base: string; sub?: string };
};

type RawModel = {
  key: string;
  label: string;
  short: string;
  kind: string;
  color: string;
  logo?: string;
  badge?: { text: string; fill: string };
};

/* LaTeX in, display text out. The JSON is written for matplotlib's mathtext. */
function detex(s: string): string {
  return s
    .replace(/\$\\pi_0\$/g, "π₀")
    .replace(/\$\\pi_\{0\.5\}\$/g, "π₀.₅")
    .replace(/OpenWAM-\$\\alpha\$/g, "OpenWAM-α")
    .replace(/\$([^$]*)\$/g, "$1");
}

/* Files actually present in /public/marks. Anything else falls back to its
 * badge, which is what the figure does for X-VLA too. */
const LOGO_FILES: Record<string, string> = {
  "openwam.png": "/marks/openwam.png",
  "qwen.png": "/marks/qwen.png",
  "starvla.svg": "/marks/starvla.svg",
  "fast-wam.svg": "/marks/fast-wam.svg",
  "lingbot.svg": "/marks/lingbot.svg",
  "being.png": "/marks/being.png",
};

const GLYPHS: Record<string, { base: string; sub?: string }> = {
  pi0: { base: "π", sub: "0" },
  pi05: { base: "π", sub: "0.5" },
};

export const MODELS: Model[] = (raw.models as RawModel[]).map((m) => ({
  key: m.key,
  label: detex(m.label),
  short: detex(m.short),
  kind: m.kind as Kind,
  color: m.color,
  logo: m.logo ? LOGO_FILES[m.logo] : undefined,
  badge: m.badge,
  glyph: GLYPHS[m.key],
}));

export const MODEL_BY_KEY = new Map(MODELS.map((m) => [m.key, m]));
export const HIGHLIGHT = raw.highlight as string;
export const LEGEND: string[] = raw.legend as string[];

export type Bar = {
  model: Model;
  value: number;
  highlight: boolean;
  /** 0-1 within the panel's plotting area, after the floor is applied. */
  frac: number;
};

export type Panel = {
  title: string;
  decimals: number;
  bars: Bar[];
  floor: number;
  top: number;
};

/* `_ordered`: highlight first, then everything the benchmark reported, ascending.
 * Models a benchmark never reported are dropped (the JSON sets show_missing off),
 * so the remaining bars simply take the panel. */
function ordered(scores: Record<string, number>): { model: Model; value: number }[] {
  const head = MODEL_BY_KEY.get(HIGHLIGHT)!;
  const rest = MODELS.filter((m) => m.key !== HIGHLIGHT && m.key in scores)
    .map((m) => ({ model: m, value: scores[m.key] }))
    .sort((a, b) => a.value - b.value);
  return [{ model: head, value: scores[HIGHLIGHT] }, ...rest];
}

/* Round numbers a human would put on an axis, so the floor lands somewhere
 * defensible rather than on an arbitrary fraction of the range. */
function niceFloor(floor: number, high: number): number {
  if (floor <= 0) return 0;
  const span = high - floor;
  const step = Math.pow(10, Math.floor(Math.log10(span || 1)));
  for (const mult of [1, 2, 2.5, 5, 10]) {
    const q = step * mult;
    const snapped = Math.floor(floor / q) * q;
    if (snapped > 0 && high - snapped >= span * 0.9) return snapped;
  }
  return Math.max(0, Math.floor(floor));
}

/* `_scale`. */
function scaleFloor(values: number[]): number {
  const high = Math.max(...values);
  const low = Math.min(...values);
  if (high <= 0 || low / high <= BASELINE_TRIGGER) return 0;
  return niceFloor(Math.max(0, low - BASELINE_HEADROOM * (high - low)), high);
}

export const PANELS: Panel[] = (
  raw.panels as { title: string; decimals: number; scores: Record<string, number> }[]
).map((p) => {
  const rows = ordered(p.scores);
  const values = rows.map((r) => r.value);
  const floor = scaleFloor(values);
  const top = Math.max(...values);
  const span = top - floor || 1;
  return {
    title: p.title,
    decimals: p.decimals,
    floor,
    top,
    bars: rows.map((r) => ({
      model: r.model,
      value: r.value,
      highlight: r.model.key === HIGHLIGHT,
      frac: (r.value - floor) / span,
    })),
  };
});

/* `_column_slots` with layout.fill === "column": panels fill down each column,
 * and a column is sized to its own busiest panel so one slot is the same width
 * everywhere in the figure. */
const { columns, rows: rowCount } = raw.layout as { columns: number; rows: number };

export const COLUMNS: Panel[][] = Array.from({ length: columns }, (_, c) =>
  PANELS.slice(c * rowCount, (c + 1) * rowCount),
);

export const COLUMN_SLOTS: number[] = COLUMNS.map((col) =>
  Math.max(...col.map((p) => p.bars.length)),
);

export const GRID_ROWS = rowCount;
export const GRID_SOURCE = raw._source as string;
export const GRID_METRIC = raw._metric as string;

export const format = (v: number, d: number) => v.toFixed(d);
