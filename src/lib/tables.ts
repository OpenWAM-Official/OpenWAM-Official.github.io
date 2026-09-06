/* The paper's full result tables.
 *
 * src/data/benchmark-tables.json is generated from tables/*.tex in the paper
 * repository — the same files the figures are built from — so the page and the
 * appendix cannot drift. Bold and underline in the source mark best and second
 * best; those survive as flags rather than being re-derived here, because a few
 * tables rank on a column the JSON does not carry. */

import raw from "@/data/benchmark-tables.json";

export type Cell = {
  /** Exactly what the table prints, including "17/20 (85%)" forms. */
  text: string;
  /** Numeric reading where one exists, for the bar overlay. */
  value: number | null;
  best: boolean;
  second: boolean;
};

export type Row = {
  model: string;
  ours: boolean;
  cells: Cell[];
  /* robodojo_real alone carries a second stub column: each policy spans three
     embodiment rows, and only the first of them repeats the policy name. */
  sub?: string;
  spanStart?: boolean;
  spanLen?: number;
};

export type Group = {
  /** "VLA", "WAM", or null where the table does not split by family. */
  label: string | null;
  rows: Row[];
};

export type Table = {
  id: string;
  /** Header for the second stub column, where a table has one. */
  subStub?: string;
  short: string;
  title: string;
  caption: string;
  columns: string[];
  groups: Group[];
};

export const SIMULATION = raw.simulation as Table[];
export const REAL = raw.real as Table[];
export const ALL_TABLES: Table[] = [...SIMULATION, ...REAL];

export const TABLE_SOURCE = raw._source as string;

export const SECTIONS: { label: string; tables: Table[] }[] = [
  { label: "Simulation benchmarks", tables: SIMULATION },
  { label: "Real robot", tables: REAL },
];

/* Which column carries the table's headline number.
 *
 * Not simply the last one: VLABench and RoboDojo end on "Avg · IS", and the
 * figure everyone quotes uses "Avg · SR". Verified against the openwam value in
 * benchmark-grid.json for all nine simulation tables. */
export function summaryIndex(t: Table): number {
  const cols = t.columns.map((c) => c.trim());
  const tiered = cols.findIndex((c) =>
    /^(Avg|Overall|Total)\.?\s*·\s*SR$/i.test(c),
  );
  if (tiered >= 0) return tiered;
  const plain = cols.findIndex((c) =>
    /^(Avg\.?|Overall(\s+Avg\.?)?|Total|SR \(%\))$/i.test(c),
  );
  if (plain >= 0) return plain;
  return cols.length - 1;
}

/* The row for our model. In robodojo_real the policy spans three embodiment
 * rows and only one of them carries the overall average, so prefer a row that
 * actually reports the summary column. */
export function oursRow(t: Table): Row | undefined {
  const i = summaryIndex(t);
  const ours = t.groups.flatMap((g) => g.rows).filter((r) => r.ours);
  return ours.find((r) => r.cells[i]?.value !== null) ?? ours[0];
}
