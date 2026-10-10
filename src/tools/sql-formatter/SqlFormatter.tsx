import { format, type SqlLanguage } from "sql-formatter"
import { useState } from "react"
import { OptionSelect } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { ToolError } from "@/lib/toolError"

const SAMPLE =
  "select users.id,users.name,users.email,count(o.id) as orders from users left join orders o on o.user_id=users.id where users.active=true group by users.id,users.name,users.email order by users.name asc;"

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "transactsql", label: "SQL Server (T-SQL)" },
  { value: "plsql", label: "Oracle PL/SQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "redshift", label: "Redshift" },
  { value: "snowflake", label: "Snowflake" },
]

export default function SqlFormatter() {
  const [dialect, setDialect] = useState<SqlLanguage>("sql")
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower" | "preserve">("upper")
  const [indent, setIndent] = useState("2")

  const run = (input: string) => {
    try {
      return format(input, { language: dialect, keywordCase, tabWidth: indent === "tab" ? 2 : Number(indent), useTabs: indent === "tab" })
    } catch (e) {
      throw new ToolError(`Could not parse this SQL: ${e instanceof Error ? e.message.split("\n")[0] : "syntax error"}`, "invalid_sql")
    }
  }

  return (
    <TextToolWorkspace
      slug="sql-formatter"
      inputLabel="SQL Input"
      outputLabel="Formatted SQL"
      inputBadge="SQL"
      outputBadge="SQL"
      sample={SAMPLE}
      actionLabel="Format SQL"
      run={run}
      runKey={`${dialect}|${keywordCase}|${indent}`}
      filename="query.sql"
      options={
        <>
          <OptionSelect label="Dialect" value={dialect} onChange={(v) => setDialect(v as SqlLanguage)} options={DIALECTS} />
          <OptionSelect label="Keywords" value={keywordCase} onChange={(v) => setKeywordCase(v as typeof keywordCase)} options={[{ value: "upper", label: "UPPERCASE" }, { value: "lower", label: "lowercase" }, { value: "preserve", label: "Keep as written" }]} />
          <OptionSelect label="Indent" value={indent} onChange={setIndent} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "tab", label: "Tab" }]} />
        </>
      }
    />
  )
}
