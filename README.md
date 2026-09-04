# HoloLink — micrositio 2042

Micrositio estático para presentar **HoloLink**, un comunicador holográfico portátil de diseño especulativo situado en 2042.

## Estructura

- `index.html` — contenido y narrativa principal.
- `assets/css/styles.css` — dirección de arte responsive.
- `assets/js/viewer.js` — visor 3D progresivo con Three.js, GLTFLoader y OrbitControls.
- `assets/js/site.js` — animaciones editoriales no críticas.
- `assets/models/hololink.glb` — modelo para WebGL.
- `assets/models/hololink.usdz` — modelo para Apple Quick Look / AR.
- `assets/images/` — renders y referencias del objeto.

## Vista local

Por restricciones de CORS del navegador, no abras `index.html` directamente para probar el GLB. Sirve la carpeta por HTTP, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## GitHub Pages

El workflow incluido en `.github/workflows/pages.yml` publica el contenido estático de la raíz mediante GitHub Actions. En el repositorio, configura **Settings → Pages → Source: GitHub Actions**.

## Robustez

El contenido HTML y las imágenes no dependen de JavaScript. Si Three.js, WebGL, el CDN o el GLB fallan, el visor conserva una referencia estática y el resto de la página permanece usable.
