import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

// Vercel Web Analytics: cookieless, so no consent banner on the cover.
// Rooms live in the hash (#/design, #/case/regis …), which Vercel would log as
// "/" for every visit. Report the hash as the path so the dashboard shows which
// rooms people actually open. No-op in dev; only counts on the deployed site.
const pathFromHash = () => "/" + window.location.hash.replace(/^#\/?/, "");

export default function SiteAnalytics() {
  const [path, setPath] = useState(pathFromHash);
  useEffect(() => {
    const on = () => setPath(pathFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return <Analytics path={path} route={path} />;
}
