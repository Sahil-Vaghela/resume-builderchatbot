import { useState, useRef, KeyboardEvent } from 'react';
import { Paperclip, Navigation, Moon, Menu } from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  onToggleSidebar?: () => void;
}

export function WelcomeScreen({ onSendMessage, isLoading = false, onToggleSidebar }: WelcomeScreenProps) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setInput((prev) => (prev ? `${prev}\n\n[Attached: ${file.name}]\n${text}` : text));
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-10 select-none overflow-hidden">
      
      {/* Background Soft Organic Mint/Emerald Fluid Wave matching reference */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-35 overflow-hidden">
        <svg
          className="w-full h-full min-w-[900px] max-w-6xl"
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50,220 C220,120 320,380 540,260 C760,140 880,310 1050,180 L1050,600 L-50,600 Z"
            fill="url(#emerald-soft-gradient)"
          />
          <defs>
            <linearGradient id="emerald-soft-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#047857" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#047857" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Mobile-Only Sidebar Toggle (hidden on desktop where floating sidebar is always visible) */}
      {onToggleSidebar && (
        <div className="absolute top-6 left-6 z-20 md:hidden">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] neu-raised-sm flex items-center justify-center text-[#171717] hover:text-[#047857] transition-all cursor-pointer shadow-xs"
            title="Open sidebar"
          >
            <Menu className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      )}

      {/* Top-Right Control: ONLY Dark / Light Mode Toggle */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
        <button
          type="button"
          onClick={() => {
            document.documentElement.classList.toggle('dark');
          }}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] neu-raised-sm flex items-center justify-center text-[#171717] hover:text-[#047857] transition-all cursor-pointer shadow-xs"
          title="Toggle dark / light mode"
        >
          <Moon className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Main Content Area - Horizontally and vertically centered in main workspace */}
      <div className="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center text-center z-10 my-auto">
        
        {/* 1. Document Icon */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#FFFFFF] border border-[#E5E5E5]/70 neu-raised flex items-center justify-center mb-6 shrink-0 transition-transform hover:scale-102">
          <svg
            className="w-10 h-10 text-[#047857]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
        </div>

        {/* 2. Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] mb-2.5">
          Build Your Resume with AI
        </h1>

        {/* 3. Subtitle */}
        <p className="text-[#737373] text-sm sm:text-base font-normal max-w-xl mb-8 leading-relaxed">
          Create a professional, ATS-friendly resume through a simple conversation.
        </p>

        {/* 4. Chat Input - Directly Below Subtitle */}
        <div className="w-full max-w-2xl sm:max-w-3xl">
          <div className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-full neu-raised px-4 sm:px-6 py-2.5 flex items-center gap-3 transition-all focus-within:border-[#047857]/50 focus-within:ring-2 focus-within:ring-[#047857]/5">
            
            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Tell me about your education, skills, or experience..."
              className="flex-1 bg-transparent border-none text-[#171717] placeholder:text-[#737373] text-sm sm:text-[15px] focus:outline-hidden py-2 font-normal"
            />

            {/* Attachment paperclip */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#171717] hover:text-[#047857] transition-colors cursor-pointer shrink-0"
              title="Attach existing resume or notes"
            >
              <Paperclip className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Emerald Green Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                input.trim() && !isLoading
                  ? 'bg-[#047857] hover:bg-[#065F46] text-white neu-button-emerald scale-100'
                  : 'bg-[#047857] text-white/80 neu-button-emerald opacity-90'
              }`}
              title="Send message"
            >
              <Navigation className="w-4 h-4 fill-white text-white rotate-90 translate-x-0.5" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
