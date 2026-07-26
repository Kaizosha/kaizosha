#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
DIST="$ROOT/dist"
CLIENT="$DIST/client"

rm -rf "$DIST"
mkdir -p "$CLIENT" "$DIST/server" "$DIST/.openai"

for file in 404.html contact.html creator.html index.html privacy.html terms.html \
  icon.png robots.txt site.webmanifest sitemap.xml; do
  cp "$ROOT/$file" "$CLIENT/$file"
done

for route in hush i sekai tlpinch together; do
  mkdir -p "$CLIENT/$route"
  cp "$ROOT/$route/index.html" "$CLIENT/$route/index.html"
done

rsync -a --exclude='* 2.*' "$ROOT/assets/" "$CLIENT/assets/"
cp "$ROOT/tools/sites-static-worker.js" "$DIST/server/index.js"
cp "$ROOT/.openai/hosting.json" "$DIST/.openai/hosting.json"

printf 'Built static site in %s\n' "$DIST"
