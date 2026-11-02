import { createBrowserRouter, createRoutesFromElements, Link, NavLink, Outlet, Route, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Balloons, IslandMark, Landscape } from './components/Decorations'
import MotionProvider from './components/MotionProvider'
import UserMenu from './components/UserMenu'
import { useMotion } from './hooks/useMotion'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import QuestionSetsPage from './pages/QuestionSetsPage'
import PlayPage from './pages/PlayPage'
import PlaceholderPage from './pages/PlaceholderPage'
import CollectionDashboardPage from './pages/CollectionDashboardPage'
import CreateCollectionPage from './pages/CreateCollectionPage'
import CollectionEditorPage from './pages/CollectionEditorPage'
import TeacherAuthPage from './pages/TeacherAuthPage'

function Layout() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/teachers/login' || pathname === '/teachers/register'
  const isTeacherPage = pathname.startsWith('/teachers') && !isAuthPage
  const segments = pathname.split('/').filter(Boolean)
  const isGamePage = segments[0] === 'play' && segments.length >= 3
  const previousPath = useRef(pathname)
  const { motionEnabled } = useMotion()
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    // Move focus to the new page after client-side navigation, including Back.
    document.querySelector<HTMLElement>('main')?.focus()
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`app-shell ${isTeacherPage ? 'teacher-shell' : 'child-shell'} ${pathname === '/' ? 'landing-shell' : ''} ${isAuthPage ? 'auth-shell' : ''} ${isGamePage ? 'play-shell' : ''}`} data-motion={motionEnabled ? 'running' : 'paused'}>
      <a className="skip-link" href="#main-content">Preskoči na vsebino</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Otok znanja – začetna stran">
          <IslandMark />
          <span>Otok znanja</span>
        </Link>
        <div className="header-actions">
          <nav aria-label="Glavna navigacija">
            {session
              ? <UserMenu email={session.email} onLogout={() => { logout(); navigate('/') }} />
              : !isAuthPage && <NavLink to="/teachers/login">Za učitelje</NavLink>}
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <Landscape />
      {isTeacherPage && <div className="teacher-balloons"><Balloons animated interactive /></div>}
    </div>
  )
}

// The data router supplies the navigation blocker used by unsaved forms.
const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="teachers/login" element={<TeacherAuthPage key="login" mode="login" />} />
    <Route path="teachers/register" element={<TeacherAuthPage key="register" mode="register" />} />
    <Route path="teachers" element={<CollectionDashboardPage />} />
    <Route path="teachers/collections/new" element={<CreateCollectionPage />} />
    <Route path="teachers/collections/:collectionId/edit" element={<CollectionEditorPage />} />
    <Route path="play" element={<GamesPage />} />
    <Route path="play/:gameName" element={<QuestionSetsPage />} />
    <Route path="play/:gameName/:collectionId" element={<PlayPage />} />
    <Route path="*" element={
      <PlaceholderPage title="Ta stran ne obstaja" description="Vrnimo se na otok." backTo="/" backLabel="Začetna stran" />
    } />
  </Route>
))

export default function App() {
  return <MotionProvider><RouterProvider router={router} /></MotionProvider>
}
