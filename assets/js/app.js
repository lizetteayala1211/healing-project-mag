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

  // ✅ Only loadPage() belongs in the main try/catch
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
    return; // stop here
  }

  // ✅ Anything below should NOT be able to break routing
  try {
    window.THP?.renderCardsGrid?.(path);
  } catch (e) {
    console.error("renderCardsGrid failed:", e);
  }

  // ✅ Mount reflections carousel safely (only runs if elements exist)
  try {
    mountWDWCarousel();
  } catch (e) {
    console.error("mountWDWCarousel failed:", e);
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

// Guard against multiple init attempts
let initAttempted = false;

function initTickerOnce() {
  if (tickerStarted) return;

  const ticker = document.getElementById("ticker");
  const textEl = document.getElementById("tickerText");

  if (!ticker || !textEl) {
    // footer might not be in DOM yet — allow a couple retries
    if (!initAttempted) {
      initAttempted = true;
      setTimeout(initTickerOnce, 150);
      setTimeout(initTickerOnce, 500);
    }
    return;
  }

  // Bind pause on hover ONCE
  if (!ticker.dataset.pauseBound) {
    ticker.dataset.pauseBound = "1";

    ticker.addEventListener("mouseenter", () => {
      if (anim) anim.pause();
    });

    ticker.addEventListener("mouseleave", () => {
      if (anim) anim.play();
    });
  }

  tickerStarted = true;

  function runQuote(q) {
    if (!tickerStarted) return;

    if (anim) anim.cancel();

    textEl.style.display = "inline-block";
    textEl.style.whiteSpace = "nowrap";
    textEl.textContent = q;

    requestAnimationFrame(() => {
      const tickerNow = document.getElementById("ticker");
      const textNow = document.getElementById("tickerText");
      if (!tickerNow || !textNow) {
        tickerStarted = false;
        return;
      }

      const tickerW = tickerNow.clientWidth;
      const textW = textNow.scrollWidth;

      if (!tickerW || !textW) {
        requestAnimationFrame(() => runQuote(q));
        return;
      }

      const startX = tickerW;
      const endX = -textW;

      const speed = 90; // px/sec
      const distance = tickerW + textW;
      const duration = Math.max(6000, (distance / speed) * 1000);

      anim = textNow.animate(
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

window.addEventListener("DOMContentLoaded", initTickerOnce);

window.addEventListener("resize", () => {
  if (!tickerStarted) return;
  const textEl = document.getElementById("tickerText");
  if (!textEl) return;

  if (anim) anim.cancel();
  tickerStarted = false;
  initTickerOnce();
});

// ===== We Deserve Wellness: reflection carousel =====

const WDW_REFLECTIONS = [
  {
    author: "Member 1",
    text: `We need to be heard in schools. We need to learn about our culture. We need more staff that understand us. We need safety, not security. We need community.`
  },
  {
    author: "Member 2",
    text: `Many of us have no one to talk to or express our feelings to. A lot of kids struggle to maintain their mental health because of the lack of social workers and support staff in schools. Every student should have access to a person they feel comfortable talking to and expressing themselves with.`
  },
  {
    author: "Member 3",
    text: `Students are constantly helping each other, learning and protecting each other’s feelings, but they are always painted as disruptive and disrespectful. Black and Brown students face so many challenges that go beyond the classroom. We need people who actually see us, listen to us and advocate for us; not just academically, but mentally and emotionally.`
  },
  { author: "Member 4", 
  text: `We are the generation that spent important years of our lives in the COVID-19 lockdown, then released back into the world without the tools to cope. As teenagers we see what's going on in the world, from the climate disaster to gun violence in our own neighborhoods.` 
},
  { author: "Member 5", 
  text: `We deserve safe spaces, real mentorship, and opportunities that reflect our full potential. We need support systems and people who understand the life of a Black child in this world. We need solutions, not suspensions. We need to be set up for success.` 
},
  { author: "Member 6", 
  text: `The truth is that law and compassion have failed us. We are stones placed in a graveyard of broken hearts and empty promises. We need opportunities and trust. `
 },
  { author: "Member 7", 
  text: `It is time that the City Council invests in the education budget to fund more school counselors. It is time to invest in our wellness. We have waited long enough.` 
},
  { author: "Member 8", 
  text: `My community and neighbors are struggling with confidence, mental health issues, suicide, substance use, overdose, inflation, gentrification, and police brutality. I see that this world still has a bias towards my people. I see discrimination, Black fathers being painted as deadbeats. I don’t see the police having a good impact. My generation is fighting to survive without enough people to look up to or lift them up. We’re still crying out for accessible resources, housing, and job opportunities. For racism to end.`
},
  { author: "Member 9", 
  text: `We need to think globally to understand our struggle. To see that people in other places go through similar issues. I see people living in famine, constant problems on the news, that our taxes are not being used to help us, but towards bombings and killings that we see on social media. Until Palestine is free, for example, America is not going to succeed. There will be no feeling of peace.` 
},
  { author: "Member 10", 
  text: `When we see how others fight back and support each other, it gives us ideas, hope, and strength to fight back too. We learn that we are not alone and that together we are stronger. We understand where we can use our peace to start solving problems. We are strong and we will rise. We will transfer the hate that they have given us and use it to unify the people. There can be no true community until all of us are free.` 
}
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

  // ✅ Only run on the page that actually has the carousel nodes
  if (!bodyEl || !countEl || !prevBtn || !nextBtn) return;

  // ✅ prevent double-binding on route re-renders
  if (bodyEl.dataset.bound === "1") {
    renderWDW();
    return;
  }
  bodyEl.dataset.bound = "1";

  function renderWDW() {
    const item = WDW_REFLECTIONS[wdwIndex];
    if (!item) return;

    if (metaEl) metaEl.textContent = "";

    // Convert \n\n to paragraphs
    const paragraphs = String(item.text || "")
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHTML(p)}</p>`)
      .join("");

    bodyEl.innerHTML = `
      ${paragraphs}
    `;

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

  // keyboard support (bind once per mount)
  if (!document.documentElement.dataset.wdwKeysBound) {
    document.documentElement.dataset.wdwKeysBound = "1";
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      const isTyping =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (isTyping) return;

      // only act if carousel is present on the current route
      const onPage = document.getElementById("wdwBody");
      if (!onPage) return;

      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });
  }

  renderWDW();
}
