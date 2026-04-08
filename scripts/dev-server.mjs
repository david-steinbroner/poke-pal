#!/usr/bin/env node
// Dev proxy that adds no-cache headers to every response.
// Prevents Safari from caching redirects or stale pages.
// Also proxies WebSocket connections for HMR.
// Usage: node scripts/dev-server.mjs

import http from "http";
import net from "net";
import { spawn } from "child_process";

const PROXY_PORT = 4000;
const NEXT_PORT = 3099;

// Start Next.js dev server on internal port
const next = spawn("npx", ["next", "dev", "--hostname", "0.0.0.0", "--port", String(NEXT_PORT)], {
  stdio: "inherit",
  cwd: process.cwd(),
});

// Wait for Next.js to be ready
await new Promise((resolve) => setTimeout(resolve, 5000));

// Proxy server
const proxy = http.createServer((req, res) => {
  const options = {
    hostname: "127.0.0.1",
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    headers["cache-control"] = "no-store, no-cache, must-revalidate, max-age=0";
    headers["pragma"] = "no-cache";
    headers["expires"] = "0";
    delete headers["strict-transport-security"];

    res.writeHead(proxyRes.statusCode || 200, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", () => {
    res.writeHead(502);
    res.end("Dev server not ready yet. Refresh in a few seconds.");
  });

  req.pipe(proxyReq, { end: true });
});

// WebSocket proxy for HMR (hot module reload)
proxy.on("upgrade", (req, socket, head) => {
  const proxySocket = net.connect(NEXT_PORT, "127.0.0.1", () => {
    proxySocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n"
    );
    if (head.length > 0) proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxySocket.on("error", () => socket.end());
  socket.on("error", () => proxySocket.end());
});

proxy.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`\n  Dev proxy running (with WebSocket support):`);
  console.log(`  → http://localhost:${PROXY_PORT}`);
  console.log(`  → http://192.168.86.32:${PROXY_PORT}\n`);
});

process.on("SIGINT", () => {
  next.kill();
  process.exit();
});
