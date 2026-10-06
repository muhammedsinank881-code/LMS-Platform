import type {
  IntegrationProvider,
  LeadAdsProvider,
  PublicSubmitResult,
  SendTestLeadResult,
  Utm,
  WebhookOutcome,
  Integration,
  CallLog,
  Conversation,
  EngagementInput,
  FormSubmissionInput,
  IncomingEmailInput,
  IncomingWhatsAppInput,
  Message,
  MessageStatus,
  MessageTemplate,
  MissedCallInput,
  ResolveTemplateInput,
  SimulatedClock,
  SimulatorMessageRef,
} from '@/types'

export interface SimulatorApiClient {
  incomingWhatsApp(input: IncomingWhatsAppInput): Promise<{ conversation: Conversation; message: Message }>
  incomingEmail(input: IncomingEmailInput): Promise<{ conversation: Conversation; message: Message }>
  setDeliveryStatus(messageId: string, status: MessageStatus): Promise<Message>
  emailOpened(messageId: string): Promise<Message>
  emailClicked(messageId: string): Promise<Message>
  missedCall(input: MissedCallInput): Promise<{ conversation: Conversation; callLog: CallLog }>
  /** Newest sent messages first, so the simulator can offer a picker instead of an id. */
  recentOutbound(): Promise<SimulatorMessageRef[]>
  resolveTemplate(input: ResolveTemplateInput): Promise<MessageTemplate>
  /** Records an engagement signal on a lead and re-scores it. */
  engagement(input: EngagementInput): Promise<void>
  submitForm(input: FormSubmissionInput): Promise<void>
  /** Moves the dev clock forward and runs the automation scheduler, so delays and idle triggers fire. */
  advanceClock(minutes: number): Promise<SimulatedClock>
  resetClock(): Promise<SimulatedClock>
  getClock(): Promise<SimulatedClock>
  /** A lead arriving through a connected Facebook, Instagram, Google or LinkedIn integration. */
  adLead(provider: LeadAdsProvider): Promise<SendTestLeadResult>
  /** Submits a hosted capture form as a visitor would, with UTM parameters. */
  captureFormSubmission(formId: string, utm: Utm): Promise<PublicSubmitResult>
  /** A WhatsApp message from a number we have never seen: creates a lead and its conversation. */
  whatsappLead(phone: string, text: string): Promise<SendTestLeadResult>
  /** What the next simulated webhook delivery does. */
  setWebhookOutcome(outcome: WebhookOutcome): Promise<void>
  /** Breaks a connected integration, or expires its token. */
  failIntegration(provider: IntegrationProvider, kind: 'error' | 'expired'): Promise<Integration>
  /** Runs the Google Ads spend sync as the provider would on a schedule. */
  syncSpend(): Promise<{ created: number }>
}
