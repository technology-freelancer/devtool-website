import { useState } from "react"
import Button from "@/components/Button"
import Icon from "@/components/Icon"
import { OptionSelect, OptionText, OptionToggle } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { aesDecrypt, aesEncrypt, type AesMode, type AesOptions, type BytesFormat, type KeySource, type TextEncoding } from "@/lib/aes"
import { DEMO_CIPHERTEXT, DEMO_PASSWORD, DEMO_PLAINTEXT } from "./demo"

const FORMATS = [{ value: "hex", label: "Hex" }, { value: "base64", label: "Base64" }, { value: "utf8", label: "Text (UTF-8)" }]

export default function AesTool() {
  const [direction, setDirection] = useState<"encrypt" | "decrypt">("encrypt")
  const [mode, setMode] = useState<AesMode>("GCM")
  const [keyBits, setKeyBits] = useState<128 | 256>(256)
  const [keySource, setKeySource] = useState<KeySource>("password")
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [keyText, setKeyText] = useState("")
  const [keyFormat, setKeyFormat] = useState<BytesFormat>("hex")
  const [iv, setIv] = useState("")
  const [ivFormat, setIvFormat] = useState<BytesFormat>("hex")
  const [encoding, setEncoding] = useState<TextEncoding>("base64")
  const encrypting = direction === "encrypt"
  const options: AesOptions = { mode, keyBits, keySource, encoding, secret: keySource === "password" ? password : keyText, keyFormat, iv, ivFormat }
  const useDemo = () => { setMode("GCM"); setKeyBits(256); setKeySource("password"); setPassword(DEMO_PASSWORD); setEncoding("base64") }

  return (
    <>
      <div className="container-page pt-8 sm:pt-10">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <span className="mt-0.5"><Icon name="shield" size={18} /></span>
          <span>Your text, password and keys never leave your browser. Use this page for learning, testing and one-off jobs. Do not paste production keys; use a vetted crypto library inside your applications.</span>
        </div>
      </div>
      <TextToolWorkspace
        key={direction}
        slug="aes-encryption-decryption"
        inputLabel={encrypting ? "Plain Text" : "Encrypted Text"}
        outputLabel={encrypting ? "Encrypted Text" : "Decrypted Text"}
        inputBadge={encrypting ? "TEXT" : encoding.toUpperCase()}
        outputBadge={encrypting ? encoding.toUpperCase() : "TEXT"}
        sample={encrypting ? DEMO_PLAINTEXT : DEMO_CIPHERTEXT}
        actionLabel={encrypting ? "Encrypt" : "Decrypt"}
        run={(input) => encrypting ? aesEncrypt(input, options) : aesDecrypt(input, options)}
        autoRun={false}
        lineNumbers={false}
        filename={encrypting ? "encrypted.txt" : "decrypted.txt"}
        options={
          <>
            <OptionSelect label="Action" value={direction} onChange={(v) => setDirection(v as "encrypt" | "decrypt")} options={[{ value: "encrypt", label: "Encrypt" }, { value: "decrypt", label: "Decrypt" }]} />
            <OptionSelect label="Algorithm" value={mode} onChange={(v) => setMode(v as AesMode)} options={[{ value: "GCM", label: "AES-GCM (recommended)" }, { value: "CBC", label: "AES-CBC" }, { value: "CTR", label: "AES-CTR" }]} />
            <OptionSelect label="Key size" value={String(keyBits)} onChange={(v) => setKeyBits(Number(v) as 128 | 256)} options={[{ value: "256", label: "256-bit" }, { value: "128", label: "128-bit" }]} />
            <OptionSelect label="Key from" value={keySource} onChange={(v) => setKeySource(v as KeySource)} options={[{ value: "password", label: "Password (PBKDF2)" }, { value: "raw", label: "Raw key + IV" }]} />
            <OptionSelect label="Ciphertext format" value={encoding} onChange={(v) => setEncoding(v as TextEncoding)} options={[{ value: "base64", label: "Base64" }, { value: "hex", label: "Hex" }]} />
            {keySource === "password" ? (
              <>
                <OptionText label="Password" value={password} onChange={setPassword} type={showPassword ? "text" : "password"} width="w-52" placeholder="Enter a password" />
                <OptionToggle label="Show" checked={showPassword} onChange={setShowPassword} />
              </>
            ) : (
              <>
                <OptionText label={`Key (${keyBits / 8} bytes)`} value={keyText} onChange={setKeyText} width="w-72" placeholder={keyFormat === "hex" ? "0".repeat(keyBits / 4) : ""} />
                <OptionSelect label="Key format" value={keyFormat} onChange={(v) => setKeyFormat(v as BytesFormat)} options={FORMATS} />
                <OptionText label={`IV (optional, ${mode === "GCM" ? 12 : 16} bytes)`} value={iv} onChange={setIv} width="w-64" placeholder="blank = random, stored first" />
                <OptionSelect label="IV format" value={ivFormat} onChange={(v) => setIvFormat(v as BytesFormat)} options={FORMATS} />
              </>
            )}
            {!encrypting && <Button data-track="aes.use-demo-settings" variant="secondary" onClick={useDemo}>Use demo settings</Button>}
          </>
        }
      />
      <div className="container-page -mt-4 pb-4">
        <p className="text-xs leading-5 text-slate-400">
          {encrypting ? "Password mode derives the key with PBKDF2-HMAC-SHA256 (600,000 iterations) and a random 16-byte salt. The result is salt + IV + ciphertext in your chosen format." : `The sample is AES-256-GCM, password mode, Base64, password “${DEMO_PASSWORD}”. Click “Use demo settings” if you changed anything.`}
        </p>
      </div>
    </>
  )
}
