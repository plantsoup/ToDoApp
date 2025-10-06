import React, { useState, useEffect, useCallback } from 'react';
import { getTodos, addTodo, updateTodo, deleteTodo } from './services/todoService';
import { type Todo } from './types';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper for error handling
  const handleError = (msg: string, err: unknown) => {
    setError(msg);
    console.error(err);
  };

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const fetchedTodos = await getTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      handleError('Failed to fetch todos. Please try again later.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleAddTodo = async (text: string) => {
    try {
      await addTodo(text);
      await fetchTodos();
    } catch (err) {
      handleError('Failed to add todo.', err);
    }
  };

  const handleToggleTodo = async (id: number, done: boolean) => {
    try {
      await updateTodo(id, done);
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, done } : todo
        )
      );
    } catch (err) {
      handleError('Failed to update todo.', err);
      // Revert UI change on failure
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, done: !done } : todo
        )
      );
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      handleError('Failed to delete todo.', err);
    }
  };

  // Render logic
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Spinner />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }
    if (todos.length === 0) {
      return (
        <div className="text-center p-8 text-dark-text-secondary">
          <p>You have no tasks. Add one to get started!</p>
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>
    );
  };

  // Main render
  return (
    <div className="min-h-screen text-dark-text p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
              Todo List
            </span>
          </h1>
          <p className="mt-4 text-lg text-dark-text-secondary">
            Organize your life, one task at a time.
          </p>
        </header>
        <main>
          <div className="bg-dark-card shadow-2xl shadow-brand-primary/10 rounded-xl p-6 mb-8">
            <TodoForm onAdd={handleAddTodo} />
          </div>
          <div className="bg-dark-card shadow-lg rounded-xl p-6">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center mt-12 py-4 text-dark-text-secondary">
          <p>
            <a
              href="https://github.com/plantsoup/ToDoApp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub Repo
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
