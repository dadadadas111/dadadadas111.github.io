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

render() { # <source.html> <output.pdf>
  "$CHROME" --headless --disable-gpu --no-sandbox \
    --print-to-pdf="$2" --no-pdf-header-footer \
    "file://$here/$1" 2>/dev/null
  echo "Wrote $2 ($(du -h "$2" | cut -f1))"
}

out="$root/Nguyen_Thanh_Long_CV.pdf"
render index.html "$out"
# Keep the legacy filename working for links already in the wild
cp "$out" "$root/Nguyen_Thanh_Long CV.pdf"

# Vietnamese edition
render index.vi.html "$root/Nguyen_Thanh_Long_CV_VI.pdf"
