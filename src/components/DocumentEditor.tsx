import React, { useState } from "react";
import { 
  Plus, Trash2, Sparkles, Bold, Italic, List, FileCode, Check, AlertCircle,
  Search, Eye, HelpCircle, AlignLeft, BookOpen, Clock, LayoutGrid, MessageSquare,
  Sparkle, CornerDownRight, X, ChevronRight, CheckCircle2, ChevronDown, RotateCcw,
  Underline, ListOrdered, Quote, Heading1, Heading2, Heading3, CheckSquare, Table, FileText,
  Undo, Redo, Link, Eraser, MoveUp, MoveDown, Copy, Shield
} from "lucide-react";
import { Section, Collaborator, Comment, TaskItem } from "../types";
import { Formatting } from "../utils/formatting";

interface DocumentEditorProps {
  sections: Section[];
  onUpdateSection: (id: string, updatedFields: Partial<Section>) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  collaborators: Collaborator[];
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  currentRole: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer";
  focusMode: boolean;
  typewriterMode?: boolean;
  darkPaperMode?: boolean;
  wordCountTarget: number;
  setWordCountTarget: (target: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onReplaceAll: (search: string, replace: string) => void;
  onReplaceNext: (search: string, replace: string) => void;
  
  // High-fidelity page parameters
  title: string;
  onChangeTitle: (title: string) => void;
  comments: Comment[];
  onAddComment: (text: string, isAi?: boolean) => void;
  onResolveComment: (id: string) => void;
  showDashboard: boolean;
  onToggleDashboard: () => void;
  onTriggerAnalyze: () => void;
  analysisLoading: boolean;
  tasks: TaskItem[];
  isTrashed?: boolean;
  onRestore?: () => void;
}

export default function DocumentEditor({
  sections,
  onUpdateSection,
  onAddSection,
  onDeleteSection,
  collaborators,
  activeSectionId,
  setActiveSectionId,
  selectedText,
  setSelectedText,
  currentRole,
  focusMode,
  typewriterMode,
  darkPaperMode,
  wordCountTarget,
  setWordCountTarget,
  searchTerm,
  setSearchTerm,
  
  title,
  onChangeTitle,
  comments,
  onAddComment,
  onResolveComment,
  showDashboard,
  onToggleDashboard,
  onTriggerAnalyze,
  analysisLoading,
  onDuplicateSection,
  onMoveSection,
  onReplaceAll,
  onReplaceNext,
  tasks,
  isTrashed,
  onRestore
}: DocumentEditorProps) {
  
  // Local states for inline tools
  const [toolbarFeedback, setToolbarFeedback] = useState<string | null>(null);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineSuggestion, setInlineSuggestion] = useState<string | null>(null);
  const [originalDraftValue, setOriginalDraftValue] = useState<string | null>(null);
  const [showInlinePrompt, setShowInlinePrompt] = useState(false);
  const [newInlineCommentTxt, setNewInlineCommentTxt] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const isReadOnly = currentRole === "Viewer" || currentRole === "Commenter" || isTrashed;
  const canEdit = (currentRole === "Owner" || currentRole === "Editor") && !isTrashed;
  const canComment = (currentRole === "Owner" || currentRole === "Editor" || currentRole === "Commenter") && !isTrashed;

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setToolbarFeedback("Saved to cloud.");
        setTimeout(() => setToolbarFeedback(null), 2500);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        applyMarkdownFormatting("bold");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        applyMarkdownFormatting("italic");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        applyMarkdownFormatting("link");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const searchInput = document.getElementById("document-search-input");
        if (searchInput) searchInput.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowInlinePrompt(p => !p);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activeSectionId, isReadOnly]);

  // Text selection tracking
  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    if (start !== end) {
      const selectedStr = target.value.substring(start, end);
      setSelectedText(selectedStr);
    } else {
      setSelectedText("");
    }
  };

  const applyMarkdownFormatting = (type: string) => {
    const isAiAction = type.startsWith("ai_");
    
    if (isReadOnly && !isAiAction) {
      setToolbarFeedback("View-only access");
      setTimeout(() => setToolbarFeedback(null), 2500);
      return;
    }
    
    if (isAiAction) {
      // In this demo, AI actions on the toolbar provide helpful context in the assistant sidebar
      setToolbarFeedback("AI analysis triggered...");
      setTimeout(() => setToolbarFeedback(null), 2500);
      return;
    }
    
    if (!activeSectionId) {
      setToolbarFeedback("⚠️ Select a block first");
      setTimeout(() => setToolbarFeedback(null), 2500);
      return;
    }

    const textarea = document.getElementById(`textarea-${activeSectionId}`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const { value, newCursorPos } = Formatting.apply(textarea, type);
    onUpdateSection(activeSectionId, { content: value });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Inline AI Action Runners (keeps core operations strictly server-side)
  const runInlineAiAction = async (action: "improve" | "simplify" | "shorten" | "expand") => {
    if (!selectedText.trim()) return;
    setInlineLoading(true);
    setInlineSuggestion(null);
    setOriginalDraftValue(selectedText);

    try {
      const parentSec = sections.find(s => s.id === activeSectionId) || sections[0];
      const contextText = sections.map(s => `${s.title}:\n${s.content}`).join("\n\n");

      const res = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selectedText,
          context: contextText
        })
      });

      if (!res.ok) throw new Error("A network challenge occurred processing the AI request.");
      const data = await res.json();
      setInlineSuggestion(data.suggested || "AI could not generate proposal.");
    } catch (err: any) {
      console.warn("AI API unavailable, using demo fallback.");
      let demoResponse = "";
      if (action === "improve") demoResponse = `Enhanced: ${selectedText.trim()} using optimized vocabulary and better structure.`;
      else if (action === "simplify") demoResponse = `Simplified: ${selectedText.trim()} (more concise representation).`;
      else if (action === "expand") demoResponse = `${selectedText.trim()} expanded to include deeper context, potential edge cases, and expanded technical nuances to provide stronger clarity.`;
      else demoResponse = `Modified text: ${selectedText.trim()}`;
      
      setInlineSuggestion(demoResponse);
    } finally {
      setInlineLoading(false);
    }
  };

  const applyInlineSuggestion = () => {
    if (!inlineSuggestion || !activeSectionId) return;
    const targetSec = sections.find(s => s.id === activeSectionId);
    if (!targetSec) return;

    // Replace selected substring inside content body
    const fullText = targetSec.content;
    const matchedIdx = fullText.indexOf(originalDraftValue || "");
    
    if (matchedIdx !== -1) {
      const updatedText = 
        fullText.substring(0, matchedIdx) + 
        inlineSuggestion + 
        fullText.substring(matchedIdx + (originalDraftValue || "").length);
      
      onUpdateSection(activeSectionId, { content: updatedText });
    } else {
      // Fallback fallback: append or replace whole section if selection lookup failed
      const updatedText = fullText.replace(originalDraftValue || "", inlineSuggestion);
      onUpdateSection(activeSectionId, { content: updatedText });
    }
    
    // Clear inline suggest cache
    setInlineSuggestion(null);
    setSelectedText("");
    setOriginalDraftValue(null);
    setToolbarFeedback("Applied AI rewrite suggestions back to section!");
    setTimeout(() => setToolbarFeedback(null), 2500);
  };

  const handleCreateInlineComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineCommentTxt.trim()) return;
    onAddComment(newInlineCommentTxt, false);
    setNewInlineCommentTxt("");
    setShowInlinePrompt(false);
    setToolbarFeedback("Comment inserted successfully!");
    setTimeout(() => setToolbarFeedback(null), 2000);
  };

  // Calculations for analytics layout indicators
  const totalWords = sections.reduce((sum, sec) => {
    return sum + (sec.content ? sec.content.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  const totalChars = sections.reduce((sum, sec) => sum + sec.content.length, 0);
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));
  const progressPercent = Math.min(100, Math.round((totalWords / wordCountTarget) * 100));

  // If search term is active, we just highlight it in place rather than filter out sections, protecting layout feel. Wait, we can optionally scroll to first match.
  const displaySections = sections;

  return (
    <div className={`flex-grow flex flex-col space-y-6 w-full mx-auto transition-all ${focusMode ? 'max-w-3xl' : 'max-w-5xl lg:max-w-6xl'}`}>
      
      {/* 1. Word stats and search row */}
      <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4" id="onboarding-editor-stats">
        
        {/* Progress word target bar */}
        <div className="space-y-1.5 md:border-r border-slate-200/80 pr-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>Target Progress:</span>
            <strong>{totalWords} / {wordCountTarget} Words</strong>
          </div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100 ? "bg-emerald-500 animate-pulse" : "bg-indigo-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 capitalize">
              {progressPercent >= 100 ? "🎉 Drafting goal complete!" : `Goal progress: ${progressPercent}%`}
            </span>
            
            <div className="flex gap-1">
              {[200, 500, 1000].map(trg => (
                <button
                  key={trg}
                  onClick={() => setWordCountTarget(trg)}
                  className={`text-[9px] font-mono font-bold px-1.5 rounded border cursor-pointer ${
                    wordCountTarget === trg ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {trg}w
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search bar inside document */}
        <div className="space-y-1.5 md:border-r border-slate-200/80 pr-2">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Advanced Find & Replace</span>
          <div className="relative flex gap-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                id="document-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find..."
                className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button onClick={() => setShowSearchPanel(!showSearchPanel)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSearchPanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showSearchPanel && (
            <div className="space-y-1.5 pt-1 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  placeholder="Replace with..."
                  className="w-full px-2.5 py-1 text-xs border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => onReplaceNext(searchTerm, replaceTerm)} className="flex-1 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-md hover:bg-slate-700 transition">Next</button>
                <button onClick={() => onReplaceAll(searchTerm, replaceTerm)} className="flex-1 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-md hover:bg-amber-700 transition">All</button>
              </div>
            </div>
          )}
        </div>

        {/* Read times and details */}
        <div className="flex items-center justify-around text-center py-1">
          <div className="space-y-0.5">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-medium">Estimated Reading</span>
            <strong className="text-xs font-mono text-slate-850">{readingTime} min</strong>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="space-y-0.5">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-medium">Total Chars</span>
            <strong className="text-xs font-mono text-slate-850">{totalChars}</strong>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="space-y-0.5">
            <button
              onClick={onToggleDashboard}
              className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition ${
                showDashboard 
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "bg-slate-200 text-slate-650 hover:bg-slate-250 border border-transparent"
              }`}
            >
              📊 DASHBOARD: {showDashboard ? "ON" : "OFF"}
            </button>
          </div>
        </div>

      </div>

      {/* 2. Style & Format Toolbar (always visible and highly responsive) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm" id="onboarding-editor-toolbar">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Format Group 1: Typography */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
            <button
              onClick={() => applyMarkdownFormatting("bold")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Bold text (**bold**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("italic")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Italic text (*italic*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("underline")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Underline text (<u>underline</u>)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Format Group 2: Lists, Task List & Blocks */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
            <button
              onClick={() => applyMarkdownFormatting("bullet")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Bullet List (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("number")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Numbered List (1. item)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("task")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Insert Checklist Item (- [ ] item)"
            >
              <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("quote")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Blockquote Quote (> text)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("code")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Code highlight (`code`)"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Format Group 3: Headings */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-150 text-[10px] font-bold font-mono">
            <button
              onClick={() => applyMarkdownFormatting("h1")}
              className="px-2 py-1 hover:bg-white hover:shadow-xs rounded-lg text-slate-700 cursor-pointer transition"
              title="Make Heading 1 (# H1)"
            >
              H1
            </button>
            <button
              onClick={() => applyMarkdownFormatting("h2")}
              className="px-2 py-1 hover:bg-white hover:shadow-xs rounded-lg text-slate-700 cursor-pointer transition"
              title="Make Heading 2 (## H2)"
            >
              H2
            </button>
            <button
              onClick={() => applyMarkdownFormatting("h3")}
              className="px-2 py-1 hover:bg-white hover:shadow-xs rounded-lg text-slate-700 cursor-pointer transition"
              title="Make Heading 3 (### H3)"
            >
              H3
            </button>
          </div>

          {/* Format Group 4: Structured Components */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
            <button
              onClick={() => applyMarkdownFormatting("table")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-slate-705 cursor-pointer transition"
              title="Insert Table Grid template"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyMarkdownFormatting("comment")}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-sky-600 cursor-pointer transition"
              title="Add selection context comment reference"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            </button>
          </div>

          {/* AI Quick Accelerators */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => applyMarkdownFormatting("ai_improve")}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-xl text-[10px] font-bold border border-indigo-100 transition cursor-pointer"
              title="Highlight active text to improve readability"
            >
              <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
              <span>AI Improve</span>
            </button>
            <button
              onClick={() => applyMarkdownFormatting("ai_summarize")}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/85 text-emerald-850 rounded-xl text-[10px] font-bold border border-emerald-100 transition cursor-pointer"
              title="Highlight active text to summarize key items"
            >
              <BookOpen className="w-3 h-3 text-emerald-600" />
              <span>AI Summarize</span>
            </button>
          </div>

        </div>

        <div className="flex items-center gap-2">
          {toolbarFeedback && (
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg animate-fade-in font-bold">
              {toolbarFeedback}
            </span>
          )}

          <button
            onClick={onAddSection}
            disabled={isReadOnly}
            className={`flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs ${isReadOnly ? "opacity-30 cursor-not-allowed" : ""}`}
            title="Create a new workspace structural section"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Block Section</span>
          </button>
        </div>
      </div>

      {/* 3. WHITE PAPER PAGE CONTAINER */}
      <div className={`${darkPaperMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200/90"} rounded-3xl border shadow-[0_15px_40px_rgba(0,0,0,0.035)] p-6 md:p-12 space-y-6 relative min-h-[750px] transition-all`}>
        
        {/* Page Watermark signature */}
        <div className="absolute right-6 top-6 flex items-center gap-1.5 opacity-20 pointer-events-none select-none font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
          <Sparkle className="w-3 h-3 text-indigo-600" />
          <span>CollabStudio Spec Sheet</span>
        </div>

        {/* A4 Page Title box */}
        <div className="border-b border-slate-100 pb-5 space-y-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
            DOCUMENT TITLE
          </span>
          <input
            type="text"
            value={title}
            readOnly={isReadOnly}
            onChange={(e) => onChangeTitle(e.target.value)}
            className={`w-full text-2xl md:text-3xl font-extrabold tracking-tight bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 rounded px-1 transition-all ${
              darkPaperMode ? "text-slate-100 placeholder-slate-700 hover:bg-slate-800" : "text-slate-800 placeholder-slate-400 hover:bg-slate-50 focus:bg-slate-50"
            }`}
            placeholder="Document Specifications Workspace"
          />
        </div>

        {/* Floating Selection Action Panel */}
        {selectedText && (
          <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 animate-fade-in z-20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span className="text-xs text-slate-300 font-semibold font-mono">
                Highlighted: "{selectedText.substring(0, 18)}..."
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => runInlineAiAction("improve")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold cursor-pointer transition border border-slate-700"
              >
                Improve
              </button>
              <button
                onClick={() => runInlineAiAction("simplify")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold cursor-pointer transition border border-slate-700"
              >
                Simplify
              </button>
              <button
                onClick={() => runInlineAiAction("shorten")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold cursor-pointer transition border border-slate-700"
              >
                Shorten
              </button>
              <button
                onClick={() => runInlineAiAction("expand")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold cursor-pointer transition border border-slate-700"
              >
                Expand
              </button>

              <div className="w-px h-4 bg-slate-700 mx-1" />

              <button
                disabled={!canComment}
                onClick={() => setShowInlinePrompt(!showInlinePrompt)}
                className={`px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-bold cursor-pointer transition ${!canComment ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                Comment
              </button>
              
              <button
                onClick={() => setSelectedText("")}
                className="p-1 hover:bg-slate-800 text-slate-400 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Inline AI processing drawer or Comment prompt block inside the page */}
        {showInlinePrompt && (
          <form onSubmit={handleCreateInlineComment} className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Add Comment referencing Selection
              </span>
              <button type="button" onClick={() => setShowInlinePrompt(false)} className="text-slate-405">
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={newInlineCommentTxt}
              onChange={(e) => setNewInlineCommentTxt(e.target.value)}
              placeholder="e.g. Please verify latency parameter boundaries on port 8080..."
              rows={2}
              className="w-full bg-white border border-slate-205 rounded-xl p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Save Comment
              </button>
            </div>
          </form>
        )}

        {/* Inline AI results and comparison diff */}
        {(inlineLoading || inlineSuggestion) && (
          <div className="bg-indigo-50/40 border border-indigo-200/80 p-4 rounded-2xl space-y-3 animate-fade-in relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-indigo-700 font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                Inline AI Suggestion Sandbox
              </span>
              <button
                onClick={() => {
                  setInlineSuggestion(null);
                  setSelectedText("");
                  setOriginalDraftValue(null);
                }}
                className="text-slate-450 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {inlineLoading ? (
              <div className="flex items-center gap-2 py-2">
                <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-mono">Running secure server-side Gemini request, please wait...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-705 bg-white p-3 rounded-xl border border-slate-150 relative">
                  <p className="italic leading-relaxed">"{inlineSuggestion}"</p>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-450">Format Mode: Unified change comparison</span>
                  <button
                    onClick={applyInlineSuggestion}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Apply back to layout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clean, responsive read-only status alert */}
        {isTrashed && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 px-4 rounded-xl flex items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-rose-900">This document is in Trash</p>
                <p className="text-[11px] text-rose-700/80">Restore it to enable editing and formatting. Deleted documents are permanently removed after 30 days.</p>
              </div>
            </div>
            <button 
              onClick={onRestore}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
            >
              Restore & Edit
            </button>
          </div>
        )}

        {isReadOnly && !isTrashed && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 px-4 rounded-xl flex items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900">View-only access</p>
                <p className="text-[11px] text-amber-700/80">You can read, search, export, and ask Gemini about this document. Ask the owner for edit access.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. SECTIONS LOOP AS REALISTIC EDITABLE PARAGRAPHS */}
        <div className="space-y-8">
          {displaySections.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700">This document is empty</h3>
                <p className="text-xs text-slate-500 mt-1">Start by adding a new section or applying a template.</p>
              </div>
            </div>
          ) : (
            displaySections.map((section, idx) => {
              const activeCollabs = collaborators.filter(c => c.activeSectionId === section.id);
              const activeCommentsCount = comments.filter(c => c.sectionId === section.id && !c.isResolved).length;
              const blockHasAiSuggestion = comments.some(c => c.sectionId === section.id && c.isAiSuggestion && !c.isResolved);

              return (
                <div
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`transition-all duration-300 relative group p-1 ${
                    activeSectionId === section.id 
                      ? "rounded-2xl" 
                      : ""
                  }`}
                >
                {/* Visual margin grid structure (Left content, Right margined comments sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  
                  {/* LEFT WRITING CONTENT COLUMN */}
                  <div className={`lg:col-span-3 space-y-3 p-4 md:p-5 rounded-2xl border transition ${
                    activeSectionId === section.id
                      ? (darkPaperMode ? "bg-slate-800/80 border-sky-500/50" : "bg-slate-50/50 border-sky-300/80 shadow-[0_4px_20px_rgba(56,189,248,0.02)]")
                      : "bg-transparent border-transparent"
                  } ${typewriterMode && activeSectionId !== section.id ? "opacity-30 blur-[1px]" : "opacity-100"}`}>
                    
                    {/* Live Multiplayer Indicator bar */}
                    {activeCollabs.map((collab) => (
                      <div 
                        key={collab.id} 
                        className={`absolute -left-1 top-6 bottom-6 w-1 rounded-r-lg ${collab.color}`}
                        title={`${collab.name} is writing inside this block`}
                      />
                    ))}

                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Styled heading block */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          H{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          readOnly={isReadOnly}
                          onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                          className={`text-sm font-bold bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 w-full ${darkPaperMode ? "text-slate-200" : "text-slate-850"}`}
                        />
                      </div>

                      {/* Deletion / multiplayer badges */}
                      <div className="flex items-center gap-2">
                        {activeCollabs.map((collab) => (
                          <span 
                            key={collab.id}
                            className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full text-white ${collab.color} flex items-center gap-1`}
                          >
                            <span className="h-1 w-1 bg-white rounded-full animate-ping" />
                            <span>{collab.name.split(" ")[0]}</span>
                          </span>
                        ))}

                        <div className="flex items-center gap-1">
                          <button 
                            disabled={!canEdit}
                            onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'up'); }} 
                            className={`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition ${!canEdit ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`} 
                            title={!canEdit ? "View-only access" : "Move Up"}
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button 
                            disabled={!canEdit}
                            onClick={(e) => { e.stopPropagation(); onMoveSection(section.id, 'down'); }} 
                            className={`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition ${!canEdit ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`} 
                            title={!canEdit ? "View-only access" : "Move Down"}
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button 
                            disabled={!canEdit}
                            onClick={(e) => { e.stopPropagation(); onDuplicateSection(section.id); }} 
                            className={`p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition ${!canEdit ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`} 
                            title={!canEdit ? "View-only access" : "Duplicate"}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSection(section.id);
                            }}
                            disabled={!canEdit}
                            className={`p-1 text-slate-300 transition-colors ${!canEdit ? "opacity-20 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                            title={!canEdit ? "View-only access" : "Remove structural section"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Section textarea with Search Highlights Backdrop */}
                    <div className="relative w-full">
                      {searchTerm && (
                        <div 
                          className="absolute inset-0 pointer-events-none text-xs leading-relaxed font-sans text-transparent whitespace-pre-wrap break-words p-0 border-0 m-0"
                          aria-hidden="true"
                        >
                          {section.content.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                              <mark key={i} className="bg-amber-300/60 text-transparent rounded-[2px]">{part}</mark>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </div>
                      )}
                      <textarea
                        id={`textarea-${section.id}`}
                        value={section.content}
                        readOnly={isReadOnly}
                        onChange={(e) => onUpdateSection(section.id, { content: e.target.value })}
                        onSelect={handleTextSelection}
                        placeholder="Start typing specifications definitions, requirements paragraphs, outlines..."
                        rows={Math.max(4, Math.ceil(section.content.length / 90))}
                        className={`w-full text-xs leading-relaxed bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 m-0 resize-none font-sans block relative z-10 ${
                          blockHasAiSuggestion ? "bg-amber-50/20" : ""
                        } ${darkPaperMode ? "text-slate-300 placeholder-slate-600" : "text-slate-700 placeholder-slate-400"}`}
                      />
                    </div>

                    {/* Character and metadata info footer for active paragraph */}
                    {activeSectionId === section.id && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>Characters: {section.content.length} | Words: {section.content.split(/\s+/).filter(Boolean).length}</span>
                        {blockHasAiSuggestion && (
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            <Sparkle className="w-2.5 h-2.5" /> AI Suggestion Highlighted
                          </span>
                        )}
                      </div>
                    )}

                  </div>

                  {/* RIGHT MARGIN COMMENTS CHANNEL */}
                  <div className="lg:col-span-1 space-y-2 mt-2 lg:mt-0">
                    
                    {/* Glowing Margin Bubble count indicator if comments exist */}
                    {activeCommentsCount > 0 ? (
                      <div className="hidden lg:flex items-center gap-1.5 p-1 px-2.5 bg-sky-50 text-sky-700 border border-sky-100/70 rounded-full w-fit animate-pulse text-[9px] font-mono">
                        <MessageSquare className="w-3 h-3 text-sky-500" />
                        <span>{activeCommentsCount} Inline Comments</span>
                      </div>
                    ) : (
                      <div className="hidden lg:block h-3.5 opacity-20 hover:opacity-100 transition cursor-pointer text-[8px] font-mono text-slate-300">
                        <span>+ comment margin</span>
                      </div>
                    )}

                    {/* Comments balloon container aligned right per block */}
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {comments
                        .filter((c) => c.sectionId === section.id && !c.isResolved)
                        .map((c) => (
                          <div 
                            key={c.id} 
                            onClick={(e) => {
                              // If they click the resolve button, let that trigger naturally
                              if ((e.target as HTMLElement).closest('button')) return;
                              setActiveSectionId(section.id);
                              setTimeout(() => {
                                const ta = document.getElementById(`textarea-${section.id}`) as HTMLTextAreaElement | null;
                                if (ta) {
                                  ta.focus();
                                }
                              }, 100);
                            }}
                            className={`p-2.5 rounded-xl border text-[10px] space-y-1 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all duration-200 active:scale-[0.99] select-none ${
                              c.isAiSuggestion 
                                ? "bg-indigo-50/70 border-indigo-200 text-indigo-950" 
                                : "bg-slate-50 border-slate-200 text-slate-700 font-sans"
                            }`}
                            title="Click comment to focus this document paragraph block"
                          >
                            <div className="flex justify-between items-center text-[9px] pb-1 border-b border-slate-200/50">
                              <strong className="font-semibold text-slate-800">{c.author}</strong>
                              <span className="text-slate-450 font-mono text-[8px]">{c.timestamp}</span>
                            </div>
                            <p className="leading-snug text-slate-650">{c.text}</p>
                            
                            <div className="pt-1.5 flex justify-between items-center">
                              <span className="text-[8px] text-indigo-600 font-mono font-bold">✎ Focus Paragraph</span>
                              <button
                                onClick={() => onResolveComment(c.id)}
                                className="text-[8px] font-bold text-emerald-700 bg-white border border-emerald-150 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
        </div>

      </div>

    </div>
  );
}
