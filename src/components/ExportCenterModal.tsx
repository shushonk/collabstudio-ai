import React, { useState } from "react";
import { X, FileDown, Clipboard, Check, HelpCircle, FileText, Code, ToggleLeft } from "lucide-react";
import { Section, Comment, FactClaim, TaskItem } from "../types";
import { Exporter } from "../utils/exportUtils";

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: Section[];
  comments: Comment[];
  tasks: TaskItem[];
  citations: FactClaim[];
}

export default function ExportCenterModal({
  isOpen,
  onClose,
  title,
  sections,
  comments,
  tasks,
  citations
}: ExportCenterModalProps) {
  const [format, setFormat] = useState<"md" | "html" | "pdf" | "blog" | "email" | "presentation">("pdf");
  const [includeComments, setIncludeComments] = useState(false);
  const [includeTasks, setIncludeTasks] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compile formatting output depending on selected options and types
  const compileExportContent = (): string => {
    let result = "";
    const cleanTitle = title || "Active Specifications Document";

    // Header Meta Template block
    if (format === "md") {
      result += `# ${cleanTitle}\n`;
      result += `*Exported on ${new Date().toLocaleDateString()} via CollabStudio AI Workspace*\n\n`;
      
      sections.forEach(s => {
        result += `## ${s.title}\n\n${s.content}\n\n`;
      });

      if (includeCitations && citations.length > 0) {
        result += `### 📚 Bibliography & Sources\n`;
        citations.forEach((c, idx) => {
          result += `${idx + 1}. [${c.citationStyle}] *"${c.text}"* — ${c.citationText || "References Repository"}\n`;
        });
        result += `\n`;
      }

      if (includeTasks && tasks.length > 0) {
        result += `### 🎯 Actionable Requirements Checklist\n`;
        tasks.forEach(t => {
          result += `- [${t.isCompleted ? "x" : " "}] ${t.text} (Assignee: ${t.assignee || "Apex Staff"})\n`;
        });
        result += `\n`;
      }

      if (includeComments && comments.length > 0) {
        result += `### 💬 Collab Editorial Comments\n`;
        comments.filter(c => !c.isResolved).forEach(c => {
          result += `- *${c.author}*: "${c.text}" (*${c.timestamp}*)\n`;
        });
      }

    } else if (format === "html") {
      result += `<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 750px; margin: 40px auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02)">\n`;
      result += `  <header style="border-b: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">\n`;
      result += `    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">${cleanTitle}</h1>\n`;
      result += `    <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>\n`;
      result += `  </header>\n\n`;

      sections.forEach(s => {
        result += `  <section style="margin-bottom: 24px;">\n`;
        result += `    <h2 style="font-size: 18px; color: #1e3a8a; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">${s.title}</h2>\n`;
        result += `    <p style="line-height: 1.6; font-size: 14px; color: #334155;">${s.content.replace(/\n/g, "<br/>")}</p>\n`;
        result += `  </section>\n\n`;
      });

      if (includeCitations && citations.length > 0) {
        result += `  <div style="margin-top: 32px; padding-top: 16px; border-top: 2px solid #e2e8f0;">\n`;
        result += `    <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 12px;">Bibliography</h3>\n`;
        result += `    <ol style="font-size: 12px; color: #475569; padding-left: 20px;">\n`;
        citations.forEach(c => {
          result += `      <li style="margin-bottom: 6px;"><strong>[${c.citationStyle}]</strong> <em>"${c.text}"</em> — ${c.citationText || "Verified Reference"}</li>\n`;
        });
        result += `    </ol>\n`;
        result += `  </div>\n`;
      }

      if (includeTasks && tasks.length > 0) {
        result += `  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">\n`;
        result += `    <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 12px;">Requirements Checklist</h3>\n`;
        result += `    <ul style="list-style: none; padding: 0; font-size: 12px; color: #475569;">\n`;
        tasks.forEach(t => {
          result += `      <li style="margin-bottom: 6px;">${t.isCompleted ? "✅" : "⬜"} ${t.text} (${t.assignee || "Unassigned"})</li>\n`;
        });
        result += `    </ul>\n`;
        result += `  </div>\n`;
      }

      result += `</div>`;

    } else if (format === "pdf") {
      // Mock formatting showing printing page boundaries
      result += `========================================================================\n`;
      result += `       PORTABLE SPECS SHEET DOCUMENT (MOCK PDF EXPORTER ENGINE)        \n`;
      result += `========================================================================\n`;
      result += `TITLE     : ${cleanTitle.toUpperCase()}\n`;
      result += `DATE      : ${new Date().toLocaleDateString()}\n`;
      result += `AUTHORITY : Team Multi-Collaboration Cloud Protocol\n`;
      result += `PAGES     : 1 of 1 Ready\n`;
      result += `------------------------------------------------------------------------\n\n`;

      sections.forEach(s => {
        result += `◆ ${s.title.toUpperCase()}\n`;
        result += `  ${s.content}\n\n`;
      });

      if (includeCitations && citations.length > 0) {
        result += `----------------------- SOURCES & BIBLIOGRAPHIES -----------------------\n`;
        citations.forEach((c, idx) => {
          result += `[${idx+1}] [${c.citationStyle}] "${c.text}"\n    -> ${c.citationText || "Corporate Repository"}\n`;
        });
        result += `\n`;
      }

      if (includeTasks && tasks.length > 0) {
        result += `--------------------------- ACTIONABLE STEPS ---------------------------\n`;
        tasks.forEach(t => {
          result += `[${t.isCompleted ? "X" : " "}] ${t.text} | Assigned: ${t.assignee || "Primary"}\n`;
        });
        result += `\n`;
      }

      result += `=========================== END OF DOCUMENT ===========================`;

    } else if (format === "blog") {
      result += `📢 BLOG SYNDICATION DRAFT: ${cleanTitle.toUpperCase()}\n\n`;
      result += `Writing live from our team workspace. Let's unpack the core specs detailing this release.\n\n`;
      sections.forEach(s => {
        result += `💡 INSIGHT: ${s.title}\n`;
        result += `${s.content.substring(0, 200)}...\n\n`;
      });
      result += `Read more inside our primary interactive specifications portal!`;

    } else if (format === "email") {
      result += `To: team-updates@company.io\n`;
      result += `Subject: Specifications Release Build Draft — ${cleanTitle}\n\n`;
      result += `Hello Colleagues,\n\nPlease see the compiled specifications build drafted on our collaborative editor for review:\n\n`;
      sections.forEach(s => {
        result += `⭐ ${s.title}:\n"${s.content}"\n\n`;
      });
      result += `Best regards,\nCorporate Engineering Staff`;

    } else if (format === "presentation") {
      result += `# PRESENTATION DECK SLIDES OUTLINE\n`;
      result += `--- SLIDE 1: General Welcome ---\n`;
      result += `💻 TITLE: ${cleanTitle}\n`;
      result += `👥 Authoring Team: CollabStudio Multi-Author Environment\n\n`;
      
      sections.forEach((s, idx) => {
        result += `--- SLIDE ${idx + 2}: ${s.title} ---\n`;
        result += `🎯 HIGHLIGHT FOCUSPOINT:\n`;
        s.content.split('.').filter(Boolean).slice(0, 3).forEach(sentence => {
          result += `- ${sentence.trim()}\n`;
        });
        result += `\n`;
      });
    } else if (format === "json") {
      result = JSON.stringify({
        title: cleanTitle,
        exportDate: new Date().toISOString(),
        sections,
        tasks: includeTasks ? tasks : [],
        comments: includeComments ? comments : [],
        citations: includeCitations ? citations : [],
      }, null, 2);
    }

    return result;
  };

  const handleDownload = () => {
    const content = compileExportContent();
    const mimeType = format === "json" ? "application/json" : "text/plain";
    const extension = format === "json" ? "json" : format === "md" ? "md" : "txt";
    Exporter.download(`${title.toLowerCase().replace(/\s+/g, '-')}.${extension}`, content, mimeType);
    onClose();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(compileExportContent()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full flex flex-col md:flex-row h-[90vh] md:h-[650px] overflow-hidden relative animate-scale-up">
        
        {/* Absolute close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Option Rail */}
        <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="space-y-1">
              <div className="p-2 bg-slate-900 text-white rounded-xl w-fit">
                <FileDown className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Export Center</h3>
              <p className="text-xs text-slate-500">
                Compile, format, and download your specifications with advanced option layers.
              </p>
            </div>

            {/* Formats selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-450 uppercase">
                Download Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "pdf", label: "📄 PDF standard" },
                  { id: "md", label: "✍️ Markdown" },
                  { id: "html", label: "🌐 HTML mark" },
                  { id: "json", label: "🖧 JSON backup" },
                  { id: "blog", label: "📢 Blog draft" },
                  { id: "email", label: "✉️ Email brief" },
                  { id: "presentation", label: "📊 Slides Deck" }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`px-2.5 py-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                      format === fmt.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-650 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Toggles options */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-450 uppercase block">
                Footnotes & Indexes
              </label>

              <div className="flex items-center justify-between text-xs font-medium text-slate-750">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-500" />
                  Include active citations
                </span>
                <input
                  type="checkbox"
                  checked={includeCitations}
                  onChange={(e) => setIncludeCitations(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer border-slate-300"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-755">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-500" />
                  Append requirements lists
                </span>
                <input
                  type="checkbox"
                  checked={includeTasks}
                  onChange={(e) => setIncludeTasks(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer border-slate-300"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-755">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-500" />
                  Include inline comments
                </span>
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer border-slate-300"
                />
              </div>
            </div>

          </div>

          {/* Download Action */}
          <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors text-center"
            >
              📥 Download Document File
            </button>
            <div className="text-center font-mono text-[9px] text-slate-400">
              MIME: {format === "md" ? "text/markdown" : format === "html" ? "text/html" : "text/plain"}
            </div>
          </div>

        </div>

        {/* Right Preview Box */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden bg-slate-900 border-l border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-indigo-400" />
              Responsive Render Preview Box
            </span>

            <button
              onClick={handleCopyToClipboard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Copy raw content</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive display */}
          <div className="flex-1 my-4 bg-slate-950 rounded-2xl p-4 overflow-y-auto border border-slate-850 select-all scrollbar-thin">
            <pre className="text-slate-305 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
              {compileExportContent()}
            </pre>
          </div>

          <div className="flex items-center gap-2 bg-slate-850 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="leading-snug">
              Previews update dynamically. This represents the final physical compilation block that will be exported to users.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
