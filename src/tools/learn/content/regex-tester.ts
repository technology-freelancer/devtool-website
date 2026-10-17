import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-15",
  sections: [
    {
      heading: "What is a regular expression?",
      blocks: [
        { t: "p", text: "A regular expression (regex) is a pattern that describes text. You use it to check that input has the right shape, to find pieces of text, to extract values and to replace text. This tester uses the JavaScript `RegExp` engine in your browser, so the results match what your JavaScript or Node.js code will do." },
      ],
    },
    {
      heading: "Regex flags",
      blocks: [
        {
          t: "table",
          head: ["Flag", "Name", "Effect"],
          rows: [
            ["`g`", "global", "Find all matches, not just the first."],
            ["`i`", "ignore case", "Treat upper and lower case as the same."],
            ["`m`", "multiline", "`^` and `$` match at the start and end of each line."],
            ["`s`", "dotAll", "`.` also matches line breaks."],
            ["`u`", "unicode", "Handle characters outside the basic range correctly, with stricter syntax."],
          ],
        },
      ],
    },
    {
      heading: "Regex cheat sheet",
      blocks: [
        {
          t: "table",
          head: ["Syntax", "Meaning", "Example"],
          rows: [
            ["`.`", "Any character except a line break", "`a.c` matches abc, a-c"],
            ["`\\d` `\\w` `\\s`", "Digit, word character, whitespace", "`\\d{4}` matches 2026"],
            ["`[abc]` `[^abc]`", "One of, or none of, these characters", "`[aeiou]` matches a vowel"],
            ["`^` `$`", "Start and end of the text (or line with `m`)", "`^Hello` matches at the start"],
            ["`*` `+` `?`", "Zero or more, one or more, zero or one", "`ab+` matches ab, abb"],
            ["`{2,4}`", "Between 2 and 4 repeats", "`\\d{2,4}`"],
            ["`*?` `+?`", "Lazy versions that match as little as possible", "`<.+?>` matches one HTML tag"],
            ["`( )`", "Capture group", "`(\\d+)-(\\d+)`"],
            ["`(?: )`", "Group without capturing", "`(?:ab)+`"],
            ["`(?<name> )`", "Named capture group", "`(?<year>\\d{4})`"],
            ["`a|b`", "Either a or b", "`cat|dog`"],
            ["`(?= )` `(?! )`", "Lookahead: followed by, not followed by", "`\\d+(?=%)` matches 50 in 50%"],
            ["`(?<= )` `(?<! )`", "Lookbehind: preceded by, not preceded by", "`(?<=\\$)\\d+`"],
            ["`\\b`", "Word boundary", "`\\bcat\\b` does not match category"],
          ],
        },
      ],
    },
    {
      heading: "Worked example: capturing the parts of an email address",
      blocks: [
        { t: "code", label: "Pattern (flags: g)", code: EX.rxPattern },
        { t: "code", label: "Test text", code: EX.rxText },
        { t: "code", label: "Matches found", code: EX.rxMatches },
        { t: "p", text: "Each match lists its position and the named groups `user` and `domain`. In JavaScript you read them with `match.groups.user`. Named groups make patterns easier to read than numbered groups." },
      ],
    },
    {
      heading: "Common regex mistakes",
      blocks: [
        {
          t: "ul",
          items: [
            "**Greedy matching.** `<.+>` on `<a><b>` matches the whole string. Use the lazy form `<.+?>` to match one tag at a time.",
            "**Forgetting to escape special characters.** A dot matches any character. Write `\\.` to match a literal dot.",
            "**Double escaping in strings.** In a JavaScript string you write `\"\\\\d+\"`, but in a regex literal you write `/\\d+/`.",
            "**The global flag and `.test()`.** A regex with the `g` flag remembers its position (`lastIndex`), so repeated `.test()` calls can alternate between true and false.",
            "**Perfect email validation.** No short regex follows the full email standard. Check the basic shape, then send a confirmation email.",
            "**Assuming every engine is the same.** Python names groups `(?P<name>...)`, PCRE supports `\\A` and `\\Z`, and lookbehind support differs. Test in the engine you will use.",
          ],
        },
      ],
    },
    {
      heading: "Catastrophic backtracking (ReDoS)",
      blocks: [
        { t: "p", text: "Some patterns take exponentially longer as the input grows. A classic example is a nested quantifier such as `(a+)+$` tested against a long run of `a` characters followed by something that does not match. The engine tries every way to split the run and the page can freeze." },
        { t: "p", text: "This tester runs your pattern in a background thread and stops it after about one and a half seconds, so your browser stays responsive. To fix a slow pattern, remove ambiguity between nested repeats, anchor the pattern, and limit the input length. Never run regexes written by untrusted users on a server without a time limit." },
      ],
    },
  ],
  references: [
    { label: "MDN: RegExp reference", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp" },
    { label: "MDN: Regular expressions guide", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions" },
    { label: "OWASP: Regular expression denial of service (ReDoS)", href: "https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS" },
  ],
  related: [
    { slug: "api-response-formatter", anchor: "API response formatter", why: "format a JSON response before extracting values from it." },
    { slug: "json-diff", anchor: "JSON diff", why: "compare the extracted or transformed data between two runs." },
  ],
}
export default learn