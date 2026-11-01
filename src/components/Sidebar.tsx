import { useState, useMemo, useEffect } from 'react';
import {
  Home,
  MessageSquare,
  Layers,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  FileText,
  X,
  LogOut,
  User,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenResumePreview: () => void;
  onGoHome?: () => void;
  isHomeActive?: boolean;
}

export function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose,
  onOpenSettings,
  onOpenResumePreview,
  onGoHome,
  isHomeActive = true,
}: SidebarProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = userProfile?.fullName || currentUser?.displayName || 'Nishu';
  const displayEmail = userProfile?.email || currentUser?.email || 'nishu@example.com';
  const avatarLetter = (displayName || 'N').charAt(0).toUpperCase();

  // Prevent background scrolling on mobile when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Recent conversations sorted by latest update
  const recentConversations = useMemo(() => {
    return [...conversations]
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
      .slice(0, 8);
  }, [conversations]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      onDeleteConversation(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId((current) => (current === id ? null : current));
      }, 3500);
    }
  };

  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false);
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#171717]/25 backdrop-blur-xs md:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Floating Neumorphic Sidebar Panel (Drawer on Mobile, Compact on Tablet, Full on Desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:w-56 lg:w-64 my-2.5 ml-2.5 md:my-4 md:ml-4 lg:my-5 lg:ml-5 h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] lg:h-[calc(100vh-2.5rem)] bg-[#F7F7F4] border border-[#E5E5E5]/90 rounded-3xl neu-raised flex flex-col justify-between transition-transform duration-300 ease-out shrink-0 select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1.5rem)] md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-3.5 py-4 md:px-3 md:py-4.5 lg:px-4 lg:py-5 scrollbar-none">
          
          {/* 1. ResumeAI logo and name */}
          <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#047857] flex items-center justify-center shadow-xs text-white shrink-0">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-[#171717] text-base tracking-tight">ResumeAI</span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#FFFFFF] md:hidden cursor-pointer transition-colors"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. New Chat button in Emerald Green */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3 md:px-4 mb-3.5 md:mb-4 rounded-2xl bg-[#047857] hover:bg-[#065F46] text-[#FFFFFF] text-sm font-semibold flex items-center justify-center gap-2 neu-button-emerald transition-all cursor-pointer group shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">New Chat</span>
          </button>

          {/* 3. Home, 4. Chats, 5. Templates, 6. Settings */}
          <nav className="space-y-1 mb-3.5 md:mb-4">
            {/* Home */}
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                else onNewChat();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                isHomeActive
                  ? 'bg-[#047857]/10 text-[#171717] font-semibold neu-raised-sm'
                  : 'text-[#737373] hover:text-[#171717] hover:bg-[#FFFFFF]/60'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${isHomeActive ? 'text-[#047857]' : 'text-[#737373]'}`} />
              <span className="truncate">Home</span>
            </button>

            {/* Chats */}
            <button
              onClick={() => {
                if (conversations.length > 0) {
                  onSelectConversation(conversations[0].id);
                }
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                !isHomeActive
                  ? 'bg-[#047857]/10 text-[#171717] font-semibold neu-raised-sm'
                  : 'text-[#737373] hover:text-[#171717] hover:bg-[#FFFFFF]/60'
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${!isHomeActive ? 'text-[#047857]' : 'text-[#737373]'}`} />
              <span className="truncate">Chats</span>
            </button>

            {/* Templates */}
            <button
              onClick={() => {
                onOpenResumePreview();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-2xl text-sm font-medium text-[#737373] hover:text-[#171717] hover:bg-[#FFFFFF]/60 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 shrink-0 text-[#737373]" />
              <span className="truncate">Templates</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-2xl text-sm font-medium text-[#737373] hover:text-[#171717] hover:bg-[#FFFFFF]/60 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0 text-[#737373]" />
              <span className="truncate">Settings</span>
            </button>
          </nav>

          {/* 7. Recent Chats List */}
          <div className="pt-2 border-t border-[#E5E5E5]/70 flex flex-col flex-1 min-h-0">
            <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider px-2 mb-2">
              Recent Chats
            </span>

            <div className="space-y-0.5 overflow-y-auto flex-1 scrollbar-none pr-0.5">
              {!currentUser ? (
                <div className="px-2.5 py-3 rounded-2xl bg-[#FFFFFF]/60 border border-[#E5E5E5]/60 text-center my-1 neu-inset-sm">
                  <p className="text-[11px] text-[#737373] mb-2 leading-relaxed">
                    Sign in to save and sync your resume chats
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#047857] hover:underline cursor-pointer"
                  >
                    <span>Sign in to save</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : recentConversations.length === 0 ? (
                <div className="px-2 py-3 text-xs text-[#737373] italic">
                  No previous conversations
                </div>
              ) : (
                recentConversations.map((conv) => {
                  const isActive = conv.id === activeId && !isHomeActive;
                  const isDeleting = deleteConfirmId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFFFFF] text-[#047857] font-semibold neu-raised-sm'
                          : 'text-[#171717] hover:bg-[#FFFFFF]/70 hover:text-[#047857]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#047857]' : 'text-[#737373]'}`} />
                        <span className="truncate">{conv.title || 'Resume Chat'}</span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, conv.id)}
                        className={`p-1 rounded-lg transition-opacity shrink-0 ${
                          isDeleting
                            ? 'opacity-100 bg-[#DC2626] text-white'
                            : 'opacity-0 group-hover:opacity-100 text-[#737373] hover:text-[#DC2626] hover:bg-[#DC2626]/10'
                        }`}
                        title={isDeleting ? 'Click again to confirm deletion' : 'Delete conversation'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* 8. User Profile Section at the Bottom */}
        <div className="p-3 border-t border-[#E5E5E5]/70 relative bg-[#F7F7F4]">
          {!currentUser ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full flex items-center justify-between p-2 rounded-2xl bg-[#FFFFFF] border border-[#E5E5E5] neu-raised-sm hover:border-[#047857]/40 hover:bg-[#FFFFFF] transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#E5E5E5] text-[#737373] flex items-center justify-center shrink-0 group-hover:text-[#047857] transition-colors">
                  <User className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#171717] group-hover:text-[#047857] transition-colors truncate">
                    Sign In / Sign Up
                  </span>
                  <span className="text-[10px] text-[#737373] truncate">Save & sync your resumes</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#047857] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ) : (
            <>
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-1.5 neu-raised z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#171717] hover:bg-[#F7F7F4] rounded-xl transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#DC2626] hover:bg-[#DC2626]/8 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}

              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center justify-between p-1.5 md:p-2 rounded-2xl hover:bg-[#FFFFFF]/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#047857] text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {avatarLetter}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#171717] truncate">{displayName}</span>
                    <span className="text-[10px] text-[#737373] truncate">{displayEmail}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#171717] shrink-0" />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
