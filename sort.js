// Sorting: re-stacks the posts X has on the page, newest first, most liked
// first, or popular now (likes per hour). X places each timeline cell with
// transform: translateY; this sets only the separate CSS translate property,
// so X's own layout stays intact. Loaded after x-look.js, whose filter box
// (`box`), root and on() it uses.

const sort = document.createElement("select");
sort.className = "xlk-sort";
sort.setAttribute("aria-label", "Sort the posts on the page");
for (const [value, label] of [
  ["", "X's order"],
  ["time", "Newest first"],
  ["likes", "Most liked"],
  ["hot", "Popular now"],
]) {
  sort.add(new Option(label, value));
}
sort.addEventListener("keydown", (event) => event.stopPropagation());
box.append(sort);

const KEYS = {
  time: (cell) => Date.parse(cell.querySelector("article time")?.getAttribute("datetime")) || 0,
  // The like button's label starts with the exact count: "477 Likes. Like",
  // "1,234", "1 234" or Persian "۱٬۲۳۴" depending on X's language.
  likes: (cell) => {
    const label = (
      cell
        .querySelector('article [data-testid="like"], article [data-testid="unlike"]')
        ?.getAttribute("aria-label") ?? ""
    )
      .replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 0x6f0)
      .replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x660);
    return Number(label.match(/^[\d.,٬\s]+/)?.[0].replace(/\D/g, "") || 0);
  },
  // New and popular at once: likes per hour since posting (+1 so a post
  // from the last minutes does not divide by almost nothing).
  hot: (cell) => KEYS.likes(cell) / ((Date.now() - KEYS.time(cell)) / 36e5 + 1),
};

function shift(cell, dy) {
  const value = dy ? `0 ${dy}px` : "";
  if ((cell.dataset.xlkShift ?? "") === value) return;
  cell.dataset.xlkShift = value;
  cell.style.translate = value;
}

function restack() {
  const cells = [
    ...document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="cellInnerDiv"]'),
  ].map((cell) => ({
    cell,
    y: Number(cell.style.transform.match(/-?[\d.]+/)?.[0] || 0),
    h: cell.offsetHeight,
  }));
  if (!on() || !sort.value) {
    for (const { cell } of cells) shift(cell, 0);
    return;
  }
  cells.sort((a, b) => a.y - b.y);
  const key = KEYS[sort.value];
  const posts = cells
    .filter(({ cell }) => cell.querySelector("article"))
    .map((post) => ({ ...post, k: key(post.cell) }))
    .sort((a, b) => b.k - a.k);
  const rest = cells.filter(({ cell }) => !cell.querySelector("article"));
  let top = cells[0]?.y ?? 0;
  for (const { cell, y, h } of [...posts, ...rest]) {
    shift(cell, top - y);
    top += h;
  }
}

// While a sort is chosen, re-stack once a frame after X changes the timeline
// or X Look is switched off or on.
let queued = false;
const watcher = new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    restack();
  });
});
sort.addEventListener("change", () => {
  watcher.disconnect();
  if (sort.value) {
    watcher.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }
  restack();
});
