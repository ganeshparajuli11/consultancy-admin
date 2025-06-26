import React from 'react'
import SectionList from '../section/SectionList'

const Sections = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Sections Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Manage all sections, analytics, students, tutors, and more.
        </p>
      </div>
      <SectionList />
    </div>
  )
}

export default Sections
