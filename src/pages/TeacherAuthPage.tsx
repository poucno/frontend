import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import PasswordField from '../components/PasswordField'
import { Balloons, Birds } from '../components/Decorations'
import { useMotion } from '../hooks/useMotion'

type AuthFields = { fullName: string; email: string; password: string; passwordConfirmation: string }
type AuthErrors = { fullName?: string; email?: string; password?: string; passwordConfirmation?: string }

export default function TeacherAuthPage({ mode }: { mode: 'login' | 'register' }) {
  const registering = mode === 'register'
  const [fields, setFields] = useState<AuthFields>({ fullName: '', email: '', password: '', passwordConfirmation: '' })
  const [errors, setErrors] = useState<AuthErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [shaking, setShaking] = useState(false)
  const { motionEnabled } = useMotion()

  function updateField(name: keyof AuthFields, value: string) {
    setFields(previous => ({ ...previous, [name]: value }))
    setErrors(previous => ({ ...previous, [name]: undefined }))
    setSubmitted(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(false)
    const nextErrors: AuthErrors = {}
    if (registering && !fields.fullName.trim()) nextErrors.fullName = 'Vnesite ime in priimek.'
    const emailInput = event.currentTarget.elements.namedItem('email')
    if (!fields.email.trim()) nextErrors.email = 'Vnesite e-poštni naslov.'
    else if (emailInput instanceof HTMLInputElement && emailInput.validity.typeMismatch) nextErrors.email = 'Vnesite veljaven e-poštni naslov.'
    if (!fields.password) nextErrors.password = 'Vnesite geslo.'
    if (registering) {
      if (!fields.passwordConfirmation) nextErrors.passwordConfirmation = 'Ponovite geslo.'
      else if (fields.passwordConfirmation !== fields.password) nextErrors.passwordConfirmation = 'Gesli se ne ujemata.'
    }
    setErrors(nextErrors)
    setShaking(motionEnabled && Object.keys(nextErrors).length > 0)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      const field = event.currentTarget.elements.namedItem(firstError)
      if (field instanceof HTMLElement) field.focus()
      return
    }
    // UI preview only: there is no authentication request or local account.
    setSubmitted(true)
  }

  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <div className="auth-decorations">
        <span className="cloud auth-cloud--first" aria-hidden="true" />
        <span className="cloud auth-cloud--second" aria-hidden="true" />
        <span className="cloud auth-cloud--third" aria-hidden="true" />
        <Birds />
        <div className="auth-balloons auth-balloons--left"><Balloons animated interactive only={['coral', 'yellow']} /></div>
        <div className="auth-balloons auth-balloons--right"><Balloons animated interactive only={['blue']} /></div>
      </div>
      <div className="auth-card">
        <h1 id="auth-title">{registering ? 'Ustvarite učiteljski račun' : 'Dobrodošli nazaj!'}</h1>
        <p className="auth-description">{registering ? 'Pripravite vprašanja za svoje učence.' : 'Prijavite se v učiteljski račun.'}</p>
        <form className={`auth-form ${shaking ? 'auth-form--shake' : ''}`} onAnimationEnd={event => { if (event.animationName === 'card-shake') setShaking(false) }} onSubmit={handleSubmit} noValidate>
          {registering && (
            <div className="form-field">
              <label htmlFor="fullName">Ime in priimek</label>
              <input id="fullName" name="fullName" value={fields.fullName} onChange={event => updateField('fullName', event.target.value)} autoComplete="name" required placeholder="Ime in priimek" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
              {errors.fullName && <p id="fullName-error" className="field-error">{errors.fullName}</p>}
            </div>
          )}
          <div className="form-field">
            <label htmlFor="email">E-pošta</label>
            <input id="email" name="email" type="email" value={fields.email} onChange={event => updateField('email', event.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} required placeholder="ime@sola.si" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
          </div>
          <PasswordField name="password" label="Geslo" value={fields.password} onChange={value => updateField('password', value)} autoComplete={registering ? 'new-password' : 'current-password'} error={errors.password} />
          {registering && <PasswordField name="passwordConfirmation" label="Ponovite geslo" value={fields.passwordConfirmation} onChange={value => updateField('passwordConfirmation', value)} autoComplete="new-password" error={errors.passwordConfirmation} />}
          {Object.values(errors).some(Boolean) && <p className="field-error" role="alert">Preverite označena polja.</p>}
          <button className="button auth-submit" type="submit">{registering ? 'Ustvari račun' : 'Prijava'} <span aria-hidden="true">›</span></button>
          {submitted && <p className="auth-notice" role="status">{registering ? 'Registracija' : 'Prijava'} še ni na voljo. Podatki niso bili poslani.</p>}
        </form>
        <p className="auth-switch">
          {registering ? 'Že imate račun?' : 'Še nimate računa?'}{' '}
          <Link to={registering ? '/teachers/login' : '/teachers/register'}>{registering ? 'Prijavite se' : 'Ustvarite račun'}</Link>
        </p>
      </div>
      <div className="auth-preview-note">
        <p>Prijava in registracija bosta na voljo kmalu.</p>
        <Link to="/teachers">Odpri lokalni predogled zbirk</Link>
      </div>
    </section>
  )
}
