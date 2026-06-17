import React from "react";
import { 
  FileText, LayoutTemplate, Star, Trash2, Sparkles, Plus, 
  Settings, FolderOpen, PanelLeftClose, PanelLeftOpen, Shield,
  Layers, Circle, Activity, ChevronRight, RotateCcw
} from "lucide-react";
import { Document, Section } from "../types";

interface LeftSidebarProps {
  documents: Document[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onOpenTemplates: () => void;
  showDashboard: boolean;
  onToggleDashboard: () => void;
  currentRole: string;
  activeTab: "recent" | "shared" | "starred" | "trash";
  setActiveTab: (tab: "recent" | "shared" | "starred" | "trash") => void;
  onRestoreDoc: (id: string) => void;
  onDeletePermanent: (id: string) => void;
}

export default function LeftSidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onNewDoc,
  onOpenTemplates,
  showDashboard,
  onToggleDashboard,
  currentRole,
  activeTab,
  setActiveTab,
  onRestoreDoc,
  onDeletePermanent
}: LeftSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const filteredDocs = React.useMemo(() => {
    switch (activeTab) {
      case "starred": return documents.filter(d => d.isStarred && !d.isTrashed);
      case "trash": return documents.filter(d => d.isTrashed);
      case "shared": return documents.filter(d => d.ownerId !== "user-1" && !d.isTrashed);
      default: return documents.filter(d => !d.isTrashed);
    }
  }, [documents, activeTab]);

  return (
    <div 
      className={`bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-850 transition-all duration-300 relative ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse button tab */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 bg-slate-800 text-slate-300 p-1 rounded-full border border-slate-700 hover:text-white transition-colors z-30 shadow-md cursor-pointer"
        title={collapsed ? "Expand Workspace Menu" : "Collapse Workspace Menu"}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-3.5 h-3.5" />
        ) : (
          <PanelLeftClose className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Workspace Header Signature */}
      <div className="p-4 border-b border-slate-850 flex items-center justify-between overflow-hidden">
        {!collapsed && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono block">
              Workspace Scope
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">
                CollabStudio Cloud
              </h2>
            </div>
          </div>
        )}
        <Layers className={`w-5 h-5 text-indigo-400 ${collapsed ? "mx-auto" : ""}`} />
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        
        {/* Core Actions */}
        <div className="space-y-1">
          <button
            onClick={onNewDoc}
            className="w-full flex items-center gap-3 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-sm"
            title="Create New Blank Document"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New Document</span>}
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            title="Open Document Presets Gallery"
          >
            <LayoutTemplate className="w-4 h-4 text-sky-400 flex-shrink-0" />
            {!collapsed && <span>Templates Gallery</span>}
          </button>
        </div>

        {/* Permanent Document Lists */}
        <div>
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {activeTab} ({filteredDocs.length})
              </h3>
            </div>
          )}
          <div className="space-y-1">
            {filteredDocs.length === 0 ? (
              <div className="px-3 py-4 text-center rounded-xl border border-dashed border-slate-800">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Empty State</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">No documents found here.</p>
              </div>
            ) : filteredDocs.map((doc) => {
              const isActive = doc.id === activeDocId;
              const totalWords = doc.sections.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0);

              return (
                <div key={doc.id} className="group relative">
                  <button
                    onClick={() => onSelectDoc(doc.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive 
                        ? "bg-slate-800 text-white font-semibold ring-1 ring-slate-700" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                    }`}
                    title={doc.title}
                  >
                    <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    {!collapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="truncate text-slate-250 leading-snug">{doc.title}</p>
                          {doc.userPermission && (
                            <span className={`flex-shrink-0 text-[8px] font-mono font-bold px-1 rounded uppercase tracking-tighter border ${
                              doc.userPermission === "Owner" ? "bg-indigo-900/50 text-indigo-400 border-indigo-800" :
                              doc.userPermission === "Editor" ? "bg-emerald-900/50 text-emerald-400 border-emerald-800" :
                              doc.userPermission === "Commenter" ? "bg-sky-900/50 text-sky-400 border-sky-800" :
                              "bg-amber-900/50 text-amber-400 border-amber-800"
                            }`}>
                              {doc.userPermission === "Commenter" ? "Comm." : doc.userPermission === "Viewer" ? "Read" : doc.userPermission}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 block">
                          {totalWords} terms • {doc.sections.length} blocks
                        </span>
                      </div>
                    )}
                    {isActive && !collapsed && (
                      <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    )}
                  </button>
                  
                  {activeTab === "trash" && !collapsed && (
                    <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onRestoreDoc(doc.id); }} className="p-1 bg-slate-700 hover:bg-emerald-600 rounded text-white" title="Restore"><RotateCcw className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePermanent(doc.id); }} className="p-1 bg-slate-700 hover:bg-red-650 rounded text-white" title="Delete Forever"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Extra Navigation Sections */}
        {!collapsed && (
          <div className="space-y-4 pt-2 border-t border-slate-850">
            
            {/* General categories */}
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("recent")}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-[11px] cursor-pointer ${activeTab === 'recent' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>All Documents</span>
              </button>

              <button 
                onClick={() => setActiveTab("shared")}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-[11px] cursor-pointer ${activeTab === 'shared' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Shared with Me</span>
              </button>

              <button 
                onClick={() => setActiveTab("starred")}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-[11px] cursor-pointer ${activeTab === 'starred' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <Star className={`w-3.5 h-3.5 ${activeTab === 'starred' ? 'text-amber-400 fill-amber-400' : 'text-amber-500'}`} />
                <span>Starred Documents</span>
              </button>

              <button 
                onClick={() => setActiveTab("trash")}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-[11px] cursor-pointer ${activeTab === 'trash' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Trash</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Role Perimeter Access Footprint */}
      {!collapsed && (
        <div className="p-3 bg-slate-950 border-t border-slate-850 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase font-bold tracking-wider">Security State</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center font-mono">
            <span className="text-slate-400">Current Scope: </span>
            <strong className="text-indigo-400 block mt-0.5">{currentRole} Access</strong>
          </div>
        </div>
      )}

    </div>
  );
}
