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
- **Blanks out images and videos**: each picture becomes a compact grey tile
  with an eye "Image" button, each clip a tile with a play "Video" button
  (hidden clips are paused). Click anywhere on the tile and only that item
  appears, up to 300px, so a four-photo post is opened one picture at a time;
  a revealed clip starts playing. Clicking a tile does not follow the media
  link.

It only changes layout and typography. X's own light/dim/dark theme is left
alone, so it works in all three.

## Download

[**Download X Look**](https://github.com/cocodedk/x-look/releases/latest/download/x-look.zip)

Every release on [GitHub Releases](https://github.com/cocodedk/x-look/releases)
attaches `x-look.zip`, the packaged extension.

## Install

### From the release zip

1. Download `x-look.zip` (link above) and unzip it into a folder you will keep
   (Chrome loads the extension from that folder, so do not delete it).
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. **Load unpacked** → pick the unzipped folder (the one containing
   `manifest.json`).

To update, unzip the new release over the same folder and click the reload icon
on the extension card.

### From source

1. `git clone https://github.com/cocodedk/x-look.git`
2. Open `chrome://extensions`, turn on **Developer mode**.
3. **Load unpacked** → pick the cloned folder.

Works in Chrome, Edge and other Chromium browsers.

Click the X Look icon in the toolbar to switch it off and on in every x.com tab;
the icon shows an "off" badge while it is off, and the choice is remembered.
Pin the icon from the extensions (puzzle) menu to keep it in reach.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | MV3 manifest and content script match |
| `x-look.css` | All the hiding and reading-list styling |
| `background.js` | Toolbar icon: switches X Look off and on |
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, packaging the release
zip and the PR checklist.

## Author

**Babak Bandpey** — [https://cocode.dk](https://cocode.dk) | [LinkedIn](https://linkedin.com/in/babakbandpey) | [GitHub](https://github.com/cocodedk)

## License

Apache-2.0 | © 2026 [Cocode](https://cocode.dk) | Created by [Babak Bandpey](https://linkedin.com/in/babakbandpey)
