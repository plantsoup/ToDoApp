# ToDoApp

ToDoApp is a serverless task management application built with **Cloudflare D1**, **Workers**, and **Pages**. It allows users to create, read, update, and delete tasks with a RESTful API, while the frontend is served via Cloudflare Pages.

## 🌐 Live Demo

[https://todo.spear.ac](https://todo.spear.ac)

---

## 🛠️ Architecture

* **Frontend**: Static HTML/JS/CSS hosted on **Cloudflare Pages**.
* **Backend API**: **Cloudflare Worker** exposing REST endpoints for task operations.
* **Database**: **Cloudflare D1** (serverless SQL) stores tasks.

The Worker automatically creates the `todos` table if it doesn't exist:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT 0
)
```

---

## ⚙️ API Endpoints

| Method | Endpoint         | Description                    | Body / Params             |
| ------ | ---------------- | ------------------------------ | ------------------------- |
| GET    | `/api/todos`     | Retrieve all tasks             | –                         |
| POST   | `/api/todos`     | Create a new task              | `{ "text": "Task name" }` |
| DELETE | `/api/todos/:id` | Delete a task by ID            | –                         |
| PATCH  | `/api/todos/:id` | Update `done` status of a task | `{ "done": true/false }`  |

> CORS is configured to allow requests from your frontend at `https://todo.spear.ac`.

---

## 🚀 Setup

### Prerequisites

* [Node.js](https://nodejs.org/)
* [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/)
* [Cloudflare Account](https://dash.cloudflare.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/plantsoup/ToDoApp.git
cd ToDoApp
```

2. Install dependencies:

```bash
npm install
```

3. Configure your D1 database in your Worker environment:

```bash
npx wrangler d1 create todo-database
```

4. Deploy the Worker and frontend:

```bash
npx wrangler publish
```

---

## 🧩 Technologies Used

* **Cloudflare D1**: Serverless SQL database.
* **Cloudflare Workers**: Backend API logic.
* **Cloudflare Pages**: Frontend hosting.
* **Vite & TypeScript**: Frontend development and build tools.

---

## 📄 License

MIT License
