import { Button } from '@/components/ui'

/** Sticky bar: unsaved-changes tracking, save as draft, publish. Same pattern as the settings save bar. */
export function BuilderSaveBar({
  dirty,
  isNew,
  isPublished,
  errorCount,
  saving,
  publishing,
  onSaveDraft,
  onPublish,
  onDiscard,
}: {
  dirty: boolean
  isNew: boolean
  isPublished: boolean
  errorCount: number
  saving: boolean
  publishing: boolean
  onSaveDraft: () => void
  onPublish: () => void
  onDiscard: () => void
}) {
  const canPublish = errorCount === 0 && (dirty || isNew || !isPublished)
  let message = 'All changes saved.'
  if (dirty) {
    message =
      isPublished && !isNew
        ? 'You have unsaved changes. Saving a draft pauses this automation until you publish.'
        : 'You have unsaved changes.'
  } else if (isNew) {
    message = 'Not saved yet.'
  } else if (!isPublished) {
    message = 'Saved as a draft. It does not run until you publish it.'
  }
  return (
    <div
      role="region"
      aria-label="Save"
      className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <p className="text-sm text-foreground" aria-live="polite">
        {message}
        {errorCount > 0 ? ` Fix ${errorCount} ${errorCount === 1 ? 'problem' : 'problems'} to publish.` : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {dirty && !isNew ? (
          <Button variant="ghost" onClick={onDiscard}>
            Discard changes
          </Button>
        ) : null}
        <Button variant="outline" disabled={!dirty && !isNew} loading={saving} onClick={onSaveDraft}>
          Save as draft
        </Button>
        <Button disabled={!canPublish} loading={publishing} onClick={onPublish}>
          Publish
        </Button>
      </div>
    </div>
  )
}
