import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Eye, 
  Plus, 
  Edit, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  GraduationCap,
  MapPin,
  X,
  Settings,
  FormInput,
  Save,
  Trash2,
  QrCode,
  Copy,
  ExternalLink,
  Globe,
  Languages,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import EntityForm from '../../components/EntityForm';
import FormManagement from '../forms/FormManagement';
import api from '../../api/axios';

const AppliedStudents = () => {
  const [currentView, setCurrentView] = useState('applications'); // 'applications' or 'forms'
  const [applications, setApplications] = useState([]);
  const [forms, setForms] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [qrCode, setQRCode] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    language: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10
  });
  const [stats, setStats] = useState({});

  // Enhanced toast notifications
  const showSuccessToast = useCallback((message) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  }, []);

  const showErrorToast = useCallback((message) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  }, []);

  const showLoadingToast = useCallback((message) => {
    return toast.loading(message, {
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
      },
    });
  }, []);

  // Memoized API functions to prevent recreation on every render
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', pagination.current);
      params.append('limit', pagination.limit);

      const response = await api.get(`/api/forms/applications?${params}`);
      if (response.data.success) {
        setApplications(response.data.data.applications);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.totalPages,
          totalRecords: response.data.data.pagination.totalRecords
        }));
      }
    } catch (err) {
      setError('Failed to fetch applications');
      showErrorToast('Failed to fetch applications. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search, pagination.current, pagination.limit, showErrorToast]);

  const fetchForms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.language) params.append('language', filters.language);
      if (filters.category) params.append('category', filters.category);
      
      const response = await api.get(`/api/forms?${params}`);
      if (response.data.success) {
        setForms(response.data.data.forms);
      }
    } catch (err) {
      showErrorToast('Failed to fetch forms.');
      console.error('Failed to fetch forms:', err);
    }
  }, [filters.language, filters.category, showErrorToast]);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await api.get('/api/languages');
      if (response.data.success) {
        setLanguages(response.data.data);
      }
    } catch (err) {
      showErrorToast('Failed to fetch languages.');
      console.error('Failed to fetch languages:', err);
    }
  }, [showErrorToast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/forms/applications/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      showErrorToast('Failed to fetch statistics.');
      console.error('Failed to fetch stats:', err);
    }
  }, [showErrorToast]);

  // Initial data load - only on mount
  useEffect(() => {
    fetchLanguages();
    fetchStats();
  }, [fetchLanguages, fetchStats]);

  // Separate effect for applications that depend on filters
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Separate effect for forms that depend on form-specific filters
  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Memoized status badge function
  const getStatusBadge = useMemo(() => {
    return (status) => {
      const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        'under-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye },
        approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
        rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        waitlisted: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Calendar },
        cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: X }
      };

      const config = statusConfig[status] || statusConfig.pending;
      const Icon = config.icon;

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </span>
      );
    };
  }, []);

  // Memoized QR code generation
  const generateQRCode = useCallback(async (formSlug) => {
    const loadingToastId = showLoadingToast('Generating QR code...');
    const publicFormUrl = `http://localhost:5173/forms/${formSlug}`;
    try {
      const QRCode = (await import('qrcode')).default;
      const qrDataUrl = await QRCode.toDataURL(publicFormUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQRCode(qrDataUrl);
      setSelectedForm({ ...selectedForm, publicUrl: publicFormUrl });
      setShowQRModal(true);
      toast.dismiss(loadingToastId);
      showSuccessToast('📱 QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.dismiss(loadingToastId);
      // Fallback: just show the URL
      setSelectedForm({ ...selectedForm, publicUrl: publicFormUrl });
      setShowQRModal(true);
      showErrorToast('QR code generation failed, but you can still copy the link.');
    }
  }, [selectedForm, showSuccessToast, showErrorToast, showLoadingToast]);

  // Memoized copy form link
  const copyFormLink = useCallback(async (formSlug) => {
    const publicFormUrl = `http://localhost:5173/forms/${formSlug}`;
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      showSuccessToast('🔗 Form link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicFormUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccessToast('🔗 Form link copied to clipboard!');
    }
  }, [showSuccessToast]);

  // Memoized date formatter
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Memoized event handlers
  const handleViewApplication = useCallback((application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  }, []);

  const handleCreateForm = useCallback(async (formData) => {
    const loadingToastId = showLoadingToast('Creating form...');
    setFormLoading(true);
    try {
      // Transform form data to match backend expectations
      const transformedData = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category,
        language: formData.language || null, // null if empty string
        fields: [
          // Default basic fields - you can expand this later
          {
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            required: true,
            order: 1
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            order: 2
          },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            required: true,
            order: 3
          },
          {
            name: 'message',
            label: 'Message/Motivation',
            type: 'textarea',
            required: false,
            order: 4
          }
        ],
        emailNotifications: {
          enabled: formData.emailNotificationsEnabled || false,
          adminEmails: formData.adminEmails ? 
            formData.adminEmails.split('\n').map(email => email.trim()).filter(email => email) : 
            []
        },
        settings: {
          allowMultipleSubmissions: formData.allowMultipleSubmissions || false,
          requiresApproval: formData.requiresApproval !== false, // default to true
          submissionDeadline: formData.submissionDeadline || null
        },
        isActive: formData.isActive || false
      };

      const response = await api.post('/api/forms/create', transformedData);
      if (response.data.success) {
        await fetchForms();
        setShowFormBuilder(false);
        toast.dismiss(loadingToastId);
        showSuccessToast('🎉 Form created successfully!');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      toast.dismiss(loadingToastId);
      
      let errorMessage = 'Failed to create form. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      showErrorToast(errorMessage);
    } finally {
      setFormLoading(false);
    }
  }, [fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleUpdateForm = useCallback(async (formData) => {
    const loadingToastId = showLoadingToast('Updating form...');
    setFormLoading(true);
    try {
      // Transform form data to match backend expectations
      const transformedData = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category,
        language: formData.language || null,
        emailNotifications: {
          enabled: formData.emailNotificationsEnabled || false,
          adminEmails: formData.adminEmails ? 
            formData.adminEmails.split('\n').map(email => email.trim()).filter(email => email) : 
            []
        },
        settings: {
          allowMultipleSubmissions: formData.allowMultipleSubmissions || false,
          requiresApproval: formData.requiresApproval !== false,
          submissionDeadline: formData.submissionDeadline || null
        },
        isActive: formData.isActive || false
      };

      const response = await api.put(`/api/forms/${editingForm._id}`, transformedData);
      if (response.data.success) {
        await fetchForms();
        setEditingForm(null);
        setShowFormBuilder(false);
        toast.dismiss(loadingToastId);
        showSuccessToast('✅ Form updated successfully!');
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to update form. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setFormLoading(false);
    }
  }, [editingForm, fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleDeleteForm = useCallback(async (formId) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;
    
    const loadingToastId = showLoadingToast('Deleting form...');
    try {
      const response = await api.delete(`/api/forms/${formId}`);
      if (response.data.success) {
        await fetchForms();
        toast.dismiss(loadingToastId);
        showSuccessToast('🗑️ Form deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.dismiss(loadingToastId);
      showErrorToast('Failed to delete form. Please try again.');
    }
  }, [fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleDuplicateForm = useCallback(async (form) => {
    try {
      const newName = prompt('Enter name for the duplicated form:', `${form.name} (Copy)`);
      if (!newName) return;

      const loadingToastId = showLoadingToast('Duplicating form...');
      const response = await api.post(`/api/forms/${form._id}/duplicate`, { name: newName });
      if (response.data.success) {
        await fetchForms();
        toast.dismiss(loadingToastId);
        showSuccessToast('📋 Form duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating form:', error);
      showErrorToast('Failed to duplicate form. Please try again.');
    }
  }, [fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleUpdateStatus = useCallback(async (applicationId, status, reason = '') => {
    const loadingToastId = showLoadingToast('Updating status...');
    try {
      const response = await api.put(`/api/forms/applications/${applicationId}/status`, {
        status,
        reason,
        sendEmail: true
      });
      if (response.data.success) {
        await fetchApplications();
        setShowApplicationModal(false);
        toast.dismiss(loadingToastId);
        showSuccessToast('✅ Application status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.dismiss(loadingToastId);
      showErrorToast('Failed to update application status. Please try again.');
    }
  }, [fetchApplications, showSuccessToast, showErrorToast, showLoadingToast]);

  const filteredApplications = applications.filter(app => {
    return (
      (!filters.status || app.status === filters.status) &&
      (!filters.search || 
        app.studentInfo?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.studentInfo?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.applicationForm?.name?.toLowerCase().includes(filters.search.toLowerCase())
      )
    );
  });

  // Form builder schema for creating dynamic application forms
  const getFormBuilderSchema = useMemo(() => [
    {
      name: 'name',
      label: 'Form Name',
      type: 'text',
      rules: { required: 'Form name is required' },
      placeholder: 'e.g., German Course Application'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of this form...',
      rows: 3
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'language-course', label: 'Language Course' },
        { value: 'test-preparation', label: 'Test Preparation' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'general', label: 'General' }
      ],
      rules: { required: 'Please select a category' }
    },
    {
      name: 'language',
      label: 'Language (Optional)',
      type: 'select-fetch',
      fetchEndpoint: '/api/languages',
      transformOptions: (items) => [
        { value: '', label: 'General Form (No specific language)' },
        ...items.map(lang => ({
          value: lang._id,
          label: lang.name
        }))
      ],
      help: 'Link this form to a specific language course or leave as general'
    },
    {
      name: 'adminEmails',
      label: 'Admin Email Addresses',
      type: 'textarea',
      placeholder: 'Enter admin emails (one per line)\nexample1@domain.com\nexample2@domain.com',
      help: 'These emails will receive notifications when forms are submitted',
      rows: 3
    },
    {
      name: 'emailNotificationsEnabled',
      label: 'Email Notifications',
      type: 'checkbox',
      checkboxLabel: 'Send email notifications for this form'
    },
    {
      name: 'allowMultipleSubmissions',
      label: 'Multiple Submissions',
      type: 'checkbox',
      checkboxLabel: 'Allow users to submit this form multiple times'
    },
    {
      name: 'requiresApproval',
      label: 'Requires Approval',
      type: 'checkbox',
      checkboxLabel: 'Applications require manual approval'
    },
    {
      name: 'submissionDeadline',
      label: 'Submission Deadline (Optional)',
      type: 'datetime-local',
      help: 'Set a deadline for form submissions. Students won\'t be able to submit after this date and time.'
    },
    {
      name: 'isActive',
      label: 'Active Form',
      type: 'checkbox',
      checkboxLabel: 'Make this form active for new applications'
    }
  ], []);

  // Show form management view
  if (currentView === 'forms') {
    return <FormManagement />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentView === 'applications' ? 'Student Applications' : 'Form Management & Applications'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'applications' 
              ? 'Review and manage student applications' 
              : 'Create dynamic forms and manage student applications'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView(currentView === 'applications' ? 'forms' : 'applications')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              currentView === 'forms' 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {currentView === 'applications' ? (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Manage Forms
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                View Applications
              </>
            )}
          </button>
          {currentView === 'applications' && (
            <button
              onClick={async () => {
                console.log('Testing API connection...');
                try {
                  const response = await api.get('/api/languages');
                  console.log('API test successful:', response.data);
                  toast.success('API connection successful!');
                } catch (error) {
                  console.error('API test failed:', error);
                  toast.error('API connection failed. Check console for details.');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Test API
            </button>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedApplications || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FormInput className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{forms.filter(f => f.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={filters.language}
              onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="general">General Forms</option>
              {languages.map(lang => (
                <option key={lang._id} value={lang._id}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="language-course">Language Course</option>
              <option value="test-preparation">Test Preparation</option>
              <option value="consultation">Consultation</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => setFilters({ status: '', language: '', category: '', search: '' })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form & Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.studentInfo?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.studentInfo?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {application.applicationForm?.name || 'Unknown Form'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      {application.applicationForm?.language ? (
                        <>
                          <Languages className="w-3 h-3 mr-1" />
                          {application.applicationForm.language.name}
                        </>
                      ) : (
                        <span className="text-gray-400">General Form</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application._id, 'approved')}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application._id, 'rejected')}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredApplications.length}</span> of{' '}
                <span className="font-medium">{pagination.totalRecords || filteredApplications.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.studentInfo?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.studentInfo?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.studentInfo?.phoneNumber || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.studentInfo?.dateOfBirth || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedApplication.studentInfo?.address ? 
                            `${selectedApplication.studentInfo.address.street || ''} ${selectedApplication.studentInfo.address.city || ''}`.trim() || 'N/A'
                            : 'N/A'
                          }
                        </p>
                        <p className="text-xs text-gray-500">Address</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Application Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FormInput className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.applicationForm?.name || 'Unknown Form'}</p>
                        <p className="text-xs text-gray-500">Form Name</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Language</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApplication.applicationForm?.language?.name || 'General Form'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApplication.applicationForm?.category?.replace('-', ' ') || 'General'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Educational Background</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedApplication.education}</p>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Work Experience</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedApplication.experience}</p>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Motivation/Purpose</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedApplication.motivation}</p>
                </div>
              </div>

              {/* Custom Form Data */}
              {selectedApplication.formData && (
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedApplication.formData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                        <p className="text-sm text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Submitted Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FileText className="w-3 h-3 mr-1" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Share Form</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 text-center">
              <h4 className="text-md font-medium text-gray-900 mb-4">{selectedForm.name}</h4>
              
              {/* QR Code */}
              {qrCode && (
                <div className="mb-6">
                  <img 
                    src={qrCode} 
                    alt="QR Code for form" 
                    className="mx-auto border border-gray-200 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Scan QR code to access form</p>
                </div>
              )}
              
              {/* Form URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Form URL</label>
                <div className="flex">
                  <input
                    type="text"
                    value={selectedForm.publicUrl || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyFormLink(selectedForm.slug)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => window.open(selectedForm.publicUrl, '_blank')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Form
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingForm ? 'Edit Form' : 'Create New Application Form'}
              </h3>
              <button
                onClick={() => {
                  setShowFormBuilder(false);
                  setEditingForm(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {formLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    {editingForm ? 'Updating form...' : 'Creating form...'}
                  </span>
                </div>
              ) : (
                <EntityForm
                  schema={getFormBuilderSchema}
                  defaultValues={editingForm ? {
                    ...editingForm,
                    emailNotificationsEnabled: editingForm.emailNotifications?.enabled || false,
                    adminEmails: editingForm.emailNotifications?.adminEmails?.join('\n') || '',
                    allowMultipleSubmissions: editingForm.settings?.allowMultipleSubmissions || false,
                    requiresApproval: editingForm.settings?.requiresApproval !== false,
                    submissionDeadline: editingForm.settings?.submissionDeadline || ''
                  } : {}}
                  onSubmit={editingForm ? handleUpdateForm : handleCreateForm}
                  onCancel={() => {
                    setShowFormBuilder(false);
                    setEditingForm(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forms Management Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Forms Management</h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {forms.map((form) => (
                <div key={form._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{form.name}</h4>
                        {form.language && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <Languages className="w-3 h-3 mr-1" />
                            {form.language.name}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Category: {form.category?.replace('-', ' ') || 'General'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Fields: {form.fields?.length || 0}
                        </span>
                        <span className="text-xs text-gray-500">
                          Submissions: {form.submissions || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(form.createdAt)}
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => generateQRCode(form.slug)}
                        className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
                        title="Generate QR Code"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        QR
                      </button>
                      <button 
                        onClick={() => copyFormLink(form.slug)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </button>
                      <button 
                        onClick={() => window.open(`http://localhost:5173/forms/${form.slug}`, '_blank')}
                        className="text-green-600 hover:text-green-800 flex items-center text-sm"
                        title="Preview Form"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setEditingForm(form);
                          setShowFormModal(false);
                          setShowFormBuilder(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                        title="Edit Form"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicateForm(form)}
                        className="text-cyan-600 hover:text-cyan-800 text-sm"
                        title="Duplicate Form"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteForm(form._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete Form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {forms.length === 0 && (
                <div className="text-center py-8">
                  <FormInput className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No forms created yet.</p>
                  <button
                    onClick={() => {
                      setShowFormModal(false);
                      setShowFormBuilder(true);
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Create your first form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Enhanced Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          // Global toast options
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
          },
        }}
      />
    </div>
  );
};

export default AppliedStudents;