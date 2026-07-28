# unonuevecr.com

Landing de UNONUEVE — agencia de marketing, contenido y automatización con IA.

Sitio estático, sin dependencias ni compilación. Se publica solo con GitHub Pages.

## Estructura

- `index.html` — todo el contenido
- `css/styles.css` — estilos
- `js/shapes.js` — genera las nubes de puntos (rostro, cerebro, iconos, toroide)
- `js/particles.js` — motor WebGL de partículas
- `js/app.js` — contenido, scroll, cotizador y formularios
- `assets/` — imágenes fuente del hero y del cerebro

## Qué se edita y dónde

Casi todo vive en dos bloques al inicio de `js/app.js`:

- **`CONFIG`** — enlace de Cal.com, llave de Web3Forms, correo y WhatsApp
- **`SERVICIOS` / `TAMANOS` / `URGENCIAS`** — textos y precios del cotizador

## Probarlo en local

```bash
python3 -m http.server 4319
```

Luego abrir http://localhost:4319

> El sitio lee píxeles de las imágenes con canvas, así que **debe abrirse por
> http://**, no con doble clic sobre el archivo (`file://` bloquea `getImageData`).

## Pendientes

- [ ] Poner la llave de Web3Forms en `CONFIG` (mientras esté vacía, el formulario abre el correo)
- [ ] Poner el enlace de Cal.com en `CONFIG` (mientras esté vacío, muestra WhatsApp)
- [ ] Reemplazar el logo por el definitivo
