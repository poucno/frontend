import { createBrowserRouter, createRoutesFromElements, Link, NavLink, Outlet, Route, RouterProvider, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Balloons, IslandMark, Landscape } from './components/Decorations'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'
import CollectionDashboardPage from './pages/CollectionDashboardPage'
import CreateCollectionPage from './pages/CreateCollectionPage'
import CollectionEditorPage from './pages/CollectionEditorPage'
import PlayPage from './pages/PlayPage'

function Layout() {
  const { pathname } = useLocation()
  const isTeacherPage = pathname.startsWith('/teachers')
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    // Move focus to the new page after client-side navigation, including Back.
    document.querySelector<HTMLElement>('main')?.focus()
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`app-shell ${isTeacherPage ? 'teacher-shell' : 'child-shell'} ${pathname === '/' ? 'landing-shell' : ''}`}>
      <a className="skip-link" href="#main-content">Preskoči na vsebino</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Otok znanja – začetna stran">
          <IslandMark />
          <span>Otok znanja</span>
        </Link>
        <nav aria-label="Glavna navigacija">
          {isTeacherPage ? <NavLink to="/" end>Začetna stran</NavLink> : <NavLink to="/teachers">Za učitelje</NavLink>}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <Landscape />
    </div>
  )
}

// The data router supplies the navigation blocker used by unsaved forms.
const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="teachers" element={<CollectionDashboardPage />} />
    <Route path="teachers/collections/new" element={<CreateCollectionPage />} />
    <Route path="teachers/collections/:collectionId/edit" element={<CollectionEditorPage />} />
    <Route path="play/:gameName" element={<PlayPage />} />
    <Route path="play/:gameName/:collectionId" element={<PlayPage />} />
    <Route path="preview" element={
      <PlaceholderPage title="Lovljenje balonov" description="Predogled vprašanj je v pripravi. Igra še ni povezana." backTo="/" backLabel="Začetna stran">
        <Balloons />
      </PlaceholderPage>
    } />
    <Route path="*" element={
      <PlaceholderPage title="Ta stran ne obstaja" description="Vrnimo se na otok." backTo="/" backLabel="Začetna stran" />
    } />
  </Route>
))

export default function App() {
  return <RouterProvider router={router} />
}
