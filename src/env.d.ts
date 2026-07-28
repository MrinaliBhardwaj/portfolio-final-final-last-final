/// <reference types="vite/client" />

// Ambient declarations for things the portfolio's plain JSX legitimately uses
// but that no installed @types package describes. Without these, `npm run
// typecheck` reports them as errors on every run — and a check with known
// permanent errors is one nobody reads, which is how the two crashes in
// git history (a missing import, a property read off a shape that lacked it)
// shipped past a "clean" typecheck in the first place.

export {};

declare global {
  interface Window {
    /** dev-only pond driver — see PondWorld.jsx (step/snap for headless verification) */
    __pond?: {
      step: (n?: number, dt?: number) => void;
      snap: () => Promise<string>;
    };
    /** dev-only handle on the badge's <video>, for checking the webcam feed */
    __badgeCam?: HTMLVideoElement;
    /** dev-only handle on the lanyard scene */
    __lanyard?: unknown;
  }
}

declare module "react" {
  interface CSSProperties {
    // Several components drive layout through CSS custom properties set inline
    // (the dome's --offset-x/--segments-x, the design hero's --u). React's own
    // CSSProperties has no index signature, so every one is an error without
    // this.
    [key: `--${string}`]: string | number | undefined;
  }

  interface ImgHTMLAttributes<T> {
    // Shipped in every current browser and used on the cover's poster and the
    // lotus preloads, but not yet in @types/react 18.
    fetchpriority?: "high" | "low" | "auto";
  }
}
