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
        <label htmlFor="collection-name">Ime</label>
        <input id="collection-name" value={metadata.name} onChange={event => onChange({ ...metadata, name: event.target.value })} maxLength={COLLECTION_LIMITS.name} required placeholder="Poštevanka števila 6" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="collection-subject">Predmet</label>
        <input id="collection-subject" value={metadata.subject} onChange={event => onChange({ ...metadata, subject: event.target.value })} required placeholder="Matematika" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'subject-error' : undefined} />
        {errors.subject && <p id="subject-error" className="field-error">{errors.subject}</p>}
      </div>
    </div>
  )
}
