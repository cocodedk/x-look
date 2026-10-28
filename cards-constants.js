// Cards mode — the numbers and selectors it is tuned by, in one place. Loaded
// before the other cards files, which share these through the content script's
// global scope.
// Everything here is used by the files loaded after it (see manifest.json).
/* oxlint-disable no-unused-vars */

// The pixel world: a 256 × 144 buffer scaled up to the window, with the
// horizon and the lake's surface at these rows.
const W = 256;
const H = 144;
const HORIZON = 94;
const WATER = H - 31;

// World time, in seconds: one day, and one spell of weather.
const DAY = 180;
const EPOCH = 20;
// World time runs at a quarter of real time, so a day takes twelve minutes.
const SPEED = 0.25;
// The day starts mid-morning, and each post moves the clock on a little.
const MORNING = 0.3;
const NUDGE = 0.1;

// World pixels between posts, the width of one region (so each post is a new
// place), and the spacing of the trees and houses along the ground.
const STEP = 700;
const REGION = 700;
const CELL = 26;
// How far the camera drifts per second of world time.
const DRIFT = 4;

// Twenty frames a second, and a 1.6-second dissolve from one post's place to the next.
const FRAME_MS = 50;
const FADE_MS = 1600;

// Post text, in characters, that counts as short (largest type) or long (smallest).
const SHORT = 120;
const LONG = 400;

// The card's opacity over the world, and the height of X's header above the column.
const CARD_ALPHA = 0.92;
const HEAD = 53;

// A post's slot: a timeline cell holding a post the filter keeps (cards.css says the same).
const SLOT =
  '[data-testid="primaryColumn"] [data-testid="cellInnerDiv"]:has(article:not(.xlk-filtered, .xlk-gone))';
const CARDS_KEY = "cards";
