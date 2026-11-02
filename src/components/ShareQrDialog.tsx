import { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareQrDialog({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      className="unsaved-dialog qr-dialog"
      ref={dialogRef}
      aria-labelledby="qr-title"
      onCancel={event => { event.preventDefault(); onClose() }}
    >
      <h2 id="qr-title">Koda QR</h2>
      <p className="qr-dialog-subject">{name}</p>
      <div className="qr-dialog-code">
        <QRCodeSVG value={url} size={220} bgColor="#fffdf7" fgColor="#102451" level="M" marginSize={2} title={`Povezava do zbirke ${name}`} />
      </div>
      <p className="qr-dialog-url">{url}</p>
      <div className="dialog-actions">
        <button className="button" type="button" autoFocus onClick={onClose}>Zapri</button>
      </div>
    </dialog>
  )
}
