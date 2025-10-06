import React, { useState } from 'react';

interface TodoFormProps {
  onAdd: (text: string) => Promise<void>;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(trimmedText);
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-grow bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-200"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="bg-brand-primary hover:bg-brand-primary/80 disabled:bg-brand-primary/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        disabled={isSubmitting || !text.trim()}
      >
        {isSubmitting ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
};

export default TodoForm;
