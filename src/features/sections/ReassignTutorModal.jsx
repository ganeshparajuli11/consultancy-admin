import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ReassignTutorModal({ open, section, onClose }) {
  const [tutors, setTutors] = useState([]);
  const [tutorId, setTutorId] = useState(section?.tutor?._id || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get('/api/user?role=tutor').then(res => setTutors(res.data.data || []));
      setTutorId(section?.tutor?._id || '');
    }
  }, [open, section]);

  const handleReassign = async () => {
    setLoading(true);
    try {
      await api.put(`/api/section/${section._id}`, { tutor: tutorId });
      onClose();
    } catch {
      alert('Failed to reassign tutor');
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>×</button>
        <h3 className="text-xl font-bold mb-4">Reassign Tutor for {section?.name}</h3>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={tutorId}
          onChange={e => setTutorId(e.target.value)}
        >
          <option value="">Select tutor</option>
          {tutors.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-100 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={!tutorId || loading}
            onClick={handleReassign}
          >Update</button>
        </div>
      </div>
    </div>
  ) : null;
}
