// Cards mode — one frame of the world: the time of day and the weather for
// world time t at post number index, then every layer back to front.
// Everything here is used by the files loaded after it (see manifest.json).
/* oxlint-disable no-unused-vars */

function drawWeather(kind, amount, t) {
  if (kind === "rain") {
    const c = pack(mix(HOR, [220, 230, 245], 0.5));
    for (let i = 0; i < 110 * amount; i++) {
      const x = wrap(rnd(i) * W - t * 25 - cam * 0.6, W);
      const y = wrap(rnd(i + 900) * H + t * 150, H + 8) - 4;
      for (let k = 0; k < 4; k++) px(x + k * 0.5, y - k, c);
    }
  }
  if (kind === "snow") {
    const c = pack(mix([245, 248, 252], NIGHT, (1 - LIGHT) * 0.4));
    for (let i = 0; i < 110 * amount; i++) {
      const x = wrap(rnd(i) * W + Math.sin(t * 0.8 + i) * 5 - cam * 0.5, W);
      const y = wrap(rnd(i + 900) * H + t * (9 + rnd(i + 3) * 10), H);
      px(x, y, c);
      if (i % 7 === 0) px(x + 1, y, c);
    }
  }
  if (kind === "leaves") {
    const colours = ["#d4772f", "#e3a03c", "#b8452f"].map(S);
    for (let i = 0; i < 30 * amount; i++) {
      const x = wrap(rnd(i) * W + t * 10 + Math.sin(t * 2 + i) * 6 - cam * 0.8, W);
      const y = wrap(rnd(i + 900) * H + t * (12 + rnd(i + 5) * 8), H);
      px(x, y, colours[i % 3]);
      if (Math.sin(t * 5 + i) > 0) px(x + 1, y, colours[i % 3]);
    }
  }
  if (kind === "fireflies") {
    for (let i = 0; i < 26 * amount; i++) {
      if (Math.sin(t * 2.6 + i * 1.7) < 0.35) continue;
      const x = wrap(rnd(i) * W + Math.sin(t * 0.7 + i) * 8 - cam * 0.9, W);
      px(x, H - 44 + rnd(i + 5) * 28 + Math.sin(t + i) * 3, LIT);
    }
  }
  if (kind === "birds" && amount > 0.3) {
    const c = S("#2a2f3a");
    for (let i = 0; i < 5; i++) {
      const bx = wrap(t * 16 + i * 9, W + 60) - 30;
      const by = 26 + Math.abs(i - 2) * 4 + Math.sin(t * 0.6) * 4;
      const up = Math.floor(t * 6 + i) % 2;
      px(bx - 1, by - up, c);
      px(bx, by, c);
      px(bx + 1, by - up, c);
    }
  }
}

function render(t, index) {
  cam = index * STEP + t * DRIFT;
  const p = wrap(MORNING + t / DAY + index * NUDGE, 1);
  const [top, mid, hor] = skyAt(p);
  LIGHT = clamp((Math.sin(2 * Math.PI * (p - 0.25)) + 0.2) / 0.7);
  const dark = 1 - LIGHT;
  const here = regionAt(cam + W / 2);
  const epoch = Math.floor(t / EPOCH);
  let kind = here.weather[Math.floor(rnd(epoch * 3.7 + 1) * here.weather.length)];
  if ((kind === "birds" && dark > 0.5) || (kind === "fireflies" && dark < 0.5)) kind = "clear";
  // Weather fades in over three seconds at the start of its spell and out at the end.
  const amount = STILL ? 1 : clamp(Math.min(t % EPOCH, EPOCH - (t % EPOCH)) / 3);
  const gloom = (kind === "rain" ? 0.4 : kind === "snow" ? 0.18 : 0) * amount;

  HOR = mix(hor, GREY, gloom);
  memo.clear();
  PAL = REGIONS.map((r) => {
    const hill = rgb(r.hill);
    const ground = rgb(r.ground);
    return {
      hill: pack(shade(hill, 0.25)),
      rim: pack(shade(mix(hill, WHITE, 0.2), 0.25)),
      dark: pack(shade(mix(hill, INK, 0.3), 0.2)),
      top: pack(shade(mix(ground, WHITE, 0.22))),
      body: pack(shade(ground)),
      deep: pack(shade(mix(ground, SOIL, 0.35))),
    };
  });

  drawSky(mix(top, GREY, gloom), mix(mid, GREY, gloom), HOR);
  drawStars(dark * (1 - gloom * 2), t);
  drawSunMoon(p);
  drawClouds(t, gloom ? 0.9 : 0.25 + rnd(epoch + 9) * 0.45, gloom, dark);
  drawMountains();
  drawHills();
  drawGround(t);
  drawThings(t, dark);
  drawWeather(kind, amount, t);
  const u = STILL ? 1 : (performance.now() - fadeFrom) / FADE_MS;
  if (u < 1) for (let i = 0; i < buf.length; i++) if (ORDER[i] > u) buf[i] = before[i];
  ctx.putImageData(image, 0, 0);
}
