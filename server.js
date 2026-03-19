const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = process.env.DUCKERTOWN_HOST || "127.0.0.1";
const PORT = Number(process.env.DUCKERTOWN_PORT || "4320");
const ROOT = __dirname;
const PROTOTYPE_ROOT = path.join(ROOT, "prototype");
const DATA_ROOT = path.join(ROOT, "data");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res, message = "Not found") {
  sendJson(res, 404, { error: message });
}

function loadBootstrapPayload() {
  return {
    world: readJson(path.join(DATA_ROOT, "world.json")),
    residents: readJson(path.join(DATA_ROOT, "residents.json")).residents,
    generatedAt: new Date().toISOString()
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    });
    res.end();
    return;
  }

  if (pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      time: new Date().toISOString()
    });
    return;
  }

  if (pathname === "/api/bootstrap" && req.method === "GET") {
    sendJson(res, 200, loadBootstrapPayload());
    return;
  }

  const filePath =
    pathname === "/" ? path.join(PROTOTYPE_ROOT, "index.html") : path.join(PROTOTYPE_ROOT, pathname.slice(1));
  if (filePath.startsWith(PROTOTYPE_ROOT) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  notFound(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Duckertown running at http://${HOST}:${PORT}`);
});
