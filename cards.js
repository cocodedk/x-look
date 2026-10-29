// Cards mode: one post per screen over a moving pixel world. cards.css lays
// the posts out as cards and snaps the page from one to the next; this adds
// the Cards button by the filter box (remembered in chrome.storage), marks
// each post short or long so its type can step down, and drives the world.
// Loaded last, after x-look.js (root, on(), box) and the world's files.

const toggle = document.createElement("button");
toggle.type = "button";
toggle.className = "xlk-cards-toggle";
toggle.textContent = "Cards";
toggle.setAttribute("aria-label", "Show one post per screen");
toggle.addEventListener("click", () => {
  chrome.storage.local.set({ [CARDS_KEY]: !root.classList.contains("xlk-cards") });
});
box.append(toggle);
// Our own element at the very top of the page, so the compose box above the
// first post stays reachable once the page snaps.
const peak = document.createElement("div");
peak.className = "xlk-top";
document.body.append(world, peak);
root.style.setProperty("--xlk-head", `${HEAD}px`);

// The slot on screen: of the slots whose top has passed the middle of the
// window, the lowest. Sorting moves cells around, so DOM order is no guide.
function current() {
  let best = null;
  let bestTop = -Infinity;
  for (const slot of document.querySelectorAll(SLOT)) {
    const y = slot.getBoundingClientRect().top;
    if (y <= innerHeight / 2 && y > bestTop) [best, bestTop] = [slot, y];
  }
  return best;
}

// Big type for a line or two, smaller for a long read. The first tweetText is
// the post's own; a quoted post's comes after it.
function mark() {
  for (const article of document.querySelectorAll('[data-testid="primaryColumn"] article')) {
    const n = article.querySelector('[data-testid="tweetText"]')?.textContent.length ?? 0;
    const size = n < SHORT ? "short" : n > LONG ? "long" : "";
    if ((article.dataset.xlkSize ?? "") !== size) article.dataset.xlkSize = size;
  }
}

// Each new post on screen moves the world one place on, back when scrolling up.
// Undefined until the first frame, so the world is always drawn once.
let shown;
let index = 0;
let lastY = scrollY;
let last = 0;
let loop = 0;
const start = performance.now();
function tick(now) {
  loop = requestAnimationFrame(tick);
  if (now - last < FRAME_MS) return;
  last = now;
  mark();
  root.classList.toggle("xlk-snap", document.querySelector(SLOT) !== null);
  // The card takes X's own page colour, light or dark, nearly opaque, and
  // follows it when the theme changes.
  const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
  const card = `rgba(${r}, ${g}, ${b}, ${CARD_ALPHA})`;
  if (root.style.getPropertyValue("--xlk-card") !== card) root.style.setProperty("--xlk-card", card);
  const slot = current();
  const moved = slot !== shown;
  if (moved) {
    if (shown && slot) index += scrollY >= lastY ? 1 : -1;
    shown = slot;
    turn();
  }
  lastY = scrollY;
  // With reduced motion the world holds still and changes only with the post.
  if (!STILL || moved) render(STILL ? 0 : ((now - start) / 1000) * SPEED, index);
}

// The loop runs only while Cards and X Look are both on.
function run() {
  cancelAnimationFrame(loop);
  if (on() && root.classList.contains("xlk-cards")) loop = requestAnimationFrame(tick);
}

function cards(want) {
  if (want === root.classList.contains("xlk-cards")) return;
  const anchor = current();
  root.classList.toggle("xlk-cards", want);
  toggle.setAttribute("aria-pressed", String(want));
  run();
  // Bring the post that was on screen back once X has re-laid the timeline out.
  if (!anchor) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      scrollTo(0, anchor.getBoundingClientRect().top + scrollY - HEAD);
    }),
  );
}

chrome.storage.local.get(CARDS_KEY).then((stored) => cards(Boolean(stored[CARDS_KEY])));
chrome.storage.onChanged.addListener((changes) => {
  if (changes[CARDS_KEY]) cards(Boolean(changes[CARDS_KEY].newValue));
  // x-look.js, loaded first, has already switched the "xlk" class by now.
  if (changes.off) run();
});
