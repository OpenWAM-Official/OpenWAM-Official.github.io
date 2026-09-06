"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen title-image splash shown on first load. It fades out (with a
 * gentle scale) as soon as the visitor moves the mouse, scrolls, taps, or
 * clicks — revealing the page underneath. A short arming delay guarantees the
 * splash is visible for a beat even if the cursor twitches, and a timeout
 * auto-dismisses it so it can never trap the page.
 */
export default function HeroSplash() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let done = false;
    const dismiss = () => {
      if (done) return;
      done = true;
      setDismissed(true);
    };

    // Arm interaction triggers after a short beat so the splash is always seen.
    const arm = window.setTimeout(() => {
      window.addEventListener("mousemove", dismiss, { passive: true, once: true });
      window.addEventListener("wheel", dismiss, { passive: true, once: true });
      window.addEventListener("scroll", dismiss, { passive: true, once: true });
      window.addEventListener("touchstart", dismiss, { passive: true, once: true });
      window.addEventListener("keydown", dismiss, { once: true });
    }, 600);

    // Safety: auto-dismiss so the overlay can never permanently block the page.
    const auto = window.setTimeout(dismiss, 5000);

    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(auto);
      window.removeEventListener("mousemove", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [dismissed]);

  return (
    <div
      aria-hidden={dismissed}
      onClick={() => setDismissed(true)}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background transition-all duration-[800ms] ease-out ${
        dismissed
          ? "pointer-events-none scale-[1.04] opacity-0"
          : "opacity-100"
      }`}
    >
      <img
        src="/openwam-logo-long.png"
        alt="OpenWAM"
        className="max-h-[45vh] w-auto max-w-[82vw] object-contain"
      />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">
          Move or scroll to enter
        </span>
      </div>
    </div>
  );
}
