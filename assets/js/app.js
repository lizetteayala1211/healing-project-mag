/* =========================================================
   THE HEALING PROJECT MAGAZINE — app.js (CLEAN + LABELED)
   - Desktop-only ledger toggle button (JS-rendered)
   - Mobile drawer behavior preserved
   - Route-safe partial injection + cards render
   - TRUE opacity fade between scroll sections (works for long sections)
   - ✅ Ledger highlights current scroll section (.rail-link.is-active)
   - ✅ Intentional (slight) delay on scroll-driven ledger changes
   - ✅ Fix: “Letter” reliably re-activates when you scroll back to top
   - ✅ Fix: boundary flicker (single update source + dwell/hysteresis + click lock)
========================================================= */

console.log("app.js loaded ✅");
console.log("[ticker] code reached");

/* =========================
   1) IMPORTS
========================= */
import { navItems, cards } from "./data.js";
import { loadPage, setPath } from "./router.js";

/* =========================
   2) DOM REFS
========================= */
const app = document.getElementById("app");

const sideRail = document.getElementById("side-rail");
const sideRailMobile = document.getElementById("side-rail-mobile");

const drawer = document.getElementById("mobile-drawer");
const menuBtn = document.getElementById("menu-button");
const drawerBackdrop = document.getElementById("drawer-backdrop");

/* =========================
   3) RESPONSIVE HELPERS
========================= */
function isDesktop() {
  return window.matchMedia("(min-width: 1024px)").matches;
}
function isMobile() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

/* =========================
   4) THP NAMESPACE (ONE TIME)
========================= */
window.THP = window.THP || {};
window.THP.setPath = setPath;

/* =========================================================
   5) LEDGER / SIDE RAIL
========================================================= */

/* ---------- 5A) Render rail (desktop + mobile) ---------- */
function renderRail(target) {
  if (!target) return;

  const showToggleBtn = isDesktop(); // ✅ only on desktop

  target.innerHTML = `
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

      ${
        showToggleBtn
          ? `
        <button class="rail-toggle" type="button" aria-expanded="true">
          Hide ledger
        </button>
      `
          : ""
      }
    </div>
  `;
}

/* ---------- 5B) Bind rail toggle (delegated; binds once) ---------- */
function bindRailToggleOnce() {
  if (document.documentElement.dataset.railToggleBound === "1") return;
  document.documentElement.dataset.railToggleBound = "1";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".rail-toggle");
    if (!btn) return;

    document.body.classList.toggle("rail-collapsed");
    const collapsed = document.body.classList.contains("rail-collapsed");

    btn.setAttribute("aria-expanded", String(!collapsed));
    btn.textContent = collapsed ? "Show ledger" : "Hide ledger";
  });
}

/* ---------- 5C) Active ledger highlight ---------- */
function setActiveLedger(sectionId) {
  if (!sectionId) return;
  const links = document.querySelectorAll(".rail-link");
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    // Your ledger hrefs are like "#/scroll#closing-prayer"
    const isMatch = href.includes(`/scroll#${sectionId}`);
    a.classList.toggle("is-active", isMatch);
  });
}

/* ---------- 5D) Intentional delay + dwell (anti-flicker) ---------- */
const LEDGER_SCROLL_DELAY_MS = 140; // the "intentional" feel (120–220)
const LEDGER_DWELL_MS = 160;        // must remain winner before scheduling (120–240)

let ledgerTimer = null;
let lastLedgerId = null;

// new: "candidate" tracking to prevent boundary ping-pong
let pendingLedgerId = null;
let pendingSince = 0;

// new: lock scroll-driven changes briefly after click / smooth scroll
let scrollLockUntil = 0;

function nowMs() {
  return (window.performance && performance.now) ? performance.now() : Date.now();
}

function scheduleLedgerActive(sectionId) {
  if (!sectionId) return;

  // If we're in a click-lock window, do nothing
  if (nowMs() < scrollLockUntil) return;

  // Already active? clear pending and exit
  if (sectionId === lastLedgerId) {
    pendingLedgerId = null;
    return;
  }

  const t = nowMs();

  // If candidate changed, start dwell timer (don’t schedule yet)
  if (pendingLedgerId !== sectionId) {
    pendingLedgerId = sectionId;
    pendingSince = t;
    return;
  }

  // Candidate is the same — has it "stayed winning" long enough?
  if (t - pendingSince < LEDGER_DWELL_MS) return;

  // Now schedule the actual visual change (with your intentional delay)
  clearTimeout(ledgerTimer);
  ledgerTimer = setTimeout(() => {
    setActiveLedger(sectionId);
    lastLedgerId = sectionId;
    pendingLedgerId = null;
  }, LEDGER_SCROLL_DELAY_MS);
}

// Clicks should feel immediate (no delay)
function setLedgerActiveImmediate(sectionId) {
  clearTimeout(ledgerTimer);
  pendingLedgerId = null;

  if (!sectionId) return;
  setActiveLedger(sectionId);
  lastLedgerId = sectionId;
}

/* ---------- 5E) Ledger click → immediate active + lock scroll updates ---------- */
function bindLedgerClickActiveOnce() {
  if (document.documentElement.dataset.ledgerClickBound === "1") return;
  document.documentElement.dataset.ledgerClickBound = "1";

  document.addEventListener("click", (e) => {
    const a = e.target.closest(".rail-link");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    const m = href.match(/^#\/scroll#(.+)$/);
    if (m && m[1]) {
      // lock scroll-driven highlight briefly while smooth scrolling happens
      scrollLockUntil = nowMs() + 650;
      setLedgerActiveImmediate(m[1]);
    }
  });
}

/* ---------- 5F) Initial mount ---------- */
bindRailToggleOnce();
bindLedgerClickActiveOnce();
renderRail(sideRail);
renderRail(sideRailMobile);

/* =========================================================
   6) MOBILE DRAWER
========================================================= */
menuBtn?.addEventListener("click", () => drawer?.classList.add("open"));
drawerBackdrop?.addEventListener("click", () => drawer?.classList.remove("open"));

// close drawer when clicking a nav link on mobile
sideRailMobile?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) drawer?.classList.remove("open");
});

/* =========================================================
   7) SECTION FADE (TRUE OPACITY FADE) + LEDGER SYNC
   - Single source of truth: scroll rAF loop
   - Largest visible area decides active section
   - Dwell + delay prevents boundary flicker
========================================================= */

// Global function used by scroll-sync (replaced on each setup)
let updateScrollStateFn = null;
let ledgerRAF = null;

function bindLedgerScrollSyncOnce() {
  if (document.documentElement.dataset.ledgerScrollSyncBound === "1") return;
  document.documentElement.dataset.ledgerScrollSyncBound = "1";

  window.addEventListener(
    "scroll",
    () => {
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
  const sections = Array.from(root.querySelectorAll(".scroll-section"));
  if (!sections.length) {
    updateScrollStateFn = null;
    return;
  }

  // Ensure each section has a sentinel (still useful for structure; not used for decision now)
  sections.forEach((section) => {
    if (section.querySelector(".fade-sentinel")) return;
    const sentinel = document.createElement("span");
    sentinel.className = "fade-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    section.prepend(sentinel);
  });

  // Default: first section visible
  sections.forEach((s, idx) => s.classList.toggle("is-visible", idx === 0));

  // Persistent active id for hysteresis
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
    // Force the first section when you're basically at the top
    if (window.scrollY <= 6) return sections[0]?.id || null;

    const vh = window.innerHeight || 0;
    const vw = window.innerWidth || 0;
    if (!vh || !vw) return currentActiveId;

    // Find section with the largest visible area
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

    // Hysteresis: don’t switch unless the new winner is meaningfully larger
    const SWITCH_RATIO = 1.22; // stronger than 1.15 to kill boundary jitter
    if (currentActiveId && bestId && bestId !== currentActiveId) {
      if (currentArea >= 0 && bestArea < currentArea * SWITCH_RATIO) {
        return currentActiveId;
      }
    }

    currentActiveId = bestId;
    return bestId;
  }

  // One function that updates BOTH:
  // - fades (.is-visible)
  // - ledger highlight (with dwell + delay)
  updateScrollStateFn = function updateScrollState() {
    const id = computeActiveSectionId();
    if (!id) return;

    const activeSection = sections.find((s) => s.id === id);
    if (activeSection) {
      sections.forEach((s) => s.classList.toggle("is-visible", s === activeSection));
    }

    scheduleLedgerActive(id);
  };

  // Bind scroll sync once
  bindLedgerScrollSyncOnce();

  // Initial sync (immediate on load)
  const initialId = computeActiveSectionId();
  if (initialId) setLedgerActiveImmediate(initialId);
  updateScrollStateFn();
}

/* =========================================================
   8) CARDS GRID RENDERER
========================================================= */
window.THP.renderCardsGrid = function renderCardsGrid() {
  const grids = document.querySelectorAll(".cards-grid");
  if (!grids.length) return;

  grids.forEach((gridEl) => {
    const section = gridEl.dataset.section; // e.g. "community-board"
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
   9) PARTIALS INJECTOR
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
   10) ROUTER RENDER (MAIN APP MOUNT)
========================================================= */
async function render() {
  if (!app) return;

  // Supports:
  //   #/scroll
  //   #/scroll#community-board
  //   #/article/...
  const raw = window.location.hash.replace(/^#/, ""); // "/scroll#community-board"
  let [path, anchor] = raw.split("#"); // path="/scroll", anchor="community-board"
  if (!path || path === "/") path = "/home";

  try {
    const html = await loadPage(path);
    app.innerHTML = html;
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

  // ✅ Inject partials only on /scroll
  if (path === "/scroll") {
    try {
      await window.THP.injectPartials(app);
    } catch (e) {
      console.error("injectPartials failed:", e);
    }
  }

  // ✅ Render cards
  try {
    window.THP.renderCardsGrid();
  } catch (e) {
    console.error("renderCardsGrid failed:", e);
  }

  // ✅ Setup fades + ledger sync after DOM exists
  if (path === "/scroll") {
    requestAnimationFrame(() => setupSectionFade(app));
  } else {
    updateScrollStateFn = null;
  }

  // ✅ Scroll behavior
  requestAnimationFrame(() => {
    if (path === "/scroll" && anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        // lock scroll-driven highlight briefly while smooth scrolling happens
        scrollLockUntil = nowMs() + 650;

        setLedgerActiveImmediate(anchor);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  });

  // ✅ Mount reflections carousel safely
  try {
    mountWDWCarousel();
  } catch (e) {
    console.error("mountWDWCarousel failed:", e);
  }
}

window.addEventListener("hashchange", render);
render();

/* ---------- 10B) Re-render rails on breakpoint changes ---------- */
window.addEventListener("resize", () => {
  renderRail(sideRail);
  renderRail(sideRailMobile);

  // re-evaluate fades on resize (only if scroll page exists)
  try {
    if (updateScrollStateFn) updateScrollStateFn();
    else setupSectionFade(app);
  } catch (_) {}
});

/* =========================================================
   11) FOOTER TICKER ROTATION (DYNAMIC SPEED)
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

      const speed = 90; // px/sec
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
   12) WE DESERVE WELLNESS: REFLECTION CAROUSEL
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
