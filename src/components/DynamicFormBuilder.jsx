import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy,
  Settings,
  Type,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  List,
  Hash,
  Globe,
  GripVertical,
  Star,
  MapPin,
  User,
  BookOpen,
  Award,
  ToggleLeft,
  Image,
  Download,
  Layout,
  Users,
  GraduationCap,
  Clock,
  CreditCard,
  X,
  Eye,
  Send,
  Share,
  Edit3,
  Save,
  ArrowLeft
} from 'lucide-react';
// Note: Using basic alert/console for notifications since toastManager was removed
// import toastManager from '../utils/toastManager';
// import { exportToExcel, generateSampleData, FieldSelector } from '../utils/excelExport';
import apiService from '../services/api';

// Import @dnd-kit components
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Simplified field types for consultancy
const FIELD_TYPES = [
  { 
    type: 'text', 
    label: 'Name', 
    icon: User, 
    placeholder: 'Enter your name',
    defaultLabel: 'Full Name',
    category: 'basic'
  },
  { 
    type: 'email', 
    label: 'Email', 
    icon: Mail, 
    placeholder: 'your.email@example.com',
    defaultLabel: 'Email Address',
    category: 'contact'
  },
  { 
    type: 'tel', 
    label: 'Phone', 
    icon: Phone, 
    placeholder: '+977-9XXXXXXXXX',
    defaultLabel: 'Phone Number',
    category: 'contact'
  },
  { 
    type: 'date', 
    label: 'Date', 
    icon: Calendar, 
    placeholder: '',
    defaultLabel: 'Date of Birth',
    category: 'basic'
  },
  { 
    type: 'number', 
    label: 'Number', 
    icon: Hash, 
    placeholder: '0',
    defaultLabel: 'Enter a number',
    category: 'basic'
  },
  { 
    type: 'textarea', 
    label: 'Long Text', 
    icon: FileText, 
    placeholder: 'Enter detailed information',
    defaultLabel: 'Additional Information',
    category: 'basic'
  },
  { 
    type: 'language-selection', 
    label: 'Language Choice', 
    icon: Globe, 
    placeholder: '',
    defaultLabel: 'Which language would you like to learn?',
    category: 'consultancy'
  },
  { 
    type: 'proficiency-level', 
    label: 'Current Level', 
    icon: Award, 
    placeholder: '',
    defaultLabel: 'Your current proficiency level',
    category: 'consultancy'
  },
  { 
    type: 'education-level', 
    label: 'Education', 
    icon: GraduationCap, 
    placeholder: '',
    defaultLabel: 'Highest Education Level',
    category: 'consultancy'
  },
  { 
    type: 'time-preference', 
    label: 'Time Preference', 
    icon: Clock, 
    placeholder: '',
    defaultLabel: 'Preferred Class Time',
    category: 'consultancy'
  },
  { 
    type: 'select', 
    label: 'Multiple Choice', 
    icon: CheckSquare, 
    placeholder: '',
    defaultLabel: 'Choose an option',
    category: 'choice'
  },
  { 
    type: 'checkbox', 
    label: 'Multiple Select', 
    icon: List, 
    placeholder: '',
    defaultLabel: 'Select all that apply',
    category: 'choice'
  },
  { 
    type: 'file', 
    label: 'File Upload', 
    icon: Image, 
    placeholder: '',
    defaultLabel: 'Upload Document/Photo',
    category: 'documents'
  }
];

// Quick Form Templates - Super Simple
const QUICK_TEMPLATES = [
  {
    id: 'student-registration',
    name: '🎓 Student Registration',
    description: 'For new student enrollments',
    fields: ['text', 'email', 'tel', 'language-selection', 'proficiency-level', 'time-preference']
  },
  {
    id: 'class-booking',
    name: '📅 Class Booking',
    description: 'Book specific classes or batches',
    fields: ['text', 'email', 'tel', 'date', 'time-preference', 'select']
  },
  {
    id: 'feedback-form',
    name: '⭐ Feedback Survey',
    description: 'Collect student feedback',
    fields: ['text', 'email', 'select', 'checkbox', 'textarea']
  },
  {
    id: 'contact-form',
    name: '📞 Contact Form',
    description: 'General inquiries',
    fields: ['text', 'email', 'tel', 'textarea']
  }
];

const DynamicFormBuilder = ({ initialFields = [], onChange, onBack }) => {
  // Simplified state management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [],
    isPublished: false,
    formUrl: '',
    formId: null,
    category: 'general',
    language: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeField, setActiveField] = useState(null);
  const [showFieldTypes, setShowFieldTypes] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportFields, setSelectedExportFields] = useState([]);
  const [currentStep, setCurrentStep] = useState('setup'); // 'setup', 'build', 'preview', 'publish'

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get default options for consultancy fields
  const getDefaultOptions = useCallback((fieldType) => {
    switch (fieldType) {
      case 'language-selection':
        return [
          { id: 'ielts', value: 'ielts', label: 'IELTS Preparation' },
          { id: 'pte', value: 'pte', label: 'PTE Preparation' },
          { id: 'german', value: 'german', label: 'German Language' },
          { id: 'spanish', value: 'spanish', label: 'Spanish Language' },
          { id: 'french', value: 'french', label: 'French Language' },
          { id: 'japanese', value: 'japanese', label: 'Japanese Language' },
          { id: 'other', value: 'other', label: 'Other Language' }
        ];
      case 'proficiency-level':
        return [
          { id: 'beginner', value: 'beginner', label: 'Beginner (A1)' },
          { id: 'elementary', value: 'elementary', label: 'Elementary (A2)' },
          { id: 'intermediate', value: 'intermediate', label: 'Intermediate (B1)' },
          { id: 'upper-intermediate', value: 'upper-intermediate', label: 'Upper Intermediate (B2)' },
          { id: 'advanced', value: 'advanced', label: 'Advanced (C1)' },
          { id: 'proficient', value: 'proficient', label: 'Proficient (C2)' }
        ];
      case 'education-level':
        return [
          { id: 'slc', value: 'slc', label: 'SLC/SEE' },
          { id: 'plus2', value: 'plus2', label: '+2/Intermediate' },
          { id: 'bachelor', value: 'bachelor', label: "Bachelor's Degree" },
          { id: 'master', value: 'master', label: "Master's Degree" },
          { id: 'phd', value: 'phd', label: 'PhD/Doctorate' }
        ];
      case 'time-preference':
        return [
          { id: 'morning', value: 'morning', label: 'Morning (6:00 AM - 8:00 AM)' },
          { id: 'day', value: 'day', label: 'Day (10:00 AM - 4:00 PM)' },
          { id: 'evening', value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)' },
          { id: 'weekend', value: 'weekend', label: 'Weekend Only' },
          { id: 'flexible', value: 'flexible', label: 'Flexible' }
        ];
      default:
        return [];
    }
  }, []);

  // Create new field with smart defaults
  const createNewField = useCallback((type, fieldData = {}) => {
    const fieldType = FIELD_TYPES.find(ft => ft.type === type);
    const defaultOptions = ['select', 'checkbox'].includes(type) 
      ? fieldData.options || [{ id: 'opt1', value: 'option1', label: 'Option 1' }]
      : getDefaultOptions(type);

    return {
      id: fieldData.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: fieldData.label || fieldType?.defaultLabel || 'Question',
      placeholder: fieldData.placeholder || fieldType?.placeholder || '',
      required: fieldData.required || false,
      options: defaultOptions,
      helpText: fieldData.helpText || '',
      order: fieldData.order !== undefined ? fieldData.order : formData.fields.length,
      ...fieldData
    };
  }, [getDefaultOptions, formData.fields.length]);

  // Load quick template
  const loadQuickTemplate = useCallback((templateId) => {
    const template = QUICK_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templateFields = template.fields.map((fieldType, index) => 
        createNewField(fieldType, { order: index })
      );
      
      setFormData(prev => ({
        ...prev,
        title: template.name.replace(/[🎓📅⭐📞]/g, '').trim(),
        description: template.description,
        fields: templateFields
      }));
      
      setCurrentStep('build');
      alert(`${template.name} template loaded!`);
    }
  }, [createNewField]);

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Add new field
  const addField = useCallback((type) => {
    const newField = createNewField(type);
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setActiveField(newField.id);
    setShowFieldTypes(false);
  }, [createNewField]);

  // Update field
  const updateField = useCallback((fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  }, []);

  // Delete field
  const deleteField = useCallback((fieldId) => {
    if (formData.fields.length === 1) {
      alert('You need at least one field');
      return;
    }
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    setActiveField(null);
  }, [formData.fields.length]);

  // Save form to backend
  const saveFormToBackend = useCallback(async (formDataToSave = formData) => {
    try {
      setIsSaving(true);
      
      const formPayload = {
        title: formDataToSave.title,
        description: formDataToSave.description,
        fields: formDataToSave.fields,
        category: formDataToSave.category || 'general',
        language: formDataToSave.language,
        isActive: true
      };

      let response;
      if (formDataToSave.formId) {
        // Update existing form
        response = await apiService.updateForm(formDataToSave.formId, formPayload);
      } else {
        // Create new form
        response = await apiService.createForm(formPayload);
      }

      if (response.success) {
        const savedForm = response.data.form;
        const formUrl = apiService.generateFormUrl(savedForm);
        
        setFormData(prev => ({
          ...prev,
          formId: savedForm._id,
          formUrl: formUrl,
          isPublished: true
        }));

        return {
          success: true,
          formId: savedForm._id,
          formUrl: formUrl,
          form: savedForm
        };
      } else {
        throw new Error(response.message || 'Failed to save form');
      }
    } catch (error) {
      console.error('Save form error:', error);
      alert(`Failed to save form: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  // Generate form URL
  const generateFormUrl = useCallback((formData) => {
    return apiService.generateFormUrl(formData);
  }, []);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!formData.title.trim()) {
      alert('Please add a form title');
      return;
    }
    
    if (formData.fields.length === 0) {
      alert('Please add at least one field');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await saveFormToBackend();
      
      if (result.success) {
        setCurrentStep('publish');
        alert('Form published successfully!');
        
        // Copy URL to clipboard
        navigator.clipboard.writeText(result.formUrl).then(() => {
          console.log('Form URL copied to clipboard!');
        });
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.title, formData.fields.length, saveFormToBackend]);

  // Export handling (simplified since excelExport was removed)
  const handleExportClick = useCallback(() => {
    alert('Export functionality temporarily disabled. Feature will be restored soon.');
    // setSelectedExportFields(formData.fields.map(field => field.id));
    // setShowExportModal(true);
  }, []);

  const handleExport = useCallback(() => {
    alert('Export feature coming soon!');
    // const sampleResponses = generateSampleData(formData.fields, 25);
    // exportToExcel(sampleResponses, selectedExportFields, formData.fields, formData);
    setShowExportModal(false);
  }, []);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  // Field IDs for drag and drop
  const fieldIds = useMemo(() => formData.fields.map(field => field.id), [formData.fields]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.fields.findIndex((item) => item.id === active.id);
        const newIndex = prev.fields.findIndex((item) => item.id === over?.id);
        const newFields = arrayMove(prev.fields, oldIndex, newIndex);
        return {
          ...prev,
          fields: newFields.map((field, index) => ({ ...field, order: index }))
        };
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header with Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Create Your Form</h1>
          </div>
          <div className="flex items-center space-x-2">
            {['setup', 'build', 'preview', 'publish'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-blue-600 text-white' : 
                  ['setup', 'build', 'preview'].indexOf(currentStep) > index ? 'bg-green-500 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Quick Setup */}
        {currentStep === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Create Your Form! 🚀</h2>
              <p className="text-gray-600">Choose a template or start fresh. Everything is merged in one easy flow.</p>
            </div>

            {/* Quick Start */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📝 Quick Start (Recommended)</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Form Title (e.g., Student Registration Form)"
                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Brief description (optional)"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    if (formData.title.trim()) {
                      setCurrentStep('build');
                      alert('Form created! Now add your questions.');
                    } else {
                      alert('Please enter a form title first');
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
                >
                  Create Form & Add Questions →
                </button>
              </div>
            </div>

            {/* Templates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Or Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadQuickTemplate(template.id)}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to load with {template.fields.length} questions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Title/Description for other steps */}
        {currentStep !== 'setup' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">📝</span>
                <span className="text-sm font-medium text-gray-600">Form Title & Info</span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Form Title"
                className="text-xl font-bold border-none outline-none bg-transparent placeholder-gray-400 w-full mb-2 text-gray-900"
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Add a description (optional)"
                className="text-gray-600 border-none outline-none bg-transparent placeholder-gray-400 w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Builder */}
      {currentStep === 'build' && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex space-x-3">
              <button
                onClick={async () => {
                  if (formData.title.trim() && formData.fields.length > 0) {
                    await saveFormToBackend();
                  } else {
                    alert('Please add a title and at least one field before saving');
                  }
                }}
                disabled={isSaving || !formData.title.trim() || formData.fields.length === 0}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : formData.formId ? 'Update Form' : 'Save Draft'}
              </button>
              <button
                onClick={() => setCurrentStep('preview')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Form
              </button>
              <button
                onClick={handleExportClick}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={formData.fields.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {formData.fields.length} questions • {formData.fields.filter(f => f.required).length} required
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    field={field}
                    isActive={activeField === field.id}
                    onActivate={() => setActiveField(field.id)}
                    onUpdate={updateField}
                    onDelete={deleteField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Question Button */}
          <div className="mt-4 relative">
            <button
              onClick={() => setShowFieldTypes(!showFieldTypes)}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center group"
            >
              <Plus className="w-6 h-6 mr-2 text-gray-400 group-hover:text-blue-600" />
              <span className="text-gray-600 group-hover:text-blue-600 font-medium">Add Question</span>
            </button>
            
            {showFieldTypes && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Question Type</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FIELD_TYPES.map(fieldType => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.type}
                        onClick={() => addField(fieldType.type)}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors text-left border border-gray-100 hover:border-blue-300"
                      >
                        <Icon className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fieldType.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          {/* Preview Actions */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep('build')}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Form
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading || isSaving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Publishing...' : 'Publish Form'}
              </button>
            </div>
          </div>

          {/* Form Preview */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-2xl">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h1>
                {formData.description && (
                  <p className="text-gray-600">{formData.description}</p>
                )}
              </div>
              
              <div className="space-y-6">
                {formData.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <FormPreview field={field} />
                    {field.helpText && (
                      <p className="text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Step */}
      {currentStep === 'publish' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Published Successfully! 🎉</h2>
            <p className="text-gray-600 mb-6">Your form is now live and ready to collect responses.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Form URL</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={formData.formUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(formData.formUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentStep('build')}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Form
              </button>
              <button
                onClick={handleExportClick}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Responses
              </button>
              <button
                onClick={() => window.open(formData.formUrl, '_blank')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Share className="w-4 h-4 mr-2" />
                Open Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Export Form Responses</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-blue-900 font-medium mb-2">📊 What You'll Get:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• CSV file with form responses (opens in Excel)</li>
                    <li>• Sample data (25 responses) for demonstration</li>
                    <li>• Only selected fields will be included</li>
                    <li>• Properly formatted data with form metadata</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-yellow-900 font-medium mb-2">💡 For Nepal Consultancy:</h3>
                  <p className="text-yellow-800 text-sm">
                    Perfect for tracking student registrations, course preferences, and contact information. 
                    Export only the fields you need for your specific analysis or student management.
                  </p>
                </div>
              </div>

              {/* FieldSelector component temporarily removed */}
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Export functionality is being restored.</p>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download Sample CSV
                </button>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Form Preview Component
const FormPreview = ({ field }) => {
  const renderPreview = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            rows={3}
            disabled
          />
        );
        
      case 'select':
      case 'language-selection':
      case 'proficiency-level':
      case 'education-level':
      case 'time-preference':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
            <option>Choose an option...</option>
            {(field.options || []).map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="text-blue-600" />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
        );
        
      case 'file':
        const getAcceptedTypes = (purpose) => {
          switch (purpose) {
            case 'photos':
              return '.png,.jpg,.jpeg';
            case 'documents':
              return '.pdf,.doc,.docx';
            case 'certificates':
              return '.pdf,.jpg,.jpeg,.png';
            case 'transcripts':
              return '.pdf';
            case 'cv':
              return '.pdf,.doc,.docx';
            case 'passport':
              return '.jpg,.jpeg,.png,.pdf';
            case 'test-scores':
              return '.pdf,.jpg,.jpeg,.png';
            default:
              return '.pdf,.doc,.docx,.jpg,.jpeg,.png';
          }
        };

        const getFileTypeDisplay = (purpose) => {
          const types = {
            'photos': 'PNG, JPG, JPEG',
            'documents': 'PDF, DOC, DOCX',
            'certificates': 'PDF, JPG, PNG',
            'transcripts': 'PDF only',
            'cv': 'PDF, DOC, DOCX',
            'passport': 'JPG, PNG, PDF',
            'test-scores': 'PDF, JPG, PNG',
            'any': 'All file types'
          };
          return types[purpose] || 'PDF, DOC, JPG, PNG';
        };

        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 font-medium mb-1">
                {field.allowMultiple ? 'Choose files or drag & drop' : 'Choose file or drag & drop'}
              </p>
              <p className="text-sm text-gray-500">
                {getFileTypeDisplay(field.uploadPurpose)} up to {field.maxSize || '10'}MB
              </p>
              <input
                type="file"
                accept={getAcceptedTypes(field.uploadPurpose)}
                multiple={field.allowMultiple}
                className="hidden"
                disabled
              />
            </div>
            
            {field.uploadInstructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  💡 {field.uploadInstructions}
                </p>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
        );
    }
  };

  return renderPreview();
};

// Simplified Form Field Component
const FormField = ({ field, isActive, onActivate, onUpdate, onDelete }) => {
  const [localLabel, setLocalLabel] = useState(field.label);
  const [showOptions, setShowOptions] = useState(false);
  const [showFieldTypeMenu, setShowFieldTypeMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Update local label when field changes
  useEffect(() => {
    setLocalLabel(field.label);
  }, [field.label]);

  // Handle label save
  const handleLabelSave = useCallback(() => {
    if (localLabel !== field.label) {
      onUpdate(field.id, { label: localLabel });
    }
  }, [localLabel, field.label, field.id, onUpdate]);

  // Handle label key press
  const handleLabelKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  // Change field type
  const changeFieldType = useCallback((newType) => {
    const fieldType = FIELD_TYPES.find(ft => ft.type === newType);
    const updates = { type: newType };
    
    // Add default options for select/checkbox types
    if (['select', 'checkbox'].includes(newType) && !['select', 'checkbox'].includes(field.type)) {
      updates.options = [{ id: 'opt1', value: 'option1', label: 'Option 1' }];
    }
    
    // Add specialized options for consultancy fields
    if (['language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(newType)) {
      const getDefaultOptions = (fieldType) => {
        switch (fieldType) {
          case 'language-selection':
            return [
              { id: 'ielts', value: 'ielts', label: 'IELTS Preparation' },
              { id: 'pte', value: 'pte', label: 'PTE Preparation' },
              { id: 'german', value: 'german', label: 'German Language' },
              { id: 'spanish', value: 'spanish', label: 'Spanish Language' }
            ];
          case 'proficiency-level':
            return [
              { id: 'beginner', value: 'beginner', label: 'Beginner (A1)' },
              { id: 'intermediate', value: 'intermediate', label: 'Intermediate (B1)' },
              { id: 'advanced', value: 'advanced', label: 'Advanced (C1)' }
            ];
          case 'education-level':
            return [
              { id: 'slc', value: 'slc', label: 'SLC/SEE' },
              { id: 'plus2', value: 'plus2', label: '+2/Intermediate' },
              { id: 'bachelor', value: 'bachelor', label: "Bachelor's Degree" }
            ];
          case 'time-preference':
            return [
              { id: 'morning', value: 'morning', label: 'Morning (6:00 AM - 10:00 AM)' },
              { id: 'evening', value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)' },
              { id: 'weekend', value: 'weekend', label: 'Weekend Only' }
            ];
          default:
            return [];
        }
      };
      updates.options = getDefaultOptions(newType);
    }
    
    onUpdate(field.id, updates);
    setShowFieldTypeMenu(false);
  }, [field.id, field.type, onUpdate]);

  // Add option
  const addOption = useCallback(() => {
    const newOption = {
      id: `opt_${Date.now()}`,
      value: `option${(field.options || []).length + 1}`,
      label: `Option ${(field.options || []).length + 1}`
    };
    onUpdate(field.id, { 
      options: [...(field.options || []), newOption] 
    });
  }, [field.id, field.options, onUpdate]);

  // Update option
  const updateOption = useCallback((optionId, updates) => {
    const updatedOptions = (field.options || []).map(option =>
      option.id === optionId ? { ...option, ...updates } : option
    );
    onUpdate(field.id, { options: updatedOptions });
  }, [field.id, field.options, onUpdate]);

  // Delete option
  const deleteOption = useCallback((optionId) => {
    const updatedOptions = (field.options || []).filter(option => option.id !== optionId);
    onUpdate(field.id, { options: updatedOptions });
  }, [field.id, field.options, onUpdate]);

  const currentFieldType = FIELD_TYPES.find(ft => ft.type === field.type);
  const FieldIcon = currentFieldType?.icon || Type;

  // Check if field has options
  const hasOptions = ['select', 'checkbox', 'language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(field.type);
  const isSpecialConsultancyField = ['language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg transition-all ${
        isActive ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      onClick={onActivate}
    >
      <div className="p-6">
        {/* Question Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mt-1"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex-1">
            {/* Question Label */}
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                value={localLabel}
                onChange={(e) => setLocalLabel(e.target.value)}
                onBlur={handleLabelSave}
                onKeyPress={handleLabelKeyPress}
                className="flex-1 text-lg border-none outline-none bg-transparent placeholder-gray-400 focus:bg-gray-50 rounded px-2 py-1"
                placeholder="Question"
              />
              
              {/* Field Type Selector */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFieldTypeMenu(!showFieldTypeMenu);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FieldIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">{currentFieldType?.label}</span>
                </button>
                
                {showFieldTypeMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 min-w-64">
                    <div className="space-y-2">
                      {/* Basic Fields */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">Basic</div>
                        {FIELD_TYPES.filter(ft => ft.category === 'basic').map(fieldType => {
                          const Icon = fieldType.icon;
                          return (
                            <button
                              key={fieldType.type}
                              onClick={() => changeFieldType(fieldType.type)}
                              className={`w-full flex items-center p-2 hover:bg-gray-50 rounded text-left ${
                                field.type === fieldType.type ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{fieldType.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Contact Fields */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">Contact</div>
                        {FIELD_TYPES.filter(ft => ft.category === 'contact').map(fieldType => {
                          const Icon = fieldType.icon;
                          return (
                            <button
                              key={fieldType.type}
                              onClick={() => changeFieldType(fieldType.type)}
                              className={`w-full flex items-center p-2 hover:bg-gray-50 rounded text-left ${
                                field.type === fieldType.type ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{fieldType.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Consultancy Fields */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">Consultancy</div>
                        {FIELD_TYPES.filter(ft => ft.category === 'consultancy').map(fieldType => {
                          const Icon = fieldType.icon;
                          return (
                            <button
                              key={fieldType.type}
                              onClick={() => changeFieldType(fieldType.type)}
                              className={`w-full flex items-center p-2 hover:bg-gray-50 rounded text-left ${
                                field.type === fieldType.type ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{fieldType.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Choice Fields */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">Choices</div>
                        {FIELD_TYPES.filter(ft => ft.category === 'choice').map(fieldType => {
                          const Icon = fieldType.icon;
                          return (
                            <button
                              key={fieldType.type}
                              onClick={() => changeFieldType(fieldType.type)}
                              className={`w-full flex items-center p-2 hover:bg-gray-50 rounded text-left ${
                                field.type === fieldType.type ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{fieldType.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Document Fields */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">Documents</div>
                        {FIELD_TYPES.filter(ft => ft.category === 'documents').map(fieldType => {
                          const Icon = fieldType.icon;
                          return (
                            <button
                              key={fieldType.type}
                              onClick={() => changeFieldType(fieldType.type)}
                              className={`w-full flex items-center p-2 hover:bg-gray-50 rounded text-left ${
                                field.type === fieldType.type ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{fieldType.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field Content */}
            <div className="space-y-3">
              <FieldContent
                field={field}
                onUpdate={onUpdate}
                addOption={addOption}
                updateOption={updateOption}
                deleteOption={deleteOption}
              />
            </div>
          </div>
        </div>

        {/* Field Actions */}
        {isActive && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(field.id);
                }}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="text-sm">Delete</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Required</span>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Field Content Component
const FieldContent = ({ field, onUpdate, addOption, updateOption, deleteOption }) => {
  const renderFieldInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Long answer text'}
            className="w-full px-0 py-2 border-none outline-none bg-transparent resize-none border-b border-gray-300 focus:border-blue-500 transition-colors"
            rows={3}
            disabled
          />
        );
        
      case 'select':
      case 'checkbox':
      case 'language-selection':
      case 'proficiency-level':
      case 'education-level':
      case 'time-preference':
        const isReadOnly = ['language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(field.type);
        
        return (
          <div className="space-y-2">
            {(field.options || []).map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3">
                <div className="flex items-center">
                  {['select', 'language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(field.type) ? (
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                  )}
                </div>
                
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(option.id, { label: e.target.value, value: e.target.value.toLowerCase() })}
                  className={`flex-1 px-2 py-1 border-none outline-none bg-transparent focus:bg-gray-50 rounded ${isReadOnly ? 'text-gray-600' : ''}`}
                  placeholder={`Option ${index + 1}`}
                  readOnly={isReadOnly}
                />
                
                {!isReadOnly && (field.options || []).length > 1 && (
                  <button
                    onClick={() => deleteOption(option.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {!isReadOnly && (
              <button
                onClick={addOption}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  {['select', 'language-selection', 'proficiency-level', 'education-level', 'time-preference'].includes(field.type) ? (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  )}
                </div>
                <span className="text-sm">Add option</span>
              </button>
            )}
          </div>
        );
        
      case 'date':
        return (
          <div className="flex items-center space-x-2 py-2 border-b border-gray-300">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">Date</span>
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 font-medium mb-1">File Upload Area</p>
              <p className="text-sm text-gray-500">Users will be able to upload files here</p>
            </div>
            
            {/* File Upload Configuration */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">📁 Upload Settings</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File Type Purpose</label>
                <select
                  value={field.uploadPurpose || 'documents'}
                  onChange={(e) => onUpdate(field.id, { uploadPurpose: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="documents">📄 Documents (PDF, DOC, DOCX)</option>
                  <option value="photos">📸 Photos/ID (PNG, JPG, JPEG)</option>
                  <option value="certificates">🎓 Certificates (PDF, JPG, PNG)</option>
                  <option value="transcripts">📜 Academic Transcripts (PDF)</option>
                  <option value="cv">📝 CV/Resume (PDF, DOC, DOCX)</option>
                  <option value="passport">🛂 Passport/ID (JPG, PNG, PDF)</option>
                  <option value="test-scores">📊 Test Scores (PDF, JPG, PNG)</option>
                  <option value="any">📁 Any Document Type</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Maximum File Size</label>
                <select
                  value={field.maxSize || '10'}
                  onChange={(e) => onUpdate(field.id, { maxSize: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2">2 MB (Small files)</option>
                  <option value="5">5 MB (Standard)</option>
                  <option value="10">10 MB (Large files)</option>
                  <option value="20">20 MB (Very large)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`multiple-${field.id}`}
                    checked={field.allowMultiple || false}
                    onChange={(e) => onUpdate(field.id, { allowMultiple: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`multiple-${field.id}`} className="text-xs text-gray-600">
                    Multiple files
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`preview-${field.id}`}
                    checked={field.showPreview || false}
                    onChange={(e) => onUpdate(field.id, { showPreview: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`preview-${field.id}`} className="text-xs text-gray-600">
                    Show preview
                  </label>
                </div>
              </div>
              
              {/* Upload Instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instructions for Users (optional)</label>
                <textarea
                  value={field.uploadInstructions || ''}
                  onChange={(e) => onUpdate(field.id, { uploadInstructions: e.target.value })}
                  placeholder="e.g., Please upload a clear, high-quality scan of your certificate..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || 'Short answer text'}
            className="w-full px-0 py-2 border-none outline-none bg-transparent border-b border-gray-300 focus:border-blue-500 transition-colors"
            disabled
          />
        );
    }
  };

  return (
    <div>
      {renderFieldInput()}
      
      {/* Help Text */}
      <div className="mt-2">
        <input
          type="text"
          value={field.helpText || ''}
          onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
          placeholder="Help text (optional)"
          className="w-full px-0 py-1 text-sm border-none outline-none bg-transparent text-gray-600 placeholder-gray-400 focus:bg-gray-50 rounded"
        />
      </div>
    </div>
  );
};

export default DynamicFormBuilder; 