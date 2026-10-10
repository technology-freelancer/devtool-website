import { useState } from "react"
import { OptionSelect } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { decodeBase64, encodeBase64 } from "@/lib/base64"

export default function Base64Converter() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [variant, setVariant] = useState("standard")
  const encode = mode === "encode"

  return (
    <TextToolWorkspace
      key={mode} // switching mode swaps the sample and clears the panes
      slug="base64-converter"
      inputLabel={encode ? "Text Input" : "Base64 Input"}
      outputLabel={encode ? "Base64 Output" : "Decoded Text"}
      sample={encode ? "Hello, DevTools! 👋 नमस्ते" : "SGVsbG8sIERldlRvb2xzISDwn5GLIOCkqOCkruCkuOCljeCkpOClhw=="}
      actionLabel={encode ? "Encode Base64" : "Decode Base64"}
      run={(input) => (encode ? encodeBase64(input, variant === "url") : decodeBase64(input))}
      runKey={variant}
      filename={encode ? "encoded.txt" : "decoded.txt"}
      lineNumbers={false}
      options={
        <>
          <OptionSelect label="Mode" value={mode} onChange={(v) => setMode(v as "encode" | "decode")} options={[{ value: "encode", label: "Encode text → Base64" }, { value: "decode", label: "Decode Base64 → text" }]} />
          {encode && <OptionSelect label="Alphabet" value={variant} onChange={setVariant} options={[{ value: "standard", label: "Standard (+ / =)" }, { value: "url", label: "URL-safe (- _)" }]} />}
        </>
      }
    />
  )
}
