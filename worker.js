export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    // --- API routes ---
    if (path === "/api/todos" && request.method === "GET") {
      const { results } = await env.TODO_DB.prepare("SELECT * FROM todos").all();
      return Response.json(results);
    }

    if (path === "/api/todos" && request.method === "POST") {
      const { text } = await request.json();
      await env.TODO_DB.prepare("INSERT INTO todos (text) VALUES (?)").bind(text).run();
      return new Response("Created", { status: 201 });
    }

    if (path.startsWith("/api/todos/") && request.method === "DELETE") {
      const id = path.split("/").pop();
      await env.TODO_DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
      return new Response("Deleted", { status: 200 });
    }

    // --- Static files ---
    return env.ASSETS.fetch(request);
  },
};

