import React, { useState, useEffect } from "react";
import { X, Search, FileText, Zap, ChevronRight, CheckCircle2, ArrowRight, Trash2 } from "lucide-react";
import { DOCUMENT_TEMPLATES } from "./DocTemplates";
import { DocTemplate, Section } from "../types";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocTemplate) => void;
  currentSections?: Section[];
}

export default function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentSections
}: TemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Project" | "Research" | "Meeting" | "Technical" | "Business" | "Custom">("All");
  const [previewTemplate, setPreviewTemplate] = useState<DocTemplate>(DOCUMENT_TEMPLATES[0]);
  const [customTemplates, setCustomTemplates] = useState<DocTemplate[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("customTemplates");
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch(e) {}
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveCurrentAsTemplate = () => {
    if (!currentSections || currentSections.length === 0) return;
    const titlePrompt = window.prompt("Enter a name for your custom template:");
    if (!titlePrompt) return;
    const newTemplate: DocTemplate = {
      name: titlePrompt,
      description: "Custom user template saved from workspace.",
      sections: currentSections,
    };
    const updated = [newTemplate, ...customTemplates];
    setCustomTemplates(updated);
    localStorage.setItem("customTemplates", JSON.stringify(updated));
    setSelectedCategory("Custom");
  };

  const allTemplates = [...customTemplates.map(t => ({...t, isCustom: true})), ...DOCUMENT_TEMPLATES];

  // Filter templates based on queries & categories
  const filteredTemplates = allTemplates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === "All") return true;
    if (selectedCategory === "Custom") return (tpl as any).isCustom;
    if (selectedCategory === "Project") {
      return ["Project Proposal", "Product Requirements Document", "Sprint Planning Document"].includes(tpl.name);
    }
    if (selectedCategory === "Meeting") {
      return ["Meeting Notes"].includes(tpl.name);
    }
    if (selectedCategory === "Research") {
      return ["Research Report", "Study Notes"].includes(tpl.name);
    }
    if (selectedCategory === "Technical") {
      return ["Technical Documentation", "Software Design Document", "Bug Report"].includes(tpl.name);
    }
    if (selectedCategory === "Business") {
      return ["Resume / CV Draft", "Blog Article", "Business Email"].includes(tpl.name);
    }
    return true;
  });

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 outline-hidden shadow-2xl max-w-5xl w-full flex flex-col md:flex-row h-[90vh] md:h-[600px] overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Absolute close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Listing Rail */}
        <div className="w-full md:w-96 border-r border-slate-150 bg-slate-50 flex flex-col overflow-hidden">
          
          {/* Header block Search */}
          <div className="p-5 border-b border-slate-150 space-y-3.5">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </span>
                <span>Blueprints Gallery</span>
              </h3>
              <p className="text-[11px] text-slate-450">
                Bootstrap standard technical blueprints instantly or search template types.
              </p>
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blueprints (e.g. SDD, Proposal)..."
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category tabs pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(["All", "Project", "Research", "Meeting", "Technical", "Business", "Custom"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap cursor-pointer transition ${
                    selectedCategory === cat
                      ? "bg-slate-905 text-white shadow-xs"
                      : "bg-white text-slate-500 hover:bg-slate-200 border border-slate-150"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Create Custom Template Button */}
            {currentSections && currentSections.length > 0 && (
              <button 
                onClick={handleSaveCurrentAsTemplate}
                className="w-full mt-2 py-2 border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 text-xs font-bold rounded-xl cursor-pointer transition"
              >
                + Save Current Document as Template
              </button>
            )}
          </div>

          {/* List items area */}
          <div className="flex-grow overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                No templates found matching your criteria.
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                const isSelected = previewTemplate.name === tpl.name;
                return (
                  <div
                    key={tpl.name}
                    onClick={() => setPreviewTemplate(tpl)}
                    className={`p-3 rounded-xl border transition cursor-pointer text-xs flex items-center justify-between text-left ${
                      isSelected
                        ? "bg-white border-indigo-500 shadow-sm"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-350"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-450" />
                        <span>{tpl.name}</span>
                        {(tpl as any).isCustom && <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded">Custom</span>}
                      </h4>
                      <p className="text-[10px] text-slate-450 line-clamp-1">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {(tpl as any).isCustom && isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = customTemplates.filter(t => t.name !== tpl.name);
                            setCustomTemplates(updated);
                            localStorage.setItem("customTemplates", JSON.stringify(updated));
                          }}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition"
                          title="Delete Custom Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                        isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-350"
                      }`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Active Preview Sheet */}
        <div className="flex-grow p-6 md:p-8 bg-slate-900 text-white flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-4 overflow-hidden flex flex-col flex-1 pb-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Interactive Outline Preview Sheet
                </span>
                <h4 className="text-base font-extrabold text-slate-50">{previewTemplate.name}</h4>
              </div>

              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-bold border border-slate-700">
                {previewTemplate.sections.length} blocks structure
              </span>
            </div>

            <p className="text-slate-350 text-xs italic shrink-0">
              "{previewTemplate.description}"
            </p>

            {/* Simulated Live Sheet Paper layout */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 scrollbar-thin select-none">
              {previewTemplate.sections.map((sec, idx) => (
                <div key={sec.id} className="space-y-1 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <h5 className="text-[11px] font-bold text-indigo-400 font-mono tracking-wide uppercase">
                    Section {idx + 1}: {sec.title}
                  </h5>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Action Deploy button */}
          <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Bootstrap overwrites current doc sections. Ready to use.</span>
            </div>

            <button
              onClick={() => {
                onSelectTemplate(previewTemplate);
                onClose();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 shrink-0"
            >
              <span>Use This Template Outline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
