import { Link, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Dumbbell, Timer, TrendingUp, CalendarDays, User, LogOut, LogIn } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Avatar from './Avatar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function useLogout() {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  return async () => {
    await logout()
    toast('You have been logged out. See you at the next session!', { type: 'info', title: 'Logged out' })
    navigate('/')
  }
}

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/library', label: 'Workout Library', short: 'Library', icon: Dumbbell },
  { to: '/workout', label: 'Live Workout', short: 'Train', icon: Timer, primary: true },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: TrendingUp },
  { to: '/classes', label: 'Class Booking', short: 'Classes', icon: CalendarDays },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: User, desktopOnly: true },
]

function SidebarUser() {
  const { user } = useAuth()
  const logout = useLogout()
  if (!user) {
    return (
      <div className="glass flex flex-col gap-2 !rounded-2xl p-3">
        <Link to="/login" className="btn-ghost w-full text-sm"><LogIn className="h-4 w-4" /> Log in</Link>
        <Link to="/signup" className="btn-primary w-full !py-2.5 text-sm">Sign up free</Link>
      </div>
    )
  }
  return (
    <div className="glass flex items-center gap-3 !rounded-2xl p-3">
      <NavLink to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={user.full_name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.full_name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </NavLink>
      <button onClick={logout} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-flame/10 hover:text-flame" aria-label="Log out" title="Log out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/[0.06] bg-surface/40 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="px-2"><Logo /></div>
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'text-ink' : 'text-muted hover:bg-line/[0.04] hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-lime/25 bg-lime/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className={`relative h-5 w-5 ${isActive ? 'text-lime' : ''}`} />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <SidebarUser />
    </aside>
  )
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/[0.06] bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-2">
        {navItems.filter((n) => !n.desktopOnly).map(({ to, short, label, icon: Icon, primary }) => (
          <NavLink key={to} to={to} aria-label={primary ? label : undefined} className={`flex flex-1 flex-col items-center gap-1 pb-2 ${primary ? '-mt-7' : ''}`}>
            {({ isActive }) =>
              primary ? (
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-[#0a0d12] shadow-glow transition active:scale-90">
                  <Icon className="h-6 w-6" />
                </span>
              ) : (
                <>
                  <span className={`relative grid h-8 w-12 place-items-center rounded-full transition ${isActive ? 'bg-lime/15 text-lime' : 'text-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={`text-[11px] font-medium ${isActive ? 'text-ink' : 'text-muted'}`}>{short}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function UserMenu({ compact = false }) {
  const { user, loading } = useAuth()
  const logout = useLogout()
  if (loading) return null
  if (!user) {
    return <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm"><LogIn className="h-4 w-4" /> Log in</Link>
  }
  return (
    <div className="flex items-center gap-2">
      <NavLink to="/profile" className="flex items-center gap-2 rounded-full border border-line/10 py-1 pl-1 pr-3 transition hover:border-lime/50" aria-label="Profile">
        <Avatar name={user.full_name} className="h-8 w-8 rounded-full text-xs" />
        <span className={`max-w-[9rem] truncate text-sm font-medium ${compact ? 'hidden min-[400px]:inline' : ''}`}>{user.full_name.split(' ')[0]}</span>
      </NavLink>
      <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full border border-line/10 text-muted transition hover:border-flame/50 hover:bg-flame/10 hover:text-flame" aria-label="Log out" title="Log out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}

function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line/[0.06] bg-bg/70 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo size="sm" to="/" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu compact />
      </div>
    </header>
  )
}

export default function AppLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div className="ambient min-h-dvh">
      <Sidebar />
      <MobileTopBar />
      <main className="pb-28 lg:pb-12 lg:pl-64">
        <div className="mx-auto hidden max-w-6xl items-center justify-end gap-2 px-8 pt-5 lg:flex"><ThemeToggle /><UserMenu /></div>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10 lg:pt-4"
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
