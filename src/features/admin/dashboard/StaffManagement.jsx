// src/pages/admin/StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import EntityForm from '../../../components/EntityForm';
import EntityCard from '../../../components/EntityCard';
import Modal from '../../../components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DateTime } from 'luxon';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import api from '../../../api/axios';

// Register Chart.js elements once
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [chartData, setChartData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Initialize animations & load data
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    fetchStaff();
    fetchStats();
  }, []);

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff/all');
      setStaff(res.data.data);
    } catch {
      toast.error('Failed to load staff');
    }
  };

  // Fetch tutor/counsellor counts
  const fetchStats = async () => {
    try {
      const res = await api.get('/auth/staff/all');
      setChartData({
        labels: ['Tutors', 'Counsellors'],
        datasets: [{
          data: [res.data.tutorCount, res.data.counsellorCount],
          backgroundColor: ['#6366f1', '#10b981'],
          borderColor: ['#4f46e5', '#059669'],
          borderWidth: 2,
          hoverOffset: 8,
          cutout: '60%'
        }]
      });
    } catch {
      // ignore
    }
  };

  // Filter staff based on search and role
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Open modal for Create/Edit
  const openForm = (member = null) => {
    setSelectedStaff(member);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setSelectedStaff(null);
    setIsFormOpen(false);
  };

  // Handle Create / Update
  const handleFormSubmit = async (values) => {
    try {
      if (selectedStaff) {
        await api.put(
          `/auth/${values.role.toLowerCase()}/update/${selectedStaff._id}`,
          values
        );
        toast.success('Staff updated successfully!');
      } else {
        await api.post(
          `/auth/${values.role.toLowerCase()}/register`,
          values
        );
        toast.success('Staff created successfully!');
      }
      closeForm();
      await Promise.all([fetchStaff(), fetchStats()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  // SweetAlert2 Delete
  const confirmDelete = (member) => {
    Swal.fire({
      title: `Delete ${member.name}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(
            `/auth/${member.role.toLowerCase()}/delete/${member._id}`
          );
          toast.success('Staff deleted successfully!');
          await Promise.all([fetchStaff(), fetchStats()]);
        } catch {
          toast.error('Delete failed');
        }
      }
    });
  };

  const statsData = [
    {
      title: 'Total Staff',
      value: staff.length,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Tutors',
      value: chartData.datasets?.[0]?.data?.[0] || 0,
      icon: '👨‍🏫',
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Counsellors',
      value: chartData.datasets?.[0]?.data?.[1] || 0,
      icon: '🧑‍⚕️',
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Active Today',
      value: Math.floor(staff.length * 0.8),
      icon: '🟢',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      {/* Header Section */}
      <div className="mb-8" data-aos="fade-down">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage your team members efficiently and beautifully
            </p>
          </div>
          
          <button
            onClick={() => openForm()}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Staff
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-aos="fade-up">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{stat.icon}</div>
                <div className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
              </div>
              <h3 className="text-gray-600 font-medium">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100" data-aos="fade-up" data-aos-delay="100">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="tutor">Tutors</option>
              <option value="counsellor">Counsellors</option>
            </select>
          </div>

          {/* View Mode & Chart */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Chart */}
            {chartData.labels && (
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24">
                  <Doughnut 
                    data={chartData} 
                    options={{
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          cornerRadius: 8,
                          displayColors: true
                        }
                      },
                      maintainAspectRatio: false,
                      cutout: '65%'
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700">{staff.length}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Grid/List */}
      <div className="mb-8">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-16" data-aos="fade-up">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No staff members found</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first staff member'
              }
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {filteredStaff.map((member, index) => (
              <div 
                key={member._id} 
                data-aos="fade-up" 
                data-aos-delay={index * 100}
                className="transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <EntityCard
                    item={{ ...member, subtitle: member.role }}
                    imageKey="profilePicture"
                    badges={[
                      {
                        label: member.role,
                        type: member.role === 'Tutor' ? 'success' : 'info'
                      }
                    ]}
                    fields={[
                      { key: 'email', label: 'Email' },
                      {
                        key: 'phoneNumber',
                        label: 'Phone',
                        showEmpty: member.role === 'Tutor'
                      },
                      {
                        key: 'country',
                        label: 'Country',
                        showEmpty: member.role === 'Counsellor'
                      },
                      {
                        key: 'languages',
                        label: 'Languages',
                        format: (v) => v.join(', ')
                      },
                      {
                        key: 'dob',
                        label: 'DOB',
                        format: (v) =>
                          DateTime.fromISO(v).toLocaleString(DateTime.DATE_MED)
                      }
                    ]}
                    onEdit={() => openForm(member)}
                    onDelete={() => confirmDelete(member)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        title={selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        onClose={closeForm}
      >
        <EntityForm
          schema={[
            { name: 'name', label: 'Full Name', type: 'text', rules: { required: true } },
            { name: 'email', label: 'Email Address', type: 'email', rules: { required: true } },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              rules: { required: !selectedStaff }
            },
            {
              name: 'role',
              label: 'Role',
              type: 'select',
              options: [
                { value: 'Tutor', label: 'Tutor' },
                { value: 'Counsellor', label: 'Counsellor' }
              ],
              rules: { required: true }
            },
            {
              name: 'languages',
              label: 'Languages',
              type: 'multiselect-fetch',
              fetchKey: 'languages',
              rules: { required: true }
            },
            {
              name: 'dob',
              label: 'Date of Birth',
              type: 'custom',
              render: ({ value, onChange }) => (
                <div className="w-full">
                  <Calendar
                    onChange={(date) => onChange(date.toISOString())}
                    value={value ? new Date(value) : new Date()}
                    className="w-full border-0 shadow-lg rounded-xl"
                    tileClassName="hover:bg-indigo-50 rounded-lg"
                    navigationLabel={({ date }) => (
                      <span className="font-semibold text-gray-700">
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  />
                </div>
              ),
              rules: { required: true }
            },
            {
              name: 'profilePicture',
              label: 'Profile Picture',
              type: 'file-or-url',
              accept: 'image/*',
              preview: true
            },
            {
              name: 'cv',
              label: 'CV/Resume',
              type: 'file-or-url',
              accept: '.pdf,.doc,.docx'
            },
            {
              name: 'validDocs',
              label: 'Valid Documents',
              type: 'file',
              accept: '.pdf,.doc,.docx',
              multiple: true
            }
          ]}
          defaultValues={selectedStaff || {}}
          apiEndpoints={{ languages: '/api/languages' }}
          onSubmit={handleFormSubmit}
        />
      </Modal>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}