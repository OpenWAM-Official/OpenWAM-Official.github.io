import { asset } from "@/lib/asset";

import { FILM } from "@/lib/paper";

/* The three-minute overview film.
 *
 * Unlike the rollout clips this one is narrated, so it does not autoplay,
 * loop or start muted — it waits for a click. preload="none" means the 44MB
 * costs a visitor nothing until they ask for it; the poster carries the frame
 * until then. The encode puts its moov atom first, so playback starts while
 * the rest is still arriving rather than after it. */
export default function OverviewVideo() {
  return (
    <figure className="mx-auto max-w-4xl px-4">
      <div className="overflow-hidden rounded-lg border border-border bg-black shadow-sm">
        <video
          src={FILM.src}
          poster={asset(FILM.poster)}
          controls
          playsInline
          preload="none"
          controlsList="nodownload"
          className="block h-auto w-full"
          style={{ aspectRatio: "16 / 9" }}
        />
      </div>
      <figcaption className="mt-3 text-center text-[13px] text-muted-foreground">
        A three-minute tour of the infrastructure, the study and the model.
      </figcaption>
    </figure>
  );
}
