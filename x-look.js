// X Look — content script. CSS hides the furniture; this replaces promoted
// posts and puts a click-to-show button on every image.

document.documentElement.classList.add("xlk");

// Promoted posts are the one bit of noise without a stable DOM hook, so match
// their label. Exact match only: a normal post saying "promoted" must survive.
const PROMOTED = /^(promoted|ad|sponsored|anzeige|gesponsert|paid partnership)$/i;

const EYE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C7 5 2.7 9.3 1.5 12c1.2 2.7 5.5 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';

const PLAY =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

const MEDIA = '[data-testid="tweetPhoto"], [data-testid="videoComponent"]';

// Each picture or clip gets its own reveal button, so a multi-image post can
// be opened one at a time. Re-renders are tolerated: no button, no wrapper.
function hideMedia(media) {
  if (media.classList.contains("xlk-shown") || media.querySelector(".xlk-reveal")) return;
  const video = media.dataset.testid === "videoComponent";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "xlk-reveal";
  button.title = video ? "Show video" : "Show image";
  button.setAttribute("aria-label", button.title);
  button.innerHTML = `${video ? PLAY : EYE}<span>${video ? "Video" : "Image"}</span>`;
  button.addEventListener("click", (event) => {
    // The media usually sits inside a link to the lightbox; don't follow it.
    event.preventDefault();
    event.stopPropagation();
    media.classList.add("xlk-shown");
    button.remove();
  });
  media.querySelector("video")?.pause();
  media.append(button);
}

function scan(node) {
  if (!(node instanceof Element)) return;

  const labels = node.matches('[data-testid="socialContext"]')
    ? [node]
    : node.querySelectorAll('[data-testid="socialContext"]');
  for (const label of labels) {
    if (!PROMOTED.test(label.textContent.trim())) continue;
    label.closest("article")?.style.setProperty("display", "none", "important");
  }

  const media = node.matches(MEDIA) ? [node] : node.querySelectorAll(MEDIA);
  for (const item of media) hideMedia(item);
}

scan(document.body);
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) scan(node);
  }
}).observe(document.body, { childList: true, subtree: true });
