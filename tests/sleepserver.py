# For the publish check (not published): serves the repository like http.server, never cached, and holds
# /__sleep?ms=N for N milliseconds, so headless Chrome's --dump-dom (which waits for the load event) gives the
# test page time to finish in real time.
import http.server, os, socketserver, sys, time, urllib.parse

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
GIF = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'


class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == '/__sleep':
            time.sleep(int(urllib.parse.parse_qs(u.query).get('ms', ['5000'])[0]) / 1000)
            self.send_response(200)
            self.send_header('Content-Type', 'image/gif')
            self.end_headers()
            self.wfile.write(GIF)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


S(('127.0.0.1', int(sys.argv[1])), H).serve_forever()
