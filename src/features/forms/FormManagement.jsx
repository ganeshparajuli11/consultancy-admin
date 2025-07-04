import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Settings, 
  ArrowLeft,
  Search,
  Filter,
  Download,
  QrCode,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart3,
  GraduationCap,
  Globe,
  MapPin,
  Send,
  FileIcon,
  MessageSquare,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import DynamicFormBuilder from '../../components/DynamicFormBuilder';
import api from '../../api/axios';
import apiService from '../../services/api';

const FormManagement = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'submissions'
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    language: '',
    status: '',
    isActive: ''
  });
  const [submissionFilters, setSubmissionFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

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

  // Memoized API functions
  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/forms');
      if (response.data.success) {
        setForms(response.data.data.forms);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      showErrorToast('Failed to fetch forms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await api.get('/api/languages');
      if (response.data.success) {
        setLanguages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      showErrorToast('Failed to fetch languages.');
    }
  }, [showErrorToast]);

  const fetchFormSubmissions = useCallback(async (formId) => {
    try {
      setSubmissionsLoading(true);
      console.log('Fetching submissions for form:', formId);
      
      const params = new URLSearchParams();
      params.append('formId', formId);
      if (submissionFilters.search) params.append('search', submissionFilters.search);
      if (submissionFilters.status) params.append('status', submissionFilters.status);
      if (submissionFilters.priority) params.append('priority', submissionFilters.priority);
      params.append('sortBy', submissionFilters.sortBy);
      params.append('sortOrder', submissionFilters.sortOrder);

      const apiUrl = `/api/forms/applications?${params}`;
      console.log('API URL:', apiUrl);
      console.log('Full URL would be:', `${api.defaults.baseURL}${apiUrl}`);

      const response = await api.get(apiUrl);
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        setSubmissions(response.data.data.applications);
        console.log('Submissions set:', response.data.data.applications.length, 'items');
      } else {
        console.error('API returned unsuccessful response:', response.data);
        setSubmissions([]);
        showErrorToast('No submissions found for this form.');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setSubmissions([]);
      if (error.response?.status === 404) {
        showErrorToast('Submissions endpoint not found. The feature may not be implemented yet.');
      } else if (error.response?.status === 401) {
        showErrorToast('Authentication required. Please login again.');
      } else {
        showErrorToast(`Failed to fetch submissions: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setSubmissionsLoading(false);
    }
  }, [submissionFilters, showErrorToast]);

  // Update submission status
  const updateSubmissionStatus = useCallback(async (submissionId, newStatus) => {
    const loadingToastId = showLoadingToast(`Updating status to ${newStatus}...`);
    try {
      const response = await api.put(`/api/forms/applications/${submissionId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.dismiss(loadingToastId);
        showSuccessToast(`✅ Status updated to ${newStatus}!`);
        
        // Refresh submissions if we're viewing them
        if (selectedForm) {
          await fetchFormSubmissions(selectedForm._id);
        }
        
        // Update selected submission if it's open
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission(prev => ({
            ...prev,
            status: newStatus
          }));
        }
      } else {
        toast.dismiss(loadingToastId);
        showErrorToast('Failed to update status: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to update status. Please try again.';
      showErrorToast(errorMessage);
    }
  }, [selectedForm, selectedSubmission, fetchFormSubmissions, showSuccessToast, showErrorToast, showLoadingToast]);

  // Fetch submission detail
  const fetchSubmissionDetail = useCallback(async (submissionId) => {
    try {
      const response = await api.get(`/api/forms/applications/${submissionId}`);
      if (response.data.success) {
        setSelectedSubmission(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      showErrorToast('Failed to fetch submission details.');
    }
  }, [showErrorToast]);

  // Initial data loading
  useEffect(() => {
    fetchForms();
    fetchLanguages();
  }, [fetchForms, fetchLanguages]);

  // Memoized form handlers
  const handleCreateForm = useCallback(async (formData) => {
    const loadingToastId = showLoadingToast('Creating form...');
    try {
      const response = await api.post('/api/forms/create', formData);
      if (response.data.success) {
        toast.dismiss(loadingToastId);
        showSuccessToast('🎉 Form created successfully!');
        fetchForms();
        setCurrentView('list');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to create form. Please try again.';
      showErrorToast(errorMessage);
    }
  }, [fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleUpdateForm = useCallback(async (formId, formData) => {
    const loadingToastId = showLoadingToast('Updating form...');
    try {
      const response = await api.put(`/api/forms/${formId}`, formData);
      if (response.data.success) {
        toast.dismiss(loadingToastId);
        showSuccessToast('✅ Form updated successfully!');
        fetchForms();
        setCurrentView('list');
        setEditingForm(null);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to update form. Please try again.';
      showErrorToast(errorMessage);
    }
  }, [fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const handleDeleteForm = useCallback(async () => {
    if (!formToDelete) return;
    
    const loadingToastId = showLoadingToast('Deleting form...');
    try {
      const response = await api.delete(`/api/forms/${formToDelete._id}`);
      if (response.data.success) {
        toast.dismiss(loadingToastId);
        showSuccessToast('🗑️ Form deleted successfully!');
        await fetchForms(); // Refresh the list
        setShowDeleteConfirm(false);
        setFormToDelete(null);
      } else {
        toast.dismiss(loadingToastId);
        showErrorToast('Failed to delete form: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to delete form. Please try again.';
      showErrorToast(errorMessage);
    }
  }, [formToDelete, fetchForms, showSuccessToast, showErrorToast, showLoadingToast]);

  const generateQRCode = useCallback(async (formSlug) => {
    const loadingToastId = showLoadingToast('Generating QR code...');
    try {
      const QRCode = (await import('qrcode')).default;
      const publicFormUrl = apiService.generateFormUrl({ slug: formSlug });
      const qrDataUrl = await QRCode.toDataURL(publicFormUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${formSlug}-qr-code.png`;
      link.click();
      
      toast.dismiss(loadingToastId);
      showSuccessToast('📱 QR Code downloaded successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.dismiss(loadingToastId);
      showErrorToast('Failed to generate QR code. Please try again.');
    }
  }, [showSuccessToast, showErrorToast, showLoadingToast]);

  const copyFormLink = useCallback(async (formSlug) => {
    const publicFormUrl = apiService.generateFormUrl({ slug: formSlug });
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      showSuccessToast('🔗 Form link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      showErrorToast('Failed to copy link. Please try again.');
    }
  }, [showSuccessToast, showErrorToast]);

  // Memoized status badge component
  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'under-review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  }, []);

  // Memoized filtered forms
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      return (
        (!filters.search || form.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.category || form.category === filters.category) &&
        (!filters.language || form.language?._id === filters.language) &&
        (!filters.isActive || form.isActive.toString() === filters.isActive)
      );
    });
  }, [forms, filters]);

  // Memoized filtered submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      return (
        (!submissionFilters.search || 
          submission.studentInfo?.fullName?.toLowerCase().includes(submissionFilters.search.toLowerCase()) ||
          submission.studentInfo?.email?.toLowerCase().includes(submissionFilters.search.toLowerCase())
        ) &&
        (!submissionFilters.status || submission.status === submissionFilters.status) &&
        (!submissionFilters.priority || submission.priority === submissionFilters.priority)
      );
    });

    // Sort submissions
    filtered.sort((a, b) => {
      const aValue = a[submissionFilters.sortBy];
      const bValue = b[submissionFilters.sortBy];
      
      if (submissionFilters.sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    return filtered;
  }, [submissions, submissionFilters]);

  // Memoized filter handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmissionFilterChange = useCallback((key, value) => {
    setSubmissionFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: '', category: '', language: '', isActive: '' });
  }, []);

  // Toggle form active status
  const handleToggleFormStatus = useCallback(async (formId, currentStatus) => {
    const newStatus = !currentStatus;
    const loadingToastId = showLoadingToast(`${newStatus ? 'Activating' : 'Deactivating'} form...`);
    try {
      const response = await api.put(`/api/forms/${formId}`, { 
        isActive: newStatus 
      });
      if (response.data.success) {
        toast.dismiss(loadingToastId);
        showSuccessToast(`✅ Form ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        // Update the local state immediately for better UX
        setForms(prevForms => 
          prevForms.map(form => 
            form._id === formId ? { ...form, isActive: newStatus } : form
          )
        );
      }
    } catch (error) {
      console.error('Error toggling form status:', error);
      toast.dismiss(loadingToastId);
      const errorMessage = error.response?.data?.message || 'Failed to update form status. Please try again.';
      showErrorToast(errorMessage);
    }
  }, [showSuccessToast, showErrorToast, showLoadingToast]);

  // Detailed Submission View Modal Component
  const SubmissionDetailModal = ({ submission, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    if (!submission) return null;

    const handleAddNote = async () => {
      if (!newNote.trim()) return;
      
      setAddingNote(true);
      try {
        await api.post(`/api/forms/applications/${submission._id}/notes`, {
          note: newNote,
          isInternal: true
        });
        showSuccessToast('Note added successfully!');
        setNewNote('');
        fetchSubmissionDetail(submission._id); // Refresh data
      } catch (error) {
        showErrorToast('Failed to add note.');
      } finally {
        setAddingNote(false);
      }
    };

    const tabs = [
      { id: 'overview', label: 'Overview', icon: User },
      { id: 'academic', label: 'Academic Info', icon: GraduationCap },
      { id: 'preferences', label: 'Course Preferences', icon: Settings },
      { id: 'documents', label: 'Documents', icon: FileIcon },
      { id: 'communication', label: 'Communication', icon: MessageSquare },
      { id: 'notes', label: 'Notes & History', icon: FileText }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{submission.studentInfo?.fullName}</h2>
                <p className="text-blue-100">{submission.applicationForm?.name}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {submission.studentInfo?.email}
                  </span>
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {submission.studentInfo?.phoneNumber}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  submission.status === 'under-review' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1)}
                </span>
                
                {/* Priority Badge */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  submission.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                  submission.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                  submission.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {submission.priority?.toUpperCase()}
                </span>
                
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </button>
              <button
                onClick={() => updateSubmissionStatus(submission._id, 'under-review')}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                Review
              </button>
            </div>
            <div className="text-sm text-gray-600">
              ID: {submission._id}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{submission.studentInfo?.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{submission.studentInfo?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{submission.studentInfo?.phoneNumber}</p>
                    </div>
                    {submission.studentInfo?.dateOfBirth && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <p className="text-gray-900">{new Date(submission.studentInfo.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {submission.studentInfo?.address && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Address
                    </h3>
                    <div className="space-y-2">
                      {submission.studentInfo.address.street && <p>{submission.studentInfo.address.street}</p>}
                      <p>
                        {[
                          submission.studentInfo.address.city,
                          submission.studentInfo.address.state,
                          submission.studentInfo.address.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      {submission.studentInfo.address.country && <p>{submission.studentInfo.address.country}</p>}
                    </div>
                  </div>
                )}

                {/* Dynamic Form Data */}
                {submission.formData && Object.keys(submission.formData).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Form Responses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(submission.formData).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          <p className="text-gray-900">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                {/* Education History */}
                {submission.academicInfo?.education?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                      Education History
                    </h3>
                    {submission.academicInfo.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 mb-4">
                        <h4 className="font-medium text-gray-900">{edu.level?.toUpperCase()}</h4>
                        <p className="text-gray-700">{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.fieldOfStudy} • {edu.graduationYear}</p>
                        {edu.grade && <p className="text-sm text-gray-600">Grade: {edu.grade}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* English Proficiency */}
                {submission.academicInfo?.englishProficiency && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-blue-600" />
                      English Proficiency
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Level</label>
                        <p className="text-gray-900 capitalize">{submission.academicInfo.englishProficiency.level}</p>
                      </div>
                      {submission.academicInfo.englishProficiency.testScores?.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Test Scores</label>
                          {submission.academicInfo.englishProficiency.testScores.map((test, index) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span>{test.testName}</span>
                              <span className="font-medium">{test.score}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {submission.coursePreferences && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Course Preferences
                    </h3>
                    <div className="space-y-4">
                      {submission.coursePreferences.interestedCourses?.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Interested Courses</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {submission.coursePreferences.interestedCourses.map((course, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {submission.coursePreferences.preferredSchedule && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Preferred Schedule</label>
                          <p className="text-gray-900 capitalize">{submission.coursePreferences.preferredSchedule}</p>
                        </div>
                      )}
                      {submission.coursePreferences.learningGoals && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Learning Goals</label>
                          <p className="text-gray-900">{submission.coursePreferences.learningGoals}</p>
                        </div>
                      )}
                      {submission.coursePreferences.previousLanguageLearning && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Previous Language Learning</label>
                          <p className="text-gray-900">{submission.coursePreferences.previousLanguageLearning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {submission.documents?.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Uploaded Documents
                    </h3>
                    {submission.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center">
                          <FileIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{doc.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No documents uploaded
                  </div>
                )}
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-4">
                {submission.communication?.emailsSent?.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Send className="w-5 h-5 mr-2 text-blue-600" />
                      Email History
                    </h3>
                    {submission.communication.emailsSent.map((email, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{email.subject}</p>
                            <p className="text-sm text-gray-600 capitalize">{email.type?.replace('-', ' ')}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(email.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No communication history
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Add Note Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Note</h3>
                  <div className="space-y-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add your notes here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {addingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </div>

                {/* Notes History */}
                {submission.reviewNotes?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Reviews</h3>
                    {submission.reviewNotes.map((note, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 mb-4">
                        <p className="text-gray-900">{note.note}</p>
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                          <span>By: {note.addedBy?.name || 'Admin'}</span>
                          <span>{new Date(note.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status History */}
                {submission.statusHistory?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
                    {submission.statusHistory.map((status, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 mb-3">
                        <p className="text-gray-900">
                          Status changed from <span className="font-medium">{status.previousStatus}</span> to{' '}
                          <span className="font-medium">{status.newStatus}</span>
                        </p>
                        {status.reason && <p className="text-sm text-gray-600 mt-1">{status.reason}</p>}
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                          <span>By: {status.changedBy?.name || 'System'}</span>
                          <span>{new Date(status.changedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, formName }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Form</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">"{formName}"</span>? 
              This will deactivate the form and prevent new submissions.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Warning</p>
                  <p className="text-sm text-red-700">
                    Existing submissions will be preserved, but the form will no longer accept new applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Form
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render different views
  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Management</h1>
          <p className="text-gray-600">Create and manage application forms</p>
        </div>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search forms..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({...prev, isActive: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Forms</option>
            <option value="true">Active Forms</option>
            <option value="false">Inactive Forms</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="language-course">Language Course</option>
            <option value="test-preparation">Test Preparation</option>
            <option value="consultation">Consultation</option>
            <option value="general">General</option>
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters(prev => ({...prev, language: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {languages.map((language) => (
              <option key={language._id} value={language._id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Total Forms: <strong>{forms.length}</strong></span>
            <span>Active: <strong>{forms.filter(f => f.isActive).length}</strong></span>
            <span>Inactive: <strong>{forms.filter(f => !f.isActive).length}</strong></span>
            <span>Total Submissions: <strong>{forms.reduce((sum, f) => sum + (f.submissions || 0), 0)}</strong></span>
          </div>
          
          {(filters.search || filters.isActive || filters.category || filters.language) && (
            <button
              onClick={() => setFilters({ search: '', category: '', language: '', isActive: '' })}
              className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header with Toggle */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                  {/* Active/Inactive Toggle Switch */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${form.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleFormStatus(form._id, form.isActive)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        form.isActive ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                      title={`Click to ${form.isActive ? 'deactivate' : 'activate'} form`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.description || 'No description'}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {form.submissions || 0} submissions
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Language Badge */}
                {form.language && (
                  <div className="mb-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      <Globe className="w-3 h-3 inline mr-1" />
                      {form.language.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedForm(form);
                  setCurrentView('submissions');
                  fetchFormSubmissions(form._id);
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  form.submissions > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View Submissions ({form.submissions || 0})
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingForm(form);
                    setCurrentView('edit');
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setFormToDelete(form);
                  }}
                  className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => generateQRCode(form.slug)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  title="Download QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyFormLink(form.slug)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  title="Copy Form Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(apiService.generateFormUrl({ slug: form.slug }), '_blank')}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  title="View Public Form"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading forms...</span>
        </div>
      )}

      {!loading && filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first form</p>
          <button
            onClick={() => setCurrentView('create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Form
          </button>
        </div>
      )}
    </div>
  );

  // Render form builder view
  const renderFormBuilderView = () => {
    const isEditing = currentView === 'edit' && editingForm;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Form' : 'Create New Form'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? `Editing: ${editingForm.name}` : 'Build your custom application form'}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DynamicFormBuilder
            initialFields={isEditing ? editingForm?.fields || [] : []}
            onChange={(formData) => {
              // Auto-save or handle changes as needed
              console.log('Form data changed:', formData);
            }}
            onPublish={(formData) => {
              const saveData = {
                name: formData.metadata?.title || formData.title || 'Untitled Form',
                description: formData.metadata?.description || formData.description || '',
                fields: formData.fields || [],
                isActive: true,
                category: formData.metadata?.category || 'Registration',
                formType: 'application'
              };
              
              if (isEditing) {
                handleUpdateForm(editingForm._id, saveData);
              } else {
                handleCreateForm(saveData);
              }
              setCurrentView('list');
            }}
          />
        </div>
      </div>
    );
  };

  // Render submissions view
  const renderSubmissionsView = () => (
    <div className="space-y-6">
      {/* Enhanced Header with Form Context */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Forms
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Submissions</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedForm?.name}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {submissions.length} submissions
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Created {new Date(selectedForm?.createdAt).toLocaleDateString()}
              </span>
              {selectedForm?.language && (
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {selectedForm.language.name}
                </span>
              )}
              <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                selectedForm?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedForm?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {selectedForm?.description && (
              <p className="text-gray-600 mt-2">{selectedForm.description}</p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyFormLink(selectedForm?.slug)}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy Form Link"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
            <button
              onClick={() => window.open(apiService.generateFormUrl({ slug: selectedForm?.slug }), '_blank')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Form
            </button>
          </div>
        </div>
      </div>

      {/* Submission Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={submissionFilters.search}
              onChange={(e) => handleSubmissionFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={submissionFilters.status}
            onChange={(e) => handleSubmissionFilterChange('status', e.target.value)}
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

          <select
            value={submissionFilters.priority}
            onChange={(e) => handleSubmissionFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={submissionFilters.sortBy}
            onChange={(e) => handleSubmissionFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="priority">Sort by Priority</option>
            <option value="studentInfo.fullName">Sort by Name</option>
          </select>

          <select
            value={submissionFilters.sortOrder}
            onChange={(e) => handleSubmissionFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {submissionsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading submissions...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.studentInfo?.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.studentInfo?.email || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {submission.studentInfo?.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        submission.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        submission.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        submission.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.priority?.charAt(0).toUpperCase() + submission.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowSubmissionDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {submissionFilters.search || submissionFilters.status 
                  ? 'Try adjusting your filters'
                  : 'No one has submitted this form yet'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {showSubmissionDetail && selectedSubmission && (
        <SubmissionDetailModal 
          submission={selectedSubmission} 
          onClose={() => {
            setShowSubmissionDetail(false);
            setSelectedSubmission(null);
          }} 
        />
      )}
    </div>
  );

  // Enhanced Toaster component
  const EnhancedToaster = () => (
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
        duration: 4000,
        style: {
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
        },
      }}
    />
  );

  // Main render logic
  if (currentView === 'list') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {renderListView()}
        <EnhancedToaster />
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setFormToDelete(null);
          }}
          onConfirm={handleDeleteForm}
          formName={formToDelete?.name || 'this form'}
        />
      </div>
    );
  }

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {renderFormBuilderView()}
        <EnhancedToaster />
      </div>
    );
  }

  if (currentView === 'submissions') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {renderSubmissionsView()}
        <EnhancedToaster />
      </div>
    );
  }

  return null;
};

export default FormManagement;