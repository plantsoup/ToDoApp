export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    try {
      // --- Ensure table exists ---
      await env.TODO_DB.prepare(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          done BOOLEAN DEFAULT 0
        )
      `).run();

      // --- API routes ---
      if (path === "/api/todos" && request.method === "GET") {
        const { results } = await env.TODO_DB.prepare("SELECT * FROM todos").all();
        return Response.json(results);
      }

      if (path === "/api/todos" && request.method === "POST") {
        const { text } = await request.json();
        if (!text) return new Response("Missing text", { status: 400 });
        await env.TODO_DB.prepare("INSERT INTO todos (text) VALUES (?)").bind(text).run();
        return new Response("Created", { status: 201 });
      }

      if (path.startsWith("/api/todos/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        await env.TODO_DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
        return new Response("Deleted", { status: 200 });
      }

      // --- Basic fallback frontend ---
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Todo App</title>
        </head>
        <body>
          <h1>Todo App</h1>
          <p>API endpoints:</p>
          <ul>
            <li>GET /api/todos</li>
            <li>POST /api/todos (JSON body {"text":"Your todo"})</li>
            <li>DELETE /api/todos/:id</li>
          </ul>
        </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });

    } catch (err) {
      return new Response(`Worker error: ${err.message}`, { status: 500 });
    }
  },
};


