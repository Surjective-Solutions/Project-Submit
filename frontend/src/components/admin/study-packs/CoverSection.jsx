'use client';

import FormSection from './FormSection';
import CoverUploader from './CoverUploader';

export default function CoverSection({ coverUrl, onSelect, onRemove }) {
  return (
    <FormSection icon="image" title="Cover image (Optional)" subtitle="Without one, the card uses a block tinted by subject.">
      <CoverUploader coverUrl={coverUrl} onSelect={onSelect} onRemove={onRemove} />
    </FormSection>
  );
}
