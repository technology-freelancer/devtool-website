import type { ReactNode } from "react"
import Icon, { type IconName } from "./Icon"

type Props = {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}

const styles = {
  primary: "bg-brand-600 text-white border-brand-600 hover:bg-brand-700 shadow-sm",
  secondary: "bg-surface text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900",
}

export default function Button({
  children, variant = "primary", icon, onClick, type = "button", disabled = false, className = "",
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-(--radius-control) border px-4 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  )
}
