import type { CollectionMetadata } from '../types/collection'
import { COLLECTION_LIMITS } from '../data/collectionValidation'
import type { MetadataErrors } from '../data/collectionValidation'

type CollectionMetadataFieldsProps = {
  metadata: CollectionMetadata
  errors: MetadataErrors
  onChange: (metadata: CollectionMetadata) => void
}

export default function CollectionMetadataFields({ metadata, errors, onChange }: CollectionMetadataFieldsProps) {
  return (
    <div className="metadata-fields">
      <div className="form-field title-field">
        <label htmlFor="collection-title">Naslov</label>
        <input id="collection-title" value={metadata.title} onChange={event => onChange({ ...metadata, title: event.target.value })} maxLength={COLLECTION_LIMITS.title} required placeholder="Poštevanka števila 6" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
        {errors.title && <p id="title-error" className="field-error">{errors.title}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="collection-subject">Predmet</label>
        <input id="collection-subject" value={metadata.subject} onChange={event => onChange({ ...metadata, subject: event.target.value })} required placeholder="Matematika" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'subject-error' : undefined} />
        {errors.subject && <p id="subject-error" className="field-error">{errors.subject}</p>}
      </div>
      <div className="form-field grade-field">
        <label htmlFor="collection-grade">Razred</label>
        <select id="collection-grade" value={metadata.grade} onChange={event => onChange({ ...metadata, grade: Number(event.target.value) })} aria-invalid={!!errors.grade} aria-describedby={errors.grade ? 'grade-error' : undefined}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => <option key={value} value={value}>{value}. razred</option>)}
        </select>
        {errors.grade && <p id="grade-error" className="field-error">{errors.grade}</p>}
      </div>
    </div>
  )
}
