import Icon from "./Icon"

/** Native <details>: no JavaScript needed, accessible, and the answer text is in the page HTML for search engines. */
export default function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary data-track="faq.toggle" className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-bold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
        {question}
        <span className="text-slate-400 transition-transform group-open:rotate-90">
          <Icon name="chevron" size={19} />
        </span>
      </summary>
      <p className="max-w-2xl pb-5 pr-6 text-sm leading-6 text-slate-600 sm:pr-10">{answer}</p>
    </details>
  )
}
