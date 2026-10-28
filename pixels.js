// Cards mode — the pixel world's paint box: one 256 × 144 buffer, seeded
// noise so the same place always looks the same, colours and the light they
// are shaded by. sprites.js and world.js draw with these.
// Everything here is used by the files loaded after it (see manifest.json).
/* oxlint-disable no-unused-vars */

const image = new ImageData(W, H);
const buf = new Uint32Array(image.data.buffer);

const rnd = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t) => t * t * (3 - 2 * t);
const noise = (x) => {
  const i = Math.floor(x);
  return rnd(i) + (rnd(i + 1) - rnd(i)) * smooth(x - i);
};
const clamp = (x) => Math.min(1, Math.max(0, x));
const wrap = (v, n) => ((v % n) + n) % n;
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const pack = (c) => (255 << 24) | ((c[2] | 0) << 16) | ((c[1] | 0) << 8) | (c[0] | 0);
// Ordered dithering: a 4 × 4 Bayer threshold per pixel.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

const WHITE = [255, 255, 255];
const INK = [20, 28, 34];
const SOIL = [40, 26, 14];
const GREY = [128, 132, 145];
const NIGHT = rgb("#121a3a");
const FAR = rgb("#6f7fae");
const LAMP = rgb("#f2c230");
const LIT = pack(LAMP);
const GLOW = pack(mix(LAMP, WHITE, 0.35));
const STAR = pack([255, 250, 235]);
const FAINT = pack([170, 172, 205]);
const MOON = pack([238, 236, 222]);

// [phase of the day, top of the sky, middle, horizon]
const SKY = [
  [0.0, "#0b1030", "#18204a", "#2a2d5e"],
  [0.2, "#0b1030", "#18204a", "#2a2d5e"],
  [0.27, "#34407a", "#b5688a", "#f4b07a"],
  [0.36, "#3f8fd0", "#86c3ea", "#e2f1ef"],
  [0.64, "#3f8fd0", "#86c3ea", "#e2f1ef"],
  [0.74, "#2e2a62", "#b4547a", "#f59a5a"],
  [0.82, "#0b1030", "#18204a", "#2a2d5e"],
  [1.0, "#0b1030", "#18204a", "#2a2d5e"],
].map(([p, ...c]) => [p, ...c.map(rgb)]);

function skyAt(p) {
  let i = 0;
  while (SKY[i + 1][0] < p) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const t = smooth((p - a[0]) / (b[0] - a[0]));
  return [1, 2, 3].map((k) => mix(a[k], b[k], t));
}

// Per-frame light, set by render(): everything but lamps and stars is tinted
// toward the horizon with distance and toward night blue as the light goes.
let HOR = [0, 0, 0];
let LIGHT = 1;
const memo = new Map();
const shade = (c, haze = 0) => mix(mix(c, HOR, haze), NIGHT, (1 - LIGHT) * 0.72);
// A hex colour shaded for this frame, cached until the light changes.
const S = (hex) => {
  let v = memo.get(hex);
  if (v === undefined) memo.set(hex, (v = pack(shade(rgb(hex)))));
  return v;
};

function px(x, y, c) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = c;
}

function rect(x, y, w, h, c) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c);
}

// A filled circle; paint(x, y, dx, dy) picks each pixel's colour, or 0 to skip it.
function blob(cx, cy, r, paint) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r + r) continue;
      const c = paint(cx + dx, cy + dy, dx, dy);
      if (c) px(cx + dx, cy + dy, c);
    }
  }
}
