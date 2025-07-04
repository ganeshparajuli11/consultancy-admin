// API Service for Form Management
import axios from '../api/axios'; // Use the existing axios configuration

class ApiService {
  constructor() {
    // Use the same axios instance that has proper auth and base URL
    this.api = axios;
  }

  // Helper method for making requests with proper error handling
  async makeRequest(endpoint, options = {}) {
    try {
      let response;
      
      if (options.method === 'POST') {
        response = await this.api.post(endpoint, options.body);
      } else if (options.method === 'PUT') {
        response = await this.api.put(endpoint, options.body);
      } else if (options.method === 'DELETE') {
        response = await this.api.delete(endpoint);
      } else {
        response = await this.api.get(endpoint);
      }
      
      return response.data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ===========================================
  // FORM MANAGEMENT
  // ===========================================

  /**
   * Create a new form
   */
  async createForm(formData) {
    const payload = {
      name: formData.title || formData.name,
      description: formData.description || '',
      fields: this.mapFieldsForBackend(formData.fields || []),
      category: formData.category || 'general',
      language: formData.language || null,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      emailNotifications: {
        enabled: true,
        adminEmails: [],
        autoReplyTemplate: {
          subject: `Thank you for your application to ${formData.title || formData.name}`,
          message: 'We have received your application and will review it shortly.'
        }
      },
      settings: {
        allowMultipleSubmissions: false,
        maxSubmissions: 1,
        requiresApproval: true,
        maxCapacity: null,
        submissionDeadline: null
      }
    };

    return this.makeRequest('/api/forms/create', {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Get all forms
   */
  async getAllForms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/forms${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Get form by ID
   */
  async getFormById(formId) {
    return this.makeRequest(`/api/forms/${formId}`);
  }

  /**
   * Update form
   */
  async updateForm(formId, formData) {
    const payload = {
      name: formData.title || formData.name,
      description: formData.description || '',
      fields: this.mapFieldsForBackend(formData.fields || []),
      category: formData.category || 'general',
      language: formData.language || null,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    };

    return this.makeRequest(`/api/forms/${formId}`, {
      method: 'PUT',
      body: payload,
    });
  }

  /**
   * Delete form
   */
  async deleteForm(formId, permanent = false) {
    const endpoint = `/api/forms/${formId}${permanent ? '?permanent=true' : ''}`;
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Get languages for form creation
   */
  async getLanguages() {
    return this.makeRequest('/api/forms/languages');
  }

  // ===========================================
  // FORM SUBMISSION (Public)
  // ===========================================

  /**
   * Submit application form (public endpoint)
   */
  async submitApplication(formId, applicationData) {
    // Process file uploads first
    const processedData = await this.processFormSubmission(applicationData);
    
    return this.makeRequest(`/api/forms/${formId}/submit`, {
      method: 'POST',
      body: processedData,
    });
  }

  // ===========================================
  // FILE UPLOAD HANDLING
  // ===========================================

  /**
   * Upload file to Cloudinary via backend
   */
  async uploadFile(file, folder = 'langzy/forms') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await this.api.post('/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, folder = 'langzy/forms') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  // ===========================================
  // APPLICATION MANAGEMENT
  // ===========================================

  /**
   * Get all applications
   */
  async getAllApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/applications${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId) {
    return this.makeRequest(`/api/applications/${applicationId}`);
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, statusData) {
    return this.makeRequest(`/api/applications/${applicationId}/status`, {
      method: 'PUT',
      body: statusData,
    });
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  /**
   * Map frontend field format to backend format
   */
  mapFieldsForBackend(fields) {
    return fields.map((field, index) => ({
      name: this.generateFieldName(field.label || `field_${index + 1}`),
      label: field.label || `Field ${index + 1}`,
      type: this.mapFieldType(field.type),
      required: Boolean(field.required),
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      order: field.order !== undefined ? field.order : index,
      options: this.mapFieldOptions(field),
      validation: this.mapFieldValidation(field)
    }));
  }

  /**
   * Generate field name from label
   */
  generateFieldName(label) {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Map frontend field types to backend field types
   */
  mapFieldType(frontendType) {
    const typeMap = {
      'language-selection': 'select',
      'proficiency-level': 'select',
      'education-level': 'select',
      'time-preference': 'select',
      'file': 'file'
    };
    
    return typeMap[frontendType] || frontendType;
  }

  /**
   * Map field options for select/checkbox fields
   */
  mapFieldOptions(field) {
    if (!field.options || !Array.isArray(field.options)) {
      return [];
    }
    
    return field.options.map(option => ({
      value: option.value || option.id,
      label: option.label
    }));
  }

  /**
   * Map field validation rules
   */
  mapFieldValidation(field) {
    const validation = {};
    
    if (field.type === 'text' || field.type === 'textarea') {
      if (field.minLength) validation.minLength = parseInt(field.minLength);
      if (field.maxLength) validation.maxLength = parseInt(field.maxLength);
    }
    
    if (field.type === 'number') {
      if (field.min !== undefined) validation.min = parseFloat(field.min);
      if (field.max !== undefined) validation.max = parseFloat(field.max);
    }
    
    if (field.pattern) {
      validation.pattern = field.pattern;
    }
    
    return validation;
  }

  /**
   * Get accepted file types based on upload purpose
   */
  getFileAcceptTypes(purpose) {
    const acceptMap = {
      'photos': '.png,.jpg,.jpeg',
      'documents': '.pdf,.doc,.docx',
      'certificates': '.pdf,.jpg,.jpeg,.png',
      'transcripts': '.pdf',
      'cv': '.pdf,.doc,.docx',
      'passport': '.jpg,.jpeg,.png,.pdf',
      'test-scores': '.pdf,.jpg,.jpeg,.png'
    };
    
    return acceptMap[purpose] || '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  }

  /**
   * Process form submission data including file uploads
   */
  async processFormSubmission(formData) {
    // Handle file uploads
    const processedData = { ...formData };
    
    // Process any file fields in the form data
    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File || value instanceof FileList) {
        try {
          if (value instanceof FileList) {
            const uploadResults = await this.uploadMultipleFiles(Array.from(value));
            processedData[key] = uploadResults.map(result => result.data.url);
          } else {
            const uploadResult = await this.uploadFile(value);
            processedData[key] = uploadResult.data.url;
          }
        } catch (error) {
          console.error(`File upload failed for ${key}:`, error);
          throw new Error(`Failed to upload ${key}. Please try again.`);
        }
      }
    }
    
    return processedData;
  }

  /**
   * Generate form URL for sharing
   */
  generateFormUrl(formData) {
    // Use environment variable for frontend URL, fallback to localhost:5173 for development
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5174';
    
    // Use slug if available (better for SEO), otherwise use ID
    const identifier = formData.slug || formData._id || formData.id || formData;
    
    return `${frontendUrl}/forms/${identifier}`;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService; 