import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

export function useUnsavedChanges(hasChanges: boolean) {
  const canLeave = useRef(false)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    hasChanges && !canLeave.current && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!hasChanges) return
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (canLeave.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  function allowNavigation() {
    canLeave.current = true
  }

  return { blocker, allowNavigation }
}
