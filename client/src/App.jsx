import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { TwitchNavbar } from './components/layout/TwitchNavbar.jsx';
import { LeftSidebar } from './components/layout/LeftSidebar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { Home } from './pages/Home.jsx';
import { Watch } from './pages/Watch.jsx';
import { Upload } from './pages/Upload.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { NotFound } from './pages/NotFound.jsx';

function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-twitch-bg text-twitch-text antialiased selection:bg-twitch-purple selection:text-white">
      {/* 1. Sticky Top Navbar (h-[50px], #18181B, border-b #2F2F35) */}
      <TwitchNavbar />

      {/* Main Body Shell with Persistent 3-Pane Layout */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* 2. Collapsible Left Sidebar ("Recommended & Followed Channels") */}
        <LeftSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* 3. Main Content Area (#0E0E10) */}
        <main className="flex-1 min-w-0 h-[calc(100vh-50px)] overflow-y-auto overflow-x-hidden p-3 sm:p-5">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Creator & Admin Routes */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['creator', 'admin']}>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
