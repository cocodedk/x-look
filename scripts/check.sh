#!/bin/sh
# Lint everything in the repo: the same checks run in CI and in the pre-commit hook.
set -eu
cd "$(git rev-parse --show-toplevel)"

# Use the tool on PATH, else the pinned version via npx.
run() { tool=$1 pkg=$2; shift 2; if command -v "$tool" >/dev/null 2>&1; then "$tool" "$@"; else npx --yes "$pkg" "$@"; fi; }

# JS: extension, website/**, .github scripts.
run oxlint oxlint@1.78.0 --deny-warnings .

# CSS/JSON formatting and lint (config in biome.json; JS is oxlint's).
run biome @biomejs/biome@2.5.8 ci .

# manifest.json: valid JSON with the required MV3 keys.
node -e '
const m = JSON.parse(require("fs").readFileSync("manifest.json", "utf8"));
const missing = ["manifest_version", "name", "version"].filter((k) => !(k in m));
if (missing.length) throw new Error("manifest.json missing: " + missing.join(", "));
if (m.manifest_version !== 3) throw new Error("manifest_version must be 3");
console.log("manifest.json OK: MV3", m.name, m.version);
'

# Shell scripts: hooks, scripts/, .github scripts.
files=$(find .githooks scripts .github -type f \( -path '.githooks/*' -o -name '*.sh' \) 2>/dev/null || true)
# shellcheck disable=SC2086 # paths are repo-controlled, no spaces
run shellcheck shellcheck@4.1.0 $files
