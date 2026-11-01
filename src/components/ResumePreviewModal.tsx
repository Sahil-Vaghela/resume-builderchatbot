import { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  Edit3,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { marked } from 'marked';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  onUpdateContent: (newContent: string) => void;
  onExtractFromChat: () => Promise<void>;
  isExtracting: boolean;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  markdownContent,
  onUpdateContent,
  onExtractFromChat,
  isExtracting,
}: ResumePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');

  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(markdownContent || '*No resume content drafted yet. Chat with ResumeAI or click "Sync from Chat" above.*', {
        async: false,
        breaks: true,
      }) as string;
    } catch {
      return markdownContent;
    }
  }, [markdownContent]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy resume text:', err);
    }
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const filename = `Resume_${new Date().toISOString().slice(0, 10)}.${format}`;
    const blob = new Blob([markdownContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#171717]/35 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#FFFFFF] rounded-2xl neu-raised border border-[#E5E5E5] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2.5 bg-[#F7F7F4]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-[#171717] truncate">
              Live Resume Document
            </h2>

            {/* Soft UI Segmented Control */}
            <div className="flex items-center bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm p-0.5 sm:p-1 rounded-xl text-xs font-medium text-[#737373]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
                  activeTab === 'preview'
                    ? 'bg-[#F7F7F4] text-[#047857] neu-raised-sm font-semibold'
                    : 'hover:text-[#171717]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
                  activeTab === 'editor'
                    ? 'bg-[#F7F7F4] text-[#047857] neu-raised-sm font-semibold'
                    : 'hover:text-[#171717]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            
            {/* Sync from chat button */}
            <button
              onClick={onExtractFromChat}
              disabled={isExtracting}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl neu-button-emerald transition-all cursor-pointer disabled:opacity-50"
              title="Automatically extract and format all resume sections from this chat"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden xs:inline">Syncing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sync</span>
                </>
              )}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#171717] bg-[#FFFFFF] hover:bg-[#F7F7F4] border border-[#E5E5E5] rounded-xl neu-button transition-all cursor-pointer"
              title="Copy markdown text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#047857]" />
                  <span className="text-[#047857] font-semibold hidden xs:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#737373]" />
                  <span className="hidden xs:inline">Copy</span>
                </>
              )}
            </button>

            {/* Export button */}
            <button
              onClick={() => handleDownload('md')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#171717] bg-[#FFFFFF] hover:bg-[#F7F7F4] border border-[#E5E5E5] rounded-xl neu-button transition-all cursor-pointer"
              title="Download as Markdown file"
            >
              <Download className="w-3.5 h-3.5 text-[#737373]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="p-1.5 sm:p-2 text-[#737373] hover:text-[#171717] bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl neu-button transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-[#737373] hover:text-[#171717] rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-[#F7F7F4]">
          {activeTab === 'preview' ? (
            <div className="max-w-2xl mx-auto bg-[#FFFFFF] p-5 sm:p-8 md:p-12 rounded-xl border border-[#E5E5E5] min-h-[400px] sm:min-h-[500px] shadow-sm select-text overflow-hidden">
              <div
                className="prose-chat break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <textarea
                value={markdownContent}
                onChange={(e) => onUpdateContent(e.target.value)}
                placeholder="# Nishu Sharma&#10;**Software Engineer**&#10;nishu@example.com · linkedin.com/in/nishu..."
                rows={16}
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset rounded-2xl p-4 sm:p-5 text-xs sm:text-sm font-mono text-[#171717] leading-relaxed focus:outline-hidden focus:border-[#047857]/50 resize-y"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-[#E5E5E5] bg-[#FFFFFF] flex items-center justify-between text-[11px] sm:text-xs text-[#737373] gap-2">
          <span className="truncate">ATS semantic hierarchy compliant</span>
          <span className="font-mono text-[10px] sm:text-[11px] text-[#737373] shrink-0">
            {markdownContent ? `${markdownContent.split(/\s+/).filter(Boolean).length} words` : '0 words'}
          </span>
        </div>

      </div>
    </div>
  );
}
