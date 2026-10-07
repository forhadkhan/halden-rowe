#!/usr/bin/env bash
# Rebuilds src/assets/fonts/*.woff2: the @fontsource latin files cut down to the characters the site's copy uses
# (src/assets/fonts/subset-unicodes.txt). Variable axes (opsz, wght) and every OpenType feature are kept.
# Run it after adding a character to that list; tests/fonts.test.ts names any character the copy uses outside it.
# Needs uv (https://docs.astral.sh/uv/); fonttools runs through uvx and is not a project dependency.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/node_modules/@fontsource-variable"
out="$root/src/assets/fonts"
unicodes="$(tr -d '[:space:]' < "$out/subset-unicodes.txt")"

for file in \
  newsreader/files/newsreader-latin-opsz-normal \
  newsreader/files/newsreader-latin-opsz-italic \
  schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal; do
  uvx --from 'fonttools[woff]==4.*' pyftsubset "$src/$file.woff2" \
    --unicodes="$unicodes" --layout-features='*' --flavor=woff2 \
    --output-file="$out/$(basename "$file").woff2"
done

cp "$src/newsreader/LICENSE" "$out/OFL-newsreader.txt"
cp "$src/schibsted-grotesk/LICENSE" "$out/OFL-schibsted-grotesk.txt"
ls -l "$out"/*.woff2
