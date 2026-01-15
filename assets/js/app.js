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

// ===== Footer ticker rotation (dynamic speed) =====
const tickerTextEl = document.getElementById("tickerText");
const tickerTrackEl = document.getElementById("tickerTrack");

const tickerLines = [
  "I realized it's not a one-size-fits-all here. You have to be able to adapt in your caregiving, because the method one day might not be the method the next.",
  "I find that my cup is filled when I’m giving, and my healing happens when I'm helping with somebody else's healing.",
  "I don't want a revolution if I can't dance in it.",
  "But it was a bunch of new radicals in the South Bronx who brought us here.",
  "A eso le llamamos el poder popular: cuando la gente se reconoce como dueña de su destino, no como víctima.",
  "My mother wanted a magnolia tree. She fell in love with their large flowers. This was until she saw the mess they make when their petals fall, covering the surrounding area in mold.",
  "The truth is, the way stories are gathered in this country often resembles a raid.",
  "But we cannot be merely oppositional; if all we do is speak back to the wound, we risk shaping our entire conversation around the injury and becoming fluent only in describing what hurts us.",
  "We are more than decoration; we are infrastructure.",
  "We honor the wisdom carried by those whose lives have too often been dismissed, and the trust it takes to place that wisdom in the hands of others.",
  "For the courage to dream together of futures shaped by care rather than cages, by belonging rather than banishment, by systems that nourish our inherent worth instead of managing loss.",
  "Along the way, we learn to cup beauty and grief in the palms of our hands."
];

let tickerIndex = 0;

// Tune these to taste:
const MIN_SECONDS = 16;          // shortest quote speed
const MAX_SECONDS = 34;          // longest quote speed
const CHARS_FOR_MAX = 220;       // around where you want "max" duration to kick in

function restartMarqueeWithDuration(seconds) {
  if (!tickerTrackEl) return;

  // set duration for this pass
  tickerTrackEl.style.animationDuration = `${seconds}s`;

  // restart animation
  tickerTrackEl.style.animation = "none";
  void tickerTrackEl.offsetHeight;
  tickerTrackEl.style.animation = "";
}

function durationForLine(line) {
  const len = (line || "").length;
  const t = Math.min(len / CHARS_FOR_MAX, 1); // 0..1
  return MIN_SECONDS + (MAX_SECONDS - MIN_SECONDS) * t;
}

function setTickerLine(line) {
  if (!tickerTextEl || !tickerTrackEl) return;
  tickerTextEl.textContent = line;

  const seconds = durationForLine(line);
  restartMarqueeWithDuration(seconds);

  // schedule the next swap slightly before the animation completes
  const nextInMs = Math.max((seconds * 1000) - 400, 8000);
  window.clearTimeout(window.__thpTickerTimeout);
  window.__thpTickerTimeout = window.setTimeout(nextTicker, nextInMs);
}

function nextTicker() {
  tickerIndex = (tickerIndex + 1) % tickerLines.length;
  setTickerLine(tickerLines[tickerIndex]);
}

// init
if (tickerTextEl && tickerTrackEl && tickerLines.length) {
  setTickerLine(tickerLines[0]);
}
