// Excel Export Utility for Form Responses
// This utility provides functions to export form responses to Excel format
// with customizable field selection

import React from 'react';
import toastManager from './toastManager';

/**
 * Generate Excel file with selected fields
 * @param {Array} responses - Array of form responses
 * @param {Array} selectedFields - Array of field IDs to include in export
 * @param {Array} formFields - Form field definitions
 * @param {Object} metadata - Form metadata (title, description, etc.)
 * @returns {void}
 */
export const exportToExcel = (responses = [], selectedFields = [], formFields = [], metadata = {}) => {
  try {
    // Filter fields based on selection
    const fieldsToExport = formFields.filter(field => 
      selectedFields.length === 0 || selectedFields.includes(field.id)
    );

    if (fieldsToExport.length === 0) {
      toastManager.warning('Please select at least one field to export');
      return;
    }

    // Create CSV content (as a fallback for Excel)
    const csvContent = generateCSVContent(responses, fieldsToExport, metadata);
    
    // Create and download file
    downloadFile(csvContent, `${metadata.title || 'form-responses'}.csv`, 'text/csv');
    
    toastManager.success(`Exported ${responses.length} responses with ${fieldsToExport.length} fields`);
  } catch (error) {
    console.error('Export error:', error);
    toastManager.error('Failed to export data. Please try again.');
  }
};

/**
 * Generate CSV content from responses
 * @param {Array} responses 
 * @param {Array} fields 
 * @param {Object} metadata 
 * @returns {string}
 */
const generateCSVContent = (responses, fields, metadata) => {
  const headers = fields.map(field => field.label || field.name);
  const rows = [];

  // Add metadata as comments
  if (metadata.title) {
    rows.push(`# Form: ${metadata.title}`);
  }
  if (metadata.description) {
    rows.push(`# Description: ${metadata.description}`);
  }
  if (metadata.category) {
    rows.push(`# Category: ${metadata.category}`);
  }
  rows.push(`# Exported on: ${new Date().toLocaleString()}`);
  rows.push(''); // Empty line

  // Add headers
  rows.push(headers.map(escapeCSV).join(','));

  // Add data rows
  responses.forEach(response => {
    const row = fields.map(field => {
      const value = response[field.name] || response[field.id] || '';
      return escapeCSV(formatFieldValue(value, field));
    });
    rows.push(row.join(','));
  });

  return rows.join('\n');
};

/**
 * Format field value based on field type
 * @param {any} value 
 * @param {Object} field 
 * @returns {string}
 */
const formatFieldValue = (value, field) => {
  if (value === null || value === undefined) return '';
  
  switch (field.type) {
    case 'checkbox':
      return Array.isArray(value) ? value.join('; ') : value;
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : value;
    case 'email':
    case 'tel':
    case 'url':
      return value.toString();
    default:
      return value.toString();
  }
};

/**
 * Escape CSV values
 * @param {string} value 
 * @returns {string}
 */
const escapeCSV = (value) => {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // If value contains comma, quotes, or newlines, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
};

/**
 * Download file
 * @param {string} content 
 * @param {string} filename 
 * @param {string} mimeType 
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  window.URL.revokeObjectURL(url);
};

/**
 * Generate sample data for demonstration
 * @param {Array} formFields 
 * @param {number} count 
 * @returns {Array}
 */
export const generateSampleData = (formFields, count = 10) => {
  const sampleResponses = [];
  
  for (let i = 0; i < count; i++) {
    const response = {
      id: `response_${i + 1}`,
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    };
    
    formFields.forEach(field => {
      response[field.name || field.id] = generateSampleValue(field, i);
    });
    
    sampleResponses.push(response);
  }
  
  return sampleResponses;
};

/**
 * Generate sample value based on field type
 * @param {Object} field 
 * @param {number} index 
 * @returns {any}
 */
const generateSampleValue = (field, index) => {
  const names = ['Rajesh Sharma', 'Sita Poudel', 'Ram Bahadur', 'Maya Gurung', 'Bikash Thapa', 'Priya Singh', 'Arjun KC', 'Sunita Rai'];
  const emails = ['rajesh@email.com', 'sita.p@gmail.com', 'ram.b@yahoo.com', 'maya.g@hotmail.com', 'bikash.t@outlook.com'];
  const phones = ['+977-9841234567', '+977-9851234568', '+977-9861234569', '+977-9841234570', '+977-9851234571'];
  
  switch (field.type) {
    case 'text':
      if (field.label?.toLowerCase().includes('name')) {
        return names[index % names.length];
      }
      return `Sample text ${index + 1}`;
      
    case 'email':
      return emails[index % emails.length];
      
    case 'tel':
      return phones[index % phones.length];
      
    case 'number':
      return Math.floor(Math.random() * 100) + 1;
      
    case 'date':
      return new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
    case 'select':
    case 'language-selection':
    case 'proficiency-level':
    case 'education-level':
    case 'time-preference':
      const options = field.options || [];
      return options.length > 0 ? options[index % options.length].value : 'sample-option';
      
    case 'checkbox':
      const checkboxOptions = field.options || [];
      const selectedCount = Math.floor(Math.random() * Math.min(3, checkboxOptions.length)) + 1;
      const selected = checkboxOptions.slice(0, selectedCount).map(opt => opt.value);
      return selected;
      
    case 'textarea':
      return `This is a sample paragraph response for ${field.label}. It contains multiple sentences to demonstrate how longer text responses would appear in the exported data.`;
      
    case 'url':
      return 'https://example.com';
      
    default:
      return `Sample ${field.type} value`;
  }
};

/**
 * Field Selection Component for Export
 */
export const FieldSelector = ({ formFields, selectedFields, onSelectionChange, onExport }) => {
  const toggleField = (fieldId) => {
    const newSelection = selectedFields.includes(fieldId)
      ? selectedFields.filter(id => id !== fieldId)
      : [...selectedFields, fieldId];
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange(formFields.map(field => field.id));
  };

  const selectNone = () => {
    onSelectionChange([]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Select Fields to Export</h3>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Select None
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {formFields.map(field => (
          <label key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFields.includes(field.id)}
              onChange={() => toggleField(field.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label || field.name}</span>
          </label>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">
          {selectedFields.length} of {formFields.length} fields selected
        </span>
        <button
          onClick={onExport}
          disabled={selectedFields.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default {
  exportToExcel,
  generateSampleData,
  FieldSelector
}; 