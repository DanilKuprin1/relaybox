import { Fragment } from "react";

/**
 * Minimal, dependency-free JSON syntax highlighter.
 * Tokenizes a pretty-printed JSON string and wraps tokens in themed spans.
 */
export function JsonViewer({ data }: { data: unknown }) {
  const pretty = JSON.stringify(data, null, 2);
  const tokenRegex =
    /("(\\.|[^"\\])*"\s*:)|("(\\.|[^"\\])*")|(\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b)|(\bnull\b)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(pretty)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={key++}>{pretty.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    const token = match[0];
    let className = "";
    if (match[1]) className = "text-method-patch"; // key
    else if (match[3]) className = "text-method-post"; // string
    else if (match[5]) className = "text-method-put"; // number
    else if (match[8]) className = "text-method-get"; // boolean
    else if (match[9]) className = "text-muted-foreground"; // null

    nodes.push(
      <span key={key++} className={className}>
        {token}
      </span>,
    );
    lastIndex = match.index + token.length;
  }
  if (lastIndex < pretty.length) {
    nodes.push(<Fragment key={key++}>{pretty.slice(lastIndex)}</Fragment>);
  }

  return (
    <pre className="scroll-thin overflow-auto rounded-lg border border-border bg-surface-muted p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{nodes}</code>
    </pre>
  );
}
