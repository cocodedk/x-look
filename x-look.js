// X Look — content script. CSS hides the furniture; this hides promoted posts
// and label noise, and puts a click-to-show button on every image and video.

document.documentElement.classList.add("xlk");

// Promoted posts have no stable DOM hook, so match their label. Exact match only: a normal post saying "promoted" must survive.
const PROMOTED = /^(promoted|ad|sponsored|anzeige|gesponsert|paid partnership)$/i;

const EYE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C7 5 2.7 9.3 1.5 12c1.2 2.7 5.5 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';

const PLAY =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

const MEDIA = '[data-testid="tweetPhoto"], [data-testid="videoComponent"]';

// X sizes media with an aspect-ratio spacer (inline padding-bottom) next to
// the tile's wrapper; their parent is the frame to cap. No spacer: the tile.
function frameOf(media) {
  for (let n = media; n && n.tagName !== "ARTICLE"; n = n.parentElement) {
    if (n.previousElementSibling?.style.paddingBottom) return n.parentElement;
  }
  return media;
}

// Each picture or clip gets its own reveal button, so a multi-image post can
// be opened one at a time. Safe to call repeatedly: the button is re-added
// if X re-renders it away.
function hideMedia(media) {
  // X swaps a revealed preview for a player nested inside the same tile;
  // only the outermost tile is ours to blank.
  const outer = media.parentElement?.closest(MEDIA);
  if (outer) return hideMedia(outer);
  if (media.classList.contains("xlk-shown")) return;
  const clip = media.querySelector("video");
  clip?.pause();

  // X often wraps a clip in tweetPhoto as a preview with its own play button,
  // and may render that preview after the tile, so the label is re-checked.
  const isVideo =
    media.dataset.testid === "videoComponent" ||
    !!clip ||
    !!media.querySelector('[data-testid="previewInterstitial"]');
  const title = isVideo ? "Show video" : "Show image";
  let button = media.querySelector(":scope > .xlk-reveal");
  if (button?.title !== title) {
    button?.remove();
    button = document.createElement("button");
    button.type = "button";
    button.className = "xlk-reveal";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.innerHTML = `${isVideo ? PLAY : EYE}<span>${isVideo ? "Video" : "Image"}</span>`;
    media.append(button);
  }

  if (media.dataset.xlk) return;
  media.dataset.xlk = "1";
  media.classList.add("xlk-tile");
  frameOf(media).classList.add("xlk-frame");
  // The whole frame is the control, not just the little button, and the click
  // must not fall through to X's lightbox link. Capture runs first, so a click
  // on the tile, the video or the button all land here once.
  media.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      media.classList.add("xlk-shown");
      media.closest(".xlk-frame")?.classList.add("xlk-open");
      media.querySelector(":scope > .xlk-reveal")?.remove();
      media
        .querySelector("video")
        ?.play()
        .catch(() => {});
      media.querySelector('[data-testid="playButton"]')?.click();
    },
    { capture: true, once: true },
  );
}

// Post furniture with no stable hook, matched by its exact English label.
const NOISE = /^(Made with AI|Translated from .+)$/;

function scan(node) {
  // Our own buttons need no scan.
  if (!(node instanceof Element) || node.closest(".xlk-reveal")) return;

  // X re-renders a tile's insides and drops our button with them; closest()
  // also covers the node being a tile itself.
  const host = node.closest(MEDIA);
  if (host) hideMedia(host);
  for (const item of node.querySelectorAll(MEDIA)) hideMedia(item);

  if (/Made with AI|Translated from/.test(node.textContent)) {
    for (const span of node.querySelectorAll("article span")) {
      if (span.childElementCount || !NOISE.test(span.textContent)) continue;
      if (span.closest('[data-testid="tweetText"], [data-testid="User-Name"]')) continue;
      span.closest('div[dir="ltr"]')?.classList.add("xlk-gone");
    }
  }

  const labels = node.matches('[data-testid="socialContext"]')
    ? [node]
    : node.querySelectorAll('[data-testid="socialContext"]');
  for (const label of labels) {
    if (PROMOTED.test(label.textContent.trim())) label.closest("article")?.classList.add("xlk-gone");
  }
}

scan(document.body);
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) scan(node);
  }
}).observe(document.body, { childList: true, subtree: true });
