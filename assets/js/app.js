import { navItems, cards, sectionFeatured } from "./data.js";
import { getPath, loadPage, setPath } from "./router.js";

const app = document.getElementById("app");
const sideRail = document.getElementById("side-rail");
const sideRailMobile = document.getElementById("side-rail-mobile");

const drawer = document.getElementById("mobile-drawer");
const menuBtn = document.getElementById("menu-button");
const drawerBackdrop = document.getElementById("drawer-backdrop");

function renderRail(target) {
  if (!target) return;

  target.innerHTML = `
    <div class="rail-card">
      ${navItems
        .map(
          (i) => `
          <a class="rail-link" href="#${i.path}">
            <div class="rail-roman">${i.roman}</div>
            <div class="rail-label">${i.label}</div>
          </a>
        `
        )
        .join("")}
    </div>
  `;
}

renderRail(sideRail);
renderRail(sideRailMobile);

// mobile drawer toggles
menuBtn?.addEventListener("click", () => drawer?.classList.add("open"));
drawerBackdrop?.addEventListener("click", () => drawer?.classList.remove("open"));

// close drawer when clicking a nav link on mobile
sideRailMobile?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) drawer?.classList.remove("open");
});

// helpers used by page partials
window.THP = {
renderCardsGrid: (currentPath) => {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;

  const key = (currentPath || "").replace("/", "");
  const featuredPaths = sectionFeatured?.[key] || [];

  const featured = featuredPaths
    .map((p) => cards.find((c) => c.path === p))
    .filter(Boolean);

  const rest = cards.filter((c) => !featuredPaths.includes(c.path));
  const ordered = [...featured, ...rest];

  grid.innerHTML = ordered
    .map((c, idx) => {
      const featuredClass = idx < featured.length ? "is-featured" : "";
      return `
        <a class="card ${featuredClass}" href="#${c.path}" style="background:${c.color}">
          <span class="card-dot"></span>
          <h3>${c.title}</h3>
          <p>${c.byline}</p>
        </a>
      `;
    })
    .join("");
},
  setPath,
};

async function render() {
  if (!app) return;

  let path = getPath();
  if (path === "/") path = "/home";

  try {
    const html = await loadPage(path);
    app.innerHTML = html;

    // IMPORTANT: pass the current route so sorting works
    window.THP?.renderCardsGrid?.(path);
  } catch (err) {
    app.innerHTML = `
      <div class="rules">
        <h1 class="article-title">Page not found</h1>
        <p class="prose">
          Try going back <a class="backpill" href="#/home">← Home</a>
        </p>
      </div>
    `;
  }
}

window.addEventListener("hashchange", render);
render();

