import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, X } from 'lucide-react';
import { Conversation, Message, ChatSettings } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import {
  getStoredConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  getStoredSettings,
  saveStoredSettings,
  createNewConversation,
} from '../utils/storage';
import { Sidebar } from '../components/Sidebar';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ResumePreviewModal } from '../components/ResumePreviewModal';
import { SettingsModal } from '../components/SettingsModal';
import { WelcomeScreen } from '../components/WelcomeScreen';

const DEFAULT_INTRO_MESSAGE: Message = {
  id: 'msg-ai-intro',
  role: 'assistant',
  content: `### Welcome to ResumeAI!

I am your CPRW (Certified Professional Resume Writer) consultant. I'll help you craft an interview-winning, ATS-optimized resume.

**To get started, please share a few details:**
1. What is your target role or career field?
2. Are you a fresher / student, mid-level, or senior professional?
3. Share your education, core skills, or any past projects and work experience!`,
  timestamp: Date.now(),
};

export function ChatScreen() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(getStoredSettings());
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Public entry point: first-time and unauthenticated visitors start on Home/Welcome screen
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  
  // Unauthenticated chat interception and login-required prompt
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingMessageText, setPendingMessageText] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedPendingRef = useRef(false);

  // Initialize conversations on mount
  useEffect(() => {
    const stored = getStoredConversations();
    setConversations(stored);
    const storedActiveId = getActiveConversationId();
    if (storedActiveId && stored.some((c) => c.id === storedActiveId)) {
      setActiveId(storedActiveId);
    } else if (stored.length > 0) {
      setActiveId(stored[0].id);
      setActiveConversationId(stored[0].id);
    } else {
      const fresh = createNewConversation(settings.defaultCareerField);
      // Give initial conversation a professional title
      fresh.title = 'Software Developer Resume';
      setConversations([fresh]);
      setActiveId(fresh.id);
      saveConversations([fresh]);
      setActiveConversationId(fresh.id);
    }
  }, [settings.defaultCareerField]);

  // Sync active conversation ID to storage
  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setActiveConversationId(id);
    setShowHomeScreen(false);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Auto-scroll to bottom of chat when new messages or tokens arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, activeConversation?.messages[activeConversation.messages.length - 1]?.content]);

  // Global keyboard shortcuts (Cmd/Ctrl + K for New Chat)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, settings.defaultCareerField]);

  // Check for pending message stored before authentication
  useEffect(() => {
    if (currentUser && !hasProcessedPendingRef.current) {
      const pending = sessionStorage.getItem('pending_chat_message');
      if (pending) {
        hasProcessedPendingRef.current = true;
        sessionStorage.removeItem('pending_chat_message');

        const stored = getStoredConversations();
        const fresh = createNewConversation(settings.defaultCareerField);
        fresh.title = 'Software Developer Resume';
        const updated = [fresh, ...stored];
        setConversations(updated);
        setActiveId(fresh.id);
        saveConversations(updated);
        setActiveConversationId(fresh.id);
        setShowHomeScreen(false);

        executeSendMessage(fresh.id, pending, updated);
      }
    }
  }, [currentUser, settings.defaultCareerField]);

  // Create a brand new conversation
  const handleNewChat = () => {
    if (!currentUser) {
      setShowHomeScreen(true);
      return;
    }
    setShowHomeScreen(false);
    const fresh = createNewConversation(activeConversation?.careerField || settings.defaultCareerField);
    fresh.title = 'Software Developer Resume';
    const updated = [fresh, ...conversations];
    setConversations(updated);
    setActiveId(fresh.id);
    saveConversations(updated);
    setActiveConversationId(fresh.id);
  };

  // Delete an existing conversation
  const handleDeleteConversation = (idToDelete: string) => {
    const filtered = conversations.filter((c) => c.id !== idToDelete);
    if (filtered.length === 0) {
      const fresh = createNewConversation(settings.defaultCareerField);
      fresh.title = 'Software Developer Resume';
      setConversations([fresh]);
      setActiveId(fresh.id);
      saveConversations([fresh]);
      setActiveConversationId(fresh.id);
    } else {
      setConversations(filtered);
      saveConversations(filtered);
      if (activeId === idToDelete) {
        setActiveId(filtered[0].id);
        setActiveConversationId(filtered[0].id);
      }
    }
  };

  // Update conversation title
  const handleUpdateTitle = (newTitle: string) => {
    if (!activeId) return;
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  // Auto-generate title if this is the first user message
  const maybeGenerateTitle = async (convId: string, firstMsg: string) => {
    try {
      const res = await fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: firstMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setConversations((prev) => {
            const next = prev.map((c) =>
              c.id === convId ? { ...c, title: data.title } : c
            );
            saveConversations(next);
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Error auto-generating conversation title:', err);
    }
  };

  // Core execution of streaming Gemini response
  const executeSendMessage = async (targetConvId: string, text: string, currentConversations: Conversation[]) => {
    let targetConv = currentConversations.find((c) => c.id === targetConvId);
    if (!targetConv) return;

    setShowHomeScreen(false);

    const isFirstUserMessage = targetConv.messages.length === 0;

    const userMessage: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = 'msg-ai-' + Date.now();
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...targetConv.messages, userMessage, assistantMessage];
    const updatedConv: Conversation = {
      ...targetConv,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const updatedConversations = currentConversations.map((c) =>
      c.id === targetConvId ? updatedConv : c
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setIsLoading(true);

    if (isFirstUserMessage) {
      maybeGenerateTitle(targetConvId, text);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const payloadMessages = [...targetConv.messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          tone: settings.tone,
          careerField: targetConv.careerField || settings.defaultCareerField,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedContent += parsed.text;
                  setConversations((prev) =>
                    prev.map((c) => {
                      if (c.id !== targetConvId) return c;
                      const nextMsgs = c.messages.map((m) =>
                        m.id === assistantPlaceholderId
                          ? { ...m, content: accumulatedContent, isStreaming: true }
                          : m
                      );
                      return { ...c, messages: nextMsgs };
                    })
                  );
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Ignore raw token parse variations
              }
            }
          }
        }
      }

      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== targetConvId) return c;
          const nextMsgs = c.messages.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, content: accumulatedContent || 'No response content generated.', isStreaming: false }
              : m
          );
          return { ...c, messages: nextMsgs, updatedAt: Date.now() };
        });
        saveConversations(next);
        return next;
      });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const nextMsgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, isStreaming: false }
                : m
            );
            return { ...c, messages: nextMsgs };
          });
          saveConversations(next);
          return next;
        });
      } else {
        console.error('Chat error:', err);
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const nextMsgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: m.content || 'Failed to complete response. Please check your network or try again.',
                    isStreaming: false,
                    error: err.message || 'Error occurred while contacting AI service.',
                  }
                : m
            );
            return { ...c, messages: nextMsgs };
          });
          saveConversations(next);
          return next;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Intercept send message: check auth state first
  const handleSendMessage = async (text: string) => {
    // If user is unauthenticated, do NOT send to Gemini, do NOT create conversation.
    // Display clean login-required prompt and preserve pending message.
    if (!currentUser) {
      setPendingMessageText(text);
      setShowAuthModal(true);
      return;
    }

    if (!activeId) {
      const fresh = createNewConversation(settings.defaultCareerField);
      fresh.title = 'Software Developer Resume';
      const updated = [fresh, ...conversations];
      setConversations(updated);
      setActiveId(fresh.id);
      saveConversations(updated);
      setActiveConversationId(fresh.id);
      executeSendMessage(fresh.id, text, updated);
      return;
    }

    executeSendMessage(activeId, text, conversations);
  };

  // Stop active streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Regenerate last AI response
  const handleRegenerate = async () => {
    if (!activeConversation || isLoading) return;

    const msgs = [...activeConversation.messages];
    if (msgs.length === 0) return;

    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const trimmedMsgs = msgs.slice(0, -1);
    const lastUserMsg = trimmedMsgs[trimmedMsgs.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    const assistantPlaceholderId = 'msg-ai-' + Date.now();
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const newMessages = [...trimmedMsgs, assistantMessage];
    const updatedConv = {
      ...activeConversation,
      messages: newMessages,
      updatedAt: Date.now(),
    };

    const updatedConversations = conversations.map((c) =>
      c.id === activeId ? updatedConv : c
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const payloadMessages = trimmedMsgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          tone: settings.tone,
          careerField: activeConversation.careerField || settings.defaultCareerField,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedContent += parsed.text;
                  setConversations((prev) =>
                    prev.map((c) => {
                      if (c.id !== activeId) return c;
                      const nextMsgs = c.messages.map((m) =>
                        m.id === assistantPlaceholderId
                          ? { ...m, content: accumulatedContent, isStreaming: true }
                          : m
                      );
                      return { ...c, messages: nextMsgs };
                    })
                  );
                }
              } catch {}
            }
          }
        }
      }

      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== activeId) return c;
          const nextMsgs = c.messages.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, content: accumulatedContent, isStreaming: false }
              : m
          );
          return { ...c, messages: nextMsgs, updatedAt: Date.now() };
        });
        saveConversations(next);
        return next;
      });

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Regenerate error:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Add a specific message content to the live resume draft
  const handleAddToResume = (content: string) => {
    if (!activeConversation) return;
    const currentResume = activeConversation.extractedResume || '';
    const updatedResume = currentResume
      ? `${currentResume}\n\n---\n\n${content}`
      : content;

    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, extractedResume: updatedResume } : c
    );
    setConversations(updated);
    saveConversations(updated);
    setIsResumeModalOpen(true);
  };

  // Extract structured resume from all conversation messages
  const handleExtractResume = async () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    setIsExtractingResume(true);
    try {
      const res = await fetch('/api/chat/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: activeConversation.messages }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.markdown) {
          const updated = conversations.map((c) =>
            c.id === activeId ? { ...c, extractedResume: data.markdown } : c
          );
          setConversations(updated);
          saveConversations(updated);
          setIsResumeModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error extracting resume:', err);
    } finally {
      setIsExtractingResume(false);
    }
  };

  // Update markdown in preview modal
  const handleUpdateResumeContent = (newMarkdown: string) => {
    if (!activeId) return;
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, extractedResume: newMarkdown } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  // Clear messages in current conversation
  const handleClearConversation = () => {
    if (!activeId) return;
    const updated = conversations.map((c) =>
      c.id === activeId ? { ...c, messages: [], extractedResume: '', updatedAt: Date.now() } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  // Export current conversation transcript
  const handleExportConversation = () => {
    if (!activeConversation) return;
    const transcript = (activeConversation.messages.length > 0 ? activeConversation.messages : [DEFAULT_INTRO_MESSAGE])
      .map((m) => `[${m.role.toUpperCase()}] (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeConversation.title || 'Resume_Chat').replace(/[^a-zA-Z0-9_-]/g, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: ChatSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Clear all data
  const handleClearAllData = () => {
    const fresh = createNewConversation(settings.defaultCareerField);
    fresh.title = 'Software Developer Resume';
    setConversations([fresh]);
    setActiveId(fresh.id);
    saveConversations([fresh]);
    setActiveConversationId(fresh.id);
  };

  // Export JSON backup of all conversations
  const handleExportAllData = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResumeAI_Conversations_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Active messages list; if empty, show default intro so user immediately sees CPRW welcome
  const rawMessages = activeConversation?.messages || [];
  const displayMessages = rawMessages.length > 0 ? rawMessages : [DEFAULT_INTRO_MESSAGE];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F7F4] text-[#171717] font-sans">
      
      {/* Floating Left Sidebar (Preserved exactly as approved) */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenResumePreview={() => setIsResumeModalOpen(true)}
        onGoHome={() => setShowHomeScreen(true)}
        isHomeActive={showHomeScreen}
      />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        
        {showHomeScreen ? (
          <WelcomeScreen
            onSendMessage={(msg) => {
              setShowHomeScreen(false);
              handleSendMessage(msg);
            }}
            isLoading={isLoading}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Minimal Conversation Header */}
            <ChatHeader
              title={activeConversation?.title || 'Software Developer Resume'}
              onUpdateTitle={handleUpdateTitle}
              onGoBack={() => setShowHomeScreen(true)}
              onNewChat={handleNewChat}
              onOpenResumePreview={() => setIsResumeModalOpen(true)}
              onToggleSidebar={() => setIsSidebarOpen(true)}
              onClearConversation={handleClearConversation}
              onExportConversation={handleExportConversation}
            />

            {/* Vertically Scrollable Conversation Area */}
            <div className="flex-1 overflow-y-auto px-1.5 sm:px-4 md:px-8 lg:px-10 py-3 sm:py-5 md:py-8 scrollbar-none">
              <div className="w-full max-w-4xl mx-auto flex flex-col space-y-3 sm:space-y-5 md:space-y-6">
                {displayMessages.map((message, index) => {
                  const isLastAssistant =
                    message.role === 'assistant' && index === displayMessages.length - 1;
                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isLastAssistant={isLastAssistant}
                      onRegenerate={rawMessages.length > 0 ? handleRegenerate : undefined}
                      onAddToResume={handleAddToResume}
                    />
                  );
                })}
                <div ref={messagesEndRef} className="h-4 sm:h-6" />
              </div>
            </div>

            {/* Fixed Chat Input Area at the bottom */}
            <div className="shrink-0 bg-[#F7F7F4]/95 backdrop-blur-xs">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onStopGeneration={handleStopGeneration}
              />
            </div>

          </div>
        )}

      </main>

      {/* Live Resume Document Preview Modal */}
      <ResumePreviewModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        markdownContent={activeConversation?.extractedResume || ''}
        onUpdateContent={handleUpdateResumeContent}
        onExtractFromChat={handleExtractResume}
        isExtracting={isExtractingResume}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllData={handleClearAllData}
        onExportAllData={handleExportAllData}
      />

      {/* Login Required Modal (Unauthenticated chat interception) */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 bg-[#171717]/35 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl neu-raised p-6 sm:p-8 text-center relative transition-all"
          >
            {/* Dismiss close button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-[#737373] hover:text-[#171717] hover:bg-[#F7F7F4] rounded-full transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Document icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#047857]/10 text-[#047857] flex items-center justify-center mx-auto mb-4 neu-raised-sm">
              <FileText className="w-7 h-7 stroke-[2.2]" />
            </div>

            {/* Heading */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight mb-2 leading-snug">
              Sign in to start building your professional resume.
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed mb-5">
              Create an account or log in to continue your conversation with ResumeAI.
            </p>

            {/* Message preview snippet */}
            {pendingMessageText && (
              <div className="mb-5 p-3 rounded-2xl bg-[#F7F7F4] border border-[#E5E5E5] neu-inset-sm text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
                  Draft message saved
                </span>
                <p className="text-xs text-[#171717] line-clamp-2 leading-relaxed">
                  "{pendingMessageText}"
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
              {/* Primary Emerald button: Login to Continue */}
              <button
                type="button"
                onClick={() => {
                  if (pendingMessageText) {
                    sessionStorage.setItem('pending_chat_message', pendingMessageText);
                  }
                  setShowAuthModal(false);
                  navigate('/login');
                }}
                className="w-full py-3 px-4 rounded-xl neu-button-emerald bg-[#047857] hover:bg-[#065F46] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <span>Login to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary button: Create an Account */}
              <button
                type="button"
                onClick={() => {
                  if (pendingMessageText) {
                    sessionStorage.setItem('pending_chat_message', pendingMessageText);
                  }
                  setShowAuthModal(false);
                  navigate('/signup');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] neu-raised-sm hover:bg-[#F7F7F4] text-[#171717] hover:text-[#047857] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Create an Account</span>
              </button>
            </div>

            <div className="mt-4 text-[11px] text-[#737373]">
              Your input is preserved and will send automatically right after sign in.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
