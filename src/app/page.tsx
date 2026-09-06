import Link from "next/link";
import { asset } from "@/lib/asset";
import type { CSSProperties } from "react";
import HeroSplash from "@/components/HeroSplash";
import ResourceButtons from "@/components/ResourceButtons";
import OverviewVideo from "@/components/OverviewVideo";
import RolloutGallery from "@/components/RolloutGallery";
import PerformanceRadar from "@/components/PerformanceRadar";
import AlphaSpec from "@/components/AlphaSpec";
import BenchmarkStandings from "@/components/BenchmarkStandings";
import SectionNav from "@/components/SectionNav";
import styles from "./home.module.css";
import {
  ABSTRACT,
  AFFILIATIONS,
  AUTHORS,
  AUTHOR_NOTES,
  FINDINGS,
  HEADLINE_STATS,
  PAPER_NAME,
  PAPER_SUBTITLE,
  PILLARS,
  RECIPE,
  ROLLOUT_GROUPS,
} from "@/lib/paper";

/* The header splits the paper title in two: the cube mark plus the name as a
 * lockup, and the h1 carrying the descriptive half. Deliberately NOT the full
 * wordmark image — Figure 1 sits a few hundred pixels below and already has
 * the wordmark at its centre, so repeating it here reads as a duplicate.
 * The full string still lives in PAPER_TITLE for metadata. */
function Title() {
  return (
    <div>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <img
          src={asset("/openwam-mark.png")}
          alt=""
          className="h-11 w-11 shrink-0 sm:h-[54px] sm:w-[54px]"
        />
        <span className="text-[40px] font-semibold leading-none tracking-tight sm:text-[52px]">
          {PAPER_NAME}
        </span>
      </div>
      <h1 className="mx-auto mt-6 max-w-2xl text-balance text-[20px] font-medium leading-snug tracking-tight text-foreground/80 sm:text-[25px]">
        <span className="sr-only">{PAPER_NAME}: </span>
        {PAPER_SUBTITLE}
      </h1>
    </div>
  );
}

function AuthorList() {
  return (
    <div className="mt-6">
      {/* Each entry is nowrap so a name never splits from its superscript, but
          the separator must sit OUTSIDE that span — adjacent nowrap spans with
          no whitespace between them give the browser no break opportunity, and
          the line runs off the page. */}
      <p className="text-[15px] leading-relaxed text-foreground/90">
        {AUTHORS.map((author, i) => (
          <span key={author.name}>
            <span className="whitespace-nowrap">
              {author.name}
              <sup className="ml-0.5 text-[10px] text-muted-foreground">
                {author.affs.join(",")}
                {author.marks}
              </sup>
            </span>
            {i < AUTHORS.length - 1 && ", "}
          </span>
        ))}
      </p>

      {/* Logos double as the legend for the author superscripts, so each one
          carries its affiliation number. Heights are capped rather than
          widths: the set mixes round crests (PKU, ZJU) with wide horizontal
          lockups (NUS, HKU, CUHK, Tsinghua), and a common cap height is what
          makes those sit on one line together. */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-5">
        {AFFILIATIONS.map((aff) => (
          <li key={aff.id} className="flex h-10 items-center gap-1">
            <span className="self-start text-[10px] leading-none text-muted-foreground">
              {aff.id}
            </span>
            {/* object-contain matters here: a fixed height plus a max-width
                squashes the wide lockups (HKU, CUHK) once their natural width
                exceeds the cap. With object-contain they letterbox instead. */}
            <img
              src={asset(aff.logo)}
              alt={aff.name}
              title={aff.name}
              className="h-10 w-auto max-w-[170px] object-contain opacity-90 transition hover:opacity-100"
            />
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[12px] text-muted-foreground/80">{AUTHOR_NOTES}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSplash />

      {/* ---- Title block ---- */}
      <section className="pt-10 pb-14 sm:pt-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Title />
          <AuthorList />
          <div className="mt-7 flex justify-center">
            <ResourceButtons />
          </div>
        </div>

        {/* ---- Figure 1: the whole stack on one canvas. It is wide and dense,
                so it gets more width than the prose and scrolls horizontally
                rather than shrinking to illegibility on phones. ---- */}
        <figure className="mx-auto mt-12 max-w-[1240px] px-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-card p-3">
            <img
              src={asset("/figs/overview.png")}
              alt="Overview of the OpenWAM stack: OpenWAM-Infra on the left, OpenWAM-Study in the middle, OpenWAM-α on the right."
              className="h-auto w-full min-w-[720px]"
            />
          </div>
          <figcaption className="mt-3 text-center text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground/80">Figure 1.</span>{" "}
            Overview — a modular infrastructure, a controlled study over six
            design questions, and the pretrained model that composes the result.
          </figcaption>
        </figure>
      </section>

      <SectionNav />

      {/* ---- Abstract ---- */}
      <section id="overview" className="scroll-mt-28 border-t border-border py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Abstract
          </h2>
          <p className="mt-5 text-[15px] leading-[1.75] text-foreground/90">
            {ABSTRACT}
          </p>
        </div>
      </section>

      {/* ---- Overview film ---- */}
      <section id="video" className="scroll-mt-28 border-t border-border py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Video
          </h2>
          <div className="mt-7">
            <OverviewVideo />
          </div>
        </div>
      </section>

      {/* ---- Three pillars ---- */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[26px] font-semibold tracking-tight">
              One stack, three layers
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
              Modularity turns world–action modeling from a set of coupled
              implementation choices into a controlled experimental program.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PILLARS.map((pillar, pillarIndex) => (
              <div
                key={pillar.id}
                className={`${styles.pillarCard} group flex flex-col rounded-xl border border-border bg-card p-6`}
                style={
                  { "--card-accent": pillar.color } as CSSProperties
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="text-[17px] font-semibold tracking-tight"
                    style={{ color: pillar.color }}
                  >
                    {pillar.name}
                  </h3>
                  <span
                    aria-hidden="true"
                    className={`${styles.pillarIndex} font-mono text-[11px] font-semibold tracking-[0.12em]`}
                  >
                    0{pillarIndex + 1}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-medium text-foreground/70">
                  {pillar.tagline}
                </p>
                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-foreground/85">
                  {pillar.body}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {pillar.facts.map((fact, factIndex) => (
                    <li
                      key={fact}
                      className={`${styles.pillarFact} inline-flex items-center gap-1.5 rounded border border-border bg-muted/60 px-2 py-1 text-[11px] font-medium text-foreground/75`}
                      style={
                        { "--fact-index": factIndex } as CSSProperties
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={styles.pillarFactDot}
                      />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Findings ---- */}
      <section id="findings" className="scroll-mt-28 border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[26px] font-semibold tracking-tight">
              What the controlled study found
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
              Three questions, asked in sequence — each tested under the
              conditions the previous answer created.
            </p>
          </div>

          <ol className="mt-10 space-y-5">
            {FINDINGS.map((finding) => (
              <li
                key={finding.n}
                data-finding-number={`0${finding.n}`}
                className={`${styles.findingCard} rounded-xl border border-border bg-card p-6`}
              >
                <div className="relative z-10 flex items-baseline gap-3">
                  <span className={`${styles.findingLabel} inline-flex shrink-0 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent`}>
                    <span
                      aria-hidden="true"
                      className={`${styles.findingPulse} h-1.5 w-1.5 rounded-full bg-accent`}
                    />
                    Finding {finding.n}
                  </span>
                  <span className={`${styles.findingQuestion} text-[14px] font-medium text-foreground/70`}>
                    {finding.question}
                  </span>
                </div>
                <p className={`${styles.findingBody} relative z-10 mt-3 text-[15px] leading-relaxed text-foreground/90`}>
                  {finding.text}
                </p>
              </li>
            ))}
          </ol>

          {/* Recipe table — the study's output, and OpenWAM-α's input. */}
          <div className="mt-12">
            <h3 className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              The accumulated recipe
            </h3>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-semibold">Stage</th>
                    <th className="px-4 py-3 font-semibold">Finding</th>
                    <th className="px-4 py-3 font-semibold">
                      Carried-forward default
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RECIPE.map((row) => (
                    <tr
                      key={row.stage}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 align-top font-medium">
                        {row.stage}
                      </td>
                      <td className="px-4 py-3 align-top text-foreground/80">
                        {row.finding}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[13px] text-foreground/90">
                        {row.carried}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Performance ---- */}
      <section id="model" className="scroll-mt-28 border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[26px] font-semibold tracking-tight">
              OpenWAM-α
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
              The recipe instantiated at scale: a dual-system model with mutual
              world&ndash;action visibility, co-trained in one stage on 518.5M
              frames &mdash; 6,369 hours &mdash; of egocentric human and robot
              data through an 80-D unified action space.
            </p>
          </div>

          {/* What the model is, before any scores. Figure 12 carries the
              architecture, the mixture, the sampler and the action space on one
              canvas, so it does the work four separate diagrams would. */}
          {/* Height-capped rather than full-bleed. At the container's width this
              figure is 850px tall — taller than a viewport — so it stopped
              being something you take in while reading and became something you
              scroll past. 600px keeps heading, figure and caption inside one
              screen while leaving panels (b)-(d) legible; 440 was small enough
              that the fine print was gone. Full resolution is one click away. */}
          <figure className="mt-10">
            <a
              href={asset("/figs/architecture.png")}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/25"
            >
              <img
                src={asset("/figs/architecture.png")}
                alt="OpenWAM-α: the dual-system architecture, the pretraining mixture, the timestep sampler, and the 80-D unified action space."
                className="mx-auto h-auto max-h-[600px] w-auto max-w-full object-contain"
              />
              <span className="mt-2 block text-center text-[11px] text-muted-foreground/70 transition-colors group-hover:text-foreground/60">
                Open full size ↗
              </span>
            </a>
            <figcaption className="mx-auto mt-3 max-w-3xl text-center text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">Figure 12.</span>{" "}
              (a) A video DiT and a dedicated ActionDiT jointly denoise the
              future frames and the action chunk through shared attention under
              the mutual mask. (b) The one-stage pretraining mixture. (c)
              Training covers the joint noise plane; inference follows the
              synchronized diagonal. (d) Fixed slot semantics shared across
              every embodiment.
            </figcaption>
          </figure>

          <div className="mt-10">
            <AlphaSpec />
          </div>

          <div id="benchmarks" className="scroll-mt-28 mt-14 border-t border-border pt-12">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-[22px] font-semibold tracking-tight">
                From simulation to the physical world
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
                OpenWAM-α holds its standing across eight simulation benchmarks
                and three real-robot platforms &mdash; including a dexterous
                hand whose embodiment never appears in the mixture above.
              </p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
              <PerformanceRadar />

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {HEADLINE_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card px-5 py-4"
                >
                  <dt className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-[26px] font-semibold leading-none tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {stat.unit}
                    </span>
                  </dd>
                  <p className="mt-1.5 text-[12px] leading-snug text-foreground/65">
                    {stat.note}
                  </p>
                </div>
              ))}
            </dl>
            </div>

            {/* Figure 13, reproduced: same panel order, same ordering within a
                panel, same non-zero axis floors. Interactive only in that a
                model can be traced across all nine panels. */}
            <figure className="mt-12">
              <div className="overflow-x-auto rounded-xl border border-border bg-card p-5 sm:p-7">
                <div className="min-w-[1040px]">
                  <BenchmarkStandings />
                </div>
              </div>
              <figcaption className="mx-auto mt-3 max-w-3xl text-center text-[13px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  Figure 13.
                </span>{" "}
                Score comparison against representative VLA and WAM baselines
                across the simulation benchmarks. Within each panel, baselines
                are ordered by score and every bar is labelled with its actual
                value. This is each benchmark&rsquo;s summary column;{" "}
                <Link
                  href="/results"
                  className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
                >
                  the full per-benchmark tables
                </Link>{" "}
                carry every column and every baseline reported.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---- Real-robot rollouts ---- */}
      <section id="demos" className="scroll-mt-28 border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[26px] font-semibold tracking-tight">
              Real-robot rollouts
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
              The same policy across three real-robot experiments, from a
              single-arm gripper to bimanual platforms to a dexterous hand.
              Every task and camera view, scrollable left and right.
            </p>
          </div>
          {/* Wider than the prose above it: the arrows live in side gutters
              outside the tile row, and this is the room they sit in. -mx-*
              lets it exceed the max-w-6xl parent without a second wrapper. */}
          {/* The galleries bleed past the prose column so the arrows sit
              clear of the tiles. The bleed only fits once the viewport is
              wider than the container plus both arrows (1152 + 112 + padding),
              so it starts at xl — at lg it overflowed the page. */}
          <div className="mt-12 xl:-mx-14 2xl:-mx-20">
            <RolloutGallery groups={ROLLOUT_GROUPS} />
          </div>
        </div>
      </section>

      {/* ---- Citation ---- */}
      <section id="citation" className="scroll-mt-28 border-t border-border py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Citation
          </h2>
          {/* Deliberately not a BibTeX block. There is no preprint and no
              proceedings entry yet, so any key, venue or year printed here
              would be made up. */}
          <p className="mt-5 text-center text-[15px] leading-relaxed text-foreground/75">
            <span className="font-mono text-foreground">TBD</span>
            {" — "}a citation will be added here once the preprint is up.
          </p>
        </div>
      </section>
    </div>
  );
}
