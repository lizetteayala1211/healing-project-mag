/* =========================================================
   THE HEALING PROJECT MAGAZINE — router.js
   - Hash routing helpers
   - Page loader (fetches /pages/<route>.html)
   - Optional transition helpers (fade out -> load -> inject -> fade in)
========================================================= */

export function getPath() {
  const hash = window.location.hash || "#/";
  return hash.replace("#", "");
}

export async function loadPage(path) {
  const res = await fetch(`/pages${path}.html`);
  if (!res.ok) throw new Error("Page not found");
  return await res.text();
}

export function setPath(path) {
  window.location.hash = `#${path}`;
}

/* =========================================================
   TRANSITIONS (optional, but recommended)
   Usage pattern in app.js:
     const html = await navigateTo("/scroll");
     app.innerHTML = html;
     await endTransition();
========================================================= */

const TRANSITION_MS = 420;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const raf = () => new Promise((r) => requestAnimationFrame(r));

/**
 * Starts fade-out, updates hash (optional), loads HTML, returns HTML string.
 * NOTE: does NOT remove .is-transitioning — call endTransition() after injecting.
 */
export async function navigateTo(path, { updateHash = true } = {}) {
  // Start fade-out
  document.body.classList.add("is-transitioning");
  await raf(); // allow CSS to apply
  await sleep(TRANSITION_MS);

  // Update URL (so back/forward still work)
  if (updateHash) setPath(path);

  // Fetch page HTML
  const html = await loadPage(path);

  // Return HTML so caller can inject it
  return html;
}

/**
 * Ends the transition (fade back in) AFTER the new DOM is injected.
 */
export async function endTransition() {
  await raf(); // allow new DOM to paint
  document.body.classList.remove("is-transitioning");
}
