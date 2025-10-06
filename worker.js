export default {
  async fetch(request, env) {
    try {
      return new Response("Worker is running!", { status: 200 });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};

