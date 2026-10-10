/**
 * Throw this from a tool's run() for expected, user-fixable problems (bad JSON, etc.).
 *  - `message` is shown to the user in the UI only.
 *  - `code` is the ONLY thing sent to analytics (e.g. "invalid_json"). Never put user data in it.
 */
export class ToolError extends Error {
  code: string
  constructor(message: string, code = "invalid_input") {
    super(message)
    this.name = "ToolError"
    this.code = code
  }
}
