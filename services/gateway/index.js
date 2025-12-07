// Minimal dependency-free gateway using Node 18+ global fetch
const http = require("http");
const { URL } = require("url");

const services = [
  { name: "user-service", base: "http://user-service:3001" },
  { name: "chat-service", base: "http://chat-service:3002" },
  {
    name: "analytics-service",
    base: "http://analytics-service:3003",
  },
];

function getTarget(path) {
  if (path.startsWith("/users")) return services[0].base;
  if (path.startsWith("/chat")) return services[1].base;
  if (path.startsWith("/analytics")) return services[2].base;
  return null;
}

async function proxyRequest(req, res) {
  const target = getTarget(req.url);
  if (!target) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  const targetUrl = target + req.url;
  console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);

  const headers = Object.assign({}, req.headers);
  delete headers.host;

  // Buffer the request body for non-GET/HEAD requests
  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }

  try {
    console.log(`[PROXY] ${req.method} ${targetUrl}`);
    console.log(`[PROXY] Content-Type: ${headers["content-type"]}, Body size: ${body ? body.length : 0}`);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && (req.method === "POST" || req.method === "PUT") ? body : undefined,
    });
    console.log(`[PROXY] Response status: ${response.status}`);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const responseBody = response.body;
    if (responseBody && typeof responseBody.pipe === "function") {
      // Node stream
      responseBody.pipe(res);
    } else if (responseBody && typeof responseBody.pipeTo === "function") {
      // WHATWG ReadableStream (pipeTo to a writable stream)
      try {
        const writable = new (require("stream").Writable)({
          write(chunk, enc, cb) {
            res.write(chunk);
            cb();
          },
        });
        await responseBody.pipeTo(writable);
        res.end();
      } catch (err) {
        // fallback to arrayBuffer
        const ab = await response.arrayBuffer();
        res.end(Buffer.from(ab));
      }
    } else {
      // fallback: read full body and send
      const ab = await response.arrayBuffer();
      res.end(Buffer.from(ab));
    }
  } catch (err) {
    console.error(`[PROXY ERROR] ${req.method} ${targetUrl}:`, err);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(err) }));
  }
}

async function healthHandler(res) {
  const results = await Promise.all(
    services.map(async (s) => {
      try {
        const r = await fetch(s.base + "/", { method: "GET" });
        const t = await r.text();
        return { name: s.name, ok: true, status: r.status, body: t };
      } catch (err) {
        return { name: s.name, ok: false, error: String(err) };
      }
    })
  );
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ gateway: "ok", services: results }));
}

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET")
    return healthHandler(res);
  return proxyRequest(req, res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`Gateway listening on ${PORT}`)
);

module.exports = server;
