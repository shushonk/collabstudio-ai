import React, { useState } from "react";
import { X, Users, Compass, Copy, Check, ShieldAlert, CheckCircle, ToggleRight, Trash2 } from "lucide-react";
import { Collaborator } from "../types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onUpdateCollaborator: (id: string, role: string) => void;
  onInviteCollaborator: (email: string, role: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer") => void;
  onDeleteCollaborator: (id: string) => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  collaborators,
  onUpdateCollaborator,
  onInviteCollaborator,
  onDeleteCollaborator
}: ShareModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Editor" | "Reviewer" | "Commenter" | "Viewer">("Editor");
  const [isPublicAccess, setIsPublicAccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (!isOpen) return null;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    // Call invite callback
    onInviteCollaborator(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    
    setToastMessage(`Security invitation dispatched for ${inviteEmail}!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?docShareId=collab-${Date.now()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2050);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 outline-hidden shadow-2xl p-6 md:p-8 max-w-xl w-full relative space-y-6 animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 md:right-6 top-4 md:top-6 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-650 rounded-2xl">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Share Specifications Workspace
            </h3>
            <p className="text-xs text-slate-500">Enable team editing streams, coordinate access credentials, or assign specific roles.</p>
          </div>
        </div>

        {/* Temporary Feedback Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center text-xs text-emerald-800 font-medium animate-fade-in">
            ✅ {toastMessage}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInviteSubmit} className="space-y-2">
          <label className="text-[10px] font-bold font-mono tracking-wider text-slate-450 uppercase block">
            Invite Colleagues selectively
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="team-analyst@company.io"
              className="flex-grow text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="text-xs bg-slate-100 border border-slate-205 rounded-xl px-3 py-2 cursor-pointer font-semibold text-slate-750"
              >
                <option value="Editor">✍️ Editor</option>
                <option value="Reviewer">👁️ Reviewer</option>
                <option value="Commenter">💬 Commenter</option>
                <option value="Viewer">🔒 Viewer Mode</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Send Invite
              </button>
            </div>
          </div>
        </form>

        {/* Active team list */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono tracking-wider text-slate-450 uppercase block">
            Workspace Access Directory ({collaborators.length})
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {collaborators.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/50 border border-slate-150 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${user.color}`}>
                    {user.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 leading-none">{user.name}</h5>
                    <span className="text-[9px] font-mono text-slate-450 block mt-1">
                      {user.isOnline ? "● online sync active" : "idle in queue"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Select menu to adjust privileges */}
                  <select
                    value={user.role}
                    onChange={(e) => onUpdateCollaborator(user.id, e.target.value)}
                    className="text-[10px] font-mono font-bold text-slate-550 border border-slate-200/80 bg-white rounded-md px-1.5 py-0.5"
                  >
                    <option value="Owner">👑 Owner</option>
                    <option value="Editor">Editor</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Commenter">Commenter</option>
                    <option value="Viewer">Viewer</option>
                  </select>

                  <button
                    onClick={() => onDeleteCollaborator(user.id)}
                    className="p-1 text-slate-350 hover:text-red-500 rounded transition hover:bg-red-50 cursor-pointer"
                    title="Remove access privileges"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access link controls */}
        <div className="space-y-3.5 border-t border-slate-150 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">General Link sharing</span>
              <p className="text-[11px] text-slate-450">Anyone with the direct link can view or comment.</p>
            </div>
            
            <button
              onClick={() => setIsPublicAccess(!isPublicAccess)}
              className={`px-3 py-1 font-mono text-[9px] font-extrabold uppercase rounded-full ${
                isPublicAccess 
                  ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse" 
                  : "bg-slate-150 text-slate-600 border border-slate-200"
              }`}
            >
              {isPublicAccess ? "🔓 Public Spec" : "🔒 Private Team"}
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 text-[11px] font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 truncate select-all flex items-center justify-between gap-1.5 leading-none">
              <span className="truncate">{window.location.origin}/specs-collab?claim_id=391845</span>
              <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>

            <button
              onClick={handleCopyShareLink}
              className="px-4 bg-slate-905 hover:bg-slate-800 text-slate-50 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Alert Warnings */}
        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 flex items-start gap-2.5 text-[11px] text-amber-900 leading-normal">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Multitenant Mock Protocol:</strong> Adding users invites simulated AI colleagues. All communication patterns are locally synchronized. Real credentials remain safe.
          </p>
        </div>

      </div>
    </div>
  );
}
