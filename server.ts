import { watch } from "fs";
const DEFAULT_PORT = 53000;

async function findAvailablePort(startPort) {
  let port = startPort;
  while (port < 65535) {
    try {
      const server = Bun.serve({ port, fetch() { return new Response(); } });
      server.stop();
      return port;
    } catch { port++; }
  }
  return startPort;
}

const PORT = await findAvailablePort(DEFAULT_PORT);
const sockets = new Set();

const notifyReload = () => {
  console.log("🔄 File changed! Reloading browser...");
  for (const socket of sockets) { socket.send("reload"); }
};
watch("./dist", { recursive: true }, notifyReload);
watch("./index.html", notifyReload);

Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("Upgrade failed", { status: 400 });
    }
    let filePath = "." + url.pathname;
    if (filePath === "./") filePath = "./index.html";
    try {
      const file = Bun.file(filePath);
      return new Response(file);
    } catch {
      try {
        return new Response(Bun.file("./index.html"));
      } catch {
        return new Response("404 Not Found", { status: 404 });
      }
    }
  },
  websocket: {
    open(ws) { sockets.add(ws); },
    close(ws) { sockets.delete(ws); }
  }
});
console.log(`🌍 Bun Live Server running at http://localhost:${PORT}`);
