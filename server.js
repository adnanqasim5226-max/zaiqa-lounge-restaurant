// ==============================================================================
// LOCAL DEVELOPMENT SERVER (Zero-dependency Node.js HTTP Server)
// ==============================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".sql": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer((req, res) => {
  // Normalize URL
  let parsedUrl = req.url.split("?")[0];
  if (parsedUrl === "/" || parsedUrl === "") {
    parsedUrl = "/index.html";
  }

  // Safe file path resolution
  const safePath = path.normalize(path.join(__dirname, parsedUrl));

  // Security check: ensure path is within project root
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`
        <div style="font-family:sans-serif; text-align:center; padding:50px; background:#0b0f19; color:#fff; min-height:100vh;">
          <h1 style="color:#ea580c;">404 - Page Not Found</h1>
          <p>File not found: ${parsedUrl}</p>
          <a href="/index.html" style="color:#f97316;">Return to Home</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 RESTAURANT APP LIVE SERVER RUNNING!`);
  console.log(`🔗 Local Website:     http://localhost:${PORT}/index.html`);
  console.log(`🛡️ Admin Portal:     http://localhost:${PORT}/admin.html`);
  console.log(`📱 Social Scheduler: http://localhost:${PORT}/social.html`);
  console.log(`======================================================\n`);
});
