import { navItems, cards } from "./data.js";
import { getPath, loadPage, setPath } from "./router.js";

const app = document.getElementById("app");
const sideRail = document.getElementById("side-rail");
const sideRailMobile = document.getElementById("side-rail-mobile");

const drawer = document.getElementById("mobile-drawer");
const menuBtn = document.getElementById("menu-button");
const drawerBackdrop = document.getElementById("drawer-backdrop");

function renderRail(target) {
  target.innerHTML = `
    <div class="rail-card">
      ${navItems
        .map(
          (i) => `
        <a class="rail-link" href="#${i.path}">
          <div class="rail-roman">${i.roman}</div>
          <div class="rail-label">${i.label}</div>
        </a>`
        )
        .join("")}
    </div>
  `;
}

renderRail(sideRail);
renderRail(sideRailMobile);

// mobile drawer toggles
menuBtn?.addEventListener("click", () => drawer.classList.add("open"));
drawerBackdrop?.addEventListener("click", () => drawer.classList.remove("open"));
sideRailMobile?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) drawer.classList.remove("open");
});

// helper for templates to render the card grid
window.THP = {
  renderCardsGrid: () => {
    const grid = document.getElementById("cards-grid");
    if (!grid) return;

    grid.innerHTML = cards
      .map((c) => {
        const span = c.span2 ? "span-2" : "";
        return `
          <a class="card ${span}" href="#${c.path}" style="background:${c.color}">
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
  let path = getPath();
  if (path === "/") path = "/home";

  try {
    const html = await loadPage(path);
    app.innerHTML = html;

    // run page hooks
    window.THP?.renderCardsGrid?.();
  } catch (err) {
    app.innerHTML = `
      <div class="rules">
        <h1 class="article-title">Page not found</h1>
        <p class="prose">Try going back <a class="backpill" href="#/home">← Home</a></p>
      </div>
    `;
  }
}

window.addEventListener("hashchange", render);
render();
