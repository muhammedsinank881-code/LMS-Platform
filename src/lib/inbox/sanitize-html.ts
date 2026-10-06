const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'A', 'P', 'BR', 'DIV', 'SPAN'])
const SAFE_HREF = /^(https?:|mailto:|tel:)/i
const HAS_TAG = /<\/?[a-z][^>]*>/i

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Plain text keeps its line breaks; HTML keeps them as written. */
export function looksLikeHtml(value: string): boolean {
  return HAS_TAG.test(value)
}

function cleanNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? '')
  if (!(node instanceof Element)) return null
  const children = [...node.childNodes].map((child) => cleanNode(child, doc)).filter((child): child is Node => child !== null)
  if (!ALLOWED_TAGS.has(node.tagName)) {
    // Drop scripts and styles entirely; unwrap any other unknown element.
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return null
    const fragment = doc.createDocumentFragment()
    children.forEach((child) => fragment.appendChild(child))
    return fragment
  }
  const element = doc.createElement(node.tagName.toLowerCase())
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') ?? ''
    if (SAFE_HREF.test(href.trim())) {
      element.setAttribute('href', href.trim())
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }
  }
  children.forEach((child) => element.appendChild(child))
  return element
}

/**
 * Email bodies arrive as composer HTML or plain text. Keep basic formatting (bold, italic,
 * lists, links) and strip everything else, including attributes, so nothing can run.
 */
export function sanitizeEmailHtml(value: string): string {
  if (!looksLikeHtml(value)) return escapeText(value).replace(/\n/g, '<br>')
  const parsed = new DOMParser().parseFromString(`<div>${value}</div>`, 'text/html')
  const root = parsed.body.firstElementChild
  if (!root) return ''
  const out = document.implementation.createHTMLDocument('')
  const wrapper = out.createElement('div')
  for (const child of [...root.childNodes]) {
    const clean = cleanNode(child, out)
    if (clean) wrapper.appendChild(clean)
  }
  return wrapper.innerHTML
}

/** Visible text of an HTML body, for previews and length checks. */
export function htmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}
