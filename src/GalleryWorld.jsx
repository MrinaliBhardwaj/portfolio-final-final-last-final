// GALLERY WORLD: the dock's Gallery app. A full-viewport immersive dome of
// images floating in the void — drag to rotate, click a tile to enlarge.
// Minimal chrome (traffic lights + monogram) so the dome owns the screen; the dock
// (owned by App) still floats over it as the OS layer.
import WindowLights from "./WindowLights.jsx";
import DomeGallery from "./DomeGallery.jsx";

// the dome's outer radial fade blends into this exact colour, so the sphere
// dissolves into the page edges instead of sitting on a visible panel
const GALLERY_BG = "#05040a";

// Vendored to public/gallery/ (WebP, longest edge capped at 1000px) from her
// own camera roll — dropped the placeholder Unsplash set. Source photos lived
// in three zip exports + loose WhatsApp downloads; exact-duplicate exports
// were deduped by content hash before conversion. 28 photos on a 150-slot
// dome (segments=30 below), so nothing repeats. Five more shots exist only as
// HEIC (no JPEG sibling) and were skipped — this machine's ffmpeg has no
// libheif, so they can't be decoded here. Re-export those as JPEG/PNG from
// the phone and re-run to add them.
//
// Alt text is generic ("Photo N") because these are personal photos, not
// captioned work samples — there's no description to give beyond what they
// are. Swap in real captions if these get replaced with case-study shots.
const IMAGES = Array.from({ length: 28 }, (_, i) => ({
  src: `/gallery/photo-${String(i + 1).padStart(2, "0")}.webp`,
  alt: `Photo ${i + 1}`,
}));

export default function GalleryWorld() {

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
          openedImageWidth="min(56vw, 620px)"
          openedImageHeight="min(56vh, 620px)"
        />
      </div>

      <header className="gw-top">
        <WindowLights world="gallery" label="Gallery" />
        <a className="gw-mark" href="#/" aria-label="Mrinali Bhardwaj — home">
          mb
        </a>
        <span className="gw-label">Gallery</span>
      </header>

      <p className="gw-hint" aria-hidden="true">
        Drag to explore · click to enlarge
      </p>
    </div>
  );
}
