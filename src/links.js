// The off-site addresses, in one place.
//
// LinkedIn was declared twice — its own `const LINKEDIN` at the top of both
// DesignWorld.jsx and TechWorld.jsx — and the cover's top-right link would have
// made three. Three copies of a URL is how one of them quietly goes stale: she
// changes the handle, two surfaces follow and the third 404s, and nothing in
// the build says a word about it.
//
// Everything here is a real destination that leaves the site. Internal routes
// are hashes and belong to the router, not to this file.
export const LINKEDIN = "https://www.linkedin.com/in/mrinali-bhardwaj-a340a3322/";
export const GITHUB = "https://github.com/MrinaliBhardwaj";
export const INSTAGRAM = "https://www.instagram.com/mrinalii._/";
export const EMAIL = "mrinalibhardwaj0705@gmail.com";
