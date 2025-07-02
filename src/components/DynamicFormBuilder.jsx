import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
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
  CreditCard,
  User,
  Users,
  BookOpen,
  Award,
  Briefcase
} from 'lucide-react';
import toastManager from '../utils/toastManager';

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

// Enhanced field types for consultancy context
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type, description: 'Single line text field' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email address with validation' },
  { value: 'tel', label: 'Phone', icon: Phone, description: 'Phone number input' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input only' },
  { value: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text field' },
  { value: 'select', label: 'Dropdown', icon: List, description: 'Single selection dropdown' },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple selection checkboxes' },
  { value: 'radio', label: 'Radio Buttons', icon: CheckSquare, description: 'Single selection from options' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'url', label: 'Website URL', icon: Globe, description: 'URL input with validation' },
  { value: 'rating', label: 'Rating Scale', icon: Star, description: '1-5 star rating scale' },
  { value: 'address', label: 'Address', icon: MapPin, description: 'Full address input' },
  { value: 'file', label: 'File Upload', icon: FileText, description: 'Document/image upload' },
  { value: 'language-level', label: 'Language Level', icon: Award, description: 'Language proficiency level' },
  { value: 'language-selection', label: 'Language Choice', icon: Globe, description: 'Select preferred language to learn' },
  { value: 'education-level', label: 'Education Level', icon: BookOpen, description: 'Academic qualification level' },
  { value: 'experience', label: 'Experience Years', icon: Briefcase, description: 'Years of experience input' }
];

const DynamicFormBuilder = ({ initialFields = [], onChange }) => {
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const isInitialized = useRef(false);

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

  // Normalize initial fields with proper memoization
  const normalizeFields = useCallback((fieldsToNormalize) => {
    return fieldsToNormalize.map((field, index) => ({
      id: field.id || `field_${Date.now()}_${index}`,
      name: field.name || `field_${index + 1}`,
      label: field.label || `Field ${index + 1}`,
      type: field.type || 'text',
      required: field.required || false,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      order: field.order !== undefined ? field.order : index,
      options: field.options || [],
      validation: {
        minLength: field.validation?.minLength || null,
        maxLength: field.validation?.maxLength || null,
        ...field.validation
      }
    }));
  }, []);

  // Simplified initialization - only run once when component mounts or initialFields change
  useEffect(() => {
    // Only initialize if we have initial fields and haven't initialized yet, 
    // OR if initial fields changed (for editing existing forms)
    if (initialFields.length > 0 && (!isInitialized.current || fields.length === 0)) {
      const normalizedFields = normalizeFields(initialFields);
      setFields(normalizedFields);
      isInitialized.current = true;
    } else if (initialFields.length === 0 && !isInitialized.current) {
      // Initialize with empty array if no initial fields
      setFields([]);
      isInitialized.current = true;
    }
  }, [initialFields, normalizeFields]);

  // Notify parent of changes with minimal debounce
  useEffect(() => {
    if (isInitialized.current && onChange) {
      const timeoutId = setTimeout(() => {
        onChange(fields);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fields, onChange]);

  // Get default options for specific field types
  const getDefaultOptions = useCallback((fieldType) => {
    switch (fieldType) {
      case 'language-level':
        return [
          { value: 'beginner', label: 'Beginner (A1)' },
          { value: 'elementary', label: 'Elementary (A2)' },
          { value: 'intermediate', label: 'Intermediate (B1)' },
          { value: 'upper-intermediate', label: 'Upper Intermediate (B2)' },
          { value: 'advanced', label: 'Advanced (C1)' },
          { value: 'proficient', label: 'Proficient (C2)' }
        ];
      case 'language-selection':
        return [
          { value: 'english', label: 'English' },
          { value: 'german', label: 'German' },
          { value: 'french', label: 'French' },
          { value: 'spanish', label: 'Spanish' },
          { value: 'italian', label: 'Italian' },
          { value: 'japanese', label: 'Japanese' },
          { value: 'chinese', label: 'Chinese' },
          { value: 'korean', label: 'Korean' },
          { value: 'arabic', label: 'Arabic' },
          { value: 'portuguese', label: 'Portuguese' },
          { value: 'russian', label: 'Russian' },
          { value: 'other', label: 'Other' }
        ];
      case 'education-level':
        return [
          { value: 'high-school', label: 'High School' },
          { value: 'associate', label: 'Associate Degree' },
          { value: 'bachelor', label: 'Bachelor\'s Degree' },
          { value: 'master', label: 'Master\'s Degree' },
          { value: 'phd', label: 'PhD/Doctorate' },
          { value: 'other', label: 'Other' }
        ];
      case 'rating':
        return [
          { value: '1', label: '1 - Poor' },
          { value: '2', label: '2 - Fair' },
          { value: '3', label: '3 - Good' },
          { value: '4', label: '4 - Very Good' },
          { value: '5', label: '5 - Excellent' }
        ];
      case 'select':
      case 'radio':
      case 'checkbox':
        return [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ];
      default:
        return [];
    }
  }, []);

  // Add field with smart defaults
  const addField = useCallback((type) => {
    const fieldTypeInfo = FIELD_TYPES.find(ft => ft.value === type);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${type}_${fields.length + 1}`,
      label: fieldTypeInfo?.label || `New ${type} Field`,
      type: type,
      required: false,
      placeholder: getFieldPlaceholder(type),
      helpText: '',
      order: fields.length,
      options: getDefaultOptions(type),
      validation: {
        minLength: null,
        maxLength: null
      }
    };
    
    setFields(prev => [...prev, newField]);
    setEditingField(newField.id);
    
    // Only show toast for specific field types or if explicitly requested
    if (['file', 'rating', 'address', 'language-level', 'language-selection', 'education-level'].includes(type)) {
      toastManager.success(`${fieldTypeInfo?.label} field added`);
    }
  }, [fields.length, getDefaultOptions]);

  // Get smart placeholder for field types
  const getFieldPlaceholder = (type) => {
    const placeholders = {
      'text': 'Enter text...',
      'email': 'Enter email address...',
      'tel': 'Enter phone number...',
      'number': 'Enter number...',
      'textarea': 'Enter detailed information...',
      'url': 'https://example.com',
      'address': 'Enter full address...',
      'experience': 'Enter years of experience...',
      'date': '',
      'file': '',
      'select': '',
      'radio': '',
      'checkbox': '',
      'rating': '',
      'language-level': '',
      'language-selection': '',
      'education-level': ''
    };
    return placeholders[type] || 'Enter value...';
  };

  // Enhanced update field function - ensures proper re-rendering
  const updateField = useCallback((fieldId, updates) => {
    setFields(prevFields => {
      const fieldIndex = prevFields.findIndex(field => field.id === fieldId);
      if (fieldIndex === -1) {
        console.warn('⚠️ Field not found:', fieldId);
        return prevFields;
      }
      
      const updatedFields = [...prevFields];
      const currentField = updatedFields[fieldIndex];
      
      // Create completely new field object to ensure re-render
      const updatedField = { 
        ...currentField, 
        ...updates,
        validation: { 
          ...currentField.validation, 
          ...(updates.validation || {}) 
        }
      };
      
      updatedFields[fieldIndex] = updatedField;
      return updatedFields;
    });
  }, []);

  // Delete field function
  const deleteField = useCallback((fieldId) => {
    const fieldToDelete = fields.find(f => f.id === fieldId);
    
    setFields(prev => prev.filter(field => field.id !== fieldId));
    setEditingField(null);
    
    // Show minimal feedback for deletion
    toastManager.success('Field removed');
  }, [fields]);

  // Move field function
  const moveField = useCallback((fieldId, direction) => {
    setFields(prevFields => {
      const currentIndex = prevFields.findIndex(f => f.id === fieldId);
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === prevFields.length - 1)
      ) return prevFields;

      const newFields = [...prevFields];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      [newFields[currentIndex], newFields[targetIndex]] = 
      [newFields[targetIndex], newFields[currentIndex]];
      
      // Update order
      newFields.forEach((field, index) => {
        field.order = index;
      });
      
      return newFields;
    });
  }, []);

  // Drag end handler
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const newFields = arrayMove(items, oldIndex, newIndex);
        
        // Update order
        newFields.forEach((field, index) => {
          field.order = index;
        });
        
        return newFields;
      });
    }
  }, []);

  // Option management functions
  const addOption = useCallback((fieldId) => {
    setFields(prevFields => {
      return prevFields.map(field => {
        if (field.id === fieldId) {
          const newOption = {
            value: `option_${field.options.length + 1}`,
            label: `Option ${field.options.length + 1}`
          };
          return {
            ...field,
            options: [...field.options, newOption]
          };
        }
        return field;
      });
    });
  }, []);

  const updateOption = useCallback((fieldId, optionIndex, updates) => {
    setFields(prevFields => {
      return prevFields.map(field => {
        if (field.id === fieldId) {
          const updatedOptions = field.options.map((option, index) =>
            index === optionIndex ? { ...option, ...updates } : option
          );
          return { ...field, options: updatedOptions };
        }
        return field;
      });
    });
  }, []);

  const deleteOption = useCallback((fieldId, optionIndex) => {
    setFields(prevFields => {
      return prevFields.map(field => {
        if (field.id === fieldId) {
          const updatedOptions = field.options.filter((_, index) => index !== optionIndex);
          return { ...field, options: updatedOptions };
        }
        return field;
      });
    });
  }, []);

  // Sortable Field Component - Removed memo to allow updates
  const SortableField = ({ field, index }) => {
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

    const FieldTypeIcon = FIELD_TYPES.find(ft => ft.value === field.type)?.icon || Type;

    return (
      <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              title="Drag to reorder"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <FieldTypeIcon className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">{field.label || 'Untitled Field'}</h4>
              <p className="text-sm text-gray-500">
                {FIELD_TYPES.find(ft => ft.value === field.type)?.label || field.type}
                {field.required && ' • Required'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveField(field.id, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              disabled={index === fields.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingField(
                editingField === field.id ? null : field.id
              )}
              className={`p-1 transition-colors rounded ${
                editingField === field.id 
                  ? 'text-blue-800 bg-blue-100' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
              title="Edit field"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteField(field.id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title="Delete field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {editingField === field.id && (
          <FieldEditor 
            key={field.id}
            field={field} 
            updateField={updateField}
            addOption={addOption}
            updateOption={updateOption}
            deleteOption={deleteOption}
          />
        )}
      </div>
    );
  };

  // Field Editor Component - Properly reactive to field changes
  const FieldEditor = React.memo(({ field, updateField, addOption, updateOption, deleteOption }) => {
    // Local state for inputs to prevent focus loss
    const [localValues, setLocalValues] = useState({
      name: field.name || '',
      label: field.label || '',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      required: field.required || false
    });

    // Update local state when field prop changes (for external updates)
    useEffect(() => {
      setLocalValues({
        name: field.name || '',
        label: field.label || '',
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        required: field.required || false
      });
    }, [field.id]); // Only update when field ID changes (new field selected)

    // Handle local state changes (only visual updates)
    const handleLocalChange = useCallback((key, value) => {
      setLocalValues(prev => ({ ...prev, [key]: value }));
    }, []);

    // Handle saving changes (on blur or Enter)
    const handleSaveChange = useCallback((key, value) => {
      updateField(field.id, { [key]: value });
    }, [field.id, updateField]);

    // Handle key press events
    const handleKeyPress = useCallback((e, key, value) => {
      if (e.key === 'Enter') {
        e.target.blur(); // This will trigger onBlur
      }
    }, []);

    // Handle immediate updates (like checkbox)
    const handleImmediateUpdate = useCallback((key, value) => {
      setLocalValues(prev => ({ ...prev, [key]: value }));
      updateField(field.id, { [key]: value });
    }, [field.id, updateField]);

    const handleValidationUpdate = useCallback((validationKey, value) => {
      updateField(field.id, {
        validation: {
          ...field.validation,
          [validationKey]: value
        }
      });
    }, [field.id, field.validation, updateField]);

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Field Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name (Internal)
            </label>
            <input
              type="text"
              value={localValues.name}
              onChange={(e) => handleLocalChange('name', e.target.value)}
              onBlur={(e) => handleSaveChange('name', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="field_name"
            />
            <p className="text-xs text-gray-500 mt-1">Used for form processing (no spaces)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label (User Visible) *
            </label>
            <input
              type="text"
              value={localValues.label}
              onChange={(e) => handleLocalChange('label', e.target.value)}
              onBlur={(e) => handleSaveChange('label', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Field Label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={localValues.placeholder}
              onChange={(e) => handleLocalChange('placeholder', e.target.value)}
              onBlur={(e) => handleSaveChange('placeholder', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'placeholder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter placeholder..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localValues.required}
                onChange={(e) => handleImmediateUpdate('required', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Required Field</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Help Text
          </label>
          <textarea
            value={localValues.helpText}
            onChange={(e) => handleLocalChange('helpText', e.target.value)}
            onBlur={(e) => handleSaveChange('helpText', e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'helpText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional help text for users..."
            rows={2}
          />
        </div>

        {/* Options for select/radio/checkbox fields */}
        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && 
         !['language-level', 'language-selection', 'education-level', 'rating'].includes(field.type) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <button
                onClick={() => addOption(field.id)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium hover:bg-blue-50 px-2 py-1 rounded"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </button>
            </div>
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.value || ''}
                    onChange={(e) => updateOption(field.id, index, { value: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={option.label || ''}
                    onChange={(e) => updateOption(field.id, index, { label: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Label"
                  />
                  <button
                    onClick={() => deleteOption(field.id, index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation settings for text fields */}
        {['text', 'textarea', 'email'].includes(field.type) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={field.validation?.minLength || ''}
                onChange={(e) => handleValidationUpdate('minLength', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={field.validation?.maxLength || ''}
                onChange={(e) => handleValidationUpdate('maxLength', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
                min="1"
              />
            </div>
          </div>
        )}

        {/* Preview of field */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-2">Preview:</p>
          <FieldPreview field={field} />
        </div>
      </div>
    );
  });

  // Field Preview Component
  const FieldPreview = ({ field }) => {
    const renderPreview = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              rows={3}
              disabled
            />
          );
        case 'select':
          return (
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" disabled>
              <option>Select an option...</option>
              {field.options?.map((option, index) => (
                <option key={index}>{option.label}</option>
              ))}
            </select>
          );
        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input type="radio" disabled className="text-blue-600" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );
        case 'checkbox':
          return (
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="text-blue-600" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );
        case 'date':
          return (
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              disabled
            />
          );
        case 'file':
          return (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            </div>
          );
        case 'rating':
          return (
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 text-gray-300" />
              ))}
            </div>
          );
        default:
          return (
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              disabled
            />
          );
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {renderPreview()}
        {field.helpText && (
          <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
        )}
      </div>
    );
  };

  // Memoize field IDs for drag and drop
  const fieldIds = useMemo(() => fields.map(field => field.id), [fields]);

  // Main render content
  const fieldsContent = (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <SortableField key={field.id} field={field} index={index} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Field Type Selector */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Field</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FIELD_TYPES.map(fieldType => {
            const Icon = fieldType.icon;
            return (
              <button
                key={fieldType.value}
                onClick={() => addField(fieldType.value)}
                className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group text-left"
                title={fieldType.description}
              >
                <Icon className="w-6 h-6 mb-2 text-gray-600 group-hover:text-blue-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-center">
                  {fieldType.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  {fieldType.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fields List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">No fields added yet</p>
            <p className="text-gray-400 text-sm mb-4">Add fields using the buttons above to get started</p>
            <p className="text-sm text-blue-600">
              💡 Tip: For student applications, consider adding fields like Name, Email, Phone, Education Level, and Language Level
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              {fieldsContent}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default DynamicFormBuilder; 