// src/components/Modal.jsx
import React from 'react'

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null

  return (
    // Backdrop – allows scrolling if modal is taller than viewport
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
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
          mx-auto
          my-8
          max-h-[90vh]       /* cap at 90% of viewport height */
          overflow-y-auto    /* scroll inside when content overflows */
          p-6
        "
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </header>

        {/* Body */}
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  )
}
