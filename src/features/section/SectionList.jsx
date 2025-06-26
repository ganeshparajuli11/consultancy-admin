import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import EntityForm from '../../components/EntityForm'
import EntityCard from '../../components/EntityCard'

const SectionList = () => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [duplicatingSection, setDuplicatingSection] = useState(null)

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/section')
        // Expect { data: [...] }
        setSections(Array.isArray(response.data?.data) ? response.data.data : [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch sections')
      } finally {
        setLoading(false)
      }
    }
    fetchSections()
  }, [])

  const sectionSchema = [
    { name: 'name', label: 'Section Name', type: 'text', required: true, rules: { required: 'Required' } },
    { name: 'code', label: 'Section Code', type: 'text', required: true, rules: { required: 'Required' }, help: 'Unique code, e.g. IELTS-M1' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'language', label: 'Language', type: 'select-fetch', fetchKey: 'languages', valueKey: '_id', labelKey: 'name', required: true, rules: { required: 'Required' } },
    { name: 'level', label: 'Level', type: 'select-fetch', fetchKey: 'levels', valueKey: '_id', labelKey: 'name', required: true, rules: { required: 'Required' } },
    { name: 'tutor', label: 'Tutor', type: 'select-fetch', fetchKey: 'tutors', valueKey: '_id', labelKey: 'name' },
    { name: 'schedule', label: 'Schedule', type: 'time-range', help: 'Select start and end time for the section' },
    { name: 'capacity', label: 'Capacity', type: 'number', min: 1, required: true, rules: { required: 'Required', min: { value: 1, message: 'Min 1' } } },
    { name: 'isActive', label: 'Active', type: 'checkbox', checkboxLabel: 'Section is active' }
  ];

  const handleFormSubmit = async (data) => {
    try {
      if (editingSection) {
        await api.put(`/api/section/${editingSection._id}`, data)
      } else {
        await api.post('/api/section', data)
      }
      // Refetch sections
      const response = await api.get('/api/section')
      setSections(Array.isArray(response.data?.data) ? response.data.data : [])
      handleModalClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save section')
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingSection(null)
    setDuplicatingSection(null)
  }

  const handleEdit = (section) => {
    setEditingSection(section)
    setDuplicatingSection(null)
    setModalOpen(true)
  }

  const handleDuplicate = (section) => {
    setEditingSection(null)
    setDuplicatingSection(section)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/api/section/${id}`)
        setSections(sections.filter(section => section._id !== id))
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete section')
      }
    }
  }

  // Compute defaultValues for EntityForm
  let defaultValues = {}
  if (editingSection) {
    defaultValues = editingSection
  } else if (duplicatingSection) {
    defaultValues = { ...duplicatingSection, name: duplicatingSection.name + ' (Copy)', code: '' }
  }

  // Card fields for EntityCard
  const cardFields = [
    { key: 'code', label: 'Code' },
    { key: 'language', label: 'Language', format: v => v?.name || 'N/A', showEmpty: true },
    { key: 'level', label: 'Level', format: v => v?.name || 'N/A', showEmpty: true },
    { key: 'tutor', label: 'Tutor', format: v => v?.name || 'N/A', showEmpty: true },
    { key: 'capacity', label: 'Capacity' },
    { key: 'enrolled', label: 'Enrolled' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Sections</h2>
        <button
          onClick={() => { setModalOpen(true); setEditingSection(null); setDuplicatingSection(null); }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add Section
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <EntityCard
            key={section._id}
            item={section}
            titleKey="name"
            subtitleKey="description"
            badges={[
              section.isArchived ? { label: 'Archived', type: 'error' } : null,
              section.capacityAlert ? { label: 'Capacity Alert', type: 'warning' } : null
            ].filter(Boolean)}
            fields={cardFields}
            onEdit={handleEdit}
            onDelete={s => handleDelete(s._id)}
            variant="detailed"
          />
        ))}
      </div>

      {/* Add/Edit/Duplicate Section Modal */}
      <Modal
        isOpen={isModalOpen}
        title={
          editingSection
            ? 'Edit Section'
            : duplicatingSection
            ? 'Duplicate Section'
            : 'Add Section'
        }
        onClose={handleModalClose}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <EntityForm
            schema={sectionSchema}
            defaultValues={defaultValues}
            onSubmit={handleFormSubmit}
            apiEndpoints={{
              languages: '/api/languages',
              levels: '/api/levels',
              tutors: '/auth/user?role=tutor'
            }}
            onCancel={handleModalClose}
          />
        </div>
      </Modal>
    </div>
  )
}

export default SectionList