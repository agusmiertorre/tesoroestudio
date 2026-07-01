# Tesoro Estudio — Sitio web

Sitio estático (HTML + CSS + JavaScript, sin framework ni compilación) listo para
subir a cualquier hosting. Pensado para el dominio **tesoroestudio.ar**.

---

## 1. Cómo subirlo a tu hosting

1. Entrá al panel de tu hosting (cPanel / Plesk / Administrador de archivos, o por FTP
   con FileZilla).
2. Subí **todo el contenido de esta carpeta** dentro de `public_html/`
   (o la carpeta raíz que use tu hosting). Tienen que quedar ahí:
   - `index.html`, `descargas.html`, `tienda.html`
   - las carpetas `css/`, `js/`, `img/`
3. Listo. Entrá a `https://tesoroestudio.ar` y debería verse el inicio.

> Las rutas son **relativas** (sin barra inicial), así que funciona tanto en la raíz
> del dominio como en un subdirectorio, sin tocar nada.

### Páginas del sitio
- `index.html` → inicio (estudio, fotografía escolar, galería, contacto, acceso por código).
- `tienda.html` → redirige solo a `https://tesoroestudio.mitiendanube.com/`.
  Hoy los botones de "Tienda" del menú ya apuntan **directo** a Tienda Nube; si querés
  que pasen por esta página intermedia, cambiá esos enlaces a `tienda.html`.
- `descargas.html` → acceso privado por código para que el cliente baje sus fotos.

---

## 2. Datos que tenés que reemplazar (placeholders)

Hay datos de ejemplo que conviene cambiar por los reales. Buscá y reemplazá:

| Dato | Valor de ejemplo actual | Dónde aparece |
|------|-------------------------|----------------|
| WhatsApp | `5491100000000` | `js/main.js` (variable `CONFIG.whatsapp`) **y** los enlaces `wa.me/...` de `index.html` |
| Email | `hola@tesoroestudio.ar` | `index.html` (enlaces `mailto:`) |
| Instagram | `@tesoroestudio` | `index.html` (enlaces de Instagram) |

> El WhatsApp va en **formato internacional, solo números**.
> Ejemplo para Argentina +54 9 11 1234-5678 → `5491112345678`.

---

## 3. Cómo cargar las fotos de la GALERÍA pública (las que se ven en el inicio)

Son las fotos de muestra de tu trabajo, visibles para cualquiera.

1. Copiá tus imágenes a la carpeta **`img/galeria/`**.
   - Recomendado: formato `.jpg`, ancho de ~1600 px, y peso liviano (optimizadas).
2. Abrí **`js/main.js`** y editá la lista `PHOTOS` (cerca del comienzo del archivo):

   ```js
   const PHOTOS = [
     { src: "img/galeria/mi-foto-01.jpg", alt: "Egresados 6.º grado 2025" },
     { src: "img/galeria/mi-foto-02.jpg", alt: "Retrato en estudio" },
     // agregá o quitá líneas según tus fotos…
   ];
   ```
   - `src` = ruta al archivo dentro de `img/galeria/`.
   - `alt` = descripción breve (ayuda a la accesibilidad y a Google).
3. Guardá y volvé a subir `js/main.js` y las imágenes. La galería se arma sola.

Las imágenes `demo-01.jpg … demo-06.jpg` y `foto-01.jpg … foto-09.jpg` que vienen
incluidas son **placeholders**: borralas o reemplazalas cuando tengas las tuyas.

---

## 4. Las fotos de CLIENTES (descarga por código) — importante

La galería del punto 3 es pública. Pero las fotos que cada familia compra son
privadas, así que **no pueden estar sueltas dentro del sitio**: si estuvieran en
`img/…`, cualquiera podría adivinar la URL y bajarlas sin pagar.

Por eso `descargas.html` funciona así:
1. El cliente ingresa su **código** (o entra con un enlace tipo
   `descargas.html?code=SC4A-2X7K`).
2. El sitio le pregunta a un **backend** si ese código es válido.
3. Si lo es, el backend devuelve **enlaces firmados y temporales** de sus fotos.

### Modo DEMO (lo que está activo ahora)
Para que puedas probar la página sin backend, hay códigos de ejemplo en
`js/descargas.js` (objeto `DEMO`). Probá con:

- `DEMO123`
- `TESORO`
- `SC4A-2X7K`

Cualquiera de esos muestra las 6 fotos `demo-…` como ejemplo.

### Conectar el backend real
En `js/descargas.js`, dentro de la función **`fetchAlbumByCode()`**, está todo
comentado paso a paso con **dos opciones**:

- **Opción A – Google Apps Script:** publicás un Web App que recibe `?code=` y
  devuelve un JSON con el álbum y las URLs. Rápido de armar (encaja con lo que ya
  venís usando para San Carlos).
- **Opción B – Supabase con Signed URLs:** una tabla relaciona `código → carpeta`
  del Storage, y se generan enlaces firmados (p. ej. válidos 1 hora) solo si el
  código coincide. Más robusto y es la arquitectura recomendada para esto.

Cuando elijas una, borrás el bloque DEMO y pegás la versión real (está lista para
copiar y pegar, solo completás tus claves/endpoint).

---

## 5. Cómo generar y enviar los códigos

**Formato sugerido:** 6 a 8 caracteres, en mayúsculas, evitando los ambiguos
(`0/O`, `1/I/L`). Un patrón cómodo y prolijo es `XXXX-XXXX`, por ejemplo
`SC4A-2X7K`. Conviene que cada código sea único por familia/álbum.

**Cómo entregarlo:** lo más simple es mandar por WhatsApp o email el código **+**
un enlace directo, así el cliente no tipea nada:

```
https://tesoroestudio.ar/descargas.html?code=SC4A-2X7K
```

(La página toma el código de la URL y valida sola.)

---

## 6. (Opcional) Formulario de contacto por email

Hoy el formulario de contacto **no usa servidor**: arma un mensaje y abre WhatsApp.
Funciona perfecto en hosting estático y no requiere mantenimiento.

Si en algún momento querés que el formulario llegue a tu **email** en lugar de
WhatsApp, una opción sin backend es **Formspree** (formspree.io): creás un form,
te dan un endpoint y cambiás el `<form>` para que haga `POST` ahí. Si te interesa,
lo cableamos.

---

## 7. Resumen de la estructura

```
tesoroestudio/
├── index.html          ← inicio
├── descargas.html      ← acceso por código (privado)
├── tienda.html         ← redirige a Tienda Nube
├── css/
│   └── styles.css
├── js/
│   ├── main.js         ← config (WhatsApp) + lista de la galería
│   └── descargas.js    ← lógica del acceso por código + backend
└── img/
    ├── hero.jpg, nosotros.jpg, escolar-1/2.jpg, institucional.jpg
    └── galeria/        ← fotos de la galería + demos de descarga
```

¿Dudas con el deploy, el backend de las fotos o la generación de códigos?
Escribime y lo terminamos de armar.
