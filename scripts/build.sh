#!/usr/bin/env bash
# Build the extension zip with VERSION stamped into manifest.json.
#   build.sh vX.Y.Z   ->  dist/x-look.zip and dist/x-look-vX.Y.Z.zip
# The working-tree manifest.json is never modified.
set -euo pipefail

tag=${1:-}
[[ "$tag" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || { echo "usage: $0 vX.Y.Z" >&2; exit 1; }
version=${tag#v}

cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/x-look
cp -r background.js x-look.css x-look.js icons dist/x-look/
jq --arg v "$version" '.version = $v' manifest.json > dist/x-look/manifest.json
(cd dist/x-look && zip -qrX ../x-look.zip manifest.json background.js x-look.css x-look.js icons)
cp dist/x-look.zip "dist/x-look-$tag.zip"

# Verify what ships, not what was meant to ship.
got=$(unzip -p dist/x-look.zip manifest.json | jq -r .version)
[ "$got" = "$version" ] || { echo "manifest in zip says $got, expected $version" >&2; exit 1; }
cmp -s dist/x-look.zip "dist/x-look-$tag.zip"
echo "built dist/x-look.zip and dist/x-look-$tag.zip (manifest $got)"
