// src/pages/Language.jsx
import React, { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import EntityForm from '../../components/EntityForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import EntityCard from '../../components/EntityCard'
import { Globe } from 'lucide-react'
const API_ENDPOINTS = {
  languages: '/api/languages',
  levels: '/api/levels',
  users: '/api/users'
}

export default function Language() {
  const [languages, setLanguages] = useState([])
  const [levelsOptions, setLevels] = useState([])
  const [usersOptions, setUsers] = useState([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const LANG_API = API_ENDPOINTS.languages

  useEffect(() => {
    api.get(LANG_API).then(r => setLanguages(r.data.data))
    api.get(API_ENDPOINTS.levels).then(r =>
      setLevels(r.data.data.map(l => ({ value: l._id, label: l.name })))
    )
    api.get(API_ENDPOINTS.users).then(r =>
      setUsers(r.data.data.map(u => ({ value: u._id, label: u.name })))
    )
  }, [])

  // load data on mount
  useEffect(() => {
    api.get(LANG_API).then(r => setLanguages(r.data.data))
    api.get('/api/levels').then(r =>
      setLevels(r.data.data.map(l => ({ value: l._id, label: l.name })))
    )
    api.get('/api/users').then(r =>
      setUsers(r.data.data.map(u => ({ value: u._id, label: u.name })))
    )
  }, [])

  // form schema driving EntityForm
const languageFormSchema = useMemo(() => [
  {
    name: 'name',
    label: 'Language Name',
    type: 'text',
    rules: { required: 'Language name is required' },
    placeholder: 'e.g., Spanish, French, German'
  },
  {
    name: 'code',
    label: 'Language Code',
    type: 'text',
    rules: {
      pattern: {
        value: /^[a-z]{2}$/,
        message: 'Must be a 2-letter lowercase code (e.g., es, fr, de)'
      }
      // removed `required` so it’s now optional
    },
    placeholder: 'e.g., es, fr, de',
    help: 'ISO 639-1 two-letter language code (add random for non-country languages)'
  },
{
  name: 'flag',
  label: 'Language Flag/Logo',
  type: 'file-or-url',
  preview: true,
  urlPlaceholder: 'Enter image URL',
  accept: 'image/*',
  help: 'Upload an image file or provide image URL',
  computedValue: (values) => {
    // Only compute flag URL if we have a complete valid code
    if (values.code?.length === 2) {
      return `https://flagcdn.com/w80/${values.code.toLowerCase()}.png`;
    }
    return null; // Return null if code is incomplete
  }
},
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 3,
    placeholder: 'Brief description of the language…'
  },
  {
    name: 'direction',
    label: 'Text Direction',
    type: 'select',
    options: [
      { value: 'ltr', label: 'Left to Right (LTR)' },
      { value: 'rtl', label: 'Right to Left (RTL)' }
    ],
    defaultValue: 'ltr'
  },
  {
    name: 'levels',
    label: 'Available Levels',
    type: 'multiselect',
    options: levelsOptions,
    rules: { validate: v => (v?.length > 0) || 'Select at least one level' },
    help: 'Proficiency levels for this language'
  },
  {
    name: 'isActive',
    label: 'Status',
    type: 'checkbox',
    checkboxLabel: 'Language is active and available to users',
    defaultValue: true
  }
], [levelsOptions])

  // create or update
const saveLanguage = async (data) => {
  try {
    const formData = new FormData();
    
    // Handle flag field
    if (data.flag instanceof File) {
      formData.append('flag', data.flag);
      formData.append('flag_type', 'file');
    } else if (typeof data.flag === 'string') {
      formData.append('flag', data.flag);
      formData.append('flag_type', 'url');
    }
    
    // Append other fields
    Object.keys(data).forEach(key => {
      if (key !== 'flag' && key !== 'flag_type') {
        if (Array.isArray(data[key])) {
          data[key].forEach(value => formData.append(`${key}[]`, value));
        } else if (data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      }
    });

    if (editing) {
      const resp = await api.put(`${LANG_API}/${editing._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLanguages(prev => prev.map(l => 
        l._id === editing._id ? resp.data.data : l
      ));
    } else {
      const resp = await api.post(LANG_API, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLanguages(prev => [...prev, resp.data.data]);
    }
    
    setModalOpen(false);
    setEditing(null);
  } catch (err) {
    console.error('Save language error:', err);
  }
};

  // delete
  const deleteLanguage = async () => {
    try {
      await api.delete(`${LANG_API}/${toDelete._id}`)
      setLanguages(prev =>
        prev.filter(l => l._id !== toDelete._id)
      )
    } catch (err) {
      console.error('Delete language error:', err)
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Languages</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + New Language
        </button>
      </header>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map(lang => (
          <EntityCard
            key={lang._id}
            item={lang}
            titleKey="name"
            imageKey="flag"
            fallbackIcon={<Globe size={32} className="text-gray-400" />}
            onEdit={l => { setEditing(l); setModalOpen(true) }}
            onDelete={l => setToDelete(l)}
          />
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Edit Language' : 'Add Language'}
        onClose={() => { setModalOpen(false); setEditing(null) }}
      >
        <EntityForm
          schema={languageFormSchema}
          defaultValues={editing || {}}
          onSubmit={saveLanguage}
          apiEndpoints={API_ENDPOINTS}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete Language?"
        message={`Are you sure you want to delete "${toDelete?.name}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={deleteLanguage}
      />
    </div>
  )
}
