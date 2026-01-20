let savedScrollY = 0;

function openLightbox(imgSrc, imgAlt = "") {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  if (!lightbox || !lightboxImg) return;

  savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;

  // lock scroll in place (prevents jump)
  document.documentElement.classList.add("lb-lock");
  document.body.classList.add("lb-lock");
  document.body.style.top = `-${savedScrollY}px`;

  lightboxImg.src = imgSrc;
  lightboxImg.alt = imgAlt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");

  // unlock + restore scroll position
  const top = document.body.style.top; // "-1234px"
  document.body.style.top = "";

  document.documentElement.classList.remove("lb-lock");
  document.body.classList.remove("lb-lock");

  const y = top ? Math.abs(parseInt(top, 10)) : savedScrollY;
  window.scrollTo(0, y);
}

/**
 * CLICK HANDLING (event delegation)
 * Works even when pages swap in/out of #app.
 */
document.addEventListener("click", (e) => {
  const lightbox = document.querySelector(".lightbox");

  // 1) Click image -> open
  const img = e.target.closest("img");
  if (img && img.closest(".prose, .article-inner, .non-article-inner, .media-block, figure")) {
    // ignore images inside links (optional)
    const link = img.closest("a");
    if (link) e.preventDefault();

    const src = img.getAttribute("data-lightbox-src") || img.currentSrc || img.src;
    if (!src) return;

    openLightbox(src, img.alt || "");
    return;
  }

  // 2) Click backdrop/lightbox -> close
  if (lightbox && lightbox.classList.contains("is-open")) {
    const clickedBackdrop = e.target.classList.contains("lightbox");
    const clickedImage = e.target.classList.contains("lightbox-img");
    if (clickedBackdrop || clickedImage) closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});


