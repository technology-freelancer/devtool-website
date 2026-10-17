import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-17",
  sections: [
    { heading: "What is a QR code?", blocks: [
      { t: "p", text: "A QR (Quick Response) code is a two-dimensional barcode that a phone camera can read. Denso Wave created it in 1994 to track car parts. Today it opens websites, joins Wi-Fi networks, starts emails and calls, and holds tickets and payment details." },
      { t: "p", text: "This generator makes static QR codes. The data is stored in the image itself, so the code works without an account or a redirect service." },
    ] },
    { heading: "How a QR code works", blocks: [
      { t: "p", text: "A QR code is a grid of black and white squares called modules. The three large corner squares help a scanner locate and orient the code. Versions range from 1 (21 × 21 modules) to 40 (177 × 177); grid size follows size = 17 + 4 × version. More data needs a larger, denser grid." },
      { t: "p", text: "QR codes also use Reed-Solomon error correction, so scanners can recover data when part of the code is dirty, scratched or covered." },
    ] },
    { heading: "Error correction levels", blocks: [
      { t: "table", head: ["Level", "Approximate recovery", "Best for"], rows: [
        ["L (Low)", "7%", "Clean screens and short text; typically the simplest code."],
        ["M (Medium)", "15%", "A practical default for most uses."],
        ["Q (Quartile)", "25%", "Printed codes that may get scuffed."],
        ["H (High)", "30%", "Rough surfaces or a logo placed over the code."],
      ] },
      { t: "p", text: "Higher error correction takes more room in the grid, so the code may become denser for the same data." },
    ] },
    { heading: "How much data fits?", blocks: [
      { t: "p", text: "The largest code (version 40) can hold different amounts depending on data type and error correction:" },
      { t: "table", head: ["Level", "Digits", "Letters and digits", "Any text (bytes)"], rows: [["L", "7,089", "4,296", "2,953"], ["M", "5,596", "3,391", "2,331"], ["Q", "3,993", "2,420", "1,663"], ["H", "3,057", "1,852", "1,273"]] },
      { t: "p", text: "Short content makes a simpler code that scans faster and from further away. Non-English characters can take several bytes each." },
    ] },
    { heading: "What you can put in a QR code", blocks: [
      { t: "p", text: "A QR code stores text. Phones recognize common formats and offer an action. This tool assembles the data for you:" },
      { t: "table", head: ["Type", "Text stored", "Phone action"], rows: [
        ["Link", "`https://example.com`", "Open a website."],
        ["Wi-Fi", `\`${EX.qrWifi}\``, "Join the network. Reserved characters are escaped."],
        ["Email", `\`${EX.qrEmail}\``, "Start an email with its address and subject."],
        ["Phone", `\`${EX.qrPhone}\``, "Call the number."],
      ] },
    ] },
    { heading: "Static and dynamic QR codes", blocks: [
      { t: "table", head: ["", "Static (this tool)", "Dynamic (online services)"], rows: [
        ["Data location", "In the image", "On a provider's server; the image contains a redirect link"],
        ["Editable after printing", "No", "Often yes"],
        ["Scan statistics", "No", "Often yes"],
        ["Dependency", "Works as long as the content does", "Depends on the provider and account"],
        ["Privacy", "No scan tracking by this tool", "Scans may pass through the provider"],
      ] },
      { t: "p", text: "Use a static code when content will not change. If a destination may need updates, use a link on a site you control and update that page." },
    ] },
    { heading: "Make a QR code that scans reliably", blocks: [
      { t: "ul", items: [
        "**Keep strong contrast.** Dark code on a light background is most reliable; inverted codes can fail on some scanners.",
        "**Leave a quiet zone.** Keep an empty border of four modules around the code; that is the standard default.",
        "**Print it large enough.** A rough rule is scanning distance divided by ten: for one metre, make the code around 10 cm wide. Test the actual print size.",
        "**Shorten the content.** A short URL produces a simpler code. Prefer HTTPS links.",
        "**Use SVG for print** so edges remain sharp when resized, and avoid stretching it out of proportion.",
        "**Test before printing.** Scan from the intended distance with more than one phone if possible.",
      ] },
    ] },
    { heading: "QR code safety", blocks: [
      { t: "p", text: "A QR code hides its contents from a quick glance. Scammers sometimes cover legitimate codes with stickers that lead to phishing pages. Check the address your phone displays before opening it, and inspect public QR codes for tampering." },
    ] },
  ],
  references: [
    { label: "QRcode.com by Denso Wave, the QR code inventor", href: "https://www.qrcode.com/en/" },
    { label: "QR code standards (Denso Wave)", href: "https://www.qrcode.com/en/about/standards.html" },
    { label: "ZXing: barcode contents (Wi-Fi, email and other formats)", href: "https://github.com/zxing/zxing/wiki/Barcode-Contents" },
    { label: "node-qrcode, the open-source library behind this tool", href: "https://github.com/soldair/node-qrcode" },
  ],
  related: [
    { slug: "uuid-generator", anchor: "UUID generator", why: "creates unique ids for tickets and labels you want to encode." },
    { slug: "aes-encryption-decryption", anchor: "AES encryption tool", why: "encrypts text before you encode it in a QR code." },
  ],
}
export default learn
