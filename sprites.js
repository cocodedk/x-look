// Cards mode — the places the world walks through and the things standing in
// them. Each region has its own colours, things and weather; render() shades
// the colours into PAL once a frame.
// Everything here is used by the files loaded after it (see manifest.json).
/* oxlint-disable no-unused-vars */

const REGIONS = [
  {
    hill: "#6fae73",
    ground: "#5b9a4f",
    leaf: "#4f9a52",
    leafLight: "#7cc46f",
    pine: "#2f6b4a",
    density: 0.6,
    things: ["tree", "tree", "flowers", "house", "fence"],
    weather: ["clear", "rain", "birds"],
  },
  {
    hill: "#5c9a6a",
    ground: "#5c9a6a",
    water: true,
    density: 0.5,
    things: ["boat", "reeds", "reeds"],
    weather: ["clear", "birds", "fireflies"],
  },
  {
    hill: "#e0b77a",
    ground: "#d6a35f",
    density: 0.45,
    things: ["cactus", "cactus", "rock"],
    weather: ["clear", "birds"],
  },
  {
    hill: "#b47a43",
    ground: "#8c6a3a",
    leaf: "#d4772f",
    leafLight: "#eda04a",
    pine: "#3d5a3a",
    density: 0.75,
    things: ["tree", "pine", "tree", "house", "lamp"],
    weather: ["leaves", "rain", "clear"],
  },
  {
    hill: "#dbe3ec",
    ground: "#eef2f7",
    pine: "#2f5446",
    snow: true,
    density: 0.75,
    things: ["pine", "house", "lamp", "snowman", "pine"],
    weather: ["snow", "snow", "clear"],
  },
];
let PAL = [];

const regionAt = (wx) => REGIONS[wrap(Math.floor(wx / REGION), REGIONS.length)];
// Near the end of a region the next one is dithered in, pixel by pixel.
function paletteAt(wx, x, y) {
  const f = wx / REGION;
  const i = Math.floor(f);
  const edge = (f - i - 0.94) / 0.06;
  return PAL[wrap(edge > bay(x, y) ? i + 1 : i, REGIONS.length)];
}
const ridge = (wx, base, amp, scale) =>
  base - amp * (noise(wx / scale) * 0.7 + noise((wx / scale) * 3 + 50) * 0.3);
const groundY = (wx) => Math.floor(H - 30 - 4 * noise(wx / 26));

// Each sprite stands on (x, y); v is its own random 0–1, r its region, lit
// whether its lights are on.
const SPRITES = {
  tree(x, y, v, r) {
    rect(x, y - 6, 2, 6, S("#6b4a2e"));
    const leaf = (gx, gy, dx, dy) => (dx + dy < -3 ? S(r.leafLight) : S(r.leaf));
    blob(x + 1, y - 10, 4 + Math.floor(v * 2), leaf);
  },
  pine(x, y, v, r) {
    const h = 10 + Math.floor(v * 7);
    for (let j = 0; j < h; j++) {
      const w = Math.floor(j * 0.42);
      rect(x - w, y - h - 1 + j, w * 2 + 1, 1, r.snow && j < 3 ? S("#f4f7fb") : S(r.pine));
    }
    rect(x, y - 1, 1, 1, S("#5a3d24"));
  },
  house(x, y, v, r, lit, t) {
    const walls = ["#e3d3b4", "#c98e6b", "#b8c5d1"];
    const roofs = ["#9c4a3c", "#5d6b7d", "#7a5a3c"];
    rect(x + 4, y - 16, 2, 4, S("#6e5446"));
    rect(x - 7, y - 9, 15, 9, S(walls[Math.floor(v * 3)]));
    for (let j = 0; j < 6; j++) {
      const roof = r.snow && j > 3 ? "#f4f7fb" : roofs[Math.floor(v * 9) % 3];
      rect(x - 8 + j, y - 10 - j, 17 - 2 * j, 1, S(roof));
    }
    rect(x - 1, y - 4, 2, 4, S("#5a3d24"));
    const glass = lit ? LIT : S("#7fa6c2");
    rect(x - 5, y - 7, 3, 2, glass);
    rect(x + 3, y - 7, 3, 2, glass);
    if (!lit && !r.snow) return;
    for (let k = 0; k < 4; k++) {
      px(x + 5 + Math.sin(t * 1.3 + k) * 1.5, y - 18 - k * 3 - ((t * 4) % 3), S("#c9ced6"));
    }
  },
  lamp(x, y, v, r, lit) {
    rect(x, y - 11, 1, 11, S("#3a3f4a"));
    if (lit) blob(x, y - 12, 5, (gx, gy, dx, dy) => (dx * dx + dy * dy > 5 && bay(gx, gy) < 0.22 ? GLOW : 0));
    rect(x - 1, y - 13, 3, 2, lit ? LIT : S("#a3acb6"));
  },
  fence(x, y) {
    for (let i = -6; i <= 6; i += 3) rect(x + i, y - 5, 1, 5, S("#8a6a48"));
    rect(x - 6, y - 4, 13, 1, S("#8a6a48"));
  },
  flowers(x, y, v) {
    const colours = ["#f2c230", "#e8798a", "#f4f1ea"];
    for (let k = 0; k < 6; k++) {
      px(x - 5 + rnd(v * 99 + k) * 10, y - 1 - Math.floor(rnd(v * 7 + k) * 2), S(colours[k % 3]));
    }
  },
  cactus(x, y, v) {
    const c = S("#4f8a4a");
    const h = 9 + Math.floor(v * 6);
    rect(x, y - h, 3, h, c);
    rect(x - 3, y - h + 3, 2, 4, c);
    rect(x - 2, y - h + 6, 2, 1, c);
    rect(x + 4, y - h + 5, 2, 3, c);
    rect(x + 3, y - h + 7, 2, 1, c);
  },
  rock(x, y, v) {
    const stone = (gx, gy, dx, dy) => (dy > 0 ? 0 : dx + dy < -2 ? S("#a29d97") : S("#77736e"));
    blob(x, y, 3 + Math.floor(v * 3), stone);
  },
  snowman(x, y) {
    const snow = S("#f4f7fb");
    blob(x, y - 4, 4, () => snow);
    blob(x, y - 10, 3, () => snow);
    px(x + 1, y - 10, S("#e07a3a"));
    px(x - 1, y - 11, S("#2a2f3a"));
  },
  boat(x, y, v, r, lit, t) {
    const b = Math.round(Math.sin(t * 1.5 + v * 6));
    rect(x, y - 13 + b, 1, 11, S("#5a3d24"));
    for (let j = 0; j < 9; j++) rect(x + 1, y - 13 + b + j, Math.floor(j * 0.6) + 1, 1, S("#f2efe6"));
    rect(x - 6, y - 3 + b, 13, 2, S("#7a4e2e"));
    rect(x - 5, y - 1 + b, 11, 1, S("#5e3a22"));
  },
  reeds(x, y, v) {
    for (let k = 0; k < 4; k++) {
      rect(x + k * 2, y - 5 - ((k + Math.floor(v * 3)) % 3), 1, 6, S("#6b7a3a"));
    }
  },
};
