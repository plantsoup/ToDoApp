export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://todo.spear.ac", // or your Pages URL
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Ensure todos table exists
      await env.TODO_DB.prepare(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          done BOOLEAN DEFAULT 0
        )
      `).run();

      // Ensure users table exists (for Google login)
      await env.TODO_DB.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE,
          name TEXT
        )
      `).run();

      // --- LOGIN with Google ---
      if (path === "/api/login" && request.method === "POST") {
        const { id_token } = await request.json();

        // Verify the Google token via tokeninfo API
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        const googleData = await verifyRes.json();

        if (!googleData.email || googleData.aud !== env.GOOGLE_CLIENT_ID) {
          return new Response(JSON.stringify({ error: "Invalid Google token" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const email = googleData.email;
        const name = googleData.name || "";

        // Insert user if not already present
        await env.TODO_DB.prepare(
          "INSERT OR IGNORE INTO users (email, name) VALUES (?, ?)"
        ).bind(email, name).run();

        // Simple session token (base64-encoded email)
        const token = btoa(JSON.stringify({ email }));

        return new Response(JSON.stringify({ token }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- AUTH HELPER ---
      async function getUser(request) {
        const auth = request.headers.get("Authorization");
        if (!auth) return null;
        const [, token] = auth.split(" ");
        try {
          const user = JSON.parse(atob(token));
          return user;
        } catch {
          return null;
        }
      }

      // --- GET /api/todos ---
      if (path === "/api/todos" && request.method === "GET") {
        const { results } = await env.TODO_DB.prepare("SELECT * FROM todos").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- POST /api/todos ---
      if (path === "/api/todos" && request.method === "POST") {
        const { text } = await request.json();
        await env.TODO_DB.prepare("INSERT INTO todos (text) VALUES (?)")
          .bind(text)
          .run();
        return new Response("Created", { headers: corsHeaders, status: 201 });
      }

      // --- DELETE /api/todos/:id ---
      if (path.startsWith("/api/todos/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        await env.TODO_DB.prepare("DELETE FROM todos WHERE id = ?")
          .bind(id)
          .run();
        return new Response("Deleted", { headers: corsHeaders, status: 200 });
      }

      // --- PATCH /api/todos/:id ---
      if (path.startsWith("/api/todos/") && request.method === "PATCH") {
        const id = path.split("/").pop();
        const { done } = await request.json();
        await env.TODO_DB.prepare("UPDATE todos SET done = ? WHERE id = ?")
          .bind(done ? 1 : 0, id)
          .run();
        return new Response("Updated", { headers: corsHeaders, status: 200 });
      }

      // --- FALLBACK ---
      return new Response("<h1>Todo Worker API</h1>", { headers: corsHeaders });
    } catch (err) {
      return new Response(`Worker error: ${err.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
