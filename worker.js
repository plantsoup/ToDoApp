export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://todo.spear.ac", // or your Pages URL
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
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

      // GET /api/todos
      if (path === "/api/todos" && request.method === "GET") {
        const { results } = await env.TODO_DB.prepare("SELECT * FROM todos").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // POST /api/todos
      if (path === "/api/todos" && request.method === "POST") {
        const { text } = await request.json();
        await env.TODO_DB.prepare("INSERT INTO todos (text) VALUES (?)").bind(text).run();
        return new Response("Created", { headers: corsHeaders, status: 201 });
      }

      // DELETE /api/todos/:id
      if (path.startsWith("/api/todos/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        await env.TODO_DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
        return new Response("Deleted", { headers: corsHeaders, status: 200 });
      }

      // PATCH /api/todos/:id  → update done status
      if (path.startsWith("/api/todos/") && request.method === "PATCH") {
        const id = path.split("/").pop();
        const { done } = await request.json();
        await env.TODO_DB.prepare("UPDATE todos SET done = ? WHERE id = ?").bind(done ? 1 : 0, id).run();
        return new Response("Updated", { headers: corsHeaders, status: 200 });
      }

      // Fallback
      return new Response("<h1>Todo Worker API</h1>", { headers: corsHeaders });

    } catch (err) {
      return new Response(`Worker error: ${err.message}`, { status: 500, headers: corsHeaders });
    }
  },
};