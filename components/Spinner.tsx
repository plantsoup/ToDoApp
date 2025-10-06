import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div
      className="w-12 h-12 border-4 border-dark-border border-t-brand-primary rounded-full animate-spin"
      role="status"
    >
        <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
