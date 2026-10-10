import type { IconName } from "@/components/Icon"

/** Single source of truth for every tool: routes, cards, SEO text, on-page content. */
export type Tool = {
  slug: string
  name: string
  shortName?: string
  description: string
  icon: IconName
  category: string
  seoTitle: string
  seoDescription: string
  steps: [title: string, text: string][]
  features: string[]
  faqs: [question: string, answer: string][]
}

export const tools: Tool[] = [
  {
    slug: "json-to-java", name: "JSON to Java", description: "Generate Java classes from JSON instantly.", icon: "braces", category: "Convert",
    seoTitle: "JSON to Java Converter - Generate POJO Classes Online",
    seoDescription: "Convert JSON to Java classes online. Generate POJOs with getters and setters, Lombok, records or Jackson annotations. Free, private and runs in your browser.",
    steps: [["Paste your JSON", "Paste an object or an array of objects. Nested objects and arrays become their own classes."], ["Choose a style", "Pick POJO, Lombok @Data, a Java record or public fields, and optionally add Jackson annotations and a package name."], ["Copy the classes", "Copy the generated code or download it as a .java file."]],
    features: ["POJO, Lombok, record and public-field styles", "Nested objects and List<T> arrays", "snake_case keys mapped to camelCase with @JsonProperty", "Integer, Long and Double detected from your numbers"],
    faqs: [["How are nested objects handled?", "Each nested object becomes its own class, named after its JSON key. Arrays of objects become List<ClassName>, and objects in the same array are merged so every field is included."], ["What if a JSON key is a Java keyword?", "The field is renamed (for example class becomes classValue) and, with Jackson annotations on, @JsonProperty keeps the original key for serialization."], ["Is my JSON uploaded anywhere?", "No. The conversion runs entirely in your browser."]],
  },
  {
    slug: "json-to-typescript", name: "JSON to TypeScript", description: "Convert JSON into TypeScript interfaces.", icon: "code", category: "Convert",
    seoTitle: "JSON to TypeScript Converter - Generate Interfaces Online",
    seoDescription: "Convert JSON to TypeScript interfaces or types online. Handles nested objects, arrays, optional fields and nulls. Free, private and runs in your browser.",
    steps: [["Paste your JSON", "Paste an API response or any JSON document."], ["Set the options", "Choose interface or type, set the root name, and toggle export and readonly."], ["Copy the types", "Copy the generated TypeScript or download it as types.ts."]],
    features: ["interface or type alias output", "Optional fields detected when keys are missing from some array items", "Union types for mixed values and null", "Invalid property names are quoted automatically"],
    faqs: [["How are optional properties detected?", "When objects inside an array do not all share the same keys, the missing keys are marked optional with a question mark."], ["How are mixed arrays typed?", "Arrays with several value types produce a union, for example (string | number)[]."], ["Is my JSON uploaded anywhere?", "No. Everything runs locally in your browser."]],
  },
  {
    slug: "jwt-decoder", name: "JWT Decoder", description: "Decode JWT header and payload locally.", icon: "shield", category: "Decode",
    seoTitle: "JWT Decoder - Decode JSON Web Tokens Online",
    seoDescription: "Decode a JWT online: view the header, payload, claims and expiration time. Runs in your browser, your token is never uploaded.",
    steps: [["Paste your token", "Paste a JWT. A leading Bearer prefix is removed automatically."], ["Read the claims", "The header, payload and key claims such as issuer, subject and expiry are shown instantly."], ["Check the expiry", "See whether the token is expired, still valid or not yet active."]],
    features: ["Header and payload decoded as you type", "Issued-at, expiry and not-before times in local and UTC time", "Warns about unsigned (alg none) tokens", "Token never leaves your browser"],
    faqs: [["Does this verify the signature?", "No. Decoding only reads the token contents. Always verify the signature on your server before trusting a token."], ["Is it safe to paste my token here?", "The token is decoded in your browser and is never sent to any server, but you should still avoid pasting live production tokens into any website."], ["Why does my token show as expired?", "The exp claim is compared with your device clock. If your clock is wrong, the result will be wrong too."]],
  },
  {
    slug: "cron-generator", name: "Cron Expression Generator", shortName: "Cron Generator", description: "Create and understand cron expressions.", icon: "clock", category: "Generate",
    seoTitle: "Cron Expression Generator & Explainer - Next Run Times",
    seoDescription: "Build cron expressions with presets, get a plain-English explanation and see the next run times. Free, runs in your browser.",
    steps: [["Pick a preset or edit fields", "Set minute, hour, day, month and weekday, or start from a common schedule."], ["Read the explanation", "The expression is explained in plain English so you can check it."], ["Check the next runs", "See the next 5 run times in your local time or UTC, then copy the expression."]],
    features: ["Common schedule presets", "Plain-English description of any expression", "Next 5 run times in local time or UTC", "Paste an existing expression to explain it"],
    faqs: [["Which cron format does this use?", "The standard 5-field format: minute, hour, day of month, month and day of week."], ["What does */5 mean?", "It means every 5th value of that field, so */5 in the minute field runs every 5 minutes."], ["Which time zone are the runs shown in?", "Your local time zone by default. Switch to UTC to see the schedule as a server in UTC would run it."]],
  },
  {
    slug: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries.", icon: "database", category: "Format",
    seoTitle: "SQL Formatter - Beautify SQL Queries Online",
    seoDescription: "Format and beautify SQL online for MySQL, PostgreSQL, SQL Server, Oracle, SQLite, BigQuery and more. Free and private.",
    steps: [["Paste your SQL", "Paste a query of any length."], ["Choose the dialect", "Pick your database and the keyword case and indentation you prefer."], ["Copy the result", "Copy the formatted SQL or download it as a .sql file."]],
    features: ["10 SQL dialects", "UPPERCASE, lowercase or preserved keywords", "2 spaces, 4 spaces or tab indentation", "Clear errors for invalid SQL"],
    faqs: [["Which databases are supported?", "Standard SQL, MySQL, MariaDB, PostgreSQL, SQLite, SQL Server, Oracle PL/SQL, BigQuery, Redshift and Snowflake."], ["Does formatting change what my query does?", "No. Only whitespace and, optionally, the case of keywords change."], ["Is my query uploaded?", "No. Formatting runs entirely in your browser."]],
  },
  {
    slug: "regex-tester", name: "Regex Tester", description: "Test regular expressions instantly.", icon: "regex", category: "Test",
    seoTitle: "Regex Tester - Test JavaScript Regular Expressions Online",
    seoDescription: "Test regular expressions online with live match highlighting, capture groups, named groups and match positions. Free, runs in your browser.",
    steps: [["Enter a pattern", "Type your regular expression and toggle the flags you need."], ["Add test text", "Paste the text to test against. Matches are highlighted live."], ["Inspect the matches", "See each match with its position and capture groups."]],
    features: ["Live highlighting as you type", "Capture groups and named groups", "Match positions", "Protection against patterns that hang the page"],
    faqs: [["Which regex flavor is this?", "It uses your browser's JavaScript RegExp engine, so results match what your JavaScript code will do."], ["Why does it say a pattern took too long?", "Some patterns, such as nested quantifiers, can take exponential time on certain input. The test is stopped after a short time to keep your browser responsive."], ["Is my text uploaded?", "No. Matching runs locally in your browser."]],
  },
  {
    slug: "api-response-formatter", name: "API Response Formatter", description: "Format and validate API responses.", icon: "api", category: "Format",
    seoTitle: "JSON Formatter & Validator - API Response Formatter",
    seoDescription: "Format, validate and minify JSON API responses online. Choose indentation and sort keys. Free, private and runs in your browser.",
    steps: [["Paste the response", "Paste the JSON returned by your API."], ["Choose format or minify", "Pick the indentation, or minify to a single line, and optionally sort keys A to Z."], ["Copy or download", "Copy the result or download it as response.json."]],
    features: ["Pretty-print with 2 spaces, 4 spaces or tabs", "Minify to one line", "Sort keys alphabetically", "Readable errors for invalid JSON"],
    faqs: [["Does it validate JSON?", "Yes. If the JSON is invalid, the parser's error message is shown so you can find the problem."], ["Can it format very large responses?", "It works well for typical API responses. Very large documents depend on your device's memory."], ["Is my data uploaded?", "No. Formatting happens in your browser."]],
  },
  {
    slug: "uuid-generator", name: "UUID Generator", description: "Generate secure UUIDs instantly.", icon: "spark", category: "Generate",
    seoTitle: "UUID Generator - Generate v4, v7 and v1 UUIDs Online",
    seoDescription: "Generate one or up to 1000 UUIDs online. Supports v4, v7 and v1, uppercase and no-hyphen formats. Copy or download. Free and private.",
    steps: [["Choose a version", "Pick v4 (random), v7 (time-ordered) or v1 (timestamp)."], ["Set how many", "Generate from 1 to 1000 UUIDs, with optional uppercase or no hyphens."], ["Copy or download", "Copy the list or download it as uuids.txt."]],
    features: ["UUID v4, v7 and v1", "Up to 1000 at a time", "Uppercase and hyphen-free formats", "Secure random generation in your browser"],
    faqs: [["Which UUID version should I use?", "v4 is fully random and the most common. v7 is time-ordered, which works better for database primary keys."], ["Are these UUIDs unique?", "Random v4 and v7 UUIDs have a vanishingly small chance of collision in practice."], ["Are UUIDs generated on a server?", "No. They are generated in your browser and never sent anywhere."]],
  },
  {
    slug: "base64-converter", name: "Base64 Converter", description: "Encode and decode Base64 text.", icon: "swap", category: "Convert",
    seoTitle: "Base64 Encode & Decode Online - Unicode and URL-safe",
    seoDescription: "Encode text to Base64 or decode Base64 to text online. Full Unicode support and URL-safe mode. Free, private and runs in your browser.",
    steps: [["Choose encode or decode", "Select the direction you need."], ["Paste your input", "Paste text to encode, or Base64 to decode."], ["Copy the result", "Copy the output or download it as a text file."]],
    features: ["Full Unicode and emoji support", "URL-safe alphabet option", "Decoding accepts missing padding and either alphabet", "Clear errors for invalid Base64"],
    faqs: [["Does it support non-English text?", "Yes. Text is converted with UTF-8, so accents, emoji and other scripts round-trip correctly."], ["What is URL-safe Base64?", "It replaces + and / with - and _ and drops the = padding, so the result can be used in URLs and JWTs."], ["Is Base64 encryption?", "No. Base64 is an encoding, not encryption. Anyone can decode it."]],
  },
  {
    slug: "timestamp-converter", name: "Timestamp Converter", description: "Convert Unix timestamps to readable dates.", icon: "calendar", category: "Convert",
    seoTitle: "Unix Timestamp Converter - Epoch to Date and Back",
    seoDescription: "Convert Unix timestamps to human-readable dates and dates back to timestamps. Seconds and milliseconds, UTC and local time. Free.",
    steps: [["Enter a timestamp", "Paste a Unix timestamp in seconds or milliseconds. The unit is detected automatically."], ["Read the date", "See UTC, local time, ISO 8601 and a relative time."], ["Or convert a date", "Pick a date and time to get its Unix timestamp."]],
    features: ["Seconds and milliseconds, auto-detected", "UTC, local and ISO 8601 output", "Relative time such as 3 hours ago", "Live current Unix time"],
    faqs: [["What is a Unix timestamp?", "It is the number of seconds since January 1, 1970 at 00:00:00 UTC."], ["How does auto-detect work?", "Values of about 100 billion or more are treated as milliseconds, smaller values as seconds."], ["Which time zone is local time?", "The time zone set on your device."]],
  },
  {
    slug: "json-diff", name: "JSON Diff", description: "Compare two JSON objects clearly.", icon: "diff", category: "Compare",
    seoTitle: "JSON Diff - Compare Two JSON Documents Online",
    seoDescription: "Compare two JSON documents and see added, removed and changed values with their paths. Free, private and runs in your browser.",
    steps: [["Paste both documents", "Paste the original JSON on the left and the changed JSON on the right."], ["Compare", "Added, removed and changed values are listed with their JSON paths."], ["Copy the differences", "Copy the list of changes to share or paste into a ticket."]],
    features: ["Added, removed and changed values with paths", "Key order is ignored", "Array items matched by id when available", "Swap the two sides in one click"],
    faqs: [["Does key order matter?", "No. Objects are compared by key, so reordering keys is not reported as a change."], ["How are arrays compared?", "Items with an id (or _id, key) are matched by that value. Other items are matched by position."], ["Is my JSON uploaded?", "No. The comparison runs in your browser."]],
  },
]

export const popularSlugs = ["jwt-decoder", "api-response-formatter", "json-to-java", "sql-formatter"]

export const getTool = (slug?: string) => tools.find((t) => t.slug === slug)

export const relatedTools = (tool: Tool, limit = 4) => {
  const same = tools.filter((t) => t.slug !== tool.slug && (t.category === tool.category || (t.name.includes("JSON") && tool.name.includes("JSON"))))
  const rest = tools.filter((t) => t.slug !== tool.slug && !same.includes(t))
  return [...same, ...rest].slice(0, limit)
}
