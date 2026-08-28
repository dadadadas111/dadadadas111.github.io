#!/usr/bin/env bash
# Render cv/index.html to PDF. Regenerate after editing the CV.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(dirname "$here")"

# Find a Chromium-family browser
for c in \
  "$HOME/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome" \
  /opt/microsoft/msedge/msedge \
  "$(command -v google-chrome || true)" \
  "$(command -v chromium || true)"; do
  [ -n "$c" ] && [ -x "$c" ] && CHROME="$c" && break
done
: "${CHROME:?No Chromium-family browser found}"

out="$root/Nguyen_Thanh_Long_CV.pdf"
"$CHROME" --headless --disable-gpu --no-sandbox \
  --print-to-pdf="$out" --no-pdf-header-footer \
  "file://$here/index.html" 2>/dev/null

# Keep the legacy filename working for links already in the wild
cp "$out" "$root/Nguyen_Thanh_Long CV.pdf"
echo "Wrote $out ($(du -h "$out" | cut -f1))"
