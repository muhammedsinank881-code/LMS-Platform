import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setMockSessionResolver } from '@/services/mock'
import { USERS, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { Harness } from '@/test/capture-harness'
import { signIn, signOut } from '@/test/capture-session'
import { LeadCapturePage } from './LeadCapturePage'
import { PublicFormPage } from './PublicFormPage'

beforeEach(setupMock)
afterEach(() => {
  teardownMock()
  signOut()
})

const FORM = 'form-acme-demo'

function renderPublic(route = `/f/${FORM}`) {
  // A visitor: no auth store user, no mock session.
  signOut()
  setMockSessionResolver(() => null)
  return render(
    <Harness route={route}>
      <Routes>
        <Route path="/f/:formId" element={<PublicFormPage />} />
      </Routes>
    </Harness>,
  )
}

describe('public form page', () => {
  it('renders from config with no app shell and an accessible form', async () => {
    renderPublic()
    const form = await screen.findByRole('form', { name: 'Website contact form' })
    expect(within(form).getByLabelText(/Full name/)).toBeRequired()
    expect(within(form).getByLabelText(/Phone number/)).toBeRequired()
    expect(within(form).getByRole('button', { name: 'Request a callback' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.title).toBe('Website contact form')
  })

  it('shows field errors without calling the server, then submits and creates a lead with the form defaults', async () => {
    const user = userEvent.setup()
    renderPublic(`/f/${FORM}?utm_source=google&utm_campaign=diwali-dhamaka-search`)
    await user.click(await screen.findByRole('button', { name: 'Request a callback' }))
    expect(await screen.findByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Please agree to continue')).toBeInTheDocument()
    expect(tables().formSubmissions.filter((row) => row.formId === FORM).length).toBe(6)

    await user.type(screen.getByLabelText(/Full name/), 'Public Visitor')
    await user.type(screen.getByLabelText(/Phone number/), '9222200001')
    await user.click(screen.getByRole('checkbox', { name: /agree to be contacted/ }))
    await user.click(screen.getByRole('button', { name: 'Request a callback' }))

    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument()
    expect(screen.getByText(/Our team will call you within one business day/)).toBeInTheDocument()
    const lead = tables().leads.find((item) => item.name === 'Public Visitor')
    expect(lead).toMatchObject({ phone: '+919222200001', tags: ['website'], utm: { source: 'google', campaign: 'diwali-dhamaka-search' } })
    expect(lead?.assignedTo).toBeTruthy()
    expect(tables().formSubmissions.filter((row) => row.formId === FORM).length).toBe(7)
  })

  it('does not post when the hidden honeypot is filled, but still thanks the visitor', async () => {
    const user = userEvent.setup()
    renderPublic()
    await user.type(await screen.findByLabelText(/Full name/), 'Bot Name')
    await user.type(screen.getByLabelText(/Phone number/), '9222200002')
    await user.click(screen.getByRole('checkbox', { name: /agree to be contacted/ }))
    await user.type(document.querySelector('input[name="website_url"]') as HTMLInputElement, 'spam')
    await user.click(screen.getByRole('button', { name: 'Request a callback' }))
    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument()
    expect(tables().leads.some((item) => item.name === 'Bot Name')).toBe(false)
  })

  it('shows a friendly message on rapid repeated submissions', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPublic()
    unmount()
    for (let i = 0; i < 3; i += 1) {
      const view = renderPublic()
      await user.type(await screen.findByLabelText(/Full name/), `Rapid ${i}`)
      await user.type(screen.getByLabelText(/Phone number/), `922220010${i}`)
      await user.click(screen.getByRole('checkbox', { name: /agree to be contacted/ }))
      await user.click(screen.getByRole('button', { name: 'Request a callback' }))
      await screen.findByRole('heading', { name: 'Thank you' })
      view.unmount()
    }
    renderPublic()
    await user.type(await screen.findByLabelText(/Full name/), 'Rapid 4')
    await user.type(screen.getByLabelText(/Phone number/), '9222200104')
    await user.click(screen.getByRole('checkbox', { name: /agree to be contacted/ }))
    await user.click(screen.getByRole('button', { name: 'Request a callback' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/too quickly/)
  })

  it('shows a not-available state for an unknown or disabled form and leaks nothing', async () => {
    renderPublic('/f/form-missing')
    expect(await screen.findByRole('heading', { name: 'This form is not available' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Acme|tenant|user-/)
  })
})

describe('lead capture settings', () => {
  it('creates a form from the builder with the default fields, and lists it', async () => {
    signIn(USERS.arjun, 'admin')
    const user = userEvent.setup()
    render(<Harness><LeadCapturePage /></Harness>)
    expect(await screen.findByText('Website contact form')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /New form/ }))
    expect(await screen.findByRole('region', { name: 'Live preview' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Form fields' })).toHaveTextContent('Full name')
    expect(within(screen.getByRole('region', { name: 'Live preview' })).getByLabelText(/Full name/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create form' }))
    await waitFor(() => expect(tables().leadForms.some((form) => form.name === 'New lead form')).toBe(true))
    expect(tables().auditLogs.some((log) => log.entity === 'lead_form' && log.action === 'created')).toBe(true)
  })

  it('shows the publish outputs for a saved form: link, iframe, script and a QR placeholder', async () => {
    signIn(USERS.arjun, 'admin')
    const user = userEvent.setup()
    render(<Harness><LeadCapturePage /></Harness>)
    await user.click(await screen.findByRole('button', { name: /Edit/ }))
    await user.click(await screen.findByRole('tab', { name: 'Publish' }))
    expect((await screen.findByLabelText('Hosted link') as HTMLInputElement).value).toBe(`${window.location.origin}/f/${FORM}`)
    expect((screen.getByLabelText('Embed with an iframe') as HTMLTextAreaElement).value).toContain('<iframe src=')
    expect((screen.getByLabelText('Embed with a script') as HTMLTextAreaElement).value).toContain('window.location.search')
    expect(screen.getByText('Placeholder')).toBeInTheDocument()
  })

  it('disables and archives a form from the list', async () => {
    signIn(USERS.arjun, 'admin')
    const user = userEvent.setup()
    render(<Harness><LeadCapturePage /></Harness>)
    await user.click(await screen.findByRole('button', { name: /Disable/ }))
    await waitFor(() => expect(tables().leadForms.find((form) => form.id === FORM)?.status).toBe('disabled'))
    await user.click(await screen.findByRole('button', { name: /Archive/ }))
    await waitFor(() => expect(tables().leadForms.find((form) => form.id === FORM)?.status).toBe('archived'))
  })

  it('shows No access to a salesperson', async () => {
    signIn(USERS.ananya, 'salesperson')
    render(<Harness><LeadCapturePage /></Harness>)
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument()
  })
})
