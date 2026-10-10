/** Remembers the visitor's analytics-storage choice in localStorage (nothing else). */
const KEY = "devtools_consent"
export type Consent = "granted" | "denied" | null

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY)
    return v === "granted" || v === "denied" ? v : null
  } catch {
    return null
  }
}

export function setConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* storage unavailable: choice just lasts for this visit */
  }
}

export const openConsentSettings = () => window.dispatchEvent(new Event("devtools:consent-open"))
