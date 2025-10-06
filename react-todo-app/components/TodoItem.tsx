import React from 'react';
import { type Todo } from '../types';
import TrashIcon from './icons/TrashIcon';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li className="flex items-center justify-between bg-dark-bg p-4 rounded-lg border border-dark-border transition-all duration-300 hover:border-brand-primary group">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id, !todo.done)}
          className="h-6 w-6 rounded border-dark-border text-brand-primary bg-dark-card focus:ring-brand-primary cursor-pointer"
        />
        <span className={`text-lg transition-colors duration-300 ${todo.done ? 'line-through text-dark-text-secondary' : 'text-dark-text'}`}>
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-dark-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-full hover:bg-red-500/10"
        aria-label={`Delete todo: ${todo.text}`}
      >
        <TrashIcon />
      </button>
    </li>
  );
};

export default TodoItem;
