#!/usr/bin/env python3
"""Static server plus a POST /report endpoint.

Browser verification here is unreliable: the automation launches a fresh browser
per command, so anything read from a live tab is read from a blank one. A page
that posts its own results is immune to that -- the write lands on disk while the
page is alive, and the file can be read afterwards however the browser behaves.

  python tools/serve_and_report.py        # from the repository root
  POST /report                            # -> browser-report.json
"""
import http.server
import json
import os
import socketserver

REPORT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "browser-report.json")


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        if self.path != "/report":
            self.send_response(404)
            self.end_headers()
            return
        with open(REPORT, "wb") as handle:
            handle.write(body)
        try:
            parsed = json.loads(body)
            print("report:", json.dumps(parsed)[:400], flush=True)
        except Exception:
            print("report (unparsed):", body[:400], flush=True)
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 8080), Handler) as httpd:
    print("serving on http://127.0.0.1:8080 (POST /report)", flush=True)
    httpd.serve_forever()
