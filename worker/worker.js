const JSONBIN_BIN_ID = "69e8db7436566621a8ddd79c";
const JSONBIN_API_KEY = "$2a$10$vIDv3rt84031uVtr8oRofuW5uNYIVZRV8j0T0brAZUpl.lKsd1sle";
const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const ALLOWED_ORIGINS = [
  "https://andresnalegre.github.io",
  "http://localhost:3000",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleRequest(request) {
  const origin = request.headers.get("Origin") || "";
  const cors = corsHeaders(origin);
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method === "GET" && url.pathname === "/files") {
    const res = await fetch(`${JSONBIN_BASE}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY },
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (request.method === "PUT" && url.pathname === "/files") {
    const body = await request.json();
    const res = await fetch(JSONBIN_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response("Not found", { status: 404, headers: cors });
}

export default {
  fetch: handleRequest,
};