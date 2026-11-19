import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  // Parse code blocks vs markdown prose
  const parts: { type: 'code' | 'text'; content: string; language?: string }[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to format inline markdown elements (bold, italic, inline code)
  const formatInline = (text: string): React.ReactNode[] => {
    // Split by inline code first
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((seg, i) => {
      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#E5E5E5] text-black font-mono text-[11px] font-semibold"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Handle bold text (**text**)
      const boldSegments = seg.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldSegments.map((bSeg, j) => {
            if (bSeg.startsWith('**') && bSeg.endsWith('**') && bSeg.length > 4) {
              return (
                <strong key={j} className="font-bold text-black">
                  {bSeg.slice(2, -2)}
                </strong>
              );
            }
            return bSeg;
          })}
        </span>
      );
    });
  };

  return (
    <div className="space-y-2 text-xs leading-relaxed text-black">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <div
              key={idx}
              className="my-2 rounded-xl overflow-hidden bg-[#111111] text-white border border-[#333333] shadow-sm"
            >
              <div className="px-3 py-1.5 bg-[#1C1C1C] border-b border-[#333333] flex items-center justify-between text-[10px] font-mono text-[#AAAAAA]">
                <span className="uppercase tracking-wider font-semibold">{part.language}</span>
                <button
                  onClick={() => handleCopyCode(part.content, idx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span className="text-white">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-[#EDEDED] whitespace-pre">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        // Render text lines with headings, lists & bullet points
        const lines = part.content.split('\n');
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lineIdx} className="h-1" />;
              }

              // Heading 1 / 2 / 3
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="font-bold text-xs uppercase tracking-wider text-black pt-1">
                    {formatInline(trimmed.replace(/^###\s+/, ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                return (
                  <h3 key={lineIdx} className="font-black text-sm text-black tracking-tight pt-1.5 pb-0.5">
                    {formatInline(trimmed.replace(/^#+\s+/, ''))}
                  </h3>
                );
              }

              // Bullet item
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-1">
                    <span className="font-bold text-black mt-0.5">•</span>
                    <span className="flex-1">{formatInline(trimmed.replace(/^[-*•]\s+/, ''))}</span>
                  </div>
                );
              }

              // Numbered list item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-1">
                    <span className="font-mono font-bold text-black text-[11px]">{numMatch[1]}.</span>
                    <span className="flex-1">{formatInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Normal text line
              return (
                <p key={lineIdx} className="text-xs leading-relaxed text-[#222222]">
                  {formatInline(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
