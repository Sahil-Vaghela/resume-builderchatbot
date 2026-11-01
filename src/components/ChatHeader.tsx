import { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  MoreVertical,
  FileText,
  RotateCcw,
  Download,
  Trash2,
  Menu,
} from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  onGoBack: () => void;
  onNewChat: () => void;
  onOpenResumePreview: () => void;
  onToggleSidebar?: () => void;
  onClearConversation?: () => void;
  onExportConversation?: () => void;
}

export function ChatHeader({
  title,
  onUpdateTitle,
  onGoBack,
  onNewChat,
  onOpenResumePreview,
  onToggleSidebar,
  onClearConversation,
  onExportConversation,
}: ChatHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTitleSubmit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== title) {
      onUpdateTitle(trimmed);
    } else {
      setTitleInput(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleInput(title);
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 md:h-15 border-b border-[#E5E5E5] bg-[#F7F7F4]/95 backdrop-blur-md px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 select-none">
      
      {/* Left: Mobile Sidebar Hamburger + Back Navigation + Title + Rename */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden min-w-0 flex-1 mr-2">
        
        {/* Mobile Hamburger Drawer Toggle (Mobile only: md:hidden) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-all cursor-pointer shrink-0 md:hidden"
            style={{
              boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.04), -3px -3px 8px rgba(255, 255, 255, 0.95)',
            }}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Back navigation button */}
        <button
          onClick={onGoBack}
          className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-all cursor-pointer shrink-0"
          style={{
            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.04), -3px -3px 8px rgba(255, 255, 255, 0.95)',
          }}
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Conversation Title & Inline Editor */}
        {isEditingTitle ? (
          <div className="flex items-center gap-1 min-w-0 flex-1 max-w-[200px] xs:max-w-[260px] sm:max-w-xs">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') handleTitleCancel();
              }}
              autoFocus
              className="w-full text-xs sm:text-sm font-semibold text-[#171717] bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl px-2 py-1 focus:outline-hidden focus:border-[#047857]/60"
              style={{
                boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
              }}
            />
            <button
              onClick={handleTitleSubmit}
              className="p-1 text-[#047857] hover:text-[#065F46] cursor-pointer shrink-0"
              title="Save title"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleTitleCancel}
              className="p-1 text-[#737373] hover:text-[#171717] cursor-pointer shrink-0"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0 group">
            <h1 className="text-xs sm:text-sm md:text-base font-semibold text-[#171717] tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[240px] md:max-w-sm lg:max-w-md">
              {title || 'Software Developer Resume'}
            </h1>
            <button
              onClick={() => {
                setTitleInput(title || 'Software Developer Resume');
                setIsEditingTitle(true);
              }}
              className="p-1 text-[#737373] hover:text-[#047857] transition-colors rounded-lg cursor-pointer shrink-0"
              title="Rename conversation"
              aria-label="Rename conversation"
            >
              <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.8]" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Three-dot menu for additional conversation actions */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-all cursor-pointer"
          style={{
            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.04), -3px -3px 8px rgba(255, 255, 255, 0.95)',
          }}
          title="Conversation options"
          aria-label="Conversation options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              className="absolute right-0 mt-2 w-52 max-w-[90vw] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl py-1.5 z-50 overflow-hidden"
              style={{
                boxShadow: '6px 6px 14px rgba(0,0,0,0.06), -6px -6px 14px rgba(255,255,255,0.95)',
              }}
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenResumePreview();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F7F4] hover:text-[#047857] transition-colors cursor-pointer text-left"
              >
                <FileText className="w-4 h-4 text-[#047857] shrink-0" />
                <span className="truncate">Resume Document Preview</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNewChat();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F7F4] transition-colors cursor-pointer text-left"
              >
                <RotateCcw className="w-4 h-4 text-[#737373] shrink-0" />
                <span className="truncate">Start Fresh Chat</span>
              </button>

              {onExportConversation && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExportConversation();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F7F4] transition-colors cursor-pointer text-left"
                >
                  <Download className="w-4 h-4 text-[#737373] shrink-0" />
                  <span className="truncate">Export Chat History</span>
                </button>
              )}

              {onClearConversation && (
                <div className="border-t border-[#E5E5E5] my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onClearConversation();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#DC2626] hover:bg-[#DC2626]/8 transition-colors cursor-pointer text-left"
                  >
                    <Trash2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span className="truncate">Clear Messages</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </header>
  );
}
