// X Look — content script. CSS hides the furniture; this replaces promoted
// posts and puts a click-to-show button on every image.

document.documentElement.classList.add("xlk");

// Promoted posts are the one bit of noise without a stable DOM hook, so match
// their label. Exact match only: a normal post saying "promoted" must survive.
const PROMOTED = /^(promoted|ad|sponsored|anzeige|gesponsert|paid partnership)$/i;

const EYE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C7 5 2.7 9.3 1.5 12c1.2 2.7 5.5 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';

// Each image gets its own reveal button, so a multi-image post can be opened
// one picture at a time. Re-renders are tolerated: no button, no wrapper.
function hideImage(photo) {
  if (photo.classList.contains("xlk-shown") || photo.querySelector(".xlk-reveal")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "xlk-reveal";
  button.title = "Show image";
  button.setAttribute("aria-label", "Show image");
  button.innerHTML = `${EYE}<span>Image</span>`;
  button.addEventListener("click", (event) => {
    // The photo usually sits inside a link to the lightbox; don't follow it.
    event.preventDefault();
    event.stopPropagation();
    photo.classList.add("xlk-shown");
    button.remove();
  });
  photo.append(button);
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

  const photos = node.matches('[data-testid="tweetPhoto"]')
    ? [node]
    : node.querySelectorAll('[data-testid="tweetPhoto"]');
  for (const photo of photos) hideImage(photo);
}

scan(document.body);
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) scan(node);
  }
}).observe(document.body, { childList: true, subtree: true });
