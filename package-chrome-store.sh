#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
DIST_DIR="$ROOT_DIR/dist"

VERSION=$(
  sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
    "$ROOT_DIR/manifest.json" \
    | head -n 1
)

if [ -z "${VERSION:-}" ]; then
  echo "Could not read version from manifest.json" >&2
  exit 1
fi

ZIP_PATH="$DIST_DIR/json-visualiser-chrome-store-$VERSION.zip"

mkdir -p "$DIST_DIR"
rm -f "$ZIP_PATH"

cd "$ROOT_DIR"
zip -r "$ZIP_PATH" manifest.json content.js icons

printf 'Created %s\n' "$ZIP_PATH"
