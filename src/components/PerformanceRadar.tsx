"use client";

import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Setting = "Simulation" | "Real robot";

interface Score {
  model: string;
  value: number;
}

interface BenchmarkSource {
  benchmark: string;
  axisLabel: string;
  axisLines: readonly string[];
  embodiment: string;
  setting: Setting;
  metric: string;
  decimals: number;
  openwam: number;
  vla: Score;
  wam?: Score;
}

interface BenchmarkDatum extends BenchmarkSource {
  openwamPlot: number;
  vlaPlot: number;
  wamPlot?: number;
}

const OPENWAM_COLOR = "#527eea";
const WAM_COLOR = "#28313d";
const VLA_COLOR = "#a4a9b1";

/* Raw values follow the paper's benchmark and real-robot tables. The chart
 * normalizes only its geometry; every displayed number remains the raw score. */
const BENCHMARKS: readonly BenchmarkSource[] = [
  {
    benchmark: "LIBERO",
    axisLabel: "LIBERO",
    axisLines: ["LIBERO"],
    embodiment: "Single-arm",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 1,
    openwam: 99.3,
    vla: { model: "Qwen-RobotManip", value: 99.2 },
    wam: { model: "ABot-M0.5", value: 99.4 },
  },
  {
    benchmark: "LIBERO-Plus",
    axisLabel: "LIBERO+",
    axisLines: ["LIBERO", "Plus"],
    embodiment: "Single-arm",
    setting: "Simulation",
    metric: "Total success rate",
    decimals: 1,
    openwam: 69.2,
    vla: { model: "Qwen-RobotManip", value: 89.0 },
    wam: { model: "ABot-M0.5", value: 83.4 },
  },
  {
    benchmark: "RoboCasa365",
    axisLabel: "RoboCasa365",
    axisLines: ["RoboCasa", "365"],
    embodiment: "Mobile single-arm",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 1,
    openwam: 38.2,
    vla: { model: "Xiaomi-Robotics-1", value: 57.4 },
    wam: { model: "ABot-M0.5", value: 40.4 },
  },
  {
    benchmark: "VLABench",
    axisLabel: "VLABench",
    axisLines: ["VLABench"],
    embodiment: "Single-arm",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 1,
    openwam: 58.9,
    vla: { model: "Xiaomi-Robotics-1", value: 59.1 },
    wam: { model: "Bridge-WA", value: 52.8 },
  },
  {
    benchmark: "RoboTwin2.0-Full",
    axisLabel: "RoboTwin Full",
    axisLines: ["RoboTwin", "Full"],
    embodiment: "Bimanual",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 2,
    openwam: 93.6,
    vla: { model: "Qwen-RobotManip", value: 93.85 },
    wam: { model: "ABot-M0.5", value: 94.1 },
  },
  {
    benchmark: "RoboTwin2.0-Clean2Random",
    axisLabel: "RoboTwin C2R",
    axisLines: ["RoboTwin", "C2R"],
    embodiment: "Bimanual",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 1,
    openwam: 69.0,
    vla: { model: "Qwen-RobotManip", value: 77.1 },
    wam: { model: "4D-WAM", value: 61.7 },
  },
  {
    benchmark: "EBench",
    axisLabel: "EBench",
    axisLines: ["EBench"],
    embodiment: "Mobile bimanual",
    setting: "Simulation",
    metric: "Overall success rate",
    decimals: 1,
    openwam: 49.4,
    vla: { model: "Qwen-RobotManip", value: 45.6 },
    wam: { model: "Fast-WAM", value: 4.7 },
  },
  {
    benchmark: "RoboDojo",
    axisLabel: "RoboDojo",
    axisLines: ["RoboDojo"],
    embodiment: "Bimanual",
    setting: "Simulation",
    metric: "Average success rate",
    decimals: 2,
    openwam: 11.92,
    vla: { model: "DM0.5", value: 19.34 },
    wam: { model: "X-WAM", value: 3.83 },
  },
  {
    benchmark: "RoboCasa-GR1",
    axisLabel: "RoboCasa-GR1",
    axisLines: ["RoboCasa", "GR1"],
    embodiment: "Dexterous hand",
    setting: "Simulation",
    metric: "Success rate",
    decimals: 1,
    openwam: 60.5,
    vla: { model: "PhysBrain 1.0", value: 64.5 },
    wam: { model: "LDA-1B", value: 55.4 },
  },
  {
    benchmark: "Single-arm real-world tasks",
    axisLabel: "RW Single-arm",
    axisLines: ["Real world", "Single-arm"],
    embodiment: "Franka + Muka gripper",
    setting: "Real robot",
    metric: "Average success rate",
    decimals: 1,
    openwam: 82.5,
    vla: { model: "π0.5", value: 55.0 },
    wam: { model: "LingBot-VA", value: 77.5 },
  },
  {
    benchmark: "RoboDojo real-world track",
    axisLabel: "RW RoboDojo",
    axisLines: ["Real world", "RoboDojo"],
    embodiment: "Three bimanual platforms",
    setting: "Real robot",
    /* SR, not score: the other two real-robot axes are success rates, and the
       paper's own radar plots this one on SR too. The score halves are
       37.6 and 22.9. */
    metric: "Overall success rate",
    decimals: 1,
    openwam: 24.4,
    vla: { model: "π0.5", value: 12.8 },
  },
  {
    benchmark: "Dexterous-hand real-world tasks",
    axisLabel: "RW Dexterous",
    axisLines: ["Real world", "Dexterous"],
    embodiment: "Wuji hand + Tianji arm",
    setting: "Real robot",
    metric: "Pooled success rate",
    decimals: 1,
    openwam: 63.8,
    vla: { model: "π0.5", value: 29.5 },
  },
] as const;

const DATA: readonly BenchmarkDatum[] = BENCHMARKS.map((benchmark) => {
  const leader = Math.max(
    benchmark.openwam,
    benchmark.vla.value,
    benchmark.wam?.value ?? 0,
  );
  const normalize = (value: number) => (value / leader) * 100;

  return {
    ...benchmark,
    openwamPlot: normalize(benchmark.openwam),
    vlaPlot: normalize(benchmark.vla.value),
    wamPlot: benchmark.wam ? normalize(benchmark.wam.value) : undefined,
  };
});

const BY_AXIS_LABEL = new Map(DATA.map((datum) => [datum.axisLabel, datum]));

function formatScore(value: number, decimals: number) {
  return value.toFixed(decimals);
}

/* One delta per family rather than one against whichever baseline happens to
 * be highest. OpenWAM-α is a WAM, so the same-family comparison is the
 * like-for-like one, and collapsing both into a single "strongest baseline"
 * number hid it: against the best VLA the model trails on seven of twelve
 * axes, against the best WAM on four. */
function DeltaRow({
  label,
  ours,
  baseline,
  decimals,
}: {
  label: string;
  ours: number;
  baseline?: Score;
  decimals: number;
}) {
  if (!baseline) {
    return (
      <div className="flex items-baseline justify-between gap-3 py-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
          not reported
        </span>
      </div>
    );
  }
  const delta = ours - baseline.value;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="min-w-0 truncate text-[10px] text-muted-foreground">
        {label}
        <span className="ml-1 opacity-70">{baseline.model}</span>
      </span>
      <span
        className={`shrink-0 font-mono text-[12px] font-semibold tabular-nums ${
          delta >= 0 ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {delta >= 0 ? "+" : ""}
        {delta.toFixed(decimals)}
      </span>
    </div>
  );
}


function SettingBadge({ setting }: { setting: Setting }) {
  const isReal = setting === "Real robot";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
        isReal
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          isReal ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {setting}
    </span>
  );
}

function ScoreRow({
  color,
  label,
  model,
  value,
  decimals,
}: {
  color: string;
  label: string;
  model?: string;
  value?: number;
  decimals: number;
}) {
  return (
    <div className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 py-1.5">
      <span
        aria-hidden="true"
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <div className="text-[12px] font-medium leading-tight text-foreground">
          {label}
        </div>
        {model && (
          <div className="truncate text-[10px] leading-tight text-muted-foreground">
            {model}
          </div>
        )}
      </div>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
        {value === undefined ? "—" : formatScore(value, decimals)}
      </span>
    </div>
  );
}

function BenchmarkTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload as BenchmarkDatum | undefined;
  if (!datum) return null;

  return (
    <div className="w-[246px] rounded-xl border border-border bg-card/95 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.16)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold leading-tight text-foreground">
            {datum.benchmark}
          </div>
          <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
            {datum.embodiment} · {datum.metric}
          </div>
        </div>
        <SettingBadge setting={datum.setting} />
      </div>

      <div className="mt-2.5 divide-y divide-border/70">
        <ScoreRow
          color={OPENWAM_COLOR}
          label="OpenWAM-α"
          value={datum.openwam}
          decimals={datum.decimals}
        />
        <ScoreRow
          color={WAM_COLOR}
          label="Previous WAM SOTA"
          model={datum.wam?.model}
          value={datum.wam?.value}
          decimals={datum.decimals}
        />
        <ScoreRow
          color={VLA_COLOR}
          label="Previous VLA SOTA"
          model={datum.vla.model}
          value={datum.vla.value}
          decimals={datum.decimals}
        />
      </div>

      <div className="mt-2 rounded-md bg-muted/70 px-2.5 py-1.5">
        <DeltaRow
          label="vs best WAM"
          ours={datum.openwam}
          baseline={datum.wam}
          decimals={datum.decimals}
        />
        <div className="border-t border-border/60" />
        <DeltaRow
          label="vs best VLA"
          ours={datum.openwam}
          baseline={datum.vla}
          decimals={datum.decimals}
        />
      </div>
    </div>
  );
}

interface AngleTickProps {
  x?: string | number;
  y?: string | number;
  textAnchor?: string;
  payload?: { value: string };
}

function BenchmarkTick({
  x = 0,
  y = 0,
  textAnchor = "middle",
  payload,
}: AngleTickProps) {
  const datum = payload ? BY_AXIS_LABEL.get(payload.value) : undefined;
  if (!datum) return <g />;
  const isReal = datum.setting === "Real robot";
  const tickX = Number(x);
  const tickY = Number(y);
  const anchor =
    textAnchor === "start" || textAnchor === "end" ? textAnchor : "middle";

  return (
    <g>
      <text
        x={tickX}
        y={tickY}
        textAnchor={anchor}
        dominantBaseline="central"
        fill={isReal ? "#08775d" : "#5f6671"}
        fontSize={10.5}
        fontWeight={isReal ? 650 : 550}
      >
        {datum.axisLines.map((line, index) => (
          <tspan key={line} x={tickX} dy={index === 0 ? 0 : 12}>
            {line}
          </tspan>
        ))}
      </text>
      {isReal && (
        <circle
          cx={
            tickX +
            (anchor === "end" ? -5 : anchor === "start" ? 5 : 0)
          }
          cy={tickY - 10}
          r={2.25}
          fill="#10b981"
        />
      )}
    </g>
  );
}

/* The inline form of DeltaRow, for the strip under the chart. */
function PanelDelta({
  label,
  ours,
  baseline,
  decimals,
}: {
  label: string;
  ours: number;
  baseline?: Score;
  decimals: number;
}) {
  if (!baseline) {
    return (
      <span className="text-muted-foreground/60">
        vs best {label} <span className="font-mono">n/r</span>
      </span>
    );
  }
  const delta = ours - baseline.value;
  return (
    <span>
      <span className="text-muted-foreground">vs best {label} </span>
      <strong
        className={`font-mono tabular-nums ${
          delta >= 0 ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {delta >= 0 ? "+" : ""}
        {delta.toFixed(decimals)}
      </strong>
    </span>
  );
}

function DetailPanel({ datum }: { datum: BenchmarkDatum }) {
  return (
    <div
      aria-live="polite"
      className="mt-1 grid gap-3 rounded-lg border border-border/80 bg-muted/45 px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold text-foreground">
            {datum.benchmark}
          </span>
          <SettingBadge setting={datum.setting} />
        </div>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">
          {datum.embodiment} · {datum.metric}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px]">
        <span>
          <span className="text-muted-foreground">OpenWAM-α </span>
          <strong className="font-mono tabular-nums">
            {formatScore(datum.openwam, datum.decimals)}
          </strong>
        </span>
        <PanelDelta label="WAM" ours={datum.openwam} baseline={datum.wam} decimals={datum.decimals} />
        <PanelDelta label="VLA" ours={datum.openwam} baseline={datum.vla} decimals={datum.decimals} />
      </div>
    </div>
  );
}

export default function PerformanceRadar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = DATA[activeIndex] ?? DATA[0];

  const selectActiveIndex = (
    index: string | number | null | undefined,
  ) => {
    const nextIndex = Number(index);
    if (
      Number.isInteger(nextIndex) &&
      nextIndex >= 0 &&
      nextIndex < DATA.length
    ) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <figure className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          {[
            ["OpenWAM-α", OPENWAM_COLOR],
            ["Previous WAM SOTA", WAM_COLOR],
            ["Previous VLA SOTA", VLA_COLOR],
          ].map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">
          Hover or tap an axis
        </span>
      </div>

      <div
        className="relative h-[380px] w-full sm:h-[520px]"
        aria-label="Interactive radar chart comparing OpenWAM-alpha with previous WAM and VLA state of the art across simulation benchmarks and real-robot platforms."
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={DATA}
            cx="50%"
            cy="50%"
            outerRadius="69%"
            margin={{ top: 34, right: 42, bottom: 32, left: 42 }}
            onMouseMove={(state) =>
              selectActiveIndex(state.activeTooltipIndex)
            }
            onClick={(state) => selectActiveIndex(state.activeTooltipIndex)}
            onTouchStart={(state) =>
              selectActiveIndex(state.activeTooltipIndex)
            }
          >
            <PolarGrid
              gridType="polygon"
              stroke="#dfe3e8"
              strokeWidth={0.8}
            />
            <PolarAngleAxis
              dataKey="axisLabel"
              tick={(props) => <BenchmarkTick {...props} />}
              tickLine={false}
              axisLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickCount={5}
            />
            <Radar
              name="Previous VLA SOTA"
              dataKey="vlaPlot"
              stroke={VLA_COLOR}
              strokeWidth={1.8}
              fill="transparent"
              dot={{ r: 2.5, fill: "white", strokeWidth: 1.7 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              isAnimationActive="auto"
            />
            <Radar
              name="Previous WAM SOTA"
              dataKey="wamPlot"
              stroke={WAM_COLOR}
              strokeWidth={1.8}
              fill="transparent"
              connectNulls={false}
              dot={{ r: 2.5, fill: "white", strokeWidth: 1.7 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              isAnimationActive="auto"
            />
            <Radar
              name="OpenWAM-α"
              dataKey="openwamPlot"
              stroke={OPENWAM_COLOR}
              strokeWidth={3}
              fill={OPENWAM_COLOR}
              fillOpacity={0.19}
              dot={{ r: 3, fill: "white", strokeWidth: 2.4 }}
              activeDot={{ r: 6, strokeWidth: 2.6 }}
              isAnimationActive="auto"
            />
            <Tooltip
              content={(props) => <BenchmarkTooltip {...props} />}
              cursor={{
                stroke: "#527eea",
                strokeDasharray: "3 4",
                strokeOpacity: 0.45,
              }}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 20, outline: "none" }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="rounded-full border border-blue-100 bg-white/90 px-3 py-2 text-center shadow-sm backdrop-blur-sm">
            <div className="text-[11px] font-semibold tracking-tight text-slate-800">
              OpenWAM-α
            </div>
            <div className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-slate-400">
              12 evaluation axes
            </div>
          </div>
        </div>
      </div>

      <DetailPanel datum={selected} />

      <figcaption className="mt-3 px-2 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-[12px]">
        Geometry is normalized to the leader on each benchmark; hover, focus,
        or tap for raw scores and model names. Green labels mark physical-robot
        evaluations.
      </figcaption>
    </figure>
  );
}
