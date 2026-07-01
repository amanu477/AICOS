import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface NovaMarkdownProps {
  content: string;
  className?: string;
}

export function NovaMarkdown({ content, className }: NovaMarkdownProps) {
  return (
    <div className={cn("nova-markdown", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-200 mb-1.5 mt-3 first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 mb-3 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-3 last:mb-0 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-zinc-300 leading-relaxed flex gap-2 items-start">
              <span className="text-violet-400 mt-1.5 text-xs shrink-0">▸</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="text-zinc-400 not-italic">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-4 py-3 text-xs font-mono text-zinc-200 whitespace-pre-wrap my-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-zinc-800/80 border border-zinc-700/60 rounded px-1.5 py-0.5 text-xs font-mono text-violet-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-2">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-violet-500/50 pl-3 my-2 text-zinc-400 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-zinc-800 my-4" />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
