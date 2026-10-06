import { Info } from 'lucide-react'
import { CopyButton } from '@/components/common/CopyButton'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import { ERROR_CODES, ENDPOINT_GROUPS, type EndpointDoc, type HttpMethod } from '../lib/endpoints'
import { BASE_URL, VERIFY_JS, VERIFY_PY, curlFor } from '../lib/snippets'

const METHOD_TONE: Record<HttpMethod, string> = {
  GET: 'bg-info/10 text-info',
  POST: 'bg-success/10 text-success',
  PATCH: 'bg-warning/15 text-foreground',
  DELETE: 'bg-destructive/10 text-destructive',
}

function Code({ children, label }: { children: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><CopyButton value={children} label={`Copy ${label}`} iconOnly /></div>
      <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">{children}</pre>
    </div>
  )
}

function Endpoint({ endpoint }: { endpoint: EndpointDoc }) {
  const json = (value: unknown) => JSON.stringify(value, null, 2)
  return (
    <article id={endpoint.id} className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <header className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded px-2 py-0.5 font-mono text-xs font-semibold', METHOD_TONE[endpoint.method])}>{endpoint.method}</span>
        <code className="break-all text-sm font-medium">{endpoint.path}</code>
        <Badge size="sm" className="ml-auto">{endpoint.scope}</Badge>
      </header>
      <p className="text-sm">{endpoint.summary}</p>
      {endpoint.query ? (
        <dl className="grid gap-1 text-sm sm:grid-cols-[10rem_1fr]">
          {Object.entries(endpoint.query).map(([name, text]) => (
            <div key={name} className="contents"><dt className="font-mono text-xs">{name}</dt><dd className="text-muted-foreground">{text}</dd></div>
          ))}
        </dl>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        <Code label="cURL">{curlFor(endpoint, 'lf_live_YOUR_KEY')}</Code>
        {endpoint.responseExample ? <Code label={`Response ${endpoint.status}`}>{json(endpoint.responseExample)}</Code> : <p className="text-sm text-muted-foreground">Responds {endpoint.status} with no body.</p>}
      </div>
    </article>
  )
}

/** A static reference generated from `ENDPOINT_GROUPS`, so it cannot drift from the typed examples. */
export function DeveloperDocs() {
  return (
    <div className="space-y-8">
      <div role="note" className="flex items-start gap-3 rounded-md border border-info/30 bg-info/10 p-3 text-sm">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>This page documents the <strong>target contract</strong> for the production backend. In this build the API runs on mock data in your browser, so the base URL below is a placeholder.</p>
      </div>

      <section aria-labelledby="doc-start" className="space-y-3">
        <h3 id="doc-start" className="text-base font-semibold">Getting started</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="font-medium">Base URL</dt><dd><code>{BASE_URL}</code></dd>
          <dt className="font-medium">Authentication</dt><dd>Send your key as a Bearer token: <code>Authorization: Bearer lf_live_…</code>. Keys carry scopes, an optional IP allowlist and an expiry.</dd>
          <dt className="font-medium">Pagination</dt><dd>List endpoints take <code>page</code> and <code>pageSize</code> (up to 100) and return <code>{'{ items, total, page, pageSize, pageCount }'}</code>.</dd>
          <dt className="font-medium">Rate limits</dt><dd>120 requests per minute per key. Responses carry <code>X-RateLimit-Remaining</code>; at the limit you get 429 and a <code>Retry-After</code> header.</dd>
          <dt className="font-medium">Errors</dt><dd>Errors are JSON: <code>{'{ "code": "VALIDATION", "message": "…", "fieldErrors": { "phone": ["…"] } }'}</code>.</dd>
        </dl>
        <table className="w-full text-sm">
          <caption className="sr-only">Error codes</caption>
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-1 pr-3">Status</th><th className="pr-3">Code</th><th>Meaning</th></tr></thead>
          <tbody>
            {ERROR_CODES.map((error) => (
              <tr key={error.code} className="border-b border-border/60 align-top"><td className="py-1.5 pr-3 font-mono">{error.status}</td><td className="pr-3 font-mono text-xs">{error.code}</td><td>{error.meaning}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {ENDPOINT_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`doc-${group.id}`} className="space-y-3">
          <h3 id={`doc-${group.id}`} className="text-base font-semibold">{group.title}</h3>
          {group.endpoints.map((endpoint) => <Endpoint key={endpoint.id} endpoint={endpoint} />)}
        </section>
      ))}

      <section aria-labelledby="doc-signature" className="space-y-3">
        <h3 id="doc-signature" className="text-base font-semibold">Verifying webhook signatures</h3>
        <p className="text-sm">Each delivery has an <code>X-LeadFlow-Signature</code> header like <code>t=1700000000,v1=3f9a…</code>. The value is an HMAC-SHA256, keyed with your signing secret, of <code>{'{t}.{raw body}'}</code>. Reject anything that does not match or is older than five minutes.</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Code label="JavaScript (Node)">{VERIFY_JS}</Code>
          <Code label="Python">{VERIFY_PY}</Code>
        </div>
      </section>
    </div>
  )
}
