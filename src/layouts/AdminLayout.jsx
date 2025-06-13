// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Page content */}
      <main className="ml-64 flex-1 p-8 min-h-screen bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
