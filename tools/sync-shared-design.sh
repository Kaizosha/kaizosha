#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
MODE=sync

if [ "${1:-}" = "--check" ]; then
  MODE=check
  shift
fi

if [ "$#" -eq 0 ]; then
  set -- \
    "$ROOT/../together-web" \
    "$ROOT/../hush-web" \
    "$ROOT/../morph-web" \
    "$ROOT/../modscan-web"
fi

FILES="
BRAND.md
DESIGN_SYSTEM.md
icon.png
assets/styles/brand.css
assets/styles/markdown.css
assets/scripts/document-navigation.js
assets/scripts/site-motion.js
"

STATUS=0

for TARGET in "$@"; do
  if [ ! -d "$TARGET/assets" ]; then
    printf 'Shared-design target not found: %s\n' "$TARGET" >&2
    STATUS=1
    continue
  fi

  for FILE in $FILES; do
    SOURCE_FILE="$ROOT/$FILE"
    TARGET_FILE="$TARGET/$FILE"

    if [ "$MODE" = check ]; then
      if ! cmp -s "$SOURCE_FILE" "$TARGET_FILE"; then
        printf 'Out of sync with %s: %s\n' "$TARGET" "$FILE" >&2
        STATUS=1
      fi
      continue
    fi

    mkdir -p "$(dirname "$TARGET_FILE")"
    cp "$SOURCE_FILE" "$TARGET_FILE"
    printf 'Synced %s to %s\n' "$FILE" "$TARGET"
  done
done

if [ "$STATUS" -ne 0 ]; then
  exit "$STATUS"
fi

if [ "$MODE" = check ]; then
  printf 'Shared design is in sync with all requested targets\n'
fi
