import type { Metadata } from "next";

import BenchmarkExplorer from "@/components/BenchmarkExplorer";

export const metadata: Metadata = {
  title: "Full benchmark results",
  description:
    "Every per-benchmark table behind OpenWAM-α: nine simulation leaderboards and three real-robot suites, with all reported baselines.",
};

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">
          Full benchmark results
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
          The complete per-benchmark tables behind OpenWAM-α &mdash; the nine
          simulation leaderboards of Appendix E and the three real-robot suites
          &mdash; with every baseline the source tables report, at the metric
          each one uses. The home page shows the summary column; this is
          everything under it.
        </p>
      </header>

      <div className="mt-10">
        <BenchmarkExplorer />
      </div>
    </div>
  );
}
