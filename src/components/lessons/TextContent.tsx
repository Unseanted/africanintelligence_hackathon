import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '../ui/card';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { Element } from 'hast';

interface CodeProps {
  node?: Element;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TextContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Card>
      <CardContent className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ node, inline, className, children, ...props }: CodeProps) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus as Record<string, unknown>}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}; 