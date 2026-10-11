import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  sections: [
    {
      heading: "What is a JSON Web Token (JWT)?",
      blocks: [
        { t: "p", text: "A JWT is a compact, URL-safe string that carries information, called claims, between two parties. It is defined in [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519). The most common use is login: after you sign in, the server issues a token, and your app sends it back on each request, usually in an `Authorization: Bearer` header, to prove who you are." },
      ],
    },
    {
      heading: "The three parts of a JWT",
      blocks: [
        { t: "p", text: "A JWT is three parts separated by dots: `header.payload.signature`." },
        {
          t: "ul",
          items: [
            "**Header:** a small JSON object that names the signing algorithm (`alg`) and the token type (`typ`).",
            "**Payload:** a JSON object holding the claims, such as who the token is about and when it expires.",
            "**Signature:** proof that the header and payload were not changed. It is created with a secret or a private key.",
          ],
        },
        { t: "note", kind: "warn", text: "The header and payload are only Base64URL-encoded, not encrypted. Anyone who has the token can read them. Never put passwords or other secrets in a JWT payload." },
      ],
    },
    {
      heading: "Worked example: decoding a token",
      blocks: [
        { t: "code", label: "Token (signature is a placeholder)", code: EX.jwt },
        { t: "code", label: "Decoded header", code: EX.jwtHeader },
        { t: "code", label: "Decoded payload", code: EX.jwtPayload },
        { t: "p", text: "`iat` (issued at) and `exp` (expires) are counted in seconds since 1 January 1970 UTC. Here `exp` is exactly 3,600 seconds after `iat`, so the token was valid for one hour. You can convert such values with the [timestamp converter](/timestamp-converter)." },
      ],
    },
    {
      heading: "Standard JWT claims",
      blocks: [
        {
          t: "table",
          head: ["Claim", "Name", "Meaning"],
          rows: [
            ["`iss`", "Issuer", "Who created and signed the token."],
            ["`sub`", "Subject", "Who the token is about, usually a user id."],
            ["`aud`", "Audience", "Who the token is meant for, such as an API."],
            ["`exp`", "Expiration time", "After this moment (in seconds) the token must be rejected."],
            ["`nbf`", "Not before", "Before this moment the token must not be accepted."],
            ["`iat`", "Issued at", "When the token was created."],
            ["`jti`", "JWT ID", "A unique id, useful for revoking or detecting replays."],
          ],
        },
      ],
    },
    {
      heading: "Decoding is not verifying",
      blocks: [
        { t: "p", text: "This tool reads the contents of a token. It cannot tell you whether the token is genuine, because that needs the secret or public key. Your server must verify every token before trusting it:" },
        {
          t: "ul",
          items: [
            "Verify the signature with the correct key, and accept only the algorithms you expect.",
            "Reject tokens with `alg` set to `none`, which means unsigned.",
            "Do not let the token's own header choose the key or algorithm. Mixing up a public RSA key with an HMAC secret is a known attack.",
            "Check `exp`, `nbf`, `iss` and `aud`.",
            "Keep lifetimes short and use refresh tokens for longer sessions.",
          ],
        },
        {
          t: "table",
          head: ["Algorithm", "How it signs"],
          rows: [
            ["HS256", "HMAC with SHA-256 and one shared secret. Anyone who can verify can also create tokens."],
            ["RS256", "RSA signature with SHA-256. A private key signs and a public key verifies."],
            ["ES256", "ECDSA on the P-256 curve with SHA-256. Smaller keys and signatures than RSA."],
            ["EdDSA", "Edwards-curve signatures such as Ed25519."],
          ],
        },
      ],
    },
    {
      heading: "Why won't my token decode?",
      blocks: [
        {
          t: "ul",
          items: [
            "**It is not three parts.** A token with five parts is an encrypted JWE. Its contents cannot be read without the key.",
            "**It was cut off when copied.** Make sure you copied the whole string.",
            "**Extra characters.** A leading `Bearer ` prefix, spaces and line breaks are removed automatically, but quotes and other text are not.",
            "**Not valid JSON inside.** The header or payload must be a JSON object once decoded.",
          ],
        },
      ],
    },
    {
      heading: "Why is my token shown as expired?",
      blocks: [
        { t: "p", text: "The tool compares `exp` with the clock on your device. Time zones do not matter, because the value is a UTC timestamp. If the result looks wrong, check that your device's date and time are correct. Servers often allow a small leeway, such as 30 to 60 seconds, to absorb clock differences." },
      ],
    },
  ],
  references: [
    { label: "RFC 7519: JSON Web Token (JWT)", href: "https://www.rfc-editor.org/rfc/rfc7519" },
    { label: "RFC 7515: JSON Web Signature (JWS)", href: "https://www.rfc-editor.org/rfc/rfc7515" },
    { label: "RFC 8725: JWT best current practices", href: "https://www.rfc-editor.org/rfc/rfc8725" },
  ],
  related: [
    { slug: "timestamp-converter", anchor: "Timestamp converter", why: "turns exp, iat and nbf values into readable dates." },
    { slug: "base64-converter", anchor: "Base64 converter", why: "decodes any single token segment by hand (use the URL-safe alphabet)." },
    { slug: "api-response-formatter", anchor: "API response formatter", why: "formats the JSON of a decoded payload." },
  ],
}
export default learn