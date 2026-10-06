/** Conversation and note copy for the seed. `{name}`, `{product}`, `{city}` are filled in. */

export const FOLLOW_UP_NOTES = [
  'Discuss pricing and share the quotation',
  'Share brochure and case studies on WhatsApp',
  'Confirm the demo slot with the decision maker',
  'Check if the budget got approved',
  'Send revised proposal with discount',
  'Call back after the weekend as requested',
  'Collect GST details for the invoice',
  'Follow up on the unanswered email',
] as const

export const TASK_TITLES = [
  'Prepare proposal deck',
  'Send contract for signature',
  'Update CRM notes after demo',
  'Share onboarding checklist',
  'Review campaign performance with the client',
  'Collect payment confirmation',
  'Schedule product walkthrough',
  'Verify lead details from import',
] as const

export const CALL_NOTES = [
  'Discussed requirements; will share quotation.',
  'Customer asked to call back next week.',
  'Walked through the demo; positive response.',
  'Negotiated pricing; waiting for approval.',
] as const

export type ChatLine = readonly ['in' | 'out', string]
export type EmailLine = readonly ['in' | 'out', string, string]

export const WHATSAPP_SCRIPTS: ReadonlyArray<readonly ChatLine[]> = [
  [
    ['in', 'Hi, I saw your ad on Instagram. What are the charges for {product}?'],
    ['out', 'Namaste! Thanks for reaching out. Our {product} plans start at ₹15,000 per month.'],
    ['in', 'Can you share a detailed quotation?'],
    ['out', 'Sure, sending it now. Could you confirm your business name and city?'],
    ['in', 'Yes, we are based in {city}. Please send on email too.'],
    ['out', 'Done! Please check your email. Shall we schedule a quick call tomorrow?'],
  ],
  [
    [
      'out',
      'Hello {name}, this is from LeadFlow. You enquired about {product}. Is this a good time to talk?',
    ],
    ['in', 'Not right now, can you call after 6 PM?'],
    ['out', 'Of course. I will call you at 6:15 PM today.'],
    ['in', 'Okay, thanks.'],
  ],
  [
    ['in', 'We need {product} urgently. Can you start next week?'],
    ['out', 'Yes, we can. Our team will share the onboarding plan today.'],
    ['in', 'Great. What do you need from us?'],
    ['out', 'Brand assets, access to your page and a 30-minute kickoff call.'],
    ['in', 'Sending the assets by evening.'],
    ['out', 'Perfect, thank you! Kickoff call is booked for Thursday 11 AM.'],
    ['in', 'Confirmed.'],
  ],
  [
    ['out', 'Hi {name}, just checking in on the proposal I sent. Any questions?'],
    ['in', 'The price looks high compared to another agency.'],
    ['out', 'Understood. I can offer a 10% discount on a 6-month commitment. Would that work?'],
    ['in', 'Let me discuss with my partner and revert.'],
  ],
]

export const EMAIL_SCRIPTS: ReadonlyArray<readonly EmailLine[]> = [
  [
    [
      'out',
      'Proposal for {product}',
      'Dear {name}, please find the proposal for {product} attached. Happy to walk you through it.',
    ],
    [
      'in',
      'Re: Proposal for {product}',
      'Thanks, we have reviewed it. Can we reduce the scope to the first phase?',
    ],
    ['out', 'Re: Proposal for {product}', 'Absolutely. I will send a revised version by tomorrow.'],
  ],
  [
    [
      'in',
      'Enquiry: {product}',
      'Hello, we found your agency through Google. Please share your rate card for {product}.',
    ],
    [
      'out',
      'Re: Enquiry: {product}',
      'Hi {name}, our rate card and portfolio are attached. Let me know a good time to talk.',
    ],
  ],
]
