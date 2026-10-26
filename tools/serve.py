"""Serves the site locally, the way GitHub Pages would, but never stale.

    python tools/serve.py          # http://127.0.0.1:8765/

Python's own http.server sends no Cache-Control, so browsers guess and keep old copies of
pages and styles between edits. This one asks them to check every time.
"""

import functools
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    # As on GitHub Pages: an address that leads nowhere gets the site's own 404.html.
    def send_error(self, code, message=None, explain=None):
        page = ROOT / "404.html"
        if code != 404 or not page.exists():
            return super().send_error(code, message, explain)
        body = page.read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


if __name__ == "__main__":
    handler = functools.partial(Handler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as server:
        print(f"Serving {ROOT} at http://127.0.0.1:{PORT}/")
        server.serve_forever()
