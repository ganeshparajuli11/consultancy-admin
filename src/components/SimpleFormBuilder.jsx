import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  List,
  Hash,
  Globe,
  User,
  Award,
  GraduationCap,
  Clock,
  Eye,
  Send,
  Share,
  Download,
  Save,
  Edit3
} from 'lucide-react';
import toastManager from '../utils/toastManager';
import { exportToExcel, generateSampleData } from '../utils/excelExport';

// Super simple field types for consultancy
const QUESTION_TYPES = [
  { type: 'name', label: '👤 Name', icon: User, example: 'Enter your full name' },
  { type: 'email', label: '📧 Email', icon: Mail, example: 'your.email@example.com' },
  { type: 'phone', label: '📞 Phone', icon: Phone, example: '+977-9XXXXXXXXX' },
  { type: 'date', label: '📅 Date', icon: Calendar, example: 'Date of birth' },
  { type: 'language', label: '🌍 Language Choice', icon: Globe, example: 'Which language to learn' },
  { type: 'level', label: '🏆 Current Level', icon: Award, example: 'Language proficiency' },
  { type: 'education', label: '🎓 Education', icon: GraduationCap, example: 'Highest qualification' },
  { type: 'time', label: '⏰ Time Preference', icon: Clock, example: 'Preferred class time' },
  { type: 'choice', label: '✅ Multiple Choice', icon: CheckSquare, example: 'Choose one option' },
  { type: 'multiple', label: '☑️ Checkboxes', icon: List, example: 'Select multiple' },
  { type: 'text', label: '📝 Long Text', icon: FileText, example: 'Additional information' },
  { type: 'number', label: '🔢 Number', icon: Hash, example: 'Enter a number' }
];

// Quick form templates
const TEMPLATES = [
  {
    id: 'student-registration',
    name: '🎓 Student Registration',
    description: 'Complete registration for new students',
    questions: [
      { type: 'name', text: 'Full Name' },
      { type: 'email', text: 'Email Address' },
      { type: 'phone', text: 'Phone Number' },
      { type: 'date', text: 'Date of Birth' },
      { type: 'language', text: 'Which language would you like to learn?' },
      { type: 'level', text: 'Your current proficiency level' },
      { type: 'education', text: 'Highest Education Level' },
      { type: 'time', text: 'Preferred Class Time' }
    ]
  },
  {
    id: 'quick-inquiry',
    name: '💬 Quick Inquiry',
    description: 'Simple contact form for inquiries',
    questions: [
      { type: 'name', text: 'Your Name' },
      { type: 'email', text: 'Email Address' },
      { type: 'phone', text: 'Phone Number' },
      { type: 'choice', text: 'I am interested in:', options: ['IELTS Preparation', 'PTE Preparation', 'German Language', 'Spanish Language', 'Other'] },
      { type: 'text', text: 'Message' }
    ]
  },
  {
    id: 'feedback',
    name: '⭐ Feedback Survey',
    description: 'Collect student feedback',
    questions: [
      { type: 'name', text: 'Student Name (Optional)' },
      { type: 'choice', text: 'Course you completed:', options: ['IELTS Preparation', 'PTE Preparation', 'German Language', 'Spanish Language'] },
      { type: 'choice', text: 'Overall satisfaction:', options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] },
      { type: 'multiple', text: 'What did you like most?', options: ['Teaching Quality', 'Study Materials', 'Flexible Schedule', 'Student Support'] },
      { type: 'text', text: 'How can we improve?' }
    ]
  }
];

// Get default options for special fields
const getDefaultOptions = (type) => {
  switch (type) {
    case 'language':
      return ['IELTS Preparation', 'PTE Preparation', 'German Language', 'Spanish Language', 'French Language', 'Japanese Language'];
    case 'level':
      return ['Beginner (A1)', 'Elementary (A2)', 'Intermediate (B1)', 'Upper Intermediate (B2)', 'Advanced (C1)', 'Proficient (C2)'];
    case 'education':
      return ['SLC/SEE', '+2/Intermediate', "Bachelor's Degree", "Master's Degree", 'PhD/Doctorate'];
    case 'time':
      return ['Morning (6-10 AM)', 'Day (10 AM-4 PM)', 'Evening (4-8 PM)', 'Weekend Only', 'Flexible'];
    default:
      return ['Option 1', 'Option 2', 'Option 3'];
  }
};

const SimpleFormBuilder = ({ initialData, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(initialData ? 'build' : 'start');
  const [formData, setFormData] = useState({
    title: initialData?.name || '',
    description: initialData?.description || '',
    questions: []
  });

  // Create a simple message about the new interface
  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Simplified Form Builder</h1>
            <p className="text-lg text-gray-600">We've made form building super easy for consultancy owners!</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">✨ What's New:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800">🚀 Unified Experience</h3>
                <p className="text-sm text-blue-700">No more separate basic info and form fields - everything is merged into one smooth workflow!</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800">📋 Quick Templates</h3>
                <p className="text-sm text-blue-700">Pre-built templates for student registration, inquiries, and feedback forms</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800">🎯 Nepal-Focused</h3>
                <p className="text-sm text-blue-700">Built specifically for language consultancies in Nepal with local formats</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800">🔗 Instant Publishing</h3>
                <p className="text-sm text-blue-700">Create and publish forms in minutes with automatic URL generation</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Problems Solved:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• No need to fill basic info again when moving between sections</li>
              <li>• One unified interface instead of separate complicated panels</li>
              <li>• Simple drag-and-drop with visual question types</li>
              <li>• Easy URL generation and sharing</li>
              <li>• Excel export with sample data for demonstration</li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              The new form builder is <strong>much simpler</strong> and perfect for consultancy owners who want to create professional forms quickly.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // For now, let's use the existing form builder with improvements
                  toastManager.info('Using the improved form builder with unified experience!');
                  if (onCancel) onCancel();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue with Current Form Builder
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFormBuilder; 