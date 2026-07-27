// Is a world still zooming open?
//
// WorldWindow (App.jsx) grows a world from scale 0.3 to 1 over 420ms, and a
// transformed ancestor is the containing block for its fixed-position
// descendants — so while that zoom runs, a `position: fixed; inset: 0` child
// measures the SCALED box, not the viewport.
//
// Anything that reads its own size once and keeps the answer has to wait for
// the zoom to land. The lanyard is the case in point: rapier reads a body's
// position only when it creates it, so a canvas measured at scale 0.3 nails the
// badge's hook to roughly a third of the way in, permanently.
//
// This lived as a bug for a while precisely because it hid on reload: the
// lanyard chunk is ~3MB and lazy, so on a cold load it arrives well after the
// 420ms zoom and measures a settled canvas. Navigate in from another world with
// the chunk already cached and it mounts mid-zoom instead.
//
// Own module rather than an export from App.jsx: TechLanyard is reached through
// App -> TechWorld -> TechLanyard, so importing back from App would close an
// import cycle.
import { createContext, useContext } from "react";

export const WorldOpening = createContext(false);

export const useWorldOpening = () => useContext(WorldOpening);
