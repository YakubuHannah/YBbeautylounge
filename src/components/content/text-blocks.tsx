/** Renders founder-edited text: blank lines separate paragraphs. */
export function TextBlocks({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para, i) => (
          <p key={i} className={className}>
            {para}
          </p>
        ))}
    </>
  )
}
