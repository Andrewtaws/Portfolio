#!/usr/bin/env python3
"""Create smaller copies of large images and serve the right size to each screen.

For every WebP image wider than 700px in assets/images/, this makes copies
at 640, 1024 and 1440px wide (only widths smaller than the original), e.g.

    assets/images/checker/checker-02.webp        (original, 2000px)
    assets/images/checker/checker-02-640.webp
    assets/images/checker/checker-02-1024.webp
    assets/images/checker/checker-02-1440.webp

It then adds srcset and sizes to every <img> that uses one of those images,
so browsers download the smallest copy that still looks sharp. The sizes
value comes from the component the image sits in (card, gallery, hero...).

Run it from the repository root after adding or replacing images:

    python3 tools/responsive-images.py

Needs Pillow (pip install pillow). Safe to run again: existing copies and
srcset attributes are updated, not duplicated.
"""
import pathlib
import re

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"
WIDTHS = (640, 1024, 1440)
MIN_WIDTH = 700
VARIANT = re.compile(r"-(?:640|1024|1440)\.webp$")

# How wide each component shows its image, from widest screens down
SIZES = [
    ("card--feature", "(min-width: 75em) 540px, (min-width: 48em) 45vw, 92vw"),
    ("card--tall", "(min-width: 75em) 610px, (min-width: 48em) 52vw, 92vw"),
    ("card--wide", "(min-width: 75em) 510px, (min-width: 48em) 44vw, 92vw"),
    ("gallery--device", "(min-width: 70em) 680px, (min-width: 40em) 62vw, 92vw"),
    ("gallery--3", "(min-width: 70em) 330px, (min-width: 40em) 30vw, 92vw"),
    ("gallery--2", "(min-width: 70em) 500px, (min-width: 40em) 46vw, 92vw"),
    ("figure--contained", "(min-width: 40em) 608px, 92vw"),
    ("figure--hero", "(min-width: 70em) 1024px, 92vw"),
    ("portrait", "(min-width: 75em) 448px, (min-width: 56em) 36vw, 14rem"),
]
CONTEXT = re.compile(r'class="[^"]*\b(' + "|".join(re.escape(k) for k, _ in SIZES) + r')\b')
IMG = re.compile(r"<img\b[^>]*>")
SRC = re.compile(r'\bsrc="([^"]*?(assets/images/[^"?]+\.webp))"')


def make_variants():
    """Create the smaller copies; return {image path: [(url suffix, width), ...]}."""
    table = {}
    for path in sorted(IMAGES.rglob("*.webp")):
        if VARIANT.search(path.name):
            continue
        with Image.open(path) as im:
            width, height = im.size
            if width <= MIN_WIDTH:
                continue
            entries = []
            for w in WIDTHS:
                if w >= width * 0.9:
                    continue
                out = path.with_name(f"{path.stem}-{w}.webp")
                if not out.exists() or out.stat().st_mtime < path.stat().st_mtime:
                    copy = im.convert("RGBA" if "A" in im.getbands() else "RGB")
                    copy = copy.resize((w, round(height * w / width)), Image.LANCZOS)
                    copy.save(out, "WEBP", quality=80, method=6)
                    print(f"made {out.relative_to(ROOT)}")
                entries.append((f"-{w}", w))
            entries.append(("", width))
            table[path.relative_to(ROOT).as_posix()] = entries
    return table


def sizes_for(html, pos):
    """Use the nearest component class before the image."""
    found = None
    for match in CONTEXT.finditer(html, 0, pos):
        found = match.group(1)
    return dict(SIZES).get(found)


def rewrite(page, table):
    html = page.read_text(encoding="utf-8")
    out, last = [], 0
    for tag in IMG.finditer(html):
        src = SRC.search(tag.group(0))
        if not src or src.group(2) not in table:
            continue
        sizes = sizes_for(html, tag.start())
        if not sizes:
            continue
        prefix = src.group(1)[: -len(src.group(2))]
        stem = src.group(2)[: -len(".webp")]
        srcset = ", ".join(f"{prefix}{stem}{suffix}.webp {w}w" for suffix, w in table[src.group(2)])
        new = re.sub(r'\s(?:srcset|sizes)="[^"]*"', "", tag.group(0))
        new = new.replace("<img ", f'<img srcset="{srcset}" sizes="{sizes}" ', 1)
        out.append(html[last:tag.start()] + new)
        last = tag.end()
    if not out:
        return False
    page.write_text("".join(out) + html[last:], encoding="utf-8")
    return True


def main():
    table = make_variants()
    changed = 0
    for page in sorted(ROOT.rglob("*.html")):
        if ".git" in page.parts:
            continue
        if rewrite(page, table):
            changed += 1
            print(f"updated {page.relative_to(ROOT)}")
    print(f"{len(table)} images have smaller copies; {changed} page(s) updated")


if __name__ == "__main__":
    main()
