import React, { useState } from 'react';
import api from '../../api/axios';

export default function UpdateScheduleModal({ open, section, onClose }) {
  const [schedule, setSchedule] = useState(section?.schedule || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (idx, field, value) => {
    setSchedule(sch =>
      sch.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    );
  };

  const handleAdd = () => setSchedule([...schedule, { day: '', startTime: '', endTime: '' }]);
  const handleRemove = idx => setSchedule(schedule.filter((_, i) => i !== idx));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/api/section/${section._id}`, { schedule });
      onClose();
    } catch {
      alert('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}>×</button>
        <h3 className="text-xl font-bold mb-4">Update Schedule for {section?.name}</h3>
        <div className="space-y-3 mb-4">
          {schedule.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                className="border rounded px-2 py-1"
                value={item.day}
                onChange={e => handleChange(idx, 'day', e.target.value)}
              >
                <option value="">Day</option>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                className="border rounded px-2 py-1"
                value={item.startTime}
                onChange={e => handleChange(idx, 'startTime', e.target.value)}
              />
              <input
                type="time"
                className="border rounded px-2 py-1"
                value={item.endTime}
                onChange={e => handleChange(idx, 'endTime', e.target.value)}
              />
              <button className="text-red-500" onClick={() => handleRemove(idx)}>×</button>
            </div>
          ))}
        </div>
        <button className="mb-4 px-3 py-1 bg-gray-100 rounded" onClick={handleAdd}>Add Row</button>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-100 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={loading}
            onClick={handleUpdate}
          >Update</button>
        </div>
      </div>
    </div>
  ) : null;
}
