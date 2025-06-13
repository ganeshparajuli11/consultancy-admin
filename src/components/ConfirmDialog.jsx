// src/components/ConfirmDialog.jsx
import React from 'react'
import Modal from './Modal'

export default function ConfirmDialog({
  isOpen, title = 'Confirm', message,
  onCancel, onConfirm, confirmLabel = 'Yes', cancelLabel = 'No'
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2 rounded border">
          {cancelLabel}
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-500 text-white">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
