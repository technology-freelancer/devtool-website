import { lazy, type ComponentType, type LazyExoticComponent } from "react"

/**
 * Maps a tool slug to its workspace component. Tools are lazy-loaded, so each tool's
 * code only downloads on its own page. To ship a tool: build its component, add one line here.
 */
export const toolComponents: Record<string, LazyExoticComponent<ComponentType>> = {
  "json-to-java": lazy(() => import("./json-to-java/JsonToJava")),
  "json-to-typescript": lazy(() => import("./json-to-typescript/JsonToTypeScript")),
  "jwt-decoder": lazy(() => import("./jwt-decoder/JwtDecoder")),
  "cron-generator": lazy(() => import("./cron-generator/CronGenerator")),
  "sql-formatter": lazy(() => import("./sql-formatter/SqlFormatter")),
  "regex-tester": lazy(() => import("./regex-tester/RegexTester")),
  "api-response-formatter": lazy(() => import("./api-response-formatter/ApiResponseFormatter")),
  "uuid-generator": lazy(() => import("./uuid-generator/UuidGenerator")),
  "base64-converter": lazy(() => import("./base64-converter/Base64Converter")),
  "timestamp-converter": lazy(() => import("./timestamp-converter/TimestampConverter")),
  "json-diff": lazy(() => import("./json-diff/JsonDiff")),
  "aes-encryption-decryption": lazy(() => import("./aes-encryption-decryption/AesTool")),
  "qr-code-generator": lazy(() => import("./qr-code-generator/QrCodeGenerator")),
}
