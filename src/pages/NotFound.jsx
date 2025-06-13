// src/components/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <h1 className="text-6xl font-extrabold text-gray-800 mb-2">404</h1>
    <p className="text-xl text-gray-600 mb-4">Page not found</p>
    <p className="text-gray-500 mb-6">
      Oops—looks like you followed a bad link or mistyped the URL.
    </p>
    <Link
      to="/admin/dashboard"
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
    >
      Back to Dashboard
    </Link>
  </div>
)

export default NotFound
