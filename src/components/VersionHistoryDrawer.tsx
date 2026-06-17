import React, { useState } from "react";
import { X, History, RotateCcw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Revision, Section } from "../types";

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: Revision[];
  onRestoreVersion: (title: string, sections: Section[]) => void;
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  revisions,
  onRestoreVersion
}: VersionHistoryDrawerProps) {
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const activeRevision = revisions.find(r => r.id === selectedRevId) || revisions[0];

  const handleRestoreClick = () => {
    if (!activeRevision) return;
    onRestoreVersion(activeRevision.title, activeRevision.sections);
    
    setSuccessMsg(`Document recovered back to the timeline: "${activeRevision.summary}"!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      
      {/* Click backdrop to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left z-10">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Version History</h3>
              <p className="text-[11px] text-slate-500">Track commits and instantly restore prior technical snapshots.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restore Success Feedback */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-3.5 text-center text-xs text-emerald-800 font-semibold animate-fade-in flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Drawer Split Content */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left panel: list of log commits */}
          <div className="w-full md:w-80 border-r border-slate-200 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
              Historical Timeline Changelog
            </span>

            {revisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">No revision history compiled yet.</p>
            ) : (
              revisions.map((rev) => {
                const isSelected = selectedRevId === rev.id || (!selectedRevId && rev.id === revisions[0].id);

                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevId(rev.id)}
                    className={`p-3 rounded-xl border text-left transition duration-200 cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? "bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-sm"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-350"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-indigo-650 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {rev.timestamp}
                      </span>
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-sans uppercase font-bold">
                        {rev.author.split(" ")[0]}
                      </span>
                    </div>

                    <p className="font-bold text-slate-800 truncate">{rev.summary}</p>
                    <span className="text-[10px] text-slate-450 block font-mono truncate">
                      File: {rev.title}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel: contents preview of the selected revision */}
          {activeRevision ? (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Snapshot Title Baseline</span>
                  <h4 className="text-sm font-bold text-slate-850 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-sans">
                    {activeRevision.title}
                  </h4>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Snapshot Sections Outline ({activeRevision.sections.length})
                  </span>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {activeRevision.sections.map((sec) => (
                      <div key={sec.id} className="border border-slate-205 rounded-xl p-3 bg-white space-y-1">
                        <h5 className="font-bold text-slate-750 text-xs border-b border-slate-50 pb-1">
                          {sec.title}
                        </h5>
                        <p className="text-[11px] text-slate-450 font-mono line-clamp-3 bg-slate-50/50 p-1.5 rounded">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Restore trigger button */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex gap-2 text-[11px] text-indigo-950 font-medium">
                  <AlertTriangle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <p className="leading-tight">
                    Restoring this snapshot will set the document's active layout back to the selected target edit state.
                  </p>
                </div>

                <button
                  onClick={handleRestoreClick}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Selected Historical Version</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <span>Select a baseline version to preview details.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
