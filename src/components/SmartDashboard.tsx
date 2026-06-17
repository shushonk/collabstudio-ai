import React, { useState } from "react";
import { 
  FileText, CheckCircle, AlertTriangle, Users, Play, Check, Plus, Trash2, 
  Download, Award, Sparkles, Clock, ListTodo, HelpCircle, FileDown, Clipboard,
  ChevronRight, BookmarkCheck, RefreshCw, LayoutTemplate, ShieldCheck, Mail, Calendar, Video
} from "lucide-react";
import { Section, Comment, FactClaim, TaskItem, DocTemplate } from "../types";
import { DOCUMENT_TEMPLATES } from "./DocTemplates";

interface SmartDashboardProps {
  sections: Section[];
  onApplyTemplate: (template: DocTemplate) => void;
  comments: Comment[];
  onAddComment: (text: string, isAi?: boolean) => void;
  onResolveComment: (id: string) => void;
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (text: string, dueDate?: string, assignee?: string) => void;
  onDeleteTask: (id: string) => void;
  onExtractTasksByAi: () => void;
  citations: FactClaim[];
  onAddCitationMarker: (text: string) => void;
  onChangeCitationStyle: (id: string, style: 'IEEE' | 'APA' | 'MLA' | 'Simple') => void;
  onRemoveCitation: (id: string) => void;
  onRunCitationHelper: () => void;
  currentRole: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer";
  onChangeRole: (role: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer") => void;
  onTriggerMeetingMinutes: (transcript: string) => void;
  onTriggerDiffCompare: (revTitle: string, userText: string) => void;
  addToast: (msg: string, type?: any) => void;
}

export default function SmartDashboard({
  sections,
  onApplyTemplate,
  comments,
  onAddComment,
  onResolveComment,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onExtractTasksByAi,
  citations,
  onAddCitationMarker,
  onChangeCitationStyle,
  onRemoveCitation,
  onRunCitationHelper,
  currentRole,
  onChangeRole,
  onTriggerMeetingMinutes,
  onTriggerDiffCompare,
  addToast
}: SmartDashboardProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "score" | "comments" | "citations" | "tasks" | "meeting" | "export">("score");
  
  // Local sub-states
  const [newCommentText, setNewCommentText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newMeetingTranscript, setNewMeetingTranscript] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "html" | "markdown" | "blog" | "presentation" | "email">("pdf");
  const [customCitationText, setCustomCitationText] = useState("");

  // Simulated AI score calculations
  const totalWords = sections.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0);
  const totalChars = sections.reduce((sum, s) => sum + s.content.length, 0);
  
  // Math-based quality index
  const clarityBase = Math.min(100, Math.max(45, 45 + (sections.length * 8) - (comments.filter(c => !c.isResolved).length * 4)));
  const structureBase = Math.min(100, Math.max(50, 45 + (sections.length * 12)));
  const actionabilityBase = Math.min(100, Math.max(40, 35 + (tasks.length * 10)));
  const aggregateScore = Math.round((clarityBase + structureBase + actionabilityBase + 85) / 4);

  const handleTemplateSelect = (name: string) => {
    const template = DOCUMENT_TEMPLATES.find(t => t.name === name);
    if (template) {
      onApplyTemplate(template);
    }
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText, false);
    setNewCommentText("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText, "Next Monday", newTaskAssignee || "Unassigned");
    setNewTaskText("");
    setNewTaskAssignee("");
  };

  const generateExportPreview = (): string => {
    const titleText = "Active Specifications Document";
    if (exportFormat === "markdown") {
      return `# ${titleText}\n\n` + sections.map(s => `## ${s.title}\n\n${s.content}`).join("\n\n");
    } else if (exportFormat === "html") {
      return `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">\n  <h1 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">${titleText}</h1>\n` + 
        sections.map(s => `  <div style="margin-top: 16px;">\n    <h3 style="color: #3b82f6;">${s.title}</h3>\n    <p style="line-height: 1.6; font-size: 14px;">${s.content}</p>\n  </div>`).join("\n") + 
        "\n</div>";
    } else if (exportFormat === "blog") {
      return `📢 BLOG INSIGHT: HOW TO STRUCTURE TELEMETRY SYSTEMS\n\n` + 
        `Have you ever wondered about distributed network topologies? Let's dive in.\n\n` +
        sections.map(s => `📝 [Insight Part] ${s.title}\n${s.content.substring(0, 150)}...`).join("\n\n");
    } else if (exportFormat === "email") {
      return `To: core-team@company.io\nSubject: Specification Release Draft - ${titleText}\n\nHi Team,\n\nPlease see the compiled definitions summary from our collaborative server:\n\n` + 
        sections.map(s => `👉 ${s.title}:\n${s.content}`).join("\n\n") + 
        `\n\nSent via CollabStudio AI Workspace.`;
    } else if (exportFormat === "presentation") {
      return `--- SLIDE 1: Title ---\n💻 TITLE: ${titleText}\n👥 Subtitle: Powered by real-time multi-user automation\n\n` + 
        sections.map((s, i) => `--- SLIDE ${i+2}: ${s.title} ---\n⚡ KEY FOCUSPOINT:\n- ${s.content.split('.').filter(Boolean).slice(0, 2).map(x => x.trim()).join('\n- ')}`).join("\n\n");
    } else { // default PDF preview mock
      return `==========================================\n             PORTABLE DOCUMENT FORMAT      \n==========================================\n` +
        `TITLE: ${titleText}\nDATE: ${new Date().toLocaleDateString()}\nAUTHORITY: Multi-Author Team\n\n` +
        sections.map(s => `◆ ${s.title.toUpperCase()}\n------------------------------------------\n${s.content}\n\n`).join("\n");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mt-6">
      
      {/* Upper Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-1.5 cursor-pointer">
          <Award className="w-5 h-5 text-sky-600 animate-spin-slow" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            AI Document Intelligent Dashboard
          </span>
        </div>

        {/* Dynamic score summary bubble */}
        <div className="flex items-center gap-2 bg-white/80 border border-slate-200 px-3 py-1 rounded-full text-xs font-mono">
          <span className="text-slate-400">Quality Score:</span>
          <strong className={`font-bold ${aggregateScore > 80 ? "text-emerald-700" : "text-amber-700"}`}>{aggregateScore}/100</strong>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row min-h-[420px]">
        
        {/* Left Side Tab bar */}
        <div className="w-full lg:w-56 border-r border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5 flex-shrink-0">
          <button
            onClick={() => setActiveTab("templates")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "templates" 
                ? "bg-sky-50 text-sky-700 border border-sky-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-sky-500" />
            <span>Document Templates</span>
          </button>

          <button
            onClick={() => setActiveTab("score")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "score" 
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4 text-indigo-500" />
            <span>AI Quality Auditor</span>
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "comments" 
                ? "bg-purple-50 text-purple-700 border border-purple-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-purple-500" />
            <span>AI Comments System</span>
            {comments.filter(c => !c.isResolved).length > 0 && (
              <span className="ml-auto bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                {comments.filter(c => !c.isResolved).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("citations")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "citations" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-emerald-500" />
            <span>AI Citation Helper</span>
            {citations.length > 0 && (
              <span className="ml-auto bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                {citations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "tasks" 
                ? "bg-rose-50 text-rose-700 border border-rose-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <ListTodo className="w-4 h-4 text-rose-500" />
            <span>AI Task Extractor</span>
            {tasks.filter(t => !t.isCompleted).length > 0 && (
              <span className="ml-auto bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                {tasks.filter(t => !t.isCompleted).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("meeting")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "meeting" 
                ? "bg-amber-50 text-amber-700 border border-amber-100 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Video className="w-4 h-4 text-amber-500" />
            <span>AI Meeting Mode</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-xl cursor-pointer transition-all ${
              activeTab === "export" 
                ? "bg-slate-800 text-white shadow-xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>Smart Export Panel</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 p-5 md:p-6 bg-white min-w-0">
          
          {/* TAB 1: TEMPLATE GALLERY */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <LayoutTemplate className="w-4.5 h-4.5 text-sky-600" />
                    Document Structure Templates
                  </h3>
                  <p className="text-[11px] text-slate-500">Inject structured starter modules based on standard corporate design paradigms.</p>
                </div>
                <div className="bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200 px-2 py-1 rounded-lg">
                  ⚠️ Applying replaces active canvas
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {DOCUMENT_TEMPLATES.map((tpl) => (
                  <div 
                    key={tpl.name}
                    className="border border-slate-200/80 rounded-xl p-3.5 hover:border-sky-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 bg-slate-50/20"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 font-mono block">
                        {tpl.name}
                      </span>
                      <p className="text-[11px] text-slate-550 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTemplateSelect(tpl.name)}
                      className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-sky-500 text-sky-700 text-[11px] font-semibold rounded-lg text-center cursor-pointer transition-colors"
                    >
                      Use Template Outline
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT QUALITY SCORE */}
          {activeTab === "score" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-indigo-600" />
                    AI Document Quality Score Overview
                  </h3>
                  <p className="text-[11px] text-slate-500">Dynamic system compliance checks evaluating editorial performance parameters.</p>
                </div>
                <button
                  onClick={() => addToast("Scanned Document! Document quality state is fully synchronized.", "success")}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Update Audit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                
                {/* Speedometer card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Aggregate Integrity</span>
                  
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent border-r-transparent animate-spin-slow" />
                    <div className="text-center">
                      <span className="text-2xl font-black font-mono text-slate-800">{aggregateScore}</span>
                      <span className="block text-[9px] text-slate-400">Of 100</span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Highly Professional
                  </span>
                </div>

                {/* Criteria Grid */}
                <div className="col-span-2 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider block">Dimensional Performance</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-semibold">1. Clarity:</span>
                        <strong className="text-slate-700">{clarityBase}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${clarityBase}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-semibold">2. Structure:</span>
                        <strong className="text-slate-700">{structureBase}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-sky-500 h-1 rounded-full" style={{ width: `${structureBase}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-semibold">3. Actionability:</span>
                        <strong className="text-slate-700">{actionabilityBase}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${actionabilityBase}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-semibold">4. Collaboration:</span>
                        <strong className="text-slate-700">92%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-purple-500 h-1 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Suggestions Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/30 border border-emerald-150 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 font-mono uppercase tracking-wider block">✨ Project Strengths</span>
                  <ul className="text-slate-650 text-xs space-y-1.5 list-disc list-inside">
                    <li>Strict adherence to credentials private server-side security.</li>
                    <li>Strong active multi-user coordinate synchronization on sections.</li>
                    <li>Professional, coherent technical tone maintained globally.</li>
                  </ul>
                </div>

                <div className="bg-amber-50/30 border border-amber-150 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-amber-850 font-mono uppercase tracking-wider block">⚠️ Weak Areas & fixes</span>
                  <ul className="text-slate-650 text-xs space-y-1.5 list-disc list-inside">
                    <li>Some GPS filter duplicates identified inside Section 2 specifications.</li>
                    <li>Action items list could be expanded for operational clarity.</li>
                    <li>Factual definitions are not backed by indexed citation links.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SMART COMMENTS */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4.5 h-4.5 text-purple-600" />
                    AI Collaborative Comment System
                  </h3>
                  <p className="text-[11px] text-slate-500">Provide review tags or generate supportive edit suggestions to align drafts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = sections[0]?.content || "Active text specs";
                    const promptText = `Generate a polite constructive review comment for: "${text}"`;
                    onAddComment(`[AI SUGGESTION] Consider formalizing parameters mapping to comply with event schema constraints.`, true);
                  }}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-[11px] font-semibold text-purple-700 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request AI Review Hint</span>
                </button>
              </div>

              {/* Comment Thread Cards List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/55 rounded-xl border border-slate-100">No active review comments logged yet. Use the prompt above to add first comment thread!</p>
                ) : (
                  comments.map((comm) => (
                    <div 
                      key={comm.id}
                      className={`p-3 rounded-xl border ${comm.isResolved ? 'bg-slate-50 text-slate-400 border-slate-100' : comm.isAiSuggestion ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'} flex items-start justify-between gap-3`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
                          <span className={`font-bold ${comm.isAiSuggestion ? 'text-indigo-700' : 'text-slate-700'}`}>
                            {comm.author}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{comm.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-sans leading-relaxed">
                          {comm.text}
                        </p>
                      </div>

                      {!comm.isResolved && (
                        <button
                          onClick={() => onResolveComment(comm.id)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-[10px] font-bold text-slate-500 rounded border border-slate-200/80 cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handleCreateComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Post direct manual review comment or team feedback thread..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CITATION HELPER */}
          {activeTab === "citations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-emerald-600" />
                    AI Claims & Citation Helper
                  </h3>
                  <p className="text-[11px] text-slate-500">Scan parameters or factual claims that warrant professional citation guidelines.</p>
                </div>
                <button
                  onClick={onRunCitationHelper}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold text-emerald-700 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Scan Content for Facts</span>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Disclaimer:</strong> AI cannot automatically audit outer real-world facts unless you provide direct background reading material files. Ensure humans verify claims before publishing.
                </p>
              </div>

              <div className="space-y-1.5 scrollbar-thin overflow-y-auto max-h-48 pr-1">
                {citations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/50 border border-slate-100 rounded-xl">No active claims detected. Click continuous scan to generate references checklist.</p>
                ) : (
                  citations.map((cite) => (
                    <div key={cite.id} className="p-3 bg-slate-50 rounded-xl border border-slate-205 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 bg-white p-2.5 rounded border border-slate-100 flex-1">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400">Claim Statement:</span>
                          <p className="text-slate-800 leading-relaxed font-sans">{cite.text}</p>
                        </div>

                        {cite.citationText && (
                          <div className="pt-1.5 border-t border-slate-100 mt-1.5 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-700 font-mono">
                              Style: [{cite.citationStyle}] {cite.citationText}
                            </span>
                            
                            <select
                              value={cite.citationStyle}
                              onChange={(e) => onChangeCitationStyle(cite.id, e.target.value as any)}
                              className="text-[10px] font-mono border border-slate-250 rounded px-1.5 py-0.5 bg-slate-50 cursor-pointer"
                            >
                              <option value="APA">APA Style</option>
                              <option value="IEEE">IEEE Format</option>
                              <option value="MLA">MLA Spec</option>
                              <option value="Simple">Web link</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveCitation(cite.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add custom citation mock tool */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCitationText}
                  onChange={(e) => setCustomCitationText(e.target.value)}
                  placeholder="Paste manual fact/claim string to flag on selection..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customCitationText.trim()) return;
                    onAddCitationMarker(customCitationText);
                    setCustomCitationText("");
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Pin citation
                </button>
              </div>

            </div>
          )}

          {/* TAB 5: TASK EXTRACTOR */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ListTodo className="w-4.5 h-4.5 text-rose-600" />
                    AI Task & Checklist Extractor
                  </h3>
                  <p className="text-[11px] text-slate-500">Extract technical specs, requirements, or assignments into a workflow checklist.</p>
                </div>
                <button
                  onClick={onExtractTasksByAi}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-[11px] font-semibold text-rose-700 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract from Specs</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/50 border border-slate-100 rounded-xl">No active tasks detected yet. Click "Extract from Specs" to scrape paragraphs or insert manual items below.</p>
                ) : (
                  tasks.map((tsk) => (
                    <div 
                      key={tsk.id} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        tsk.isCompleted 
                          ? "bg-slate-50 text-slate-400 border-slate-150 line-through" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={tsk.isCompleted}
                          onChange={() => onToggleTask(tsk.id)}
                          className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold">{tsk.text}</p>
                          <p className="text-[9px] text-slate-450 leading-none mt-1 font-mono">
                            Assignee: {tsk.assignee || "Primary Analyst"} | Target: {tsk.dueDate || "ASAP"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(tsk.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add manual todo field */}
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Insert explicit technical requirement or milestone..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                />
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="User (e.g. Leo)"
                  className="w-24 text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: AI MEETING MODE */}
          {activeTab === "meeting" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Video className="w-4.5 h-4.5 text-amber-500" />
                  AI Meeting Mode (Transcript Analyzer)
                </h3>
                <p className="text-[11px] text-slate-500">Paste transcripts or meeting logs here. Gemini automatically processes outcomes, decisions, checklist items, and drafted followups.</p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={newMeetingTranscript}
                  onChange={(e) => setNewMeetingTranscript(e.target.value)}
                  placeholder="[TRANSCRIPT LINE SAMPLE] Leo: We absolutely must enforce TLS 1.3 on port 8080. Sarah: Agreed, let's document port parameters and notify the steering team by Friday. Alex: Perfect, I will handle security clearance procedures..."
                  rows={4}
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-55"
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMeetingTranscript(
                        "Leo: We absolutely must enforce TLS 1.3 on port 8080.\n" +
                        "Sarah: Agreed, let's document port parameters and notify the steering team by Friday.\n" +
                        "Alex: Perfect, I will handle security clearance procedures."
                      );
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-600 border border-slate-300"
                  >
                    Load Mock Transcript
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newMeetingTranscript.trim()) {
                        addToast("Paste the transcription text first.", "warning");
                        return;
                      }
                      onTriggerMeetingMinutes(newMeetingTranscript);
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Assemble Minutes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EXPORT FORMAT PANEL */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileDown className="w-4.5 h-4.5 text-slate-700" />
                    Document formatting & Export desk
                  </h3>
                  <p className="text-[11px] text-slate-500">View responsive style layouts or simulate final publication output ready files.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-mono">
                  ✨ Previews Enabled
                </div>
              </div>

              {/* Format Selectors */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "pdf", label: "PDF Format" },
                  { id: "html", label: "HTML markup" },
                  { id: "markdown", label: "Markdown" },
                  { id: "blog", label: "Blog Outline" },
                  { id: "email", label: "Client Email" },
                  { id: "presentation", label: "Slides Layout" }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id as any)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      exportFormat === fmt.id 
                        ? "bg-slate-800 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Mock Preview Canvas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Export Render Preview</span>
                  <button
                    onClick={() => {
                      const text = generateExportPreview();
                      navigator.clipboard.writeText(text);
                      addToast("Successfully copied export specifications preview to clipboard.", "success");
                    }}
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer bg-sky-50 px-2.5 py-1 rounded"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy exported context</span>
                  </button>
                </div>
                
                <pre className="p-4 bg-slate-900 text-slate-200 text-xs rounded-2xl overflow-x-auto font-mono max-h-56 leading-relaxed whitespace-pre-wrap select-all">
                  {generateExportPreview()}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
