"""Screenshots every project in assets/data/catalog.json for the home page wall.

    python tools/shoot-projects.py [base-url] [--only id,id]

Needs the site served locally (python -m http.server 8765) and Chrome installed.
Each page is opened headless at 1280x800, given a few seconds to settle, then saved
as assets/img/projects/<id>.webp at 720x450. Chrome runs with a throwaway profile.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "assets" / "img" / "projects"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
VIEW = (1280, 800)
THUMB = (720, 450)


def shoot(url, png, profile):
    subprocess.run(
        [
            str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--mute-audio", "--no-first-run", "--no-default-browser-check",
            f"--user-data-dir={profile}", f"--window-size={VIEW[0]},{VIEW[1]}",
            "--virtual-time-budget=5000", f"--screenshot={png}", url,
        ],
        check=True, timeout=60, capture_output=True,
    )


def main():
    args = sys.argv[1:]
    base = next((a for a in args if a.startswith("http")), "http://127.0.0.1:8765").rstrip("/")
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))

    projects = json.loads((SITE / "assets" / "data" / "catalog.json").read_text(encoding="utf-8"))["projects"]
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for p in projects:
            if only and p["id"] not in only:
                continue
            png = Path(tmp) / f"{p['id']}.png"
            try:
                shoot(base + p["url"], png, Path(tmp) / "profile")
                img = Image.open(png).convert("RGB").resize(THUMB, Image.LANCZOS)
                img.save(OUT / f"{p['id']}.webp", "WEBP", quality=72, method=6)
                print(f"ok   {p['id']:28} {(OUT / (p['id'] + '.webp')).stat().st_size // 1024} KB")
            except Exception as e:  # keep going; report the misses at the end
                print(f"FAIL {p['id']:28} {e}")


if __name__ == "__main__":
    main()
