// Cards mode — the moving pixel world behind the cards: sky, sun and moon,
// clouds, three layers of land moving at their own speeds, the things on the
// ground and the weather. render() draws one frame; cards.js decides when.
// Everything here is used by the files loaded after it (see manifest.json).
/* oxlint-disable no-unused-vars */

const world = document.createElement("canvas");
world.className = "xlk-world";
world.width = W;
world.height = H;
world.setAttribute("aria-hidden", "true");
const ctx = world.getContext("2d");
const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
// The last frame of the previous post, and the order its pixels give way in.
const before = new Uint32Array(W * H);
const ORDER = Float32Array.from({ length: W * H }, (_, i) => rnd(i * 1.7 + 7000));
let cam = 0;
let fadeFrom = -Infinity;

// A new post dissolves the old view into the next place, pixel by pixel,
// instead of racing the camera across the land.
function turn() {
  before.set(buf);
  fadeFrom = performance.now();
}

function drawSky(top, mid, hor) {
  const BANDS = 10;
  const at = (s) => (s < 0.55 ? mix(top, mid, s / 0.55) : mix(mid, hor, (s - 0.55) / 0.45));
  for (let y = 0; y < H; y++) {
    const f = clamp(y / HORIZON) * BANDS;
    const b = Math.floor(f);
    const c0 = pack(at(b / BANDS));
    const c1 = pack(at(Math.min(BANDS, b + 1) / BANDS));
    for (let x = 0; x < W; x++) buf[y * W + x] = f - b > bay(x, y) ? c1 : c0;
  }
}

function drawStars(dark, t) {
  if (dark < 0.15) return;
  for (let i = 0; i < 70; i++) {
    const twinkle = 0.6 + 0.4 * Math.sin(t * (1 + rnd(i + 140) * 2) + i);
    if (rnd(i + 210) < dark * twinkle) px(rnd(i) * W, rnd(i + 70) * HORIZON * 0.75, i % 9 ? STAR : FAINT);
  }
  // Now and then a shooting star.
  const k = Math.floor(t / 9);
  const u = (t % 9) / 0.9;
  if (dark < 0.6 || rnd(k + 400) > 0.6 || u >= 1) return;
  const sx = rnd(k + 401) * W * 0.7;
  const sy = 6 + rnd(k + 402) * 26;
  for (let j = 0; j < 8; j++) px(sx + u * 60 - j * 2, sy + u * 20 - j * 0.66, j < 2 ? STAR : FAINT);
}

function drawSunMoon(p) {
  const arc = (a) => [
    Math.floor(W * (0.1 + 0.8 * a)),
    Math.floor(HORIZON - Math.sin(Math.PI * a) * (HORIZON - 18)),
  ];
  const sa = (p - 0.22) / 0.56;
  if (sa > 0 && sa < 1) {
    const [x, y] = arc(sa);
    const sun = mix([255, 240, 190], [255, 158, 88], 1 - Math.sin(Math.PI * sa));
    const halo = pack(mix(sun, HOR, 0.45));
    blob(x, y, 12, (gx, gy, dx, dy) => (dx * dx + dy * dy > 90 && bay(gx, gy) < 0.3 ? halo : 0));
    blob(x, y, 8, () => pack(sun));
  }
  const ma = (wrap(p + 0.5, 1) - 0.22) / 0.56;
  if (ma > 0 && ma < 1) {
    const [x, y] = arc(ma);
    blob(x, y, 6, (gx, gy, dx, dy) => ((dx - 3) ** 2 + (dy + 1) ** 2 > 30 ? MOON : 0));
  }
}

function drawClouds(t, cover, gloom, dark) {
  const lit = mix(mix([252, 252, 255], HOR, 0.3), [70, 76, 110], dark * 0.85);
  const col = mix(lit, GREY, Math.min(1, gloom * 1.4));
  const body = pack(col);
  const under = pack(mix(col, [40, 44, 70], 0.22));
  const span = W + 140;
  for (let i = 0; i < 2 + Math.round(cover * 7); i++) {
    const drift = cam * 0.06 + t * (1.2 + rnd(i + 501) * 2.2);
    const x = Math.floor(wrap(rnd(i + 500) * span - drift, span) - 70);
    const s = 4 + Math.floor(rnd(i + 503) * 5);
    const y = Math.floor(10 + rnd(i + 502) * 40);
    const base = y + Math.ceil(s * 0.45);
    const paint = (gx, gy) => (gy > base ? 0 : gy > base - 2 ? under : body);
    blob(x, y, s, paint);
    blob(x + Math.floor(s * 1.1), y - Math.floor(s * 0.6), Math.floor(s * 1.2), paint);
    blob(x + Math.floor(s * 2.3), y, s, paint);
  }
}

function drawMountains() {
  const off = cam * 0.1;
  const rock = pack(shade(mix(FAR, HOR, 0.5)));
  const snow = pack(shade(mix([236, 240, 248], HOR, 0.35)));
  for (let x = 0; x < W; x++) {
    const h = Math.floor(ridge(x + off, HORIZON + 6, 46, 50));
    const cap = h < HORIZON - 30 ? h + 3 + ((bay(x, 0) * 2) | 0) : -1;
    for (let y = Math.max(0, h); y < H; y++) buf[y * W + x] = y < cap ? snow : rock;
  }
}

function drawHills() {
  const off = cam * 0.35;
  for (let x = 0; x < W; x++) {
    const h = Math.floor(ridge(x + off, HORIZON + 16, 20, 36));
    for (let y = Math.max(0, h); y < H; y++) {
      const r = paletteAt(x + cam, x, y);
      buf[y * W + x] = y === h ? r.rim : r.hill;
    }
  }
  // Small far-off trees along the ridge.
  for (let c = Math.floor(off / 9) - 1; c * 9 - off < W + 9; c++) {
    if (rnd(c * 3.1 + 9) > 0.32) continue;
    const x = Math.floor(c * 9 - off + rnd(c) * 5);
    const h = Math.floor(ridge(x + off, HORIZON + 16, 20, 36));
    const r = paletteAt(x + cam, x, h);
    for (let j = 0; j < 6; j++) rect(x - (j >> 1), h - 6 + j, (j >> 1) * 2 + 1, 1, r.dark);
  }
}

function drawGround(t) {
  const deep = shade(rgb("#1d3a5a"));
  const sand = S("#d8c08a");
  const sandTop = S("#e8d6a8");
  const spark = pack(mix(HOR, WHITE, 0.6));
  for (let x = 0; x < W; x++) {
    const wx = x + cam;
    const r = paletteAt(wx, x, WATER);
    if (!regionAt(wx).water) {
      const g = groundY(wx);
      for (let y = g; y < H; y++) {
        const d = y - g;
        buf[y * W + x] = d < 1 ? r.top : d < 6 || (d < 9 && bay(x, y) < 0.5) ? r.body : r.deep;
      }
      continue;
    }
    // The lake mirrors whatever is above it, rippling, and darkens with depth.
    for (let y = WATER; y < H; y++) {
      if (y >= H - 9) {
        buf[y * W + x] = y === H - 9 ? sandTop : sand;
        continue;
      }
      const d = y - WATER;
      const sx = Math.min(W - 1, Math.max(0, x + Math.round(Math.sin(y * 0.9 + t * 2.4) * d * 0.09)));
      const v = buf[(2 * WATER - y - 1) * W + sx];
      const c = mix([v & 255, (v >> 8) & 255, (v >> 16) & 255], deep, 0.35 + d * 0.012);
      buf[y * W + x] = bay(x, y) < 0.06 && Math.sin(x * 0.7 + t * 3 + y) > 0.8 ? spark : pack(c);
    }
  }
}

function drawThings(t, dark) {
  for (let c = Math.floor(cam / CELL) - 1; c * CELL - cam < W + CELL; c++) {
    const wx = c * CELL + rnd(c * 7 + 3) * 12;
    const r = regionAt(wx);
    if (rnd(c * 7 + 1) > r.density) continue;
    const kind = r.things[Math.floor(rnd(c * 7 + 2) * r.things.length)];
    const lit = dark > 0.45 && rnd(c * 7 + 5) < 0.85;
    SPRITES[kind](Math.floor(wx - cam), r.water ? WATER : groundY(wx), rnd(c * 7 + 4), r, lit, t);
  }
}
