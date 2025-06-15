// src/App.jsx
import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import api from './api/axios'

// pages & layouts
import AdminLayout from './layouts/AdminLayout'
import Login       from './features/auth/Login'
import Dashboard   from './features/admin/dashboard/Dashboard'
import Users       from './features/user/pages/Users'
import Tutors      from './features/tutor/pages/Tutors'
import NotFound from './pages/NotFound'
import Language from './features/languages/Language'
import StaffManagement from './features/admin/dashboard/StaffManagement'


/**
 * SessionLoader runs inside Router context and handles
 * token restoration + refresh logic on app startup.
 */
function SessionLoader() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      api
        .get('/auth/refresh', { withCredentials: true })
        .then(res => {
          const newToken = res.data.token
          localStorage.setItem('accessToken', newToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          navigate('/admin/login', { replace: true })
        })
    } else {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  return null
}

function App() {
  return (
    <>
      <Toaster position="top-right" />

       <Router>
      <Routes>


        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Public */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes: any "/admin/…" path */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users"     element={<Users     />} />
          <Route path="tutors"    element={<Tutors    />} />
          <Route path="languages" element={<Language  />} />
          <Route path="Staff" element={<StaffManagement  />} />

          { /* everything else under /admin/* is a 404 */ }
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Finally: any other URL (that isn't "/" or "/admin/…" or "/admin/login") */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />

      </Routes>
    </Router>
    </>
  )
}

export default App
