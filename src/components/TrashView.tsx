import React from "react";
import { Trash2, RotateCcw, ArrowLeft, FileText, Calendar, Clock } from "lucide-react";
import { Document } from "../types";

interface TrashViewProps {
  documents: Document[];
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onBack: () => void;
}

export default function TrashView({ documents, onRestore, onDeleteForever, onBack }: TrashViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
            title="Back to Editor"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Trash Folder
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {documents.length} deleted {documents.length === 1 ? 'document' : 'documents'} found
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {documents.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center animate-fade-in shadow-sm">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Trash is empty</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Deleted documents will appear here for 30 days before permanent removal.
              </p>
              <button 
                onClick={onBack}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Back to Documents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {documents.map((doc) => {
                const totalWords = doc.sections.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0);
                const trashedDate = doc.trashedAt ? new Date(doc.trashedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Unknown';

                return (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all group relative border-l-4 border-l-rose-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <FileText className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onRestore(doc.id)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="Restore document"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteForever(doc.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete forever"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[13px] font-bold text-slate-800 mb-1 truncate pr-16" title={doc.title}>
                      {doc.title || "Untitled Document"}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3 rotate-45" />
                        <span>{totalWords} terms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Trashed {trashedDate}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                       <button 
                        onClick={() => onRestore(doc.id)}
                        className="flex-1 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                      <button 
                        onClick={() => onDeleteForever(doc.id)}
                        className="flex-1 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Forever
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
