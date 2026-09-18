/* =========================================================================
   TESORO ESTUDIO — descargas.js
   Lógica de la página de acceso por código.

   Flujo:
   1) El visitante ingresa un código (o llega con ?code=XXXX en la URL).
   2) Se valida el código y, si es válido, se muestra el álbum con sus fotos.
   3) Cada foto se puede ver en grande (lightbox) y descargar en alta resolución.

   👉 IMPORTANTE: hoy esto funciona en modo DEMO (códigos de prueba más abajo).
      Cuando tengas el backend, sólo tenés que reescribir la función
      fetchAlbumByCode(). Está todo explicado en el bloque "CONECTAR BACKEND".
   ========================================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);

  /* ===================================================================
     1) MODO DEMO — códigos de ejemplo para probar la página
        Borrá este objeto cuando conectes el backend real.
        Las claves van en MAYÚSCULAS (el código se normaliza a mayúsculas).
     =================================================================== */
  // URL del Apps Script Web App. Reemplazá con la tuya al desplegar.
  // El Sheet queda privado; el script solo devuelve el link si el código es válido.
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygxw7qLvOM2K4vBLICUIWbtpHwJoxuJAypK63Ov0Xt1O7UysmJZ_13PtRkBPecbke2Rg/exec";

  /* ===================================================================
     2) VALIDACIÓN DEL CÓDIGO
        Devuelve una Promesa que resuelve a:
          { title: "Nombre del álbum", photos: [{ src, name }, ...] }
        o a  null  si el código no existe.
     =================================================================== */
  function fetchAlbumByCode(code) {
    return fetch(SCRIPT_URL + "?code=" + encodeURIComponent(code))
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.ok) return null;
        return { title: data.title, driveUrl: data.link };
      });
  }

  /* ===================================================================
     3) ARRANQUE
     =================================================================== */
  let CURRENT_PHOTOS = []; // fotos del álbum cargado (para lightbox y "descargar todas")

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    initHeader();
    initForm();
    initAlbumButtons();
    initLightbox();

    // Si llegó con ?code=XXXX, lo precargamos y validamos automáticamente.
    const fromUrl = new URLSearchParams(location.search).get("code");
    if (fromUrl) {
      const input = $("#codeInput");
      input.value = fromUrl.trim().toUpperCase();
      submitCode();
    } else {
      $("#codeInput").focus();
    }
  });

  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function initHeader() {
    const header = $("#header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- formulario de código ---------------- */
  function initForm() {
    const form = $("#codeForm");
    const input = $("#codeInput");
    if (!form) return;

    // Mayúsculas + formato automático XXXX-XXXX.
    // Strips hyphens del input, inserta uno automáticamente tras el 4.º carácter.
    input.addEventListener("input", () => {
      const cursor      = input.selectionStart;
      const beforeHyphen = input.value.slice(0, cursor).replace(/-/g, "").length;
      const raw         = input.value.toUpperCase().replace(/-/g, "").slice(0, 8);
      const formatted   = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
      input.value = formatted;
      const newCursor = Math.min(
        beforeHyphen <= 4 ? beforeHyphen : beforeHyphen + 1,
        formatted.length
      );
      input.setSelectionRange(newCursor, newCursor);
      setMsg("");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitCode();
    });
  }

  function submitCode() {
    const input = $("#codeInput");
    const btn = $("#codeBtn");
    const code = (input.value || "").trim().toUpperCase();

    if (!code) {
      setMsg("Ingresá tu código para continuar.", "error");
      input.focus();
      return;
    }

    // Estado "cargando": spinner dentro del botón + texto.
    const btnHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Buscando…';
    setMsg("");

    fetchAlbumByCode(code)
      .then((album) => {
        if (!album || !album.driveUrl) {
          setMsg("No encontramos un álbum con ese código. Revisalo e intentá de nuevo.", "error");
          return;
        }
        window.open(album.driveUrl, "_blank", "noopener");
      })
      .catch((err) => {
        console.error(err);
        setMsg("Hubo un problema al cargar las fotos. Probá de nuevo en un momento.", "error");
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = btnHTML;
      });
  }

  function setMsg(text, kind) {
    const el = $("#accessMsg");
    if (!el) return;
    el.textContent = text || "";
    el.classList.remove("error", "ok");
    if (kind) el.classList.add(kind);
  }

  /* ---------------- mostrar álbum ---------------- */
  function showAlbum(code, album) {
    CURRENT_PHOTOS = album.photos;

    $("#albumCode").textContent = "Código " + code;
    $("#albumTitle").textContent = album.title || "Tu álbum";
    const n = album.photos.length;
    $("#albumCount").textContent = n + (n === 1 ? " foto disponible" : " fotos disponibles");

    const grid = $("#albumGrid");
    grid.innerHTML = "";
    album.photos.forEach((photo, i) => {
      const card = document.createElement("figure");
      card.className = "album-card";
      card.dataset.index = String(i);
      card.innerHTML =
        '<img src="' + photo.src + '" alt="' + photo.name + '" loading="lazy">' +
        '<div class="album-card__bar">' +
          '<span>' + photo.name + '</span>' +
          '<button class="dl-btn" type="button" data-src="' + photo.src +
            '" data-name="' + photo.name + '">' +
            '<svg class="ico" aria-hidden="true"><use href="#i-download"/></svg>' +
            'Descargar' +
          '</button>' +
        '</div>';
      grid.appendChild(card);
    });

    // Ocultamos la entrada de código y mostramos el álbum.
    $("#codeSection").style.display = "none";
    const album$ = $("#album");
    album$.classList.add("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- botones del álbum ---------------- */
  function initAlbumButtons() {
    // Descargar una foto (delegación sobre la grilla).
    $("#albumGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".dl-btn");
      if (!btn) return;
      e.stopPropagation();
      downloadImage(btn.dataset.src, btn.dataset.name, btn);
    });

    // Usar otro código → vuelve a la pantalla de ingreso.
    $("#changeCode").addEventListener("click", () => {
      $("#album").classList.remove("show");
      $("#codeSection").style.display = "";
      history.replaceState(null, "", location.pathname);
      const input = $("#codeInput");
      input.value = "";
      setMsg("");
      input.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Descargar todas (una tras otra, con una pequeña pausa).
    $("#downloadAll").addEventListener("click", downloadAll);
  }

  /* Fuerza la descarga del archivo (en vez de abrirlo en otra pestaña).
     Trae la imagen como blob y dispara un <a download>. Si el navegador o
     el origen no lo permiten (CORS), abre la imagen como último recurso. */
  function downloadImage(src, name, btn) {
    const original = btn ? btn.innerHTML : null;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';
    }
    return fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name || "foto.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      })
      .catch(() => {
        // Fallback: abrir en pestaña nueva para guardar manualmente.
        window.open(src, "_blank", "noopener");
      })
      .finally(() => {
        if (btn && original !== null) {
          btn.disabled = false;
          btn.innerHTML = original;
        }
      });
  }

  function downloadAll() {
    const btn = $("#downloadAll");
    if (!CURRENT_PHOTOS.length) return;
    const original = btn.innerHTML;
    btn.disabled = true;

    let i = 0;
    const next = () => {
      if (i >= CURRENT_PHOTOS.length) {
        btn.disabled = false;
        btn.innerHTML = original;
        return;
      }
      const p = CURRENT_PHOTOS[i];
      btn.innerHTML =
        '<span class="spinner"></span> Descargando ' + (i + 1) + "/" + CURRENT_PHOTOS.length;
      downloadImage(p.src, p.name).finally(() => {
        i++;
        setTimeout(next, 500); // pausa entre descargas
      });
    };
    next();
  }

  /* ---------------- lightbox ---------------- */
  function initLightbox() {
    const grid = $("#albumGrid");
    const lb = $("#lightbox");
    const lbImg = $("#lbImg");
    const counter = $("#lbCounter");
    if (!grid || !lb || !lbImg) return;
    let current = 0;

    const show = (i) => {
      if (!CURRENT_PHOTOS.length) return;
      current = (i + CURRENT_PHOTOS.length) % CURRENT_PHOTOS.length;
      lbImg.src = CURRENT_PHOTOS[current].src;
      lbImg.alt = CURRENT_PHOTOS[current].name;
      if (counter) counter.textContent = current + 1 + " / " + CURRENT_PHOTOS.length;
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

    // Click en la foto (no en el botón de descarga) → abre lightbox.
    grid.addEventListener("click", (e) => {
      if (e.target.closest(".dl-btn")) return;
      const card = e.target.closest(".album-card");
      if (card) open(parseInt(card.dataset.index, 10));
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
})();
