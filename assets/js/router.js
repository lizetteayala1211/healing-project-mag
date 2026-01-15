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