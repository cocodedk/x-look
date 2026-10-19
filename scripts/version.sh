#!/usr/bin/env bash
# Version from git tags (canonical). Only exact vX.Y.Z tags count.
#   version.sh latest       newest vX.Y.Z tag, or nothing
#   version.sh next BUMP    tag the next release gets (BUMP: patch|minor|major)
# With no tags the first release is v1.1.0 (the version x-look shipped as before
# tags existed), whatever the bump, so versions never go backwards.
set -euo pipefail

FIRST=v1.1.0

latest() {
  git tag --list 'v*' | grep -E '^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$' \
    | sort -V | tail -n1 || true
}

next() {
  local bump=$1 tag
  case "$bump" in patch|minor|major) ;; *) echo "bump must be patch, minor or major: '$bump'" >&2; exit 1 ;; esac
  tag=$(latest)
  [ -z "$tag" ] && { echo "$FIRST"; return; }
  IFS=. read -r ma mi pa <<<"${tag#v}"
  case "$bump" in
    major) ma=$((ma+1)); mi=0; pa=0 ;;
    minor) mi=$((mi+1)); pa=0 ;;
    patch) pa=$((pa+1)) ;;
  esac
  echo "v$ma.$mi.$pa"
}

case "${1:-}" in
  latest) latest ;;
  next) next "${2:-}" ;;
  *) echo "usage: $0 latest | next patch|minor|major" >&2; exit 1 ;;
esac
