"""Development-only static file server. The site itself runs entirely in the browser."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading, webbrowser

folder=Path(__file__).resolve().parent
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(folder)))
address=f'http://127.0.0.1:{server.server_port}/'
print(f'Interaction Island: {address}\nStop with Ctrl+C.\n',flush=True)
threading.Timer(0.7,lambda:webbrowser.open(address)).start()
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
