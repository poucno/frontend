import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
  backTo?: string
  backLabel?: string
  children?: ReactNode
}

export default function PlaceholderPage({ title, description, backTo, backLabel, children }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      {backTo && <Link className="back-link" to={backTo}><span aria-hidden="true">←</span> {backLabel}</Link>}
      <h1>{title}</h1>
      <div className="placeholder-card">
        <p>{description}</p>
        {children}
      </div>
    </section>
  )
}
