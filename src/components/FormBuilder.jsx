import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, Settings, Eye } from 'lucide-react';
import toastManager from '../utils/toastManager';
import DynamicFormBuilder from './DynamicFormBuilder';

const FormBuilder = ({ initialData, onSubmit, onCancel, languages = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    language: '',
    maxCapacity: '',
    submissionDeadline: '',
    isActive: true,
    fields: []
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'general',
        language: initialData.language?._id || '',
        maxCapacity: initialData.settings?.maxCapacity || '',
        submissionDeadline: initialData.settings?.submissionDeadline || '',
        isActive: initialData.isActive || false,
        fields: initialData.fields || []
      });
    }
  }, [initialData]);

  const handleFieldsChange = useCallback((fields) => {
    setFormData(prev => ({ ...prev, fields }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toastManager.error(null, 'Form name is required');
      return;
    }

    if (formData.fields.length === 0) {
      toastManager.error(null, 'Please add at least one field to the form');
      return;
    }

    setIsSubmitting(true);
    
    // Transform data for API
    const transformedData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      category: formData.category,
      language: formData.language || null,
      fields: formData.fields.map((field, index) => ({
        name: field.name?.trim() || `field_${index + 1}`,
        label: field.label?.trim() || `Field ${index + 1}`,
        type: field.type,
        required: Boolean(field.required),
        placeholder: field.placeholder?.trim() || '',
        helpText: field.helpText?.trim() || '',
        order: field.order !== undefined ? field.order : index,
        options: Array.isArray(field.options) ? field.options.filter(opt => opt.value && opt.label) : [],
        validation: {
          minLength: field.validation?.minLength || null,
          maxLength: field.validation?.maxLength || null,
          min: field.validation?.min || null,
          max: field.validation?.max || null,
          pattern: field.validation?.pattern || null
        }
      })).filter(field => field.name && field.label && field.type), // Remove invalid fields
      settings: {
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        submissionDeadline: formData.submissionDeadline || null,
        allowMultipleSubmissions: false,
        requiresApproval: true
      },
      isActive: Boolean(formData.isActive),
      emailNotifications: {
        enabled: true,
        adminEmails: [],
        autoReplyTemplate: {
          subject: `Thank you for your application to ${formData.name}`,
          message: 'We have received your application and will review it shortly.'
        }
      }
    };

    // Validate required fields before sending
    if (!transformedData.name.trim()) {
      toastManager.error(null, 'Form name is required');
      return;
    }

    if (!transformedData.fields.length) {
      toastManager.error(null, 'Please add at least one valid field to the form');
      return;
    }

    console.log('📤 Sending form data:', JSON.stringify(transformedData, null, 2));

    try {
      await onSubmit(transformedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toastManager.error(error, 'Failed to save form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'fields', label: 'Form Fields', icon: Eye }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., German Course Application"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="general">General</option>
                  <option value="language-course">Language Course</option>
                  <option value="test-preparation">Test Preparation</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language (Optional)
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">General Form (No specific language)</option>
                  {languages.map(lang => (
                    <option key={lang._id} value={lang._id}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Capacity
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50 (leave empty for unlimited)"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum number of students that can submit this form
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this form..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Deadline (Optional)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Select date and time"
                />
                {formData.submissionDeadline && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, submissionDeadline: '' }))}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear deadline"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  🕒 Students won't be able to submit after this date and time
                </p>
                {formData.submissionDeadline && (
                  <p className="text-sm text-blue-600">
                    📅 Deadline: {new Date(formData.submissionDeadline).toLocaleString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(23, 59, 0, 0);
                      setFormData(prev => ({ ...prev, submissionDeadline: tomorrow.toISOString().slice(0, 16) }));
                    }}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Tomorrow 11:59 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      nextWeek.setHours(23, 59, 0, 0);
                      setFormData(prev => ({ ...prev, submissionDeadline: nextWeek.toISOString().slice(0, 16) }));
                    }}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      nextMonth.setHours(23, 59, 0, 0);
                      setFormData(prev => ({ ...prev, submissionDeadline: nextMonth.toISOString().slice(0, 16) }));
                    }}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Next Month
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this form active for new applications
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Form Fields Tab */}
        {activeTab === 'fields' && (
          <div>
            <DynamicFormBuilder
              key={`form-builder-${initialData?._id || 'new'}`}
              initialFields={formData.fields}
              onChange={handleFieldsChange}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Form' : 'Create Form')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBuilder; 