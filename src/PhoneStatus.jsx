// THE PHONE'S OWN CHROME — one copy, worn by two screens.
//
// The status row belongs to the DEVICE, not to either screen on it: the cover
// is the lock screen and PhoneHome is the home screen, and the first
// cross-fades into the second without the bar moving. Two copies of this
// markup is exactly how the two would end up a pixel apart — so it lives here,
// and both import it.
//
// Sizes and colour come from the context it is dropped into (.cover-status,
// .ph-frame): the bar is the same drawing on both, painted in whatever that
// screen's ink is.
import { useEffect, useState } from "react";

/** iOS's own clock: the hour and minute, no seconds, no meridiem */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // tick on the minute, not every second — a home screen clock that repaints
    // sixty times a minute is sixty wake-ups for a number that did not change
    let id;
    const schedule = () => {
      id = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60000 - (Date.now() % 60000));
    };
    schedule();
    return () => clearTimeout(id);
  }, []);
  return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
}

export default function PhoneStatus() {
  const time = useClock();
  return (
    <div className="ph-status">
      <span className="ph-status-time">{time}</span>
      {/* the island is drawn INSIDE the status row so the time and the
          indicators sit either side of it, exactly as iOS lays them out */}
      <span className="ph-island" aria-hidden="true">
        <span className="ph-island-lens" />
      </span>
      <span className="ph-status-icons" aria-hidden="true">
        <svg viewBox="0 0 18 12" className="ph-status-glyph" role="presentation">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="ph-status-glyph" role="presentation">
          <path d="M8 10.6 5.9 8.4a3 3 0 0 1 4.2 0L8 10.6Z" />
          <path
            d="M3.2 5.6a7 7 0 0 1 9.6 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5.6 8a3.6 3.6 0 0 1 4.8 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 26 12" className="ph-status-glyph ph-status-battery" role="presentation">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
          <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.8" />
          <path d="M23.4 4.2a2.6 2.6 0 0 1 0 3.6V4.2Z" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}
