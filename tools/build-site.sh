#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
DIST="$ROOT/dist"
CLIENT="$DIST/client"

rm -rf "$DIST"
mkdir -p "$CLIENT" "$DIST/server"

for file in 404.html contact.html index.html privacy.html terms.html \
  icon.png robots.txt site.webmanifest sitemap.xml; do
  cp "$ROOT/$file" "$CLIENT/$file"
done

rsync -a "$ROOT/assets/" "$CLIENT/assets/"
cp "$ROOT/tools/sites-static-worker.js" "$DIST/server/index.js"

printf 'Built static site in %s\n' "$DIST"
