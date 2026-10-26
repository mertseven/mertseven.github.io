"""Makes the paper grain tiles: assets/img/grain-dark.png and grain-light.png.

    python tools/make-grain.py

Each tile is a square of single-pixel grains with random alpha: dark grains for the light
theme, light grains for the dark one. DOSE is the "light" setting chosen in
preview/grain.html. Standard library only; the same seed gives the same tiles.
"""

import random
import struct
import zlib
from pathlib import Path

SIZE = 128
DOSE = 0.035
OUT = Path(__file__).resolve().parent.parent / "assets" / "img"


def png(path, rgb):
    rnd = random.Random(7)
    rows = bytearray()
    for _ in range(SIZE):
        rows.append(0)  # no filter
        for _ in range(SIZE):
            a = round(rnd.random() * 255 * DOSE * 2.2) if rnd.random() < 0.5 else 0
            rows += bytes((*rgb, a))

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    head = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", head) + chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + chunk(b"IEND", b""))
    print(path.name, path.stat().st_size, "bytes")


png(OUT / "grain-dark.png", (18, 18, 18))
png(OUT / "grain-light.png", (236, 236, 236))
