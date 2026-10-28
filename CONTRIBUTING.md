# Contributing to X Look

## Local Setup
1. Install Chrome, Edge or another Chromium browser.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick this folder.
3. After changing a file, click the reload icon on the extension card and refresh x.com.

There are no dependencies and no build step: the extension is `manifest.json`, `background.js`, the CSS and JS files the manifest lists, and `icons/`.

## Install Git Hooks
```
./scripts/install-hooks.sh
```

## Build and Test Commands
```
# Lint and validate (same as CI and the pre-commit hook)
./scripts/check.sh

# Package a release zip locally (dist/x-look.zip, version stamped from the tag)
./scripts/build.sh "$(./scripts/version.sh next patch)"
```

## Releases
Git tags are the version. Run the **Release** workflow (Actions → Release → Run workflow) and pick a bump; it tags, stamps the version into the zip's `manifest.json` and publishes `x-look.zip`. Don't edit `version` in `manifest.json` by hand.

## Coding Style
- Plain JavaScript and CSS, no frameworks, no bundler.
- Select X's DOM by stable hooks (`data-testid`, `role`, landmark elements), never by generated class names.
- Change layout and typography only; leave X's light/dim/dark theme colours alone.
- Keep files small and focused.

## PR Checklist
- [ ] `./scripts/check.sh` passes.
- [ ] Manual test completed on x.com for changed functionality (light, dim and dark themes; wide and narrow windows).
- [ ] Updated docs if behavior changed.
