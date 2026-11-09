#!/usr/bin/env python3
"""Add a content-based version to every CSS and JS link in the site.

Browsers (and GitHub Pages) cache stylesheets and scripts. Without a
version, a visitor can get a new page with old styles for a while after
an update. This script rewrites links such as

    assets/css/components.css  ->  assets/css/components.css?v=3f9a1c2e

where the version is a short hash of the file's contents, so it only
changes when the file does.

Run it from the repository root after editing any CSS or JS file:

    python3 tools/stamp-assets.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINK = re.compile(r'((?:href|src)="(?:\.\./|/)?(assets/(?:css|js)/[\w.-]+\.(?:css|js)))(?:\?v=[0-9a-f]+)?"')


def version(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:8]


def main():
    changed = 0
    for page in sorted(ROOT.rglob("*.html")):
        if ".git" in page.parts:
            continue
        text = page.read_text(encoding="utf-8")
        new = LINK.sub(lambda m: f'{m.group(1)}?v={version(m.group(2))}"', text)
        if new != text:
            page.write_text(new, encoding="utf-8")
            changed += 1
            print(f"updated {page.relative_to(ROOT)}")
    print(f"{changed} page(s) updated")


if __name__ == "__main__":
    main()
