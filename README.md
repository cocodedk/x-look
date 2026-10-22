# X Look — reading mode for x.com

[![Latest release](https://img.shields.io/github/v/release/cocodedk/x-look)](https://github.com/cocodedk/x-look/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-xlook.cocode.dk-informational)](https://xlook.cocode.dk/)

A small Chrome extension (MV3) that turns x.com into something you can open at
work: no left navigation, no trends column, no promoted posts, and a timeline
that reads like a list instead of a feed.

## Website

- [English](https://xlook.cocode.dk/)
- [فارسی (Persian)](https://xlook.cocode.dk/fa/)

## What it does

- **Removes the left nav entirely.** It is gone, not hidden behind a hover.
- **Hides the right rail**: search, "Subscribe to Premium", today's trends,
  who-to-follow.
- **Hides Grok and the messages drawer**, plus the per-post Grok button,
  the view count, and the "Translated from …" and "Made with AI" lines.
- **Drops promoted/ads** from the timeline (exact label match, so a normal post
  that happens to say "promoted" stays).
- **Calms the timeline**: a 660px centred column with a hairline edge and a
  faint wash behind it, serif tweet text at 17px/1.5, hairline separators,
  the like/retweet bar dimmed until you hover a post.
- **Filters posts**: a "Filter posts" box sits in the empty gutter left of the
  column (bottom left on narrow windows). Type words and only posts containing
  all of them stay; the rest shrink to a slim "hidden by filter" line (so X
  does not keep loading more on its own) and are counted under the box. Clear
  the box to see everything again.
- **Sorts the posts on the page**: a menu under the filter box re-orders the
  posts X has loaded, newest first, most liked first, or popular now (likes
  per hour since posting, so new and popular at once), and "X's order" puts
  them back. It sorts what is on the page, not your whole timeline.
- **Blanks out images and videos**: each picture becomes a compact grey tile
  with an eye "Image" button, each clip a tile with a play "Video" button
  (hidden clips are paused). Click anywhere on the tile and only that item
  appears, up to 300px, so a four-photo post is opened one picture at a time;
  a revealed clip starts playing. Clicking a tile does not follow the media
  link.

It only changes layout and typography. X's own light/dim/dark theme is left
alone, so it works in all three.

## Install in Chrome

You can install X Look straight from GitHub. It works in Google Chrome,
Microsoft Edge, Brave and other Chromium-based browsers. In the browser it is
called **Calm Reader for X**, with a yellow X icon.

Before you start:

- You will turn on **Developer mode**, a Chrome setting that lets you add an
  extension from a folder on your computer. Some work computers block this
  setting. If the switch is missing or greyed out, your IT department can tell
  you whether you may use it.
- An extension installed this way does not update itself. To get a new version,
  follow [Update to a new version](#update-to-a-new-version) below. A Chrome Web
  Store version, which updates automatically, has been submitted and is waiting
  for Google's review.

### Install

1. Download [**x-look.zip**](https://github.com/cocodedk/x-look/releases/latest/download/x-look.zip).
   This link always gives you the latest version.
2. Unzip it into a folder you will keep, for example `Documents/x-look`.
   Chrome runs the extension from this folder, so if you delete or move the
   folder, the extension stops working.
3. In Chrome's address bar, type `chrome://extensions` and press Enter.
   The Extensions page opens.
4. Turn on **Developer mode** in the top-right corner of that page.
   A **Load unpacked** button appears.
5. Click **Load unpacked** and choose the folder from step 2, the one that
   contains `manifest.json`. A card named **Calm Reader for X** appears.
6. Click the puzzle-piece **Extensions** button in Chrome's toolbar, then click
   the pin next to **Calm Reader for X**. The yellow X icon now stays in the
   toolbar.
7. Open or reload x.com. If the left menu is gone and the posts sit in one
   quiet column, it is working.

In Edge, the page in step 3 is `edge://extensions` and **Developer mode** is in
the left panel. In Brave, the page is `brave://extensions`. The other steps are
the same.

### Switch it off and on

Click the yellow X icon in the toolbar. The icon shows **off**, and x.com looks
as it normally does in every tab. Click it again to switch X Look back on.
Chrome remembers your choice.

### Update to a new version

1. Download [**x-look.zip**](https://github.com/cocodedk/x-look/releases/latest/download/x-look.zip) again.
2. Unzip it into the same folder, replacing the old files.
3. On `chrome://extensions`, click the reload arrow on the **Calm Reader for X**
   card.
4. Reload x.com.

[GitHub Releases](https://github.com/cocodedk/x-look/releases) lists every
version and what changed in it.

### Remove it

On `chrome://extensions`, click **Remove** on the **Calm Reader for X** card.
You can then delete the folder.

### From the source code (for developers)

1. Run `git clone https://github.com/cocodedk/x-look.git`.
2. On `chrome://extensions`, turn on **Developer mode**.
3. Click **Load unpacked** and choose the cloned folder.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | MV3 manifest and content script match |
| `x-look.css` | All the hiding and reading-list styling |
| `background.js` | Toolbar icon: switches X Look off and on |
| `sort.js` | The sort menu: re-orders the loaded posts by time, likes or likes per hour |
| `controls.css` | Styles for X Look's own controls (reveal buttons, filter box, sort menu) |
| `x-look.js` | Promoted-post and label hiding, the image/video reveal buttons, the filter box, and following the on/off switch |
| `icons/` | Extension icons |
| `website/` | Source of [xlook.cocode.dk](https://xlook.cocode.dk/) (English + Persian) |

## Caveats

- X changes its DOM regularly. Everything here keys off stable-ish hooks
  (`header[role="banner"]`, `[data-testid="sidebarColumn"]`,
  `[data-testid="primaryColumn"]`, `[data-testid="tweet"]`,
  `[data-testid="tweetPhoto"]`, `[data-testid="videoComponent"]`), not
  generated class names, so breakage should
  be rare.
- Narrow (mobile-width) windows keep X's bottom bar, so navigation still works
  where there is no room for, or use of, a left nav.

## Privacy

X Look collects nothing and sends nothing anywhere. It makes no network
requests of its own, runs only on x.com and twitter.com, and stores one
setting (on or off) in Chrome's local extension storage. Filter words and the
hidden count live only in the tab's memory. It does not stop X's own data
collection, and hidden pictures and videos are still downloaded from X; they
are only kept out of sight until you click. The full statement, including the website's, is at
[xlook.cocode.dk/#privacy](https://xlook.cocode.dk/#privacy).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, packaging the release
zip and the PR checklist.

## Author

**Babak Bandpey** — [https://cocode.dk](https://cocode.dk) | [LinkedIn](https://linkedin.com/in/babakbandpey) | [GitHub](https://github.com/cocodedk)

## License

Apache-2.0 | © 2026 [Cocode](https://cocode.dk) | Created by [Babak Bandpey](https://linkedin.com/in/babakbandpey)
