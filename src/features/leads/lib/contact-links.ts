export function telHref(phone: string | null | undefined): string | null {
  return phone ? `tel:${phone}` : null
}

export function whatsappHref(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}

export function mailtoHref(email: string | null | undefined): string | null {
  return email ? `mailto:${email}` : null
}
