import { useEffect, useRef } from 'react'

export default function UnsavedChangesDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog className="unsaved-dialog" ref={dialogRef} aria-labelledby="unsaved-title" aria-describedby="unsaved-description" onCancel={event => { event.preventDefault(); onStay() }}>
      <h2 id="unsaved-title">Neshranjene spremembe</h2>
      <p id="unsaved-description">Če zapustiš stran, bodo zadnje spremembe izgubljene.</p>
      <div className="dialog-actions">
        <button className="button" type="button" autoFocus onClick={onStay}>Nadaljuj urejanje</button>
        <button className="button secondary-button" type="button" onClick={onLeave}>Zavrzi spremembe</button>
      </div>
    </dialog>
  )
}
