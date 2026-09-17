# Artisanal Design & Realization

Built with **SvelteKit + adapter-node**.

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 2 (Svelte 5 runes) |
| 3D | three.js + DRACO-compressed GLB |
| Adapter | `@sveltejs/adapter-node` → `build/index.js` |
| Process manager | pm2 (`ecosystem.config.cjs`) |
| Font | IBM Plex Sans (Google Fonts) |

## Project layout

```
src/
  lib/
    components/     UI pieces (Header, ProductCard, ThreeViewer, AboutModal, …)
    data/products.js  ← single source of truth for the catalogue
    stores/ui.js      catalogue filter state
    actions/impact.js hammer-impact shake + neighbour cascade
    three/viewer.js   reusable GLB viewer (lighting, framing, orbit, dispose)
    styles/           tokens.css (all colours/metrics) + app.css
  routes/
    +layout.svelte    grid backdrop, cursor, header, view-transitions
    +page.svelte      the catalogue grid
    product/[slug]/   detail page with the 3D inspector
    contact | imprint | agb
static/
  models/         DRACO-compressed .glb objects
  product_images/ transparent PNG renders
  cursor/         hammer.webm (custom cursor) + idle poster
  draco/          DRACO decoder (served locally, no CDN)
```

To add an object, add one record to
`src/lib/data/products.js` (image, optional GLB, copy, specs)

Colours, grid sizes and type scale live as CSS custom properties in
`src/lib/styles/tokens.css`

---

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & run in production

```bash
npm install
npm run build      # emits ./build (adapter-node)
node build/index.js
```

The server honours `PORT`, `HOST` and `ORIGIN` env vars.

## Deploy with pm2

```bash
npm install
npm run build
pm2 start ecosystem.config.cjs   # serves on PORT 3000 by default
pm2 save                         # persist across reboots
pm2 startup                      # (once) enable boot on server start
```

Update after a new build:

```bash
git pull && npm install && npm run build && pm2 reload adr-website
```

Ports/host are set in `ecosystem.config.cjs`. Put nginx/Caddy in front for TLS
and set `ORIGIN` to your public URL (needed for form POSTs / CSRF).

### Example nginx reverse proxy

```nginx
server {
    server_name adr.studio;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Assets

### Custom cursor
The hammer cursor is a transparent **VP9 WebM** rebuilt from the 8 source PNG
frames (originally ~9 MB → **27 KB**). To regenerate after editing the frames:

```bash
ffmpeg -y -framerate 16 -start_number 1 -i click%04d.png \
  -vf "scale=480:480" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -an \
  static/cursor/hammer.webm
```

The hotspot (real click point) is aligned to the hammer head via
`HOTSPOT_X/Y` in `CustomCursor.svelte`. Touch/coarse-pointer devices keep the
native cursor.

### 3D models
GLBs are DRACO-compressed
