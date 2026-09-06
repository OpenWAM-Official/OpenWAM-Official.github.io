"use client";

import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { useEffect, useRef } from "react";

import { CLIP_BASE } from "@/lib/paper";

type Clip = {
  src: string;
  title: string;
  platform?: string;
};

type Group = {
  id: string;
  label: string;
  note: string;
  aspect: string;
  /* Tiles visible per screenful. Fewer means wider tiles, which for an
     ultra-wide group is the only way to gain height: a 20:9 clip in a 280px
     tile is 126px tall against 210px for a 4:3 clip in the same width. */
  perView: number;
  clips: readonly Clip[];
};

/* One clip.
 *
 * Videos play on their own — no click, no hover. What keeps that affordable
 * across 72 clips is that only the ones actually on screen are ever loaded:
 * every tile starts at preload="none", and the sync in Track flips it to
 * "auto" and calls play() once it scrolls into view, then pauses it again on
 * the way out. */
function Tile({
  clip,
  aspect,
  perView,
}: {
  clip: Clip;
  aspect: string;
  perView: number;
}) {
  return (
    <figure
      className="shrink-0 snap-start"
      /* Width is a share of the visible track, so perView tiles land exactly
         within it whatever the container width. minWidth stops narrow screens
         from squeezing tiles to nothing — below that the row just scrolls. */
      style={
        {
          width: `calc((100% - ${perView - 1}rem) / ${perView})`,
          minWidth: "240px",
        } as CSSProperties
      }
    >
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-muted"
        style={{ aspectRatio: aspect }}
      >
        <video
          data-rollout-clip=""
          src={`${CLIP_BASE}/${clip.src}.mp4`}
          poster={asset(`/videos/posters/${clip.src}.jpg`)}
          muted
          loop
          playsInline
          /* Native controls, so the progress bar is draggable and each clip
             can be scrubbed. Cheaper and more accessible than a bespoke
             player, and the browser hides them until the tile is hovered. */
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          preload="none"
          /* contain, not cover: group aspect is measured from the encoded
             clips so this fills exactly for all but one ultra-wide outlier,
             which letterboxes rather than losing the hand off-frame. */
          className="h-full w-full object-contain"
        />
      </div>
      <figcaption className="mt-2 text-[13px] leading-snug">
        <span className="font-medium text-foreground/85">{clip.title}</span>
        {clip.platform && (
          <span className="ml-1.5 text-muted-foreground">{clip.platform}</span>
        )}
      </figcaption>
    </figure>
  );
}

function Arrow({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card/95 text-foreground/70 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:border-foreground/40 hover:text-foreground hover:shadow-md"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
        <path
          d={dir === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* Scroll the track ourselves rather than asking for `behavior: "smooth"`.
 *
 * Two reasons. `scroll-snap-type: x mandatory` cancels a native smooth scroll
 * that crosses several snap points, which is exactly what wrapping from one
 * end to the other does; and native smooth scrolling is simply absent in some
 * embedded browsers, where the arrows would then do nothing at all. Writing
 * scrollLeft each frame behaves the same everywhere.
 *
 * Snap is lifted for the duration so it cannot fight the tween, and restored
 * once the last frame lands on a snap position anyway. */
function animateTo(
  el: HTMLElement,
  target: number,
  duration: number,
  onLand?: () => void,
) {
  const from = el.scrollLeft;
  const delta = target - from;
  if (Math.abs(delta) < 1) return;

  const existing = Number(el.dataset.scrollAnim || 0);
  if (existing) cancelAnimationFrame(existing);

  const previousSnap = el.style.scrollSnapType;

  const settle = () => {
    el.scrollLeft = target;
    delete el.dataset.scrollAnim;
    el.style.scrollSnapType = previousSnap;
    /* Runs after the position is final, so folding back into the first set is
       a plain assignment the reader never sees mid-animation. */
    onLand?.();
  };

  /* Animation frames do not run while the document is hidden, so tweening
     would leave snap disabled and the track short of its target. Nobody is
     watching an easing curve on a hidden page — jump. */
  if (document.hidden) {
    settle();
    return;
  }

  el.style.scrollSnapType = "none";
  const start = performance.now();

  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    /* easeOutCubic — quick to leave, soft to arrive. */
    const eased = 1 - Math.pow(1 - t, 3);
    el.scrollLeft = from + delta * eased;
    if (t < 1) {
      el.dataset.scrollAnim = String(requestAnimationFrame(frame));
    } else {
      settle();
    }
  };
  el.dataset.scrollAnim = String(requestAnimationFrame(frame));

  /* If the page is hidden mid-tween the frames stop for good, so finish the
     job on the way out rather than leaving snap off and the row stranded. */
  const onHide = () => {
    if (!document.hidden) return;
    const pending = Number(el.dataset.scrollAnim || 0);
    if (pending) cancelAnimationFrame(pending);
    settle();
    document.removeEventListener("visibilitychange", onHide);
  };
  document.addEventListener("visibilitychange", onHide);
  window.setTimeout(
    () => document.removeEventListener("visibilitychange", onHide),
    duration + 400,
  );
}

function Track({ group }: { group: Group }) {
  const trackRef = useRef<HTMLDivElement>(null);

  /* Play only what is on screen, so a row of 18 clips costs one screenful of
     video rather than all of it.
   *
   * Visibility is measured from getBoundingClientRect rather than taken from
   * the IntersectionObserver entry. The observer is only a cheap trigger:
   * it does not fire at all while the document is unrendered, and rect maths
   * stays correct in that case, so the same sync also runs on scroll, on
   * resize, and once on mount. Running sync twice is harmless — it only ever
   * sets state the element is not already in. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const videos = Array.from(
      el.querySelectorAll<HTMLVideoElement>("[data-rollout-clip]")
    );

    const sync = () => {
      const vh = window.innerHeight || 0;
      const vw = window.innerWidth || 0;
      for (const v of videos) {
        const r = v.getBoundingClientRect();
        const visible =
          r.width > 0 &&
          r.height > 0 &&
          r.top < vh &&
          r.bottom > 0 &&
          r.left < vw &&
          r.right > 0;

        if (visible) {
          if (v.preload !== "auto") v.preload = "auto";
          // Rejects if the tile scrolls out mid-load, or when the browser
          // suspends video-only media in an unrendered tab. Neither is
          // recoverable here and neither should surface.
          if (v.paused) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    sync();

    const io = new IntersectionObserver(schedule, {
      threshold: [0, 0.25, 0.6],
    });
    videos.forEach((v) => io.observe(v));

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    el.addEventListener("scroll", schedule, { passive: true });

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.removeEventListener("scroll", schedule);
    };
  }, [group.clips]);

  const step = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;

    /* Move by exactly one tile. offsetLeft includes the flex gap, so this
       remains accurate when the card width changes at the sm breakpoint. */
    const first = el.firstElementChild as HTMLElement | null;
    const second = first?.nextElementSibling as HTMLElement | null;
    const distance =
      first && second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth;
    if (!distance) return;

    /* One set's width. The track holds two identical sets, so any position x
       and x + setWidth show the same thing — which is what lets the seam be
       crossed without the reader seeing it. */
    const setWidth = el.scrollWidth / 2;

    if (dir === -1 && el.scrollLeft - distance < 0) {
      /* Going left off the front: jump forward one set first, then animate
         left from there. The jump is invisible because the two positions are
         identical, and the animation that follows is an ordinary step. */
      el.scrollLeft += setWidth;
    }

    const target = el.scrollLeft + dir * distance;
    /* After landing, fold back into the first set. */
    const onLand = () => {
      if (el.scrollLeft >= setWidth) el.scrollLeft -= setWidth;
    };

    animateTo(el, target, 380, onLand);
  };

  return (
    <section aria-labelledby={`rollout-${group.id}`}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h3
            id={`rollout-${group.id}`}
            className="text-[17px] font-semibold tracking-tight"
          >
            {group.label}
          </h3>
          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-foreground/75">
            {group.note}
          </p>
        </div>
        <span className="hidden shrink-0 text-[12px] tabular-nums text-muted-foreground sm:inline">
          {group.clips.length} clips
        </span>
      </div>

      {/* Arrows sit in gutters either side of the track rather than floating
          over the first and last tile, so they read as controls for the row
          instead of covering its content. min-w-0 is what lets the track
          actually shrink inside the flex row instead of overflowing it. */}
      <div className="mt-4 flex items-center gap-2 sm:gap-3">
        <Arrow dir="left" onClick={() => step(-1)} />
        <div
          ref={trackRef}
          className="marquee-scroller flex min-w-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
        >
          {/* The set is rendered twice. Scrolling past the end continues into
              an identical copy, and `step` silently subtracts one set's width
              once the animation lands — so the row joins back onto its own
              first tile instead of rewinding. The copies carry preload="none"
              like every other tile, so they cost nothing until seen. */}
          {[0, 1].flatMap((pass) =>
            group.clips.map((clip) => (
              <Tile
                key={`${clip.src}-${pass}`}
                clip={clip}
                aspect={group.aspect}
                perView={group.perView}
              />
            ))
          )}
        </div>
        <Arrow dir="right" onClick={() => step(1)} />
      </div>
    </section>
  );
}

export default function RolloutGallery({
  groups,
}: {
  groups: readonly Group[];
}) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <Track key={group.id} group={group} />
      ))}
    </div>
  );
}
