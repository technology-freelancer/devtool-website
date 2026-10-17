/**
 * Computes every worked example shown in the Learn sections using the real tool engines,
 * so the documentation can never drift from what the tools actually do.
 * Used only by scripts/gen-learn-examples.ts and tests/learn.test.ts (never bundled into the site).
 */
import { format } from "sql-formatter"
import { aesEncrypt } from "../../lib/aes"
import { buildPayload } from "../../lib/qr"
import { decodeBase64, encodeBase64 } from "../../lib/base64"
import { describeCron } from "../../lib/cron"
import { jsonToJava } from "../../lib/generators/java"
import { jsonToTypeScript } from "../../lib/generators/typescript"
import { diffJsonText, preview } from "../../lib/jsonDiff"
import { decodeJwt } from "../../lib/jwt"
import { runRegex } from "../../lib/regexRun"
import { parseTimestamp } from "../../lib/timestamp"

const b64url = (o: unknown) => encodeBase64(JSON.stringify(o), true)

export async function computeExamples() {
  const javaJson = `{
  "id": 101,
  "user_name": "John",
  "active": true,
  "tags": ["admin", "dev"],
  "address": { "city": "Pune", "zip": "411001" }
}`
  const tsJson = `{
  "id": 1,
  "name": "Ada",
  "email": null,
  "address": { "city": "Pune" },
  "orders": [
    { "id": 10, "total": 99.5 },
    { "id": 11, "total": 20, "coupon": "SAVE5" }
  ]
}`
  const jwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: "1234567890", name: "Ada Lovelace", iat: 1516239022, exp: 1516242622 })}.c2lnbmF0dXJlLW5vdC12ZXJpZmllZA`
  const jwtDecoded = decodeJwt(jwt)
  const cronExprs = ["*/5 * * * *", "0 * * * *", "0 9 * * 1-5", "30 2 * * 0", "0 0 1 * *", "0 */6 * * *", "15 10 * * 1"]
  const sqlIn = "select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.active=true group by u.id,u.name order by orders desc limit 10;"
  const sqlCteIn = "with recent as (select user_id,max(created_at) as last_order from orders group by user_id) select u.name,r.last_order from users u join recent r on r.user_id=u.id where r.last_order>now()-interval '30 days';"
  const rxText = "Contact ada@example.com or grace@devtools.io today."
  const rxPattern = "(?<user>[\\w.-]+)@(?<domain>[\\w.-]+\\.\\w+)"
  const rx = runRegex(rxPattern, "g", rxText)
  const apiCompact = `{"id":101,"name":"John","roles":["admin","dev"],"address":{"city":"Pune","zip":"411001"}}`
  const diffA = `{"name":"DevTools","version":1,"active":true,"tags":["json","api"],"owner":{"id":7,"team":"core"}}`
  const diffB = `{"name":"DevTools Pro","version":2,"tags":["json","api","diff"],"owner":{"id":7,"team":"platform"},"beta":true}`
  const ts = parseTimestamp("1747751400")
  const aesKey256 = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"
  const aesIv12 = "000102030405060708090a0b"
  const aesKey128 = "000102030405060708090a0b0c0d0e0f"
  const aesIv16 = "101112131415161718191a1b1c1d1e1f"
  const aesPlain = "Hello, DevTools!"
  const rawOptions = { keySource: "raw", keyFormat: "hex", ivFormat: "hex", encoding: "hex" } as const
  const qrFields = { text: "", ssid: "Home WiFi", password: "pa;ss", security: "WPA", hidden: false, email: "hello@example.com", subject: "Hello there", body: "", phone: "+91 98765 43210" } as const

  return {
    aesKey256,
    aesIv12,
    aesKey128,
    aesIv16,
    aesPlain,
    aesGcmHex: await aesEncrypt(aesPlain, { ...rawOptions, mode: "GCM", keyBits: 256, secret: aesKey256, iv: aesIv12 }),
    aesCbcHex: await aesEncrypt(aesPlain, { ...rawOptions, mode: "CBC", keyBits: 128, secret: aesKey128, iv: aesIv16 }),
    aesCtrHex: await aesEncrypt(aesPlain, { ...rawOptions, mode: "CTR", keyBits: 128, secret: aesKey128, iv: aesIv16 }),
    qrWifi: buildPayload("wifi", { ...qrFields }),
    qrEmail: buildPayload("email", { ...qrFields }),
    qrPhone: buildPayload("phone", { ...qrFields }),
    javaJson,
    javaRecord: jsonToJava(javaJson, { rootName: "User", packageName: "", style: "record", jackson: true }),
    javaLombok: jsonToJava(javaJson, { rootName: "User", packageName: "com.example.model", style: "lombok", jackson: true }),
    tsJson,
    tsInterface: jsonToTypeScript(tsJson, { rootName: "User", style: "interface", exportTypes: true, readonly: false }),
    jwt,
    jwtHeader: jwtDecoded.headerText,
    jwtPayload: jwtDecoded.payloadText,
    cron: cronExprs.map((e) => [e, describeCron(e)] as [string, string]),
    sqlIn,
    sqlOut: format(sqlIn, { language: "postgresql", keywordCase: "upper", tabWidth: 2 }),
    sqlCteIn,
    sqlCteOut: format(sqlCteIn, { language: "postgresql", keywordCase: "upper", tabWidth: 2 }),
    rxPattern,
    rxText,
    rxMatches: rx.ok ? rx.matches.map((m) => `"${m.text}" at ${m.index}-${m.end}  user=${m.named.user}  domain=${m.named.domain}`).join("\n") : "",
    apiCompact,
    apiPretty: JSON.stringify(JSON.parse(apiCompact), null, 2),
    diffA,
    diffB,
    diffOut: diffJsonText(diffA, diffB)
      .map((c) => (c.type === "changed" ? `~ ${c.path}: ${preview(c.before)} -> ${preview(c.after)}` : c.type === "added" ? `+ ${c.path}: ${preview(c.after)}` : `- ${c.path}: ${preview(c.before)}`))
      .join("\n"),
    b64Plain: "Hello, DevTools!",
    b64Encoded: encodeBase64("Hello, DevTools!"),
    b64Unicode: encodeBase64("नमस्ते"),
    b64Std: encodeBase64("???>>>"),
    b64Url: encodeBase64("???>>>", true),
    b64Roundtrip: decodeBase64(encodeBase64("Man")),
    b64Man: encodeBase64("Man"),
    tsEpoch: "1747751400",
    tsIso: ts.date.toISOString(),
    tsUtc: ts.date.toUTCString(),
    tsMax32: new Date(2147483647 * 1000).toISOString(),
  }
}
export type Examples = ReturnType<typeof computeExamples>