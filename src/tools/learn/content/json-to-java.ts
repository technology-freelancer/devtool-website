import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-15",
  sections: [
    {
      heading: "What is a JSON to Java converter?",
      blocks: [
        { t: "p", text: "JSON describes data with objects, arrays, strings, numbers, booleans and null. In Java you normally read that data into typed classes, so your code can call `user.getUserName()` instead of digging through a `Map`. Libraries such as Jackson and Gson do the binding, but they need classes whose fields match the JSON keys." },
        { t: "p", text: "Writing those classes by hand for a large API response is slow and easy to get wrong. This tool reads a sample of your JSON and generates the classes for you. Nested objects become their own classes, arrays become `List<T>`, and when objects in the same array have different keys, they are merged so that every field is included." },
      ],
    },
    {
      heading: "How JSON types map to Java types",
      blocks: [
        {
          t: "table",
          head: ["JSON value", "Java type", "Notes"],
          rows: [
            ["string", "`String`", "Dates stay as `String`. Convert them to `Instant` or `LocalDate` in your own code."],
            ["whole number", "`Integer`", "Becomes `Long` when the value is outside the 32-bit range (about ±2.1 billion)."],
            ["decimal number", "`Double`", "Switch to `BigDecimal` by hand if you handle money."],
            ["true / false", "`Boolean`", "Boxed type, so a missing or null value is allowed."],
            ["null", "`Object`", "A lone null gives no type clue. Replace `Object` with the real type."],
            ["array", "`List<T>`", "`T` comes from the items. An empty array gives `List<Object>`."],
            ["object", "nested class", "Named after the JSON key, in PascalCase."],
            ["mixed types in one field", "`Object`", "For example a field that is sometimes a number and sometimes a string."],
          ],
        },
      ],
    },
    {
      heading: "Worked example: JSON to Lombok and record classes",
      blocks: [
        { t: "p", text: "Take this JSON. The key `user_name` uses snake_case, which Java style would write as `userName`, and `address` is a nested object." },
        { t: "code", label: "JSON input", code: EX.javaJson },
        { t: "code", label: "Output: Lombok style with a package name", code: EX.javaLombok },
        { t: "p", text: "The generator renamed `user_name` to `userName` and added `@JsonProperty(\"user_name\")` so Jackson still maps the original key. `@JsonIgnoreProperties(ignoreUnknown = true)` stops parsing from failing when the API later adds new fields. The same JSON as Java records looks like this:" },
        { t: "code", label: "Output: Java record style", code: EX.javaRecord },
      ],
    },
    {
      heading: "Which Java style should you choose?",
      blocks: [
        {
          t: "table",
          head: ["Style", "Best for", "Needs"],
          rows: [
            ["POJO with getters and setters", "Works everywhere, including older projects and frameworks that use bean properties.", "Nothing extra. Java 8 or later."],
            ["Lombok `@Data`", "Less boilerplate: getters, setters, `equals` and `toString` are generated at compile time.", "The Lombok dependency and annotation processing enabled in your build."],
            ["Java record", "Immutable data carriers (DTOs) with very little code.", "Java 16 or later. Jackson 2.12 or later to read records."],
            ["Public fields", "Quick scripts and simple Gson usage.", "Nothing, but it is not idiomatic for larger codebases."],
          ],
        },
        { t: "note", kind: "tip", text: "Each public class belongs in its own file named after the class, for example `User.java` and `Address.java`. Copy them out one by one." },
      ],
    },
    {
      heading: "Common mistakes and how to fix them",
      blocks: [
        {
          t: "ul",
          items: [
            "**Fields are null after parsing.** The JSON key and the Java field name differ and nothing maps them. Keep Jackson annotations on, or configure a naming strategy on your `ObjectMapper`.",
            "**UnrecognizedPropertyException.** The JSON has a key your class does not know. Keep `@JsonIgnoreProperties(ignoreUnknown = true)` or configure the mapper to ignore unknown properties.",
            "**One sample is not enough.** Optional keys that are missing from your sample will be missing from the class. Paste an array with several representative items, or an example that includes every field.",
            "**Dates are strings.** Add the Jackson `JavaTimeModule` and change the field type to `Instant`, `LocalDate` or `OffsetDateTime`.",
            "**Exact decimals.** Prices and rates should use `BigDecimal`, not `Double`.",
            "**Object fields.** Anywhere you see `Object`, the sample had null, an empty array or mixed types. Replace it with the real type.",
          ],
        },
      ],
    },
  ],
  references: [
    { label: "Jackson annotations (GitHub)", href: "https://github.com/FasterXML/jackson-annotations" },
    { label: "Lombok @Data documentation", href: "https://projectlombok.org/features/Data" },
    { label: "JEP 395: Records (OpenJDK)", href: "https://openjdk.org/jeps/395" },
    { label: "RFC 8259: The JSON data interchange format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
  ],
  related: [
    { slug: "json-to-typescript", anchor: "JSON to TypeScript converter", why: "generates matching types for your frontend." },
    { slug: "api-response-formatter", anchor: "API response formatter", why: "validates and tidies the JSON before you convert it." },
    { slug: "json-diff", anchor: "JSON diff", why: "shows what changed between two versions of an API response." },
  ],
}
export default learn