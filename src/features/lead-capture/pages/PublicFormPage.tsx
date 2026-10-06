import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CircleCheck, FileX } from 'lucide-react'
import { captureUtm } from '@/lib/ingest/utm'
import { getErrorMessage } from '@/services/api/errors'
import { ApiError } from '@/services/api/errors'
import { validateSubmission } from '@/lib/lead-forms/validate'
import { FormRenderer } from '../components/FormRenderer'
import { usePublicForm, useSubmitPublicForm } from '../hooks/use-lead-forms'

/**
 * `/f/:formId`. A standalone page: no app shell, no sign-in, no workspace data. It renders the
 * form from its config and submits through the same ingestion pipeline as every other source.
 */
export function PublicFormPage() {
  const { formId = '' } = useParams()
  const [search] = useSearchParams()
  const form = usePublicForm(formId)
  const submit = useSubmitPublicForm(formId)
  const [values, setValues] = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const done = submit.data

  useEffect(() => {
    document.title = form.data?.name ?? 'Form'
  }, [form.data?.name])

  useEffect(() => {
    if (done?.redirectUrl) window.location.assign(done.redirectUrl)
  }, [done?.redirectUrl])

  function onSubmit() {
    if (!form.data) return
    const found = validateSubmission(form.data, values, consent)
    setErrors(found)
    setFormError(undefined)
    if (Object.keys(found).length > 0) return
    submit.mutate(
      { values, consent, honeypot, utm: captureUtm(search) },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setErrors(Object.fromEntries(Object.entries(error.fieldErrors).map(([key, messages]) => [key, messages[0] ?? ''])))
          }
          setFormError(getErrorMessage(error))
        },
      },
    )
  }

  return (
    <main className="flex min-h-dvh items-start justify-center bg-gray-50 px-4 py-8 sm:items-center">
      <div className="w-full max-w-lg">
        {form.isLoading ? (
          <p role="status" aria-busy="true" className="text-center text-gray-600">Loading…</p>
        ) : form.isError || !form.data ? (
          <div role="alert" className="space-y-2 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <FileX aria-hidden="true" className="mx-auto h-10 w-10 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">This form is not available</h1>
            <p className="text-sm text-gray-600">It may have been turned off or the link is wrong.</p>
          </div>
        ) : done ? (
          <div role="status" className="space-y-3 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <CircleCheck aria-hidden="true" className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-900">Thank you</h1>
            <p className="text-gray-700">{done.successMessage}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <FormRenderer
              form={form.data}
              values={values}
              errors={errors}
              consent={consent}
              honeypot={honeypot}
              formError={formError}
              submitting={submit.isPending}
              onValue={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
              onConsent={setConsent}
              onHoneypot={setHoneypot}
              onSubmit={onSubmit}
            />
          </div>
        )}
      </div>
    </main>
  )
}
