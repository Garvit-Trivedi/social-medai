import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
// import Login from './pages/Login.jsx'
// import Signup from './pages/Signup.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Profile from './pages/Profile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import Saved from './pages/Saved.jsx'
import PostComposer from './pages/PostComposer.jsx'
import SearchUsers from './pages/SearchUsers.jsx'
import PublicProfile from './pages/PublicProfile.jsx'
import Messages from './pages/Messages.jsx'
import Settings from './pages/Settings.jsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
// import { AnimatePresence } from "framer-motion";

export default function App() {
  const location = useLocation()

  // Only animate auth routes
  const isAuth = location.pathname === '/login' || location.pathname === '/signup'

  // Direction: 1 when navigating to signup, -1 when navigating to login
  const dir = (location.state && typeof location.state.dir === 'number')
    ? location.state.dir
    : (location.pathname === '/signup' ? 1 : -1)

  // Variants driven by direction
  const variants = {
    initial: (d) => ({ x: d === 1 ? '-100%' : '100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d === 1 ? '100%' : '-100%', opacity: 0 })
  }

  return (
    <>
      {/* Auth route animations */}
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
      </Routes>
    </AnimatePresence>

      {/* Non-auth routes (not animated) */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/search"
          element={
            <ProtectedRoute>
              <SearchUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/compose"
          element={
            <ProtectedRoute>
              <PostComposer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

