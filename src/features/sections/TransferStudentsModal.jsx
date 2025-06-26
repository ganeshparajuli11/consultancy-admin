import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function TransferStudentsModal({ open, fromSection, onClose }) {
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [toSectionId, setToSectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open && fromSection) {
      api.get('/api/section').then(res => {
        setSections(res.data.data.filter(s => s._id !== fromSection._id && !s.isArchived));
      });
      api.get(`/api/section/${fromSection._id}/students`).then(res => {
        setStudents(res.data.students || []);
      });
    }
  }, [open, fromSection]);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      await api.post('/api/section/transfer-students', {
        fromSectionId: fromSection._id,
        toSectionId,
        studentIds: selectedStudents,
        transferAll: false
      });
      onClose();
    } catch {
      alert('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>×</button>
        <h3 className="text-xl font-bold mb-4">Transfer Students from {fromSection?.name}</h3>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Target Section</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={toSectionId}
            onChange={e => setToSectionId(e.target.value)}
          >
            <option value="">Select section</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Students</label>
          <div className="max-h-40 overflow-y-auto border rounded">
            {students.map(stu => (
              <label key={stu._id} className="flex items-center px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(stu._id)}
                  onChange={e => {
                    setSelectedStudents(e.target.checked
                      ? [...selectedStudents, stu._id]
                      : selectedStudents.filter(id => id !== stu._id)
                    );
                  }}
                  className="mr-2"
                />
                {stu.name} <span className="text-xs text-gray-500 ml-2">{stu.email}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-100 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={!toSectionId || selectedStudents.length === 0 || loading}
            onClick={() => setShowConfirm(true)}
          >Transfer</button>
        </div>
        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Transfer"
          message={`Transfer ${selectedStudents.length} students to selected section?`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleTransfer}
        />
      </div>
    </div>
  ) : null;
}
