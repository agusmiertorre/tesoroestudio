/* =========================================================================
   TESORO ESTUDIO — main.js
   ========================================================================= */
(function () {
  "use strict";

  /* ===================================================================
     1) CONFIGURACIÓN  —  editá estos valores
     =================================================================== */
  const CONFIG = {
    // Número de WhatsApp en formato internacional, SOLO números.
    // Ej: Argentina +54 9 11 1234-5678  ->  "5491112345678"
    whatsapp: "5491100000000",
  };

  /* ===================================================================
     2) GALERÍA  —  agregá o quitá fotos de esta lista.
        Subí tus imágenes a la carpeta /img/galeria/ y nombralas acá.
        'alt' = descripción breve (importante para accesibilidad y Google).
     =================================================================== */
  const PHOTOS = [
    { src: "img/galeria/foto-01.jpg", alt: "Foto de muestra 01" },
    { src: "img/galeria/foto-02.jpg", alt: "Foto de muestra 02" },
    { src: "img/galeria/foto-03.jpg", alt: "Foto de muestra 03" },
    { src: "img/galeria/foto-04.jpg", alt: "Foto de muestra 04" },
    { src: "img/galeria/foto-05.jpg", alt: "Foto de muestra 05" },
    { src: "img/galeria/foto-06.jpg", alt: "Foto de muestra 06" },
    { src: "img/galeria/foto-07.jpg", alt: "Foto de muestra 07" },
    { src: "img/galeria/foto-08.jpg", alt: "Foto de muestra 08" },
    { src: "img/galeria/foto-09.jpg", alt: "Foto de muestra 09" },
  ];

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    initHeader();
    initMenu();
    initReveal();
    initScrollSpy();
    buildGallery();
    initTeaserCode();
    initContactForm();
  });

  /* ---------------- año del footer ---------------- */
  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------- header sólido al hacer scroll ---------------- */
  function initHeader() {
    const header = $("#header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- menú mobile ---------------- */
  function initMenu() {
    const burger = $("#burger");
    const menu = $("#mobileMenu");
    if (!burger || !menu) return;

    const toggle = (open) => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };

    burger.addEventListener("click", () =>
      toggle(!document.body.classList.contains("menu-open"))
    );
    $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggle(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggle(false);
    });
  }

  /* ---------------- animación de aparición ---------------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- resaltar link activo del nav ---------------- */
  function initScrollSpy() {
    const sections = ["inicio", "estudio", "escolar", "galeria", "contacto"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const links = $$(".nav__links a");
    if (!sections.length || !links.length) return;

    const setActive = (id) => {
      links.forEach((a) => {
        const href = a.getAttribute("href") || "";
        a.classList.toggle("active", href === "#" + id);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------------- construir galería + lightbox ---------------- */
  function buildGallery() {
    const grid = $("#gallery");
    if (!grid) return;

    PHOTOS.forEach((photo, i) => {
      const btn = document.createElement("button");
      btn.className = "gallery__item";
      btn.type = "button";
      btn.setAttribute("aria-label", "Ampliar " + photo.alt);
      btn.dataset.index = String(i);
      btn.innerHTML =
        '<img src="' + photo.src + '" alt="' + photo.alt + '" loading="lazy">' +
        '<span class="gallery__zoom"><svg class="ico" aria-hidden="true">' +
        '<use href="#i-expand"/></svg></span>';
      grid.appendChild(btn);
    });

    /* lightbox */
    const lb = $("#lightbox");
    const lbImg = $("#lbImg");
    const counter = $("#lbCounter");
    if (!lb || !lbImg) return;
    let current = 0;

    const show = (i) => {
      current = (i + PHOTOS.length) % PHOTOS.length;
      lbImg.src = PHOTOS[current].src;
      lbImg.alt = PHOTOS[current].alt;
      if (counter) counter.textContent = current + 1 + " / " + PHOTOS.length;
    };
    const open = (i) => {
      show(i);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };

    grid.addEventListener("click", (e) => {
      const item = e.target.closest(".gallery__item");
      if (item) open(parseInt(item.dataset.index, 10));
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => show(current - 1));
    $("#lbNext").addEventListener("click", () => show(current + 1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------------- código de acceso (teaser → página de descargas) ------- */
  function initTeaserCode() {
    const form = $("#accessTeaser");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#teaserCode");
      const code = (input.value || "").trim().toUpperCase();
      if (!code) {
        input.focus();
        return;
      }
      window.location.href = "descargas.html?code=" + encodeURIComponent(code);
    });
  }

  /* ---------------- formulario de contacto → WhatsApp ---------------- */
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#cf-name").value.trim();
      const org = $("#cf-from").value.trim();
      const subject = $("#cf-subject").value;
      const msg = $("#cf-msg").value.trim();

      if (!name || !msg) return;

      let text = "Hola Tesoro Estudio! 👋\n\n";
      text += "Soy " + name;
      if (org) text += " (" + org + ")";
      text += ".\n";
      text += "Asunto: " + subject + "\n\n";
      text += msg;

      const url =
        "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
    });
  }
})();

/* ========================= Loader / Splash ========================= */
(function () {
  var loader = document.getElementById('loader');
  if (!loader) return;
  function dismiss() {
    loader.classList.add('fade-out');
    loader.addEventListener('transitionend', function () { loader.remove(); }, { once: true });
  }
  if (document.readyState === 'complete') {
    setTimeout(dismiss, 1600);
  } else {
    window.addEventListener('load', function () { setTimeout(dismiss, 500); });
  }
})();
