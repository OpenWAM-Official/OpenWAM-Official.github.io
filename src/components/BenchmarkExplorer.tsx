"use client";

import { useState } from "react";

import {
  SECTIONS,
  TABLE_SOURCE,
  oursRow,
  summaryIndex,
  type Table,
} from "@/lib/tables";

/* Left rail picks a benchmark, right pane shows that benchmark's full table.
 * The tables differ a lot in shape — one column for RoboCasa-GR1, eighteen for
 * VLABench, fraction-and-percent cells for the real-robot suites — so the pane
 * renders whatever the table declares rather than assuming a schema. */

const OURS_TINT = "#527eea";

function Rail({
  active,
  onPick,
}: {
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Benchmarks"
      className="min-w-0 lg:sticky lg:top-20 lg:self-start"
    >
      {SECTIONS.map((section) => (
        <div key={section.label} className="mb-6 last:mb-0">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {section.label}
          </h2>
          <ul className="space-y-0.5">
            {section.tables.map((t) => {
              const on = t.id === active;
              const ours = oursRow(t);
              const headline = ours?.cells[summaryIndex(t)]?.text;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onPick(t.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex w-full items-baseline justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[13.5px] transition-colors ${
                      on
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className="min-w-0 truncate">{t.short}</span>
                    {headline && (
                      <span
                        className="shrink-0 font-mono text-[11.5px] tabular-nums"
                        style={{ color: on ? OURS_TINT : undefined }}
                      >
                        {headline.replace(/^.*\(([\d.]+%?)\)$/, "$1")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Pane({ table }: { table: Table }) {
  const summary = summaryIndex(table);

  return (
    <section aria-labelledby={`table-${table.id}`}>
      <h2
        id={`table-${table.id}`}
        className="text-[20px] font-semibold tracking-tight"
      >
        {table.short}
      </h2>
      <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
        {table.caption}
      </p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-muted/50 px-3 py-2.5 font-semibold"
              >
                Method
              </th>
              {table.subStub && (
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">
                  {table.subStub}
                </th>
              )}
              {table.columns.map((c, i) => (
                <th
                  key={`${c}-${i}`}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-2.5 text-right font-semibold ${
                    i === summary ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          {table.groups.map((group, gi) => (
            <tbody key={group.label ?? `g${gi}`}>
              {group.label && (
                <tr className="border-b border-border bg-muted/25">
                  <th
                    scope="colgroup"
                    colSpan={table.columns.length + (table.subStub ? 2 : 1)}
                    className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {group.label}
                  </th>
                </tr>
              )}
              {group.rows.map((row, ri) => (
                <tr
                  key={`${row.model}-${row.sub ?? ""}-${ri}`}
                  className="border-b border-border/70 last:border-b-0"
                  style={
                    row.ours ? { backgroundColor: `${OURS_TINT}0f` } : undefined
                  }
                >
                  {/* A spanned policy cell is written once with rowSpan; its
                      continuation rows omit the cell rather than hiding it,
                      which is what keeps the columns aligned. */}
                  {(!table.subStub || row.spanStart) && (
                    <th
                      scope="row"
                      rowSpan={row.spanLen}
                      className={`sticky left-0 z-10 whitespace-nowrap px-3 py-2 text-left align-top font-normal ${
                        row.ours ? "font-semibold" : ""
                      }`}
                      style={{
                        backgroundColor: row.ours ? "#eef2fd" : "var(--card)",
                        color: row.ours ? OURS_TINT : undefined,
                      }}
                    >
                      {row.model}
                    </th>
                  )}
                  {table.subStub && (
                    <td className="whitespace-nowrap px-3 py-2 text-[12.5px] text-foreground/70">
                      {row.sub}
                    </td>
                  )}
                  {row.cells.map((c, i) => (
                    <td
                      key={i}
                      className={`whitespace-nowrap px-3 py-2 text-right font-mono text-[12.5px] tabular-nums ${
                        c.text === "—" ? "text-muted-foreground/50" : ""
                      } ${c.best ? "font-semibold text-foreground" : ""} ${
                        i === summary ? "" : "text-foreground/75"
                      }`}
                    >
                      <span className={c.second ? "underline decoration-foreground/30 underline-offset-2" : ""}>
                        {c.text}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <p className="mt-3 text-[11.5px] text-muted-foreground/80">
        Bold is best, underline second best, as marked in the paper. &ldquo;—&rdquo;
        means the source table does not report that entry.
      </p>
    </section>
  );
}

export default function BenchmarkExplorer() {
  const [active, setActive] = useState(SECTIONS[0].tables[0].id);
  const table =
    SECTIONS.flatMap((s) => s.tables).find((t) => t.id === active) ??
    SECTIONS[0].tables[0];

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <Rail active={active} onPick={setActive} />
        <Pane table={table} />
      </div>
      <p className="mt-10 border-t border-border pt-4 text-[11.5px] text-muted-foreground/70">
        Transcribed from {TABLE_SOURCE}.
      </p>
    </div>
  );
}
