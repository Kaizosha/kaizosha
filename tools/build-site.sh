#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
DIST="$ROOT/dist"
CLIENT="$DIST/client"

rm -rf "$DIST"
mkdir -p "$CLIENT" "$DIST/server"

for file in _headers 404.html contact.html index.html privacy.html terms.html \
  icon.png robots.txt site.webmanifest sitemap.xml; do
  cp "$ROOT/$file" "$CLIENT/$file"
done

mkdir -p "$CLIENT/assets/styles" "$CLIENT/assets/media/social"

for file in brand.css markdown.css; do
  cp "$ROOT/assets/styles/$file" "$CLIENT/assets/styles/$file"
done

cp "$ROOT/assets/media/social/kaizosha-social-card-markdown-2026.png" \
  "$CLIENT/assets/media/social/kaizosha-social-card-markdown-2026.png"
cp "$ROOT/tools/sites-static-worker.js" "$DIST/server/index.js"

printf 'Built static site in %s\n' "$DIST"
