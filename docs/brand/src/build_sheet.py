"""Build docs/brand/logo-options.html, the preview sheet for the three logo options (Picasso, 2026-10-07).

Run after build_logos.py:
  python3 docs/brand/src/build_sheet.py

Each option is shown on limewash and on night, at display size, at 120 CSS px wide (the wordmark minimum)
and at the header height (14 and 18 px), with the monogram at 96, 48 and 28 px and the favicon at its true
16 and 32 px plus a pixelated 8x enlargement of the 16 px raster.
"""

from __future__ import annotations

import re
from pathlib import Path

BRAND = Path(__file__).resolve().parents[1]
OPTIONS = [
    ("a-swing", "A. Swing", "The R's bowl is a floor-plan door swing; heavy walls, light swing (plan line weights)."),
    ("b-et", "B. Et", "The old Et ampersand as the mark; high-contrast drawn capitals."),
    ("c-hinge", "C. Hinge", "A hinge as the ampersand: two leaves on one pin; geometric lowercase."),
    ("../previous", "Previous (for comparison)", "Monoline capitals and the arched H/R doorway."),
]


def inline(path: Path) -> str:
    """Inline an SVG so currentColor follows the scheme; drop title, comments and fixed size."""
    src = path.read_text()
    src = re.sub(r"<title[\s\S]*?</title>", "", src)
    src = re.sub(r"<!--[\s\S]*?-->", "", src)
    src = re.sub(r'\s(width|height)="[^"]*"', "", src, count=2)
    src = src.replace("<svg ", '<svg aria-hidden="true" ', 1)
    return src.strip()


def section(key: str, title: str, idea: str) -> str:
    folder = BRAND / "options" / key
    wm, mono = inline(folder / "wordmark.svg"), inline(folder / "monogram.svg")
    fav = f"options/{key}/favicon.svg"
    tiles = []
    for scheme in ("light", "night"):
        tiles.append(f"""
      <div class="tile {scheme}">
        <div class="wm-big">{wm}</div>
        <div class="row">
          <div class="wm" style="width:120px">{wm}</div>
          <div class="wm" style="height:14px">{wm}</div>
          <div class="wm" style="height:18px">{wm}</div>
        </div>
        <div class="row">
          <div class="mono" style="width:96px">{mono}</div>
          <div class="mono" style="width:48px">{mono}</div>
          <div class="mono" style="width:28px">{mono}</div>
          <div class="mono" style="width:24px">{mono}</div>
        </div>
      </div>""")
    return f"""
  <section>
    <h2>{title}</h2>
    <p>{idea}</p>
    <div class="pair">{''.join(tiles)}</div>
    <div class="fav">
      <img src="{fav}" width="16" height="16" alt="">
      <img src="{fav}" width="32" height="32" alt="">
      <img src="{fav}" width="64" height="64" alt="">
      <canvas data-src="{fav}" width="16" height="16"></canvas>
      <span>favicon: 16, 32, 64 px, and the 16 px raster enlarged 8x</span>
    </div>
  </section>"""


def main():
    body = "".join(section(*o) for o in OPTIONS)
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Halden &amp; Rowe: logo options</title>
<style>
  body {{ margin: 0; padding: 32px; background: #F8F6F0; color: #1A1E1D; font: 15px/1.5 system-ui, sans-serif; }}
  h1 {{ font-size: 22px; margin: 0 0 4px; }}
  h2 {{ font-size: 18px; margin: 0; }}
  section {{ margin: 28px 0 40px; }}
  section > p {{ margin: 2px 0 12px; color: #555A56; }}
  .pair {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
  .tile {{ padding: 28px; display: grid; gap: 22px; }}
  .light {{ background: #EEECE5; color: #1A1E1D; }}
  .night {{ background: #121717; color: #ECE8DF; }}
  .wm-big svg {{ width: 100%; height: auto; display: block; overflow: visible; }}
  .row {{ display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }}
  .wm svg {{ display: block; height: 100%; width: 100%; overflow: visible; }}
  .wm[style*="height"] svg {{ width: auto; }}
  .mono svg {{ display: block; width: 100%; height: auto; }}
  .fav {{ display: flex; gap: 18px; align-items: center; margin-top: 12px; }}
  .fav canvas {{ width: 128px; height: 128px; image-rendering: pixelated; background: #fff; }}
  .fav span {{ color: #555A56; font-size: 13px; }}
</style>
</head>
<body>
  <h1>Halden &amp; Rowe: three logo directions</h1>
  <p>Picasso, 2026-10-07. All marks are hand-built SVG paths in one colour (currentColor). Rationale: LOGO-OPTIONS.md.</p>
  {body}
<script>
  document.querySelectorAll('canvas[data-src]').forEach((c) => {{
    const img = new Image();
    img.onload = () => c.getContext('2d').drawImage(img, 0, 0, 16, 16);
    img.src = c.dataset.src;
  }});
</script>
</body>
</html>
"""
    (BRAND / "logo-options.html").write_text(html)
    print("wrote", BRAND / "logo-options.html")


if __name__ == "__main__":
    main()
