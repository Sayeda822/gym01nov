import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { Login, Signup } from './pages/Auth'
import RequireAuth from './components/RequireAuth'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
          <Route path="/workout" element={<RequireAuth><LiveWorkout /></RequireAuth>} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
