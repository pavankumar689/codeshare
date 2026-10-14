import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useTheme } from './hooks/useTheme'

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/room/:workspaceId"
          element={<RoomPage theme={theme} onToggleTheme={toggleTheme} />}
        />
        {/* Support legacy or alternative /workspace/:workspaceId by redirecting */}
        <Route
          path="/workspace/:workspaceId"
          element={<Navigate to="/room/:workspaceId" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
