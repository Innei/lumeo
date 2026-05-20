import { useState } from 'react'

interface CodeProps {
  /** Raw source string (with simple highlight tags inline). Use {} markers? Keep it simple — render plain. */
  children: string
  /** Display language label (top-right) */
  lang?: string
}

/**
 * Minimal highlighter: tokenises JS/TS-ish source by regex into spans.
 * Not perfect, but stable enough for a 5-line install snippet.
 */
function tokenize(src: string): React.ReactNode {
  const lines = src.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {highlightLine(line)}
      {i < lines.length - 1 ? '\n' : ''}
    </span>
  ))
}

function highlightLine(line: string): React.ReactNode {
  // Comments
  const commentIdx = line.indexOf('//')
  if (commentIdx >= 0 && !/['"`]/.test(line.slice(0, commentIdx))) {
    return (
      <>
        {highlightCode(line.slice(0, commentIdx))}
        <span className="tk-cmt">{line.slice(commentIdx)}</span>
      </>
    )
  }
  return highlightCode(line)
}

function highlightCode(code: string): React.ReactNode {
  // strings
  const parts: React.ReactNode[] = []
  const re = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(code))) {
    if (m.index > last) {
      parts.push(highlightKeywords(code.slice(last, m.index), key++))
    }
    parts.push(
      <span key={`s${key++}`} className="tk-str">
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < code.length) {
    parts.push(highlightKeywords(code.slice(last), key++))
  }
  return parts
}

const KEYWORDS = new Set([
  'import',
  'from',
  'const',
  'let',
  'var',
  'export',
  'default',
  'return',
  'function',
  'new',
  'await',
  'async',
  'if',
  'else',
])

function highlightKeywords(text: string, baseKey: number): React.ReactNode {
  const tokens = text.split(/(\b\w+\b)/g)
  return tokens.map((tok, i) => {
    const key = `${baseKey}-${i}`
    if (KEYWORDS.has(tok)) {
      return (
        <span key={key} className="tk-key">
          {tok}
        </span>
      )
    }
    if (/^[a-z][a-zA-Z0-9]*$/.test(tok) && tokens[i + 1]?.startsWith('(')) {
      return (
        <span key={key} className="tk-fn">
          {tok}
        </span>
      )
    }
    return <span key={key}>{tok}</span>
  })
}

export function Code({ children, lang = 'ts' }: CodeProps) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <pre className="code" aria-label={`${lang} snippet`}>
      <button className="copy-btn" type="button" onClick={copy}>
        {copied ? 'copied' : 'copy'}
      </button>
      <code>{tokenize(children)}</code>
    </pre>
  )
}
