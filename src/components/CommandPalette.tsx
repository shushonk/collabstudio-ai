import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, FileText, Settings, ShieldCheck, HelpCircle, Eye, Command, Zap } from "lucide-react";
import { Section } from "../types";

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  shortcut?: string;
  category: "Actions" | "Roles" | "Panels" | "Documents";
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  documents: Array<{ id: string; title: string }>;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onOpenTemplates: () => void;
  onToggleDashboard: () => void;
  onTriggerAnalyze: () => void;
  setFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentRole: (role: any) => void;
  onOpenShortcuts: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  documents,
  onSelectDoc,
  onNewDoc,
  onOpenTemplates,
  onToggleDashboard,
  onTriggerAnalyze,
  setFocusMode,
  setCurrentRole,
  onOpenShortcuts
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Define our available workspace command objects
  const commands: CommandItem[] = [
    // 1. Actions category
    {
      id: "cmd-new-doc",
      title: "Create New Blank Document",
      subtitle: "Bootstrap a fresh technical specification sheet",
      shortcut: "Ctrl + N",
      category: "Actions",
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onNewDoc();
        onClose();
      }
    },
    {
      id: "cmd-run-audit",
      title: "Trigger AI Quality Audit Analysis",
      subtitle: "Execute Gemini compliance check and score documents",
      shortcut: "Ctrl + G",
      category: "Actions",
      icon: <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />,
      action: () => {
        onTriggerAnalyze();
        onClose();
      }
    },
    {
      id: "cmd-open-templates",
      title: "Browse Templates Gallery",
      subtitle: "Load structural technical specs outlines",
      shortcut: "Ctrl + T",
      category: "Actions",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: () => {
        onOpenTemplates();
        onClose();
      }
    },

    // 2. Roles category
    {
      id: "role-owner",
      title: "Set Role to: 👑 Owner Privileges",
      subtitle: "Unrestricted writes and administrative merges",
      category: "Roles",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      action: () => {
        setCurrentRole("Owner");
        onClose();
      }
    },
    {
      id: "role-viewer",
      title: "Set Role to: 🔒 Read-Only Viewer",
      subtitle: "Temporarily lock editing buffers to prevent accidents",
      category: "Roles",
      icon: <Eye className="w-4 h-4 text-slate-500" />,
      action: () => {
        setCurrentRole("Viewer");
        onClose();
      }
    },

    // 3. Views / Panels
    {
      id: "cmd-toggle-dash",
      title: "Toggle Bottom AI Analytics Desk",
      subtitle: "Reveal metrics, citation lists, and task extractors",
      category: "Panels",
      icon: <Settings className="w-4 h-4 text-purple-500" />,
      action: () => {
        onToggleDashboard();
        onClose();
      }
    },
    {
      id: "cmd-focus-mode",
      title: "Toggle Distraction-Free Focus Mode",
      subtitle: "Hide side panels and center workspace editor",
      shortcut: "Ctrl + F",
      category: "Panels",
      icon: <Eye className="w-4 h-4 text-sky-500" />,
      action: () => {
        setFocusMode(prev => !prev);
        onClose();
      }
    },
    {
      id: "cmd-open-shortcuts",
      title: "Display Keyboard Shortcuts Guide",
      subtitle: "Recall layout triggers and hotkeys list",
      shortcut: "Ctrl + /",
      category: "Panels",
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      action: () => {
        onOpenShortcuts();
        onClose();
      }
    }
  ];

  // Append load documents as searchable items dynamically!
  documents.forEach((doc) => {
    commands.push({
      id: `switch-doc-${doc.id}`,
      title: `Switch Workspace to: "${doc.title}"`,
      subtitle: "Load the drafted specification sections",
      category: "Documents",
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => {
        onSelectDoc(doc.id);
        onClose();
      }
    });
  });

  // Filter commands match input
  const filtered = commands.filter(item => {
    const term = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.subtitle.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-start justify-center z-[100] p-4 pt-[15vh] backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-xl w-full flex flex-col max-h-[500px] animate-scale-up">
        
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a workspace command or document name to search..."
            className="flex-1 text-xs text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
          />
          <div className="flex items-center gap-1 bg-slate-200/80 px-2 py-1 rounded text-[10px] font-mono text-slate-500">
            <Command className="w-3 h-3" />
            <span className="font-bold">K</span>
          </div>
        </div>

        {/* Search results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3.5 max-h-[350px] scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1 pb-10">
              <span className="text-base">🔍</span>
              <p className="font-semibold text-slate-600">No outcomes match search criteria</p>
              <p className="text-[11px] text-slate-400">Refine search text or try 'Viewer' or 'Templates'.</p>
            </div>
          ) : (
            // Group outcomes by category tags
            (["Actions", "Roles", "Panels", "Documents"] as const).map(cat => {
              const catItems = filtered.filter(f => f.category === cat);
              if (catItems.length === 0) return null;
              
              return (
                <div key={cat} className="space-y-1">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase py-1 px-3 block">
                    {cat} Group
                  </span>
                  {catItems.map((item) => {
                    // Calculate index in filtered list to highlight accurately
                    const idx = filtered.indexOf(item);
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => item.action()}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                          isSelected 
                            ? "bg-slate-900 border border-slate-900 text-white shadow-sm scale-[1.01]" 
                            : "hover:bg-slate-50 text-slate-750 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {item.icon}
                          </div>
                          <div className="space-y-0.5 text-left">
                            <span className="font-bold block leading-tight">{item.title}</span>
                            <span className={`text-[10px] block leading-none ${isSelected ? "text-slate-400" : "text-slate-450"}`}>
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {item.shortcut && (
                          <kbd className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${isSelected ? "bg-slate-800 text-indigo-300 border border-slate-700" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard instructions foot */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Navigate with <kbd>↑↓</kbd> keys</span>
          <span>Execute via <kbd>Enter</kbd></span>
          <span>Dismiss with <kbd>Esc</kbd></span>
        </div>

      </div>
    </div>
  );
}
