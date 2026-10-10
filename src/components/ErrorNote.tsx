import Icon from "./Icon"

export default function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
      <span className="mt-0.5"><Icon name="x" size={18} /></span>
      <span className="min-w-0 break-words">{message}</span>
    </div>
  )
}
