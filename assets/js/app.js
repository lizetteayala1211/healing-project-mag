console.log("app.js loaded ✅");

console.log("[ticker] code reached");

import { navItems, cards } from "./data.js";
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

window.THP = {
  renderCardsGrid: () => {
    const grid = document.getElementById("cardsGrid");
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

const quotes = [
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

let tickerStarted = false;
let anim = null;
let index = 0;

function initTicker() {
  const ticker = document.getElementById("ticker");
  const textEl = document.getElementById("tickerText");

  if (!ticker || !textEl) {
    console.log("[ticker] missing elements", { ticker: !!ticker, textEl: !!textEl });
    return;
  }

  // If we already started and the element still exists, don't restart.
  if (tickerStarted) {
    // but if no animation exists, restart anyway
    if (textEl.getAnimations().length === 0) tickerStarted = false;
    else return;
  }

  console.log("[ticker] init ✓");
  tickerStarted = true;

  function runQuote(q) {
    if (anim) anim.cancel();

    textEl.style.display = "inline-block";
    textEl.style.whiteSpace = "nowrap";

    textEl.textContent = q;

    requestAnimationFrame(() => {
      const tickerW = ticker.clientWidth;
      const textW = textEl.scrollWidth;

      console.log("[ticker] measure", { tickerW, textW });

      if (!tickerW || !textW) return;

      const startX = tickerW;
      const endX = -textW;

      const speed = 90; // px/sec
      const distance = tickerW + textW;
      const duration = Math.max(6000, (distance / speed) * 1000);

      anim = textEl.animate(
        [
          { transform: `translateX(${startX}px)` },
          { transform: `translateX(${endX}px)` }
        ],
        { duration, easing: "linear", fill: "forwards" }
      );

      anim.onfinish = () => {
        index = (index + 1) % quotes.length;
        runQuote(quotes[index]);
      };
    });
  }

  runQuote(quotes[index]);
}

// run on first load
window.addEventListener("DOMContentLoaded", initTicker);

// run again when navigating between hash routes
window.addEventListener("hashchange", () => {
  tickerStarted = false;
  initTicker();
});

// (optional) also retry shortly after load in case footer injects late
setTimeout(initTicker, 150);
setTimeout(initTicker, 500);

