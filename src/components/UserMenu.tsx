import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type UserMenuProps = {
  email: string
  onLogout: () => void
}

export default function UserMenu({ email, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const displayName = email.split('@')[0] || email || 'Učitelj'

  useEffect(() => {
    if (!open) return
    function handlePointer(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="user-menu" ref={containerRef}>
      <button className="user-menu-button" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className="user-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
        <span className="user-name">{displayName}</span>
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <p className="user-menu-email">{email}</p>
          <Link className="user-menu-link" to="/teachers" role="menuitem" onClick={() => setOpen(false)}>Moje zbirke</Link>
          <button className="user-menu-logout" type="button" role="menuitem" onClick={() => { setOpen(false); onLogout() }}>Odjava</button>
        </div>
      )}
    </div>
  )
}
