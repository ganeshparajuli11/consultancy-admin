// src/components/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal panel */}
      <div
        className="
          relative
          flex
          flex-col
          bg-white
          rounded-lg
          shadow-lg
          w-full
          max-w-lg
          max-h-[90vh]
          overflow-hidden
        "
      >
        {/* Sticky Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
