# X Look — reading mode for x.com

A small Chrome extension (MV3) that turns x.com into something you can open at
work: no left navigation, no trends column, no promoted posts, and a timeline
that reads like a list instead of a feed.

## What it does

- **Removes the left nav entirely.** It is gone, not hidden behind a hover.
- **Hides the right rail**: search, "Subscribe to Premium", today's trends,
  who-to-follow.
- **Hides Grok and the messages drawer.**
- **Drops promoted/ads** from the timeline (exact label match, so a normal post
  that happens to say "promoted" stays).
- **Calms the timeline**: a 660px centred column with a hairline edge and a
  faint wash behind it, serif tweet text at 17px/1.65, hairline separators,
  the like/retweet bar dimmed until you hover a post.
- **Blanks out images and videos**: each picture becomes a compact grey tile
  with an eye "Image" button, each clip a tile with a play "Video" button
  (hidden clips are paused). Click anywhere on the tile and only that item
  appears, up to 300px, so a four-photo post is opened one picture at a time;
  a revealed clip starts playing. Clicking a tile does not follow the media
  link.

It only changes layout and typography. X's own light/dim/dark theme is left
alone, so it works in all three.

## Install (unpacked)

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. **Load unpacked** → pick this folder.

Works in Chrome, Edge and other Chromium browsers.

To turn it off, disable the extension in `chrome://extensions` (there is no
in-page toggle — the nav stays gone while the extension is on).

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | MV3 manifest and content script match |
| `x-look.css` | All the hiding and reading-list styling |
| `x-look.js` | Promoted-post filter and the image/video reveal buttons |
| `icons/` | Extension icons |

## Caveats

- X changes its DOM regularly. Everything here keys off stable-ish hooks
  (`header[role="banner"]`, `[data-testid="sidebarColumn"]`,
  `[data-testid="primaryColumn"]`, `[data-testid="tweet"]`,
  `[data-testid="tweetPhoto"]`, `[data-testid="videoComponent"]`), not
  generated class names, so breakage should
  be rare.
- Narrow (mobile-width) windows keep X's bottom bar, so navigation still works
  where there is no room for, or use of, a left nav.
