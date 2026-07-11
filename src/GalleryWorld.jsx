// GALLERY WORLD: the dock's Gallery app. A full-viewport immersive dome of
// images floating in the void — drag to rotate, click a tile to enlarge.
// Minimal chrome (monogram + close) so the dome owns the screen; the dock
// (owned by App) still floats over it as the OS layer.
import { X } from "lucide-react";
import DomeGallery from "./DomeGallery.jsx";

// the dome's outer radial fade blends into this exact colour, so the sphere
// dissolves into the page edges instead of sitting on a visible panel
const GALLERY_BG = "#05040a";

// TODO: swap these placeholders for real work shots (ideally vendored to
// public/, the way the lotus video is, to drop the external-URL dependency).
const IMAGES = [
  { src: "https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop", alt: "Gallery image" },
  { src: "https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop", alt: "Gallery image" },
  { src: "https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop", alt: "Gallery image" },
  { src: "https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop", alt: "Gallery image" },
  { src: "https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop", alt: "Gallery image" },
  { src: "https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop", alt: "Gallery image" },
];

export default function GalleryWorld() {
  const back = () => {
    window.location.hash = "/";
  };

  return (
    <div className="gw" style={{ background: GALLERY_BG }}>
      <div className="gw-stage">
        <DomeGallery
          images={IMAGES}
          overlayBlurColor={GALLERY_BG}
          minRadius={500}
          maxVerticalRotationDeg={20}
          segments={30}
          dragDampening={3.8}
          grayscale={false}
        />
      </div>

      <header className="gw-top">
        <span className="gw-mark" aria-label="Mrinali Bhardwaj">
          mb
        </span>
        <span className="gw-label">Gallery</span>
        <button
          type="button"
          className="gw-close"
          onClick={back}
          aria-label="Close gallery and return to the start"
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      <p className="gw-hint" aria-hidden="true">
        Drag to explore · click to enlarge
      </p>
    </div>
  );
}
