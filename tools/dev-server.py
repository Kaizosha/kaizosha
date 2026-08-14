#!/usr/bin/env python3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from urllib.parse import urlsplit


class Custom404Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = super().translate_path(path)
        request_path = urlsplit(path).path
        request_name = Path(request_path).name

        if request_name and "." not in request_name:
            html_path = f"{translated}.html"
            if Path(html_path).is_file():
                return html_path

        return translated

    def send_error(self, code, message=None, explain=None):
        if code != HTTPStatus.NOT_FOUND:
            return super().send_error(code, message, explain)

        try:
            with open("404.html", "rb") as file:
                body = file.read()
        except OSError:
            return super().send_error(code, message, explain)

        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    server = ThreadingHTTPServer(("", port), Custom404Handler)
    print(f"Serving on http://127.0.0.1:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
