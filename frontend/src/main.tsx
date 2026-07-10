import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './index.css'
import AdminDashboard from './pages/AdminDashboard'
import AgencyDashboard from './pages/AgencyDashboard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/agency/*" element={<AgencyDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
