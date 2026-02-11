/* =========================================================
   THE HEALING PROJECT MAGAZINE — app.js (REWRITTEN IN FULL)
   - Keeps your current behavior
   - ✅ Byline color override (#d2a100)
   - ✅ Robust Lightbox (no layout “gap”, scroll-lock, SPA-safe)
   - ✅ Curated route transitions (prevents “flash” + reduces “blank on back”)
   - ✅ Curated ledger click scroll (no anchor snap)
   - ✅ Desktop ledger: scrollable + toggle stays at bottom WITH the scroll
   - ✅ FIX: Home logo / home route no longer “stuck on scroll”
     (removes broken __suppressNextHashChange flow + adds safe go())
========================================================= */

console.log("app.js loaded ✅");
console.log("[ticker] code reached");

/* =========================================================
   0) ANALYTICS (Vercel Web Analytics)
========================================================= */
function trackPageview() {
  const path = window.location.pathname + window.location.hash;
  window.va?.("pageview", { url: path });
}
window.addEventListener("load", trackPageview);
window.addEventListener("hashchange", trackPageview);

/* =========================================================
   1) IMPORTS
========================================================= */
import { navItems, cards } from "./data.js";
import { loadPage, setPath } from "./router.js";

/* =========================================================
   2) DOM REFS
========================================================= */
const app = document.getElementById("app");

const sideRail = document.getElementById("side-rail");
const sideRailMobile = document.getElementById("side-rail-mobile");

const drawer = document.getElementById("mobile-drawer");
const menuBtn = document.getElementById("menu-button");
const drawerBackdrop = document.getElementById("drawer-backdrop");

/* =========================================================
   3) RESPONSIVE HELPERS
========================================================= */
const DESKTOP_BREAKPOINT = 900;

function isDesktop() {
  return window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches;
}
function isMobile() {
  return window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`).matches;
}

/* =========================================================
   4) THP NAMESPACE (ONE TIME)
========================================================= */
window.THP = window.THP || {};
window.THP.setPath = setPath;

/* =========================================================
   4A) GLOBAL STYLE INJECTOR (ONE TIME)
========================================================= */
function addGlobalStyleOnce(id, cssText) {
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}

/* =========================================================
   4B) ✅ BYLINE COLOR (ALL ARTICLES)
========================================================= */
function initBylineColorOnce() {
  addGlobalStyleOnce(
    "thp-byline-color",
    `
/* Article byline color override */
.is-article .article-byline,
.is-article .byline,
.is-article .article-meta,
.is-article .article-subtitle,
.is-article .prose .byline {
  color: #d2a100 !important;
}
`.trim()
  );
}
initBylineColorOnce();

/* =========================================================
   4C) ✅ ROUTE TRANSITION SYSTEM (SINGLE SOURCE OF TRUTH)
========================================================= */
function beginRouteTransition() {
  document.body.classList.add("is-transitioning");
}
function endRouteTransition() {
  requestAnimationFrame(() => {
    document.body.classList.remove("is-transitioning");
  });
}
function raf() {
  return new Promise((r) => requestAnimationFrame(r));
}

async function withRouteTransition(fn) {
  if (document.documentElement.dataset.routeTransitioning === "1") return;
  document.documentElement.dataset.routeTransitioning = "1";

  beginRouteTransition();
  await raf(); // let fade-out apply

  try {
    await fn();
  } finally {
    // allow paint before fade-in
    await raf();
    await raf();
    endRouteTransition();

    setTimeout(() => {
      document.documentElement.dataset.routeTransitioning = "0";
    }, 60);
  }
}

/* =========================================================
   4D) ✅ ROUTE HELPERS (SAFE, NO "STUCK ON SCROLL")
========================================================= */
function setHashQuietly(nextHash) {
  // avoids default browser anchor jump + does NOT trigger hashchange
  history.replaceState(null, "", `#${nextHash}`);
}

async function go(nextHash) {
  // curated navigation: transition + quiet hash + render
  await withRouteTransition(async () => {
    setHashQuietly(nextHash);
    await render();
  });
}

/* =========================================================
   4E) ✅ ENTER + HOME CLICK CURATION (OPTIONAL BUT NICE)
   - Enter button fades into /scroll instead of abrupt jump.
   - Home logo/link reliably returns to /home.
   - Only intercepts the specific hashes.
========================================================= */
function bindCuratedNavOnce() {
  if (document.documentElement.dataset.curatedNavBound === "1") return;
  document.documentElement.dataset.curatedNavBound = "1";

  document.addEventListener("click", async (e) => {
    // ENTER -> /scroll
    const enter =
      e.target.closest('[data-enter]') ||
      e.target.closest(".enter-btn") ||
      e.target.closest("#enterBtn") ||
      e.target.closest('a[href="#/scroll"]') ||
      e.target.closest('a[href="#/scroll#letter"]');

    if (enter) {
      // only intercept when leaving home (keeps everything else normal)
      if (document.body.classList.contains("is-home")) {
        e.preventDefault();
        await go("/scroll");
      }
      return;
    }

    // HOME -> /home (logo, button, etc.)
    const home =
      e.target.closest('a[href="#/home"]') ||
      e.target.closest('[data-home]') ||
      e.target.closest(".home-link");

    if (home) {
      e.preventDefault();
      await go("/home");
      return;
    }
  });
}
bindCuratedNavOnce();

/* =========================================================
   5) LEDGER / SIDE RAIL
========================================================= */

/* ---------- 5A) Render rail (desktop + mobile) ---------- */
function renderRail(target) {
  if (!target) return;

  const isMobileRail =
    target.id === "side-rail-mobile" ||
    target.closest("#mobile-drawer") ||
    target.closest(".drawer");

  const drawerLogo = `
    <a class="drawer-logo-link" target="_blank" href="https://www.healingprojectsound.org/" aria-label="Back to home">
      <img
        class="drawer-logo-img"
        src="./assets/logo/HP_logo_circle_bl.png"
        alt="The Healing Project"
        loading="eager"
        data-no-lightbox
      />
    </a>
  `;

  const railLinks = `
    <div class="rail-card">
      ${navItems
        .map(
          (i) => `
          <a class="rail-link" href="#${i.path}">
            <div class="rail-roman">${i.roman}</div>
            <div class="rail-text">
              <div class="rail-label">${i.label}</div>
              ${i.byline ? `<p class="rail-byline">${i.byline}</p>` : ""}
            </div>
          </a>
        `
        )
        .join("")}
    </div>
  `;

  target.innerHTML = `
    ${isMobileRail ? drawerLogo : ""}
    ${railLinks}
  `;
}

/* ---------- 5B) Desktop ledger toggle (JS-rendered) ---------- */
function syncRailToggleUI(btn) {
  if (!btn) return;
  const collapsed = document.body.classList.contains("rail-collapsed");
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.textContent = collapsed ? "Show ledger" : "Hide ledger";
}

/**
 * To make the toggle scroll WITH the ledger (and sit under the last item),
 * it must be inside the scroll container.
 */
function pinRailToggleToBottom() {
  const railCard = document.querySelector("#side-rail .rail-card");
  const btn = document.querySelector("#side-rail .rail-toggle");
  if (!railCard || !btn) return;
  railCard.appendChild(btn);
}

function ensureRailToggleButton() {
  // Desktop-only
  if (!isDesktop()) {
    document.querySelector("#side-rail .rail-toggle")?.remove();
    return;
  }

  if (!sideRail) return;

  const railCard = sideRail.querySelector(".rail-card");
  if (!railCard) return;

  let btn = railCard.querySelector(".rail-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rail-toggle";
    btn.setAttribute("aria-controls", "side-rail");
    railCard.appendChild(btn);
  }

  syncRailToggleUI(btn);
  pinRailToggleToBottom();
}

/* =========================================================
   6) MOBILE DRAWER (scroll-lock safe)
========================================================= */
let scrollYBeforeDrawer = 0;

function openDrawer() {
  scrollYBeforeDrawer = window.scrollY || 0;
  drawer?.classList.add("open");
  drawerBackdrop?.classList.add("open");
  document.documentElement.classList.add("drawer-open");
  document.body.classList.add("drawer-open");
  document.body.style.top = `-${scrollYBeforeDrawer}px`;
}

function closeDrawer() {
  drawer?.classList.remove("open");
  drawerBackdrop?.classList.remove("open");
  document.documentElement.classList.remove("drawer-open");
  document.body.classList.remove("drawer-open");
  const top = document.body.style.top;
  document.body.style.top = "";
  window.scrollTo(0, top ? -parseInt(top, 10) : scrollYBeforeDrawer);
}

function isDrawerOpen() {
  return drawer?.classList.contains("open");
}

/* Bind drawer controls */
menuBtn?.addEventListener("click", () => {
  if (isDrawerOpen()) closeDrawer();
  else openDrawer();
});
drawerBackdrop?.addEventListener("click", closeDrawer);

sideRailMobile?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) closeDrawer();
});

/* =========================================================
   7) LEDGER INTERACTION + SCROLL CURATION
========================================================= */

/* ---------- 7A) Toggle binding (delegated; binds once) ---------- */
function bindRailToggleOnce() {
  if (document.documentElement.dataset.railToggleBound === "1") return;
  document.documentElement.dataset.railToggleBound = "1";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".rail-toggle");
    if (!btn) return;

    document.body.classList.toggle("rail-collapsed");
    syncRailToggleUI(btn);
    pinRailToggleToBottom();
  });
}

/* ---------- 7B) Active ledger highlight ---------- */
function setActiveLedger(sectionId) {
  if (!sectionId) return;

  const links = document.querySelectorAll(".rail-link");
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const isMatch = href === `#/scroll#${sectionId}`;
    a.classList.toggle("is-active", isMatch);
  });
}

/* ---------- 7C) Anti-flicker dwell tuning (slower, curated) ---------- */
const LEDGER_SCROLL_DELAY_MS = 260;
const LEDGER_DWELL_MS = 320;

let ledgerTimer = null;
let lastLedgerId = null;
let pendingLedgerId = null;
let pendingSince = 0;
let scrollLockUntil = 0;

function nowMs() {
  return window.performance && performance.now ? performance.now() : Date.now();
}

function scheduleLedgerActive(sectionId) {
  if (!sectionId) return;
  if (!window.location.hash.startsWith("#/scroll")) return;
  if (nowMs() < scrollLockUntil) return;

  if (sectionId === lastLedgerId) {
    pendingLedgerId = null;
    return;
  }

  const t = nowMs();

  if (pendingLedgerId !== sectionId) {
    pendingLedgerId = sectionId;
    pendingSince = t;
    return;
  }

  if (t - pendingSince < LEDGER_DWELL_MS) return;

  clearTimeout(ledgerTimer);
  ledgerTimer = setTimeout(() => {
    setActiveLedger(sectionId);
    lastLedgerId = sectionId;
    pendingLedgerId = null;
  }, LEDGER_SCROLL_DELAY_MS);
}

function setLedgerActiveImmediate(sectionId) {
  clearTimeout(ledgerTimer);
  pendingLedgerId = null;

  if (!sectionId) return;
  setActiveLedger(sectionId);
  lastLedgerId = sectionId;
}

/* ---------- 7D) Curated smooth scroll (prevents anchor “snap”) ---------- */
function smoothScrollToId(id, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  const cssHeader = getComputedStyle(document.documentElement)
    .getPropertyValue("--home-bar-height")
    .trim();
  const headerH = parseInt(cssHeader, 10) || 0;

  const gap = opts.offset ?? 18;
  const offset = headerH + gap;

  const y = el.getBoundingClientRect().top + window.scrollY - offset;

  scrollLockUntil = nowMs() + (opts.lockMs ?? 1400);
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

/* ---------- 7E) Ledger click binding (delegated; binds once) ---------- */
function bindLedgerClickActiveOnce() {
  if (document.documentElement.dataset.ledgerClickBound === "1") return;
  document.documentElement.dataset.ledgerClickBound = "1";

  document.addEventListener("click", (e) => {
    const a = e.target.closest(".rail-link");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    const m = href.match(/^#\/scroll#(.+)$/);
    if (!m || !m[1]) return;

    e.preventDefault();

    const id = m[1];
    setLedgerActiveImmediate(id);

    const onScrollRoute = window.location.hash.startsWith("#/scroll");

    // If we’re not on /scroll, do a quiet hash update + render with transition
    if (!onScrollRoute) {
      setHashQuietly(`/scroll#${id}`);

      withRouteTransition(async () => {
        await render();
      });

      requestAnimationFrame(() => smoothScrollToId(id, { offset: 18, lockMs: 1500 }));
      if (isDrawerOpen()) closeDrawer();
      return;
    }

    // Already on /scroll
    setHashQuietly(`/scroll#${id}`);
    smoothScrollToId(id, { offset: 18, lockMs: 1500 });
    if (isDrawerOpen()) closeDrawer();
  });
}

/* =========================================================
   8) SECTION FADE + LEDGER SCROLL SYNC
========================================================= */
let updateScrollStateFn = null;
let ledgerRAF = null;

function bindLedgerScrollSyncOnce() {
  if (document.documentElement.dataset.ledgerScrollSyncBound === "1") return;
  document.documentElement.dataset.ledgerScrollSyncBound = "1";

  window.addEventListener(
    "scroll",
    () => {
      if (!window.location.hash.startsWith("#/scroll")) return;
      if (!updateScrollStateFn) return;

      if (ledgerRAF) return;
      ledgerRAF = requestAnimationFrame(() => {
        ledgerRAF = null;
        updateScrollStateFn();
      });
    },
    { passive: true }
  );
}

function setupSectionFade(root = document) {
  if (!window.location.hash.startsWith("#/scroll")) {
    updateScrollStateFn = null;
    return;
  }

  const sections = Array.from(root.querySelectorAll(".scroll-section"));
  if (!sections.length) {
    updateScrollStateFn = null;
    return;
  }

  sections.forEach((section) => {
    if (section.querySelector(".fade-sentinel")) return;
    const sentinel = document.createElement("span");
    sentinel.className = "fade-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    section.prepend(sentinel);
  });

  sections.forEach((s, idx) => s.classList.toggle("is-visible", idx === 0));
  let currentActiveId = lastLedgerId || sections[0]?.id || null;

  function visibleArea(rect, vh, vw) {
    const top = Math.max(0, rect.top);
    const bottom = Math.min(vh, rect.bottom);
    const left = Math.max(0, rect.left);
    const right = Math.min(vw, rect.right);

    const w = Math.max(0, right - left);
    const h = Math.max(0, bottom - top);
    return w * h;
  }

  function computeActiveSectionId() {
    if (window.scrollY <= 6) return sections[0]?.id || null;

    const vh = window.innerHeight || 0;
    const vw = window.innerWidth || 0;
    if (!vh || !vw) return currentActiveId;

    let bestId = currentActiveId;
    let bestArea = -1;
    let currentArea = -1;

    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      const area = visibleArea(rect, vh, vw);

      if (s.id === currentActiveId) currentArea = area;

      if (area > bestArea) {
        bestArea = area;
        bestId = s.id || bestId;
      }
    }

    const SWITCH_RATIO = 1.45;
    if (currentActiveId && bestId && bestId !== currentActiveId) {
      if (currentArea >= 0 && bestArea < currentArea * SWITCH_RATIO) {
        return currentActiveId;
      }
    }

    currentActiveId = bestId;
    return bestId;
  }

  updateScrollStateFn = function updateScrollState() {
    if (!window.location.hash.startsWith("#/scroll")) return;

    const id = computeActiveSectionId();
    if (!id) return;

    const activeSection = sections.find((s) => s.id === id);
    if (activeSection) {
      sections.forEach((s) => s.classList.toggle("is-visible", s === activeSection));
    }

    scheduleLedgerActive(id);
  };

  bindLedgerScrollSyncOnce();

  const initialId = computeActiveSectionId();
  if (initialId) setLedgerActiveImmediate(initialId);
  updateScrollStateFn();
}

/* =========================================================
   9) CARDS GRID RENDERER
========================================================= */
window.THP.renderCardsGrid = function renderCardsGrid() {
  const grids = document.querySelectorAll(".cards-grid");
  if (!grids.length) return;

  grids.forEach((gridEl) => {
    const section = gridEl.dataset.section;
    const filtered = section ? cards.filter((c) => c.section === section) : cards;

    gridEl.innerHTML = filtered
      .map((c) => {
        const span = c.span2 ? "span-2" : "";
        return `
          <a
            class="card ${span}"
            href="#${c.path}"
            style="background:${c.color}"
            ${c.scrollId ? `id="card-${c.scrollId}"` : ""}>
            <span class="card-dot"></span>
            <h3>${c.title}</h3>
            <p>${c.byline}</p>
          </a>
        `;
      })
      .join("");
  });
};

/* =========================================================
   10) PARTIALS INJECTOR
========================================================= */
window.THP.injectPartials =
  window.THP.injectPartials ||
  async function injectPartials(root = document) {
    const slots = root.querySelectorAll("[data-include]");
    if (!slots.length) return;

    await Promise.all(
      Array.from(slots).map(async (el) => {
        const url = el.getAttribute("data-include");
        if (!url) return;

        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          el.innerHTML = await res.text();
        } catch (e) {
          console.error("Partial failed:", url, e);
          el.innerHTML = `<p class="prose" style="opacity:.7;">Content failed to load.</p>`;
        }
      })
    );
  };

/* =========================================================
   11) ✅ LIGHTBOX (NO GAP / SCROLL LOCK / SPA-SAFE)
========================================================= */
let __lightboxScrollY = 0;

function ensureLightboxShell() {
  let lb = document.getElementById("lightbox");
  let img = document.getElementById("lightboxImg");

  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.className = "lightbox";
    lb.setAttribute("aria-hidden", "true");
    // document.body.appendChild(lb);
    document.documentElement.appendChild(lb);

  }

  if (!img) {
    img = document.createElement("img");
    img.id = "lightboxImg";
    img.className = "lightbox-img";
    img.alt = "";
    lb.appendChild(img);
  }

  // Safety net: never creates layout space
  lb.style.position = "fixed";
  lb.style.inset = "0";
  lb.style.display = "none";
  lb.style.alignItems = "center";
  lb.style.justifyContent = "center";
  lb.style.zIndex = "9999";
  lb.style.padding = "24px";
  lb.style.background = "rgba(0,0,0,0.55)";

  img.style.maxWidth = "min(1100px, 92vw)";
  img.style.maxHeight = "88vh";
  img.style.width = "auto";
  img.style.height = "auto";
  img.style.display = "block";
  img.style.borderRadius = "12px";
  img.style.boxShadow = "0 20px 60px rgba(0,0,0,0.35)";

  return { lb, img };
}

function lockScrollForLightbox() {
  __lightboxScrollY = window.scrollY || 0;

  // lock at the ROOT, not body-fixed
  document.documentElement.classList.add("lightbox-open");
  document.body.classList.add("lightbox-open");

  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.height = "100%";

  // optional: prevents layout shift when scrollbar disappears
  const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarW > 0) document.documentElement.style.paddingRight = `${scrollbarW}px`;
}

function unlockScrollForLightbox() {
  document.documentElement.classList.remove("lightbox-open");
  document.body.classList.remove("lightbox-open");

  document.documentElement.style.overflow = "";
  document.documentElement.style.height = "";
  document.documentElement.style.paddingRight = "";

  window.scrollTo(0, __lightboxScrollY || 0);
}

function openLightbox(src, alt = "") {
  if (!src) return;

  const { lb, img } = ensureLightboxShell();

  // ✅ FORCE it to be top-level every time
  if (lb.parentElement !== document.body) {
    document.body.appendChild(lb);
  }

  // ✅ Temporarily neutralize transition transforms that “trap” fixed overlays
  const appEl = document.getElementById("app");
  if (appEl) {
    appEl.dataset.prevTransform = appEl.style.transform || "";
    appEl.dataset.prevFilter = appEl.style.filter || "";
    appEl.style.transform = "none";
    appEl.style.filter = "none";
  }

  img.src = src;
  img.alt = alt || "";

  // ✅ Force viewport sizing
  lb.style.position = "fixed";
  lb.style.left = "0";
  lb.style.top = "0";
  lb.style.right = "0";
  lb.style.bottom = "0";
  lb.style.width = "100vw";
  lb.style.height = "100vh";
  lb.style.margin = "0";
  lb.style.zIndex = "2147483647"; // max-ish
  lb.style.display = "flex";

  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");

  lockScrollForLightbox();
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  if (!lb) return;

  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  lb.style.display = "none";

  if (img) img.src = "";

  // ✅ Restore transition styles
  const appEl = document.getElementById("app");
  if (appEl) {
    appEl.style.transform = appEl.dataset.prevTransform || "";
    appEl.style.filter = appEl.dataset.prevFilter || "";
    delete appEl.dataset.prevTransform;
    delete appEl.dataset.prevFilter;
  }

  unlockScrollForLightbox();
}

let __lightboxJustOpenedAt = 0;
const LIGHTBOX_CLOSE_GUARD_MS = 180;

function bindLightboxOnce() {
  if (document.documentElement.dataset.lightboxBound === "1") return;
  document.documentElement.dataset.lightboxBound = "1";

  document.addEventListener("click", (e) => {
    const lb = e.target.closest("#lightbox");
    if (!lb) return;

    const clickedImg = e.target.closest("#lightboxImg");
    if (!clickedImg) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const lb = document.getElementById("lightbox");
    if (lb?.classList.contains("is-open")) closeLightbox();
  });
}

function bindLightboxForRoot(root = document) {
  if (!root) return;
  bindLightboxOnce();
  ensureLightboxShell();

  if (root.dataset.lightboxDelegate === "1") return;
  root.dataset.lightboxDelegate = "1";

  root.addEventListener("click", (e) => {
    if (e.target.closest("#side-rail")) return;
    if (e.target.closest("#mobile-drawer")) return;
    if (e.target.closest("#ticker")) return;

    const img = e.target.closest("img");
    if (!img) return;
    if (img.hasAttribute("data-no-lightbox")) return;
    if (img.id === "lightboxImg") return;

    const src =
      img.getAttribute("data-full") ||
      img.currentSrc ||
      img.getAttribute("src") ||
      "";

    if (!src) return;

    e.preventDefault();
    openLightbox(src, img.alt || "");
  });
}

/* =========================================================
   12) ROUTER RENDER (MAIN APP MOUNT)
========================================================= */
async function render() {
  if (!app) return;

  const raw = window.location.hash.replace(/^#/, "");
  let [path, anchor] = raw.split("#");
  if (!path || path === "/") path = "/home";

  document.body.classList.toggle("is-home", path === "/home");
  document.body.classList.toggle("is-scroll", path === "/scroll");
  document.body.classList.toggle("is-article", path.startsWith("/article/"));

  // Home lock (avoid html overflow edits — reduces “blank” flashes)
  if (path === "/home") {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  // Always close overlays on route render
  closeDrawer();
  closeLightbox();

  // fetch HTML BEFORE swapping DOM
  let html = "";
  try {
    html = await loadPage(path);
  } catch (err) {
    console.error("loadPage failed:", err);
    app.innerHTML = `
      <div class="rules">
        <h1 class="article-title">Page not found</h1>
        <p class="prose">
          Try going back <a class="backpill" href="#/home">← Home</a>
        </p>
      </div>
    `;
    return;
  }

  console.log("RENDER:", window.location.hash, performance.now());

  // Swap DOM only once we have the HTML
  app.innerHTML = html;

  if (path === "/scroll") {
    try {
      await window.THP.injectPartials(app);
    } catch (e) {
      console.error("injectPartials failed:", e);
    }
  }

  try {
    window.THP.renderCardsGrid();
  } catch (e) {
    console.error("renderCardsGrid failed:", e);
  }

  if (path === "/scroll") {
    requestAnimationFrame(() => setupSectionFade(app));
  } else {
    updateScrollStateFn = null;
  }

  if (path === "/home") {
    document.body.classList.remove("rail-collapsed");
  }

  // Keep rails/toggle sane after renders
  renderRail(sideRail);
  ensureRailToggleButton();
  renderRail(sideRailMobile);

  // Lightbox binds to freshly rendered content
  bindLightboxForRoot(app);

  // Scroll behavior
  requestAnimationFrame(() => {
    if (path === "/scroll" && anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        scrollLockUntil = nowMs() + 900;
        setLedgerActiveImmediate(anchor);
        smoothScrollToId(anchor, { offset: 18, lockMs: 1500 });
        return;
      }
    }
    window.scrollTo(0, 0);
  });

  // WDW carousel, if present
  try {
    mountWDWCarousel();
  } catch (e) {
    console.error("mountWDWCarousel failed:", e);
  }
}

/* Route handler WITH transition */
async function renderWithTransition() {
  await withRouteTransition(render);
}

/* Bind route changes (NORMAL — no suppression) */
window.addEventListener("hashchange", renderWithTransition);
renderWithTransition();

/* Keep UI sane on resize */
window.addEventListener("resize", () => {
  renderRail(sideRail);
  ensureRailToggleButton();
  renderRail(sideRailMobile);

  try {
    if (updateScrollStateFn) updateScrollStateFn();
    else setupSectionFade(app);
  } catch (_) {}
});

/* Close overlays on hard nav events */
window.addEventListener("pageshow", () => {
  closeDrawer();
  closeLightbox();
});

/* =========================================================
   13) ONE-TIME INITIAL BINDINGS + INITIAL RAIL RENDER
========================================================= */
bindRailToggleOnce();
bindLedgerClickActiveOnce();
renderRail(sideRail);
ensureRailToggleButton();
renderRail(sideRailMobile);

/* =========================================================
   14) FOOTER TICKER ROTATION (DYNAMIC SPEED)
========================================================= */
const quotes = [
  "I realized it's not a one-size-fits-all here. You have to be able to adapt in your caregiving, because the method one day might not be the method the next. —Pamela Smart",
  "I find that my cup is filled when I’m giving, and my healing happens when I'm helping with somebody else's healing. —Pamela Smart",
  "I don't want a revolution if I can't dance in it. —Libertad Guerra",
  "But it was a bunch of new radicals in the South Bronx who brought us here. —Walter Bosque",
  "A eso le llamamos el poder popular: cuando la gente se reconoce como dueña de su destino, no como víctima. —Nieves Ayress",
  "My mother wanted a magnolia tree. She fell in love with their large flowers. This was until she saw the mess they make when their petals fall, covering the surrounding area in mold. —Meagan Betances",
  "The truth is, the way stories are gathered in this country often resembles a raid. —Mahogany L. Browne",
  "But we cannot be merely oppositional; if all we do is speak back to the wound, we risk shaping our entire conversation around the injury and becoming fluent only in describing what hurts us. —Mahogany L. Browne",
  "We are more than decoration; we are infrastructure. —Mahogany L. Browne",
  "We honor the wisdom carried by those whose lives have too often been dismissed, and the trust it takes to place that wisdom in the hands of others. —Sue Ariza",
  "For the courage to dream together of futures shaped by care rather than cages, by belonging rather than banishment, by systems that nourish our inherent worth instead of managing loss. —Sue Ariza",
  "Along the way, we learn to cup beauty and grief in the palms of our hands. —Sue Ariza",
];

let tickerStarted = false;
let anim = null;
let index = 0;
let initAttempted = false;

function initTickerOnce() {
  if (tickerStarted) return;

  const ticker = document.getElementById("ticker");
  const textEl = document.getElementById("tickerText");

  if (!ticker || !textEl) {
    if (!initAttempted) {
      initAttempted = true;
      setTimeout(initTickerOnce, 150);
      setTimeout(initTickerOnce, 500);
    }
    return;
  }

  if (!ticker.dataset.pauseBound) {
    ticker.dataset.pauseBound = "1";
    ticker.addEventListener("mouseenter", () => anim && anim.pause());
    ticker.addEventListener("mouseleave", () => anim && anim.play());
  }

  tickerStarted = true;

  function runQuote(q) {
    if (!tickerStarted) return;
    if (anim) anim.cancel();

    textEl.style.display = "inline-block";
    textEl.style.whiteSpace = "nowrap";
    textEl.textContent = q;

    requestAnimationFrame(() => {
      const tickerW = ticker.clientWidth;
      const textW = textEl.scrollWidth;
      if (!tickerW || !textW) return requestAnimationFrame(() => runQuote(q));

      const startX = tickerW;
      const endX = -textW;

      const speed = 90;
      const distance = tickerW + textW;
      const duration = Math.max(6000, (distance / speed) * 1000);

      anim = textEl.animate(
        [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
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

window.addEventListener("DOMContentLoaded", initTickerOnce);

window.addEventListener("resize", () => {
  if (!tickerStarted) return;
  const textEl = document.getElementById("tickerText");
  if (!textEl) return;
  if (anim) anim.cancel();
  tickerStarted = false;
  initTickerOnce();
});

/* =========================================================
   15) WE DESERVE WELLNESS: REFLECTION CAROUSEL
========================================================= */
const WDW_REFLECTIONS = [
  { author: "Member 1", text: `We need to be heard in schools. We need to learn about our culture. We need more staff that understand us. We need safety, not security. We need community.` },
  { author: "Member 2", text: `Many of us have no one to talk to or express our feelings to. A lot of kids struggle to maintain their mental health because of the lack of social workers and support staff in schools. Every student should have access to a person they feel comfortable talking to and expressing themselves with.` },
  { author: "Member 3", text: `Students are constantly helping each other, learning and protecting each other’s feelings, but they are always painted as disruptive and disrespectful. Black and Brown students face so many challenges that go beyond the classroom. We need people who actually see us, listen to us and advocate for us; not just academically, but mentally and emotionally.` },
  { author: "Member 4", text: `We are the generation that spent important years of our lives in the COVID-19 lockdown, then released back into the world without the tools to cope. As teenagers we see what's going on in the world, from the climate disaster to gun violence in our own neighborhoods.` },
  { author: "Member 5", text: `We deserve safe spaces, real mentorship, and opportunities that reflect our full potential. We need support systems and people who understand the life of a Black child in this world. We need solutions, not suspensions. We need to be set up for success.` },
  { author: "Member 6", text: `The truth is that law and compassion have failed us. We are stones placed in a graveyard of broken hearts and empty promises. We need opportunities and trust.` },
  { author: "Member 7", text: `It is time that the City Council invests in the education budget to fund more school counselors. It is time to invest in our wellness. We have waited long enough.` },
  { author: "Member 8", text: `My community and neighbors are struggling with confidence, mental health issues, suicide, substance use, overdose, inflation, gentrification, and police brutality. I see that this world still has a bias towards my people. I see discrimination, Black fathers being painted as deadbeats. I don’t see the police having a good impact. My generation is fighting to survive without enough people to look up to or lift them up. We’re still crying out for accessible resources, housing, and job opportunities. For racism to end.` },
  { author: "Member 9", text: `We need to think globally to understand our struggle. To see that people in other places go through similar issues. I see people living in famine, constant problems on the news, that our taxes are not being used to help us, but towards bombings and killings that we see on social media. Until Palestine is free, for example, America is not going to succeed. There will be no feeling of peace.` },
  { author: "Member 10", text: `When we see how others fight back and support each other, it gives us ideas, hope, and strength to fight back too. We learn that we are not alone and that together we are stronger. We understand where we can use our peace to start solving problems. We are strong and we will rise. We will transfer the hate that they have given us and use it to unify the people. There can be no true community until all of us are free.` },
];

let wdwIndex = 0;

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mountWDWCarousel() {
  const bodyEl = document.getElementById("wdwBody");
  const metaEl = document.getElementById("wdwMeta");
  const countEl = document.getElementById("wdwCount");
  const prevBtn = document.getElementById("wdwPrev");
  const nextBtn = document.getElementById("wdwNext");

  if (!bodyEl || !countEl || !prevBtn || !nextBtn) return;

  if (bodyEl.dataset.bound === "1") {
    renderWDW();
    return;
  }
  bodyEl.dataset.bound = "1";

  function renderWDW() {
    const item = WDW_REFLECTIONS[wdwIndex];
    if (!item) return;

    if (metaEl) metaEl.textContent = "";

    const paragraphs = String(item.text || "")
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHTML(p)}</p>`)
      .join("");

    bodyEl.innerHTML = `${paragraphs}`;
    countEl.textContent = `${wdwIndex + 1} / ${WDW_REFLECTIONS.length}`;

    prevBtn.disabled = WDW_REFLECTIONS.length <= 1;
    nextBtn.disabled = WDW_REFLECTIONS.length <= 1;
  }

  function go(delta) {
    const n = WDW_REFLECTIONS.length;
    if (!n) return;
    wdwIndex = (wdwIndex + delta + n) % n;
    renderWDW();
  }

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  if (!document.documentElement.dataset.wdwKeysBound) {
    document.documentElement.dataset.wdwKeysBound = "1";
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      const isTyping =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (isTyping) return;

      const onPage = document.getElementById("wdwBody");
      if (!onPage) return;

      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });
  }

  renderWDW();
}



