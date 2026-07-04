"use client";

import { Fragment, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import type { CitationPayload } from "@/types/rag";

interface AnswerRendererProps {
  content: string;
  citations: CitationPayload[];
  /** Called with the 1-based source number when an inline [n] chip is clicked. */
  onCite: (sourceNumber: number) => void;
}

// Matches inline citation markers the model is prompted to emit: [1], [2,3], [1][2].
const CITATION_RE = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

/** Small superscript chip that links an inline [n] marker to its source card. */
function CitationRef({
  n,
  citation,
  onCite,
}: {
  n: number;
  citation?: CitationPayload;
  onCite: (n: number) => void;
}) {
  const label = citation
    ? `Source ${n}: page ${citation.pageNumber}`
    : `Source ${n}`;
  return (
    <button
      type="button"
      onClick={() => onCite(n)}
      aria-label={`Jump to ${label}`}
      title={label}
      className="not-prose align-super mx-px inline-flex min-h-0 items-center rounded bg-brand-orange/15 px-[4px] text-[10px] font-bold leading-[1.35] text-brand-orange ring-1 ring-inset ring-brand-orange/30 transition-colors hover:bg-brand-orange/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange cursor-pointer"
    >
      {n}
    </button>
  );
}

/**
 * Recursively walk rendered markdown children and replace inline [n] citation
 * markers (which live only in text leaves) with clickable CitationRef chips.
 */
function linkifyCitations(
  node: ReactNode,
  keyPrefix: string,
  citations: CitationPayload[],
  onCite: (n: number) => void,
): ReactNode {
  if (typeof node === "string") {
    const out: ReactNode[] = [];
    let last = 0;
    let counter = 0;
    let m: RegExpExecArray | null;
    CITATION_RE.lastIndex = 0;
    while ((m = CITATION_RE.exec(node)) !== null) {
      if (m.index > last) out.push(node.slice(last, m.index));
      const nums = m[1]
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
      for (const n of nums) {
        out.push(
          <CitationRef
            key={`${keyPrefix}-c-${counter++}`}
            n={n}
            citation={citations[n - 1]}
            onCite={onCite}
          />,
        );
      }
      last = m.index + m[0].length;
    }
    if (out.length === 0) return node;
    if (last < node.length) out.push(node.slice(last));
    return out;
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>
        {linkifyCitations(child, `${keyPrefix}-${i}`, citations, onCite)}
      </Fragment>
    ));
  }
  // React element (e.g. <strong>, <em>) — its own component override handles
  // its children, so pass it through untouched.
  return node;
}

export function AnswerRenderer({ content, citations, onCite }: AnswerRendererProps) {
  // Wrap a text container so inline [n] markers within it become chips.
  const withRefs = (children: ReactNode, key: string) =>
    linkifyCitations(children, key, citations, onCite);

  const components: Components = {
    p: ({ children }) => (
      <p className="my-2 first:mt-0 last:mb-0 text-[15px] leading-7 text-gray-100">
        {withRefs(children, "p")}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{withRefs(children, "s")}</strong>
    ),
    em: ({ children }) => <em className="italic">{withRefs(children, "e")}</em>,
    ul: ({ children }) => (
      <ul className="my-2.5 space-y-1.5 pl-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-2.5 space-y-1.5 pl-1 [counter-reset:li]">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="relative flex gap-2.5 text-[15px] leading-7 text-gray-100">
        <span
          aria-hidden
          className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-brand-orange/70"
        />
        <span className="min-w-0 flex-1">{withRefs(children, "li")}</span>
      </li>
    ),
    h1: ({ children }) => (
      <h3 className="mt-4 mb-1.5 text-base font-bold text-white first:mt-0">
        {withRefs(children, "h1")}
      </h3>
    ),
    h2: ({ children }) => (
      <h3 className="mt-4 mb-1.5 text-base font-bold text-white first:mt-0">
        {withRefs(children, "h2")}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="mt-3.5 mb-1 text-[15px] font-bold text-white first:mt-0">
        {withRefs(children, "h3")}
      </h4>
    ),
    h4: ({ children }) => (
      <h4 className="mt-3 mb-1 text-sm font-bold uppercase tracking-wide text-brand-muted first:mt-0">
        {withRefs(children, "h4")}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-2 border-brand-orange/50 bg-brand-orange/5 py-1 pl-3.5 pr-2 text-[15px] italic leading-7 text-gray-200">
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-orange underline decoration-brand-orange/40 underline-offset-2 hover:decoration-brand-orange"
      >
        {withRefs(children, "a")}
      </a>
    ),
    code: ({ children, className }) => {
      const isBlock = /language-/.test(className ?? "");
      if (isBlock) {
        return (
          <code className="block overflow-x-auto rounded-lg border border-white/10 bg-brand-black/60 p-3 font-mono text-[13px] leading-6 text-gray-200">
            {children}
          </code>
        );
      }
      return (
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-brand-orange">
          {children}
        </code>
      );
    },
    hr: () => <hr className="my-4 border-white/10" />,
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/5 text-brand-muted">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border-b border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wide">
        {withRefs(children, "th")}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-white/5 px-3 py-2 align-top text-gray-100">
        {withRefs(children, "td")}
      </td>
    ),
  };

  return (
    <div className={clsx("max-w-none")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
