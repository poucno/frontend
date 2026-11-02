import { useState } from 'react'

type PasswordFieldProps = {
  name: 'password' | 'passwordConfirmation'
  label: string
  value: string
  autoComplete: 'current-password' | 'new-password'
  error?: string
  onChange: (value: string) => void
}

export default function PasswordField({ name, label, value, autoComplete, error, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const passwordLabel = name === 'password' ? 'geslo' : 'ponovljeno geslo'

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <div className="password-input">
        <input id={name} name={name} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} required placeholder="••••••••" aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} />
        <button className="password-toggle" type="button" aria-label={`${visible ? 'Skrij' : 'Prikaži'} ${passwordLabel}`} aria-controls={name} onClick={() => setVisible(!visible)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
      {error && <p id={`${name}-error`} className="field-error">{error}</p>}
    </div>
  )
}
