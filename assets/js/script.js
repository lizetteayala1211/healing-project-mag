// document.addEventListener("DOMContentLoaded", () => {
//   const lightbox = document.getElementById("lightbox");
//   const lightboxImg = document.getElementById("lightboxImg");

//   if (!lightbox || !lightboxImg) return;

//   document.querySelectorAll(".prose img, .media-block img").forEach((img) => {
//     img.style.cursor = "zoom-in";

//     img.addEventListener("click", () => {
//       if (!img.src) return;

//       lightboxImg.src = img.src;
//       lightboxImg.alt = img.alt || "";
//       lightbox.classList.add("is-open");
//       lightbox.setAttribute("aria-hidden", "false");
//       document.body.style.overflow = "hidden";
//     });
//   });

//   lightbox.addEventListener("click", () => {
//     lightbox.classList.remove("is-open");
//     lightbox.setAttribute("aria-hidden", "true");
//     lightboxImg.src = "";
//     document.body.style.overflow = "";
//   });

//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") {
//       lightbox.classList.remove("is-open");
//       lightbox.setAttribute("aria-hidden", "true");
//       lightboxImg.src = "";
//       document.body.style.overflow = "";
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  function ensureLightbox() {
    let lb = document.getElementById("lightbox");
    let img = document.getElementById("lightboxImg");

    if (!lb) {
      lb = document.createElement("div");
      lb.id = "lightbox";
      lb.className = "lightbox";
      lb.setAttribute("aria-hidden", "true");

      img = document.createElement("img");
      img.id = "lightboxImg";
      img.className = "lightbox-img";
      img.alt = "";

      lb.appendChild(img);
      document.body.appendChild(lb);
    }

    return { lb, img };
  }

  const { lb, img } = ensureLightbox();

  function openLightbox(src, alt = "") {
    img.src = src;
    img.alt = alt;

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");

    document.documentElement.classList.add("lb-lock");
    document.body.classList.add("lb-lock");
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    img.src = "";

    document.documentElement.classList.remove("lb-lock");
    document.body.classList.remove("lb-lock");
  }

  // close on overlay click
  lb.addEventListener("click", closeLightbox);

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox();
  });

  // Event delegation: works for images inside figure, even if injected later
  document.addEventListener("click", (e) => {
    const clickedImg = e.target.closest("img");
    if (!clickedImg) return;

    // Optional: only lightbox images inside figures
    // if (!clickedImg.closest("figure")) return;

    const a = clickedImg.closest("a");
    if (a) e.preventDefault();

    const src = clickedImg.currentSrc || clickedImg.src;
    if (!src) return;

    openLightbox(src, clickedImg.alt || "");
  });

  console.log("✅ Lightbox active");
});

