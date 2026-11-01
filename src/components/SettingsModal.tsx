import { useState } from 'react';
import { X, Check, Trash2, Download, Sliders, Briefcase, MessageSquare, Palette, Shield } from 'lucide-react';
import { ChatSettings, ToneType, CareerLevel } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSaveSettings: (settings: ChatSettings) => void;
  onClearAllData: () => void;
  onExportAllData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData,
  onExportAllData,
}: SettingsModalProps) {
  const [currentSettings, setCurrentSettings] = useState<ChatSettings>(settings);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'chat' | 'appearance' | 'data'>('general');

  if (!isOpen) return null;

  const toneOptions: { id: ToneType; title: string; desc: string }[] = [
    {
      id: 'professional',
      title: 'Professional Executive',
      desc: 'Balanced, authoritative, and metrics-focused phrasing favored by corporate recruiters.',
    },
    {
      id: 'modern',
      title: 'Modern Tech & High-Growth',
      desc: 'Action-oriented, product-minded, and engineering-centric terminology.',
    },
    {
      id: 'executive',
      title: 'Strategic Leadership',
      desc: 'P&L ownership, organizational impact, leadership, and vision.',
    },
    {
      id: 'creative',
      title: 'Creative & Narrative',
      desc: 'Story-driven and brand-focused, ideal for designers, copywriters, and marketers.',
    },
  ];

  const careerLevels: { id: CareerLevel; label: string }[] = [
    { id: 'fresher', label: 'Student / Fresher' },
    { id: 'mid', label: 'Mid-Level (2-5 yrs)' },
    { id: 'senior', label: 'Senior / Staff (5-10 yrs)' },
    { id: 'executive', label: 'Executive (Director / VP)' },
    { id: 'career-changer', label: 'Career Changer' },
  ];

  const handleSave = () => {
    onSaveSettings(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#171717]/30 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-[#FFFFFF] rounded-2xl neu-raised border border-[#E5E5E5] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F4]">
          <div className="flex items-center gap-2.5 font-semibold text-[#171717] text-sm sm:text-base">
            <Sliders className="w-4 h-4 text-[#047857]" />
            <span>Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Sections) */}
        <div className="flex items-center px-3 sm:px-6 pt-2 sm:pt-3 border-b border-[#E5E5E5] bg-[#F7F7F4] gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-[#047857] text-[#047857] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-[#047857] text-[#047857] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-[#047857] text-[#047857] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-[#047857] text-[#047857] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Data & Privacy</span>
          </button>
        </div>

        {/* Content by Section */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-[#FFFFFF]">
          
          {/* Section 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                  Default Target Role / Career Field
                </label>
                <input
                  type="text"
                  value={currentSettings.defaultCareerField}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, defaultCareerField: e.target.value })
                  }
                  placeholder="e.g. Software Engineer, Product Manager"
                  className="w-full bg-[#FFFFFF] border border-[#E5E5E5] neu-inset-sm rounded-xl px-3.5 py-2 text-xs text-[#171717] placeholder-[#737373] focus:outline-hidden focus:border-[#047857]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Target Experience Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {careerLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCurrentSettings({ ...currentSettings, careerLevel: lvl.id })}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                        currentSettings.careerLevel === lvl.id
                          ? 'border-[#047857]/30 bg-[#047857]/8 text-[#047857] neu-raised-sm font-semibold'
                          : 'border-[#E5E5E5] text-[#171717] bg-[#FFFFFF] hover:bg-[#F7F7F4]'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Chat Preferences */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Consultant Tone & Advisory Style
                </label>
                <div className="space-y-2">
                  {toneOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setCurrentSettings({ ...currentSettings, tone: opt.id })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        currentSettings.tone === opt.id
                          ? 'border-[#047857]/40 bg-[#047857]/5 neu-raised-sm'
                          : 'border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#737373]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-semibold ${currentSettings.tone === opt.id ? 'text-[#047857]' : 'text-[#171717]'}`}>
                          {opt.title}
                        </span>
                        {currentSettings.tone === opt.id && (
                          <Check className="w-4 h-4 text-[#047857]" />
                        )}
                      </div>
                      <p className="text-[#737373] leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-sync resume toggle */}
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#171717]">Auto-Sync Resume Sections</div>
                  <div className="text-[11px] text-[#737373]">Update live resume draft when new sections are finalized</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSettings({
                      ...currentSettings,
                      autoExtractResume: !currentSettings.autoExtractResume,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentSettings.autoExtractResume ? 'bg-[#047857]' : 'bg-[#E5E5E5]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-[#FFFFFF] shadow-sm transform transition-transform ${
                      currentSettings.autoExtractResume ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Theme & Visual Design System
                </label>
                <div className="p-4 rounded-xl border border-[#047857]/30 bg-[#047857]/5 neu-raised-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E5E5] neu-raised-sm flex items-center justify-center text-[#047857]">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#171717]">Neomorphism (Soft UI)</span>
                      <p className="text-[11px] text-[#737373]">Warm white (#F7F7F4), charcoal, and emerald accents</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#047857] bg-[#FFFFFF] px-2.5 py-1 rounded-full border border-[#047857]/20 neu-raised-sm">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F7F7F4] border border-[#E5E5E5] rounded-xl text-xs text-[#737373] space-y-1">
                <div className="font-medium text-[#171717]">Design Principles:</div>
                <div>• Soft dual shadows with subtle raised & inset depth</div>
                <div>• Pure White (#FFFFFF) & Warm White (#F7F7F4) surfaces</div>
                <div>• Emerald Green (#047857) primary action points</div>
              </div>
            </div>
          )}

          {/* Section 4: Data & Privacy */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Local Storage & Export
                </label>
                <p className="text-xs text-[#737373] mb-4">
                  All your conversation logs, drafted resume sections, and preferences are stored locally in your browser.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={onExportAllData}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#171717] bg-[#FFFFFF] hover:bg-[#F7F7F4] border border-[#E5E5E5] rounded-xl neu-button transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#737373]" />
                    <span>Export Conversations (.json)</span>
                  </button>

                  {confirmClear ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllData();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <span>Confirm Clear All</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#DC2626] bg-[#FFFFFF] hover:bg-rose-50/50 border border-[#DC2626]/30 rounded-xl neu-button transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reset History</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E5E5] flex justify-end gap-2.5 bg-[#F7F7F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#737373] hover:text-[#171717] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-xl neu-button-emerald transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
