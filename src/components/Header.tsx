import React, { useState } from "react";
import { 
  FileText, CheckCircle2, CloudLightning, Share2, Download, Sparkles, 
  BookOpen, AlignLeft, Clock, Sparkle, Link2, Copy, Check, ShieldCheck, HelpCircle, Users, History, LayoutGrid, Shield, Trash2
} from "lucide-react";
import { Collaborator, Section } from "../types";

interface HeaderProps {
  title: string;
  onChangeTitle: (newTitle: string) => void;
  collaborators: Collaborator[];
  sections: Section[];
  savedStatus: "saving" | "saved" | "idle";
  onTriggerAnalyze: () => void;
  analysisLoading: boolean;
  readabilityScore: number | null;
  currentRole: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer";
  onChangeRole: (role: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer") => void;
  focusMode: boolean;
  setFocusMode: (f: boolean) => void;
  typewriterMode: boolean;
  setTypewriterMode: (f: boolean) => void;
  darkPaperMode: boolean;
  setDarkPaperMode: (f: boolean) => void;
  onOpenShortcuts: () => void;
  onTriggerOnboarding: () => void;
  onOpenExport?: () => void;
  onOpenShare?: () => void;
  onOpenVersionHistory?: () => void;
  onToggleDashboard?: () => void;
  showDashboard?: boolean;
  onOpenAssistant: () => void;
  addToast: (msg: string, type?: any) => void;
  onTriggerMoveToTrash?: () => void;
}

export default function Header({
  title,
  onChangeTitle,
  collaborators,
  sections,
  savedStatus,
  onTriggerAnalyze,
  analysisLoading,
  readabilityScore,
  currentRole,
  onChangeRole,
  focusMode,
  setFocusMode,
  typewriterMode,
  setTypewriterMode,
  darkPaperMode,
  setDarkPaperMode,
  onOpenShortcuts,
  onTriggerOnboarding,
  onOpenExport,
  onOpenShare,
  onOpenVersionHistory,
  onToggleDashboard,
  showDashboard,
  onOpenAssistant,
  addToast,
  onTriggerMoveToTrash
}: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite mock State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Editor" | "Reviewer" | "Viewer">("Editor");
  const [invitedUsers, setInvitedUsers] = useState<Array<{ email: string; role: string }>>([
    { email: "sarah.m@apex.io", role: "Reviewer" },
    { email: "leo.c@apex.io", role: "Editor" }
  ]);
  const [isPublicAccess, setIsPublicAccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");

  React.useEffect(() => {
    if (savedStatus === "saved") {
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [savedStatus]);

  // Compute stats
  const totalWords = sections.reduce((sum, sec) => {
    return sum + (sec.content ? sec.content.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const totalChars = sections.reduce((sum, sec) => {
    return sum + (sec.content ? sec.content.length : 0);
  }, 0);

  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  // Handle actual file exports
  const handleExport = (type: "md" | "txt" | "json") => {
    let fileContent = "";
    let mimeType = "text/plain";
    let fileName = `${title.toLowerCase().replace(/\s+/g, "-") || "document"}`;

    if (type === "md") {
      fileContent = `# ${title}\n\n` + sections.map(s => `## ${s.title}\n\n${s.content}`).join("\n\n");
      mimeType = "text/markdown";
      fileName += ".md";
    } else if (type === "txt") {
      fileContent = `${title}\n\n` + sections.map(s => `${s.title}\n${"=".repeat(s.title.length)}\n${s.content}`).join("\n\n");
      mimeType = "text/plain";
      fileName += ".txt";
    } else if (type === "json") {
      fileContent = JSON.stringify({ title, sections, exportedAt: new Date().toISOString() }, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleCopyShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInvitedUsers(prev => [...prev, { email: inviteEmail, role: inviteRole }]);
    setInviteEmail("");
    addToast(`Mock Invite sent to ${inviteEmail} as ${inviteRole}!`, "success");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand and Document Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial" id="onboarding-brand-title">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 text-white p-2 rounded-xl flex-shrink-0 shadow-sm animate-pulse">
            <Sparkle className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                CollabStudio AI Premium
              </span>
              {savedStatus === "saving" ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-mono border border-amber-100">
                  <div className="w-2.5 h-2.5 border border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : savedStatus === "saved" ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-mono border border-emerald-100 animate-fade-in" title={`Last auto-saved at ${lastSavedTime}`}>
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span>Saved at {lastSavedTime}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-mono border border-indigo-100">
                  <CloudLightning className="w-2.5 h-2.5 text-indigo-500 fill-current" />
                  <span>Live Sync On</span>
                </div>
              )}
            </div>

            {isEditingTitle && currentRole !== "Viewer" && currentRole !== "Commenter" ? (
              <input
                id="edit-doc-title-input"
                type="text"
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                className="text-base font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 max-w-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <h1 
                  id="doc-title-h1"
                  onClick={() => {
                    if (currentRole !== "Viewer" && currentRole !== "Commenter") {
                      setIsEditingTitle(true);
                    }
                  }}
                  className={`text-base font-semibold text-slate-800 rounded px-1 -ml-1 transition-colors truncate max-w-[200px] sm:max-w-xs ${
                    currentRole === "Viewer" || currentRole === "Commenter" ? "cursor-default" : "cursor-pointer hover:bg-slate-50"
                  }`}
                  title={currentRole === "Viewer" || currentRole === "Commenter" ? "View-only access" : "Click to edit document title"}
                >
                  {title || "Project Specifications Design Doc"}
                </h1>
                {(currentRole === "Viewer" || currentRole === "Commenter") && (
                  <Shield className="w-3 h-3 text-amber-500" title="View-only access" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mid Stats info bar */}
        <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1.5" title="Total Word Count">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Words: <strong className="text-slate-800">{totalWords}</strong></span>
          </div>
          <div className="flex items-center gap-1.5" title="Total Characters">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Chars: <strong className="text-slate-800">{totalChars}</strong></span>
          </div>
          <div className="flex items-center gap-1.5" title="Average Reading Time">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Read Time: <strong className="text-slate-800">{readingTime} min</strong></span>
          </div>
          {readabilityScore !== null && (
            <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-lg border border-sky-100">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 fill-current" />
              <span>Score: <strong className="font-bold">{readabilityScore}/100</strong></span>
            </div>
          )}
        </div>

        {/* Right Actions: Collaborators, Roles dropdown, Focus toggle, Share, Export */}
        <div className="flex items-center gap-2.5">
          
          {/* Active online contributors */}
          <div className="hidden sm:flex items-center -space-x-1.5 mr-1" title="Collaborators actively simulated">
            {collaborators.map((user) => (
              <div
                key={user.id}
                className={`w-7.5 h-7.5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white relative cursor-pointer shadow-sm ${user.color}`}
                title={`${user.name} (${user.role}) - ${user.isTyping ? "Typing..." : "Viewing"}`}
              >
                {user.name.split(" ").map(w => w[0]).join("")}
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
                )}
              </div>
            ))}
          </div>

          {/* Role selector dropdown */}
          <div className="flex items-center gap-1.5" id="onboarding-role-select">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <select
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as any)}
              className="text-xs bg-slate-100 text-slate-700 border border-slate-205 rounded-lg px-2 py-1.5 font-bold cursor-pointer hover:bg-slate-200 transition-colors"
              title="Change your active workspace role and permissions"
            >
              <option value="Owner">👑 Owner</option>
              <option value="Editor">✍️ Editor</option>
              <option value="Reviewer">👁️ Reviewer</option>
              <option value="Commenter">💬 Commenter</option>
              <option value="Viewer">🔒 Viewer Mode</option>
            </select>
          </div>

          {/* Focus Mode toggle */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer hidden md:block ${
              focusMode 
                ? "bg-amber-500 text-white border-amber-400" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title={focusMode ? "Deactivate Focus Mode" : "Activate Distraction-Free Focus Mode"}
            id="onboarding-focus-toggle"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Tutorial Tour Trigger */}
          <button
            onClick={onTriggerOnboarding}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer hidden md:block"
            title="Start Onboarding Walkthrough Tour"
          >
            <HelpCircle className="w-4 h-4 text-sky-500" />
          </button>

          {/* Version History Button */}
          {onOpenVersionHistory && (
            <button
              onClick={onOpenVersionHistory}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer hidden md:block"
              title="Open Version History Timeline"
            >
              <History className="w-4 h-4 text-indigo-500" />
            </button>
          )}

          {/* Smart Dashboard Toggle */}
          {onToggleDashboard && (
            <button
              onClick={onToggleDashboard}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer hidden md:block ${
                showDashboard 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title={showDashboard ? "Hide Analytics Dashboard" : "Show Analytics Dashboard & Comments"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          )}

          {/* Hotkeys help button */}
          <button
            onClick={onOpenShortcuts}
            className="px-2 py-1.5 text-[11px] font-mono border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer hidden sm:block"
            title="Show Keyboard Hotkeys"
          >
            Ctrl + /
          </button>

          {/* Gemini AI Trigger - Visible mainly on mobile to open drawer */}
          <button
            onClick={onOpenAssistant}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer lg:hidden flex items-center gap-1.5"
            title="Open Gemini AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI</span>
          </button>

          {/* Trash Button - Only for Owners */}
          {currentRole === "Owner" && onTriggerMoveToTrash && (
            <button
              onClick={onTriggerMoveToTrash}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer hidden md:block transition-colors"
              title="Move document to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Share Button panel upgrade */}
          <div className="relative">
            <button
              id="header-share-btn"
              onClick={() => {
                if (onOpenShare) {
                  onOpenShare();
                } else {
                  setShowSharePopup(!showSharePopup);
                }
              }}
              className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="Launch Premium Workspace Sharing panel"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {showSharePopup && !onOpenShare && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide font-mono z-50">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Secure Sharing & Auditing
                  </h4>
                  <p className="text-[10px] text-slate-500">Enable real-time synchronization or edit invites selectively under mock protocol.</p>
                </div>

                {/* Invite Email */}
                <form onSubmit={handleInviteUser} className="space-y-2">
                  <div className="flex gap-1">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@domain.io"
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-1.5"
                    >
                      <option value="Editor">Editor</option>
                      <option value="Reviewer">Reviewer</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg"
                  >
                    Send Invite Invite
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Access Scope:</span>
                    <button
                      onClick={() => setIsPublicAccess(!isPublicAccess)}
                      className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        isPublicAccess ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-605"
                      }`}
                    >
                      {isPublicAccess ? "🔓 Public Spec" : "🔒 private team"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-500 truncate flex-1">
                      {window.location.href}
                    </span>
                    <button
                      onClick={handleCopyShare}
                      className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors bg-white border border-slate-200 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {copiedLink && <span className="text-[10px] text-emerald-600 font-mono block">Mock URL copied!</span>}
                </div>

                <div className="border-t border-slate-150 pt-2 text-[10px] text-slate-400">
                  <span className="block font-bold mb-1 uppercase tracking-wider text-[8px]">Active Invites:</span>
                  <div className="space-y-1">
                    {invitedUsers.map((usr) => (
                      <div key={usr.email} className="flex justify-between font-mono text-[9px]">
                        <span>{usr.email}</span>
                        <strong className="text-slate-600">{usr.role}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              id="header-export-btn"
              onClick={() => {
                if (onOpenExport) {
                  onOpenExport();
                } else {
                  setShowExportMenu(!showExportMenu);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 text-xs text-slate-700 font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && !onOpenExport && (
              <div className="absolute right-0 mt-2.5 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 overflow-hidden">
                <button
                  onClick={() => handleExport("md")}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="font-bold text-slate-400 font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded">MD</span>
                  <span>Markdown File</span>
                </button>
                <button
                  onClick={() => handleExport("txt")}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="font-bold text-slate-400 font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded">TXT</span>
                  <span>Plain Text Layout</span>
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <span className="font-bold text-slate-400 font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded">JSON</span>
                  <span>Document State</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
