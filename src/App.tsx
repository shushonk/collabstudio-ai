import React, { useState, useEffect } from "react";
import { 
  INITIAL_SECTIONS, INITIAL_COLLABORATORS, INITIAL_REVISIONS, INITIAL_CONFLICTS, SHARED_DOCS
} from "./components/SampleDocs";
import { Document, Section, Collaborator, Conflict, Revision, ChatMessage, Comment, FactClaim, TaskItem, DocTemplate } from "./types";
import { Storage } from "./utils/storage";
import { Exporter } from "./utils/exportUtils";
import { Formatting } from "./utils/formatting";
import { useToast } from "./utils/toast";
import Header from "./components/Header";
import DocumentEditor from "./components/DocumentEditor";
import SidebarAssistant from "./components/SidebarAssistant";
import SmartDashboard from "./components/SmartDashboard";
import LeftSidebar from "./components/LeftSidebar";
import TemplatesModal from "./components/TemplatesModal";
import TrashView from "./components/TrashView";

// Premium Workspace Modal overlays
import ExportCenterModal from "./components/ExportCenterModal";
import ShareModal from "./components/ShareModal";
import CommandPalette from "./components/CommandPalette";
import VersionHistoryDrawer from "./components/VersionHistoryDrawer";

// Extra Lucide icons for tour & modals
import { Sparkles, Info, X, Eye, EyeOff, ShieldCheck, CheckCircle, Keyboard, Award, CheckCircle2, ChevronRight } from "lucide-react";

// Realistic Multi-doc Datastore matching user requests (Requirement 6)
const INITIAL_DOCS: Document[] = [
  {
    id: "doc-1",
    title: "Project Apex Transit Core Specs",
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isStarred: false,
    isTrashed: false,
    ownerId: "user-1",
    userPermission: "Owner",
    collaborators: INITIAL_COLLABORATORS,
    sections: INITIAL_SECTIONS
  },
  {
    id: "doc-2",
    title: "Team Meeting Notes",
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isStarred: true,
    isTrashed: false,
    ownerId: "user-1",
    userPermission: "Owner",
    collaborators: INITIAL_COLLABORATORS,
    sections: [
      {
        id: "m-1",
        title: "1. Executive Summary & Goals",
        content: "Project Summit targets a modular telemetry architecture for smart shuttle networks. Our central goal is to shorten latency by 40% and eliminate synchronous queuing delays."
      },
      {
        id: "m-2",
        title: "2. Technical Architecture & Ports",
        content: "Leo Chang suggested shifting parser microservices into a backend docker cluster. Sarah Miller proposed 300ms debouncers on inbound websocket sockets configurations."
      },
      {
        id: "m-3",
        title: "3. Action Items List Summary",
        content: "- Leo Chang: Build high-throughput cluster prototype (Due Friday)\n- Sarah Miller: Adjust browser connection thresholds in dispatcher panels\n- Alex Rivera: Audit RDS PostgreSQL memory benchmarks"
      }
    ]
  },
  {
    id: "doc-3",
    title: "Product Strategy Draft",
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isStarred: false,
    isTrashed: false,
    ownerId: "user-1",
    userPermission: "Owner",
    collaborators: INITIAL_COLLABORATORS,
    sections: [
      {
        id: "str-1",
        title: "1. Project Goals & Audience",
        content: "Establish an enterprise document workspace with real-time multiplayer editing collaboration. Primary users consist of distributed development clusters and technical writers requiring fast citations."
      },
      {
        id: "str-2",
        title: "2. Collaboration Requirements",
        content: "Changes must propagate with under 80ms latency. The editor page sheet must remain responsive, utilizing client local persistent storage buffers as resilient fallback."
      },
      {
        id: "str-3",
        title: "3. Implementation Roadmap",
        content: "Q1 Framework Setup. Q2 WebSockets stream optimization and conflict solver. Q3 AI assist and bibliography formatting markers deployment."
      }
    ]
  },
  ...SHARED_DOCS
];

export default function App() {
  // Document Multi-doc State & Loading
  const [documents, setDocuments] = useState<Document[]>(() => Storage.getDocs().length ? Storage.getDocs() : INITIAL_DOCS);
  const [activeDocId, setActiveDocId] = useState(() => Storage.getActiveDocId() || INITIAL_DOCS[0].id);
  const [activeView, setActiveView] = useState<'editor' | 'trash'>('editor');
  const [trashConfirmModal, setTrashConfirmModal] = useState<{ isOpen: boolean; docId: string; type: 'trash' | 'permanent' } | null>(null);

  const [docTitle, setDocTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "shared" | "starred" | "trash">("recent");

  // Load active document when ID or docs change
  useEffect(() => {
    const doc = documents.find(d => d.id === activeDocId);
    if (doc) {
      setDocTitle(doc.title);
      setSections(doc.sections);
      setCurrentRole(doc.userPermission || "Owner");
      Storage.setActiveDocId(activeDocId);
    }
  }, [activeDocId, documents]);

  // Sync docs to storage
  useEffect(() => {
    Storage.saveDocs(documents);
  }, [documents]);

  const [savedStatus, setSavedStatus] = useState<"saving" | "saved" | "idle">("idle");

  // Focus and layout states
  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem("collabstudio_focus") === "true";
  });
  const [typewriterMode, setTypewriterMode] = useState(() => {
    return localStorage.getItem("collabstudio_typewriter") === "true";
  });
  const [darkPaperMode, setDarkPaperMode] = useState(() => {
    return localStorage.getItem("collabstudio_dark") === "true";
  });
  const [wordCountTarget, setWordCountTarget] = useState(() => {
    const words = localStorage.getItem("collabstudio_target_words");
    return words ? Number(words) : 500;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRole, setCurrentRole] = useState<"Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer">(() => {
    return (localStorage.getItem("collabstudio_role") as any) || "Owner";
  });

  // Dashboard reveal flag & Modals
  const [showDashboard, setShowDashboard] = useState(() => {
    return localStorage.getItem("collabstudio_dashboard") === "true";
  });
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Premium Modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [featureModalName, setFeatureModalName] = useState<string | null>(null);

  // Overlays / Help modals state
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Comments state starting with rich relevant feedback
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem("collabstudio_comments");
    return saved ? JSON.parse(saved) : [
      {
        id: "comm-1",
        sectionId: "sec-2",
        author: "Leo Chang",
        text: "Double-check if port 8080 conflicts with local services inside the default docker containers.",
        timestamp: "10:35 AM",
        isResolved: false
      },
      {
        id: "comm-2",
        sectionId: "sec-3",
        author: "CollabStudio AI",
        text: "Excellent warning! Adding environment file examples (.env.example) prevents leaky browser variables.",
        timestamp: "10:42 AM",
        isResolved: false,
        isAiSuggestion: true
      }
    ];
  });

  // Task lists matching smart tracker
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("collabstudio_tasks");
    return saved ? JSON.parse(saved) : [
      {
        id: "task-1",
        text: "Resolve Bearer Token warning overlap with private telemetry ports.",
        assignee: "Leo Chang",
        dueDate: "Next Monday",
        isCompleted: false
      },
      {
        id: "task-2",
        text: "Establish standard JSON handshake format configurations",
        assignee: "Sarah Miller",
        dueDate: "This Friday",
        isCompleted: true
      },
      {
        id: "task-3",
        text: "Review security policies relative to Cloud SQL queries",
        assignee: "Alex Rivera",
        dueDate: "Tomorrow",
        isCompleted: false
      }
    ];
  });

  // Citations / fact marker claims
  const [citations, setCitations] = useState<FactClaim[]>(() => {
    const saved = localStorage.getItem("collabstudio_citations");
    return saved ? JSON.parse(saved) : [
      {
        id: "cit-1",
        sectionId: "sec-2",
        text: "Continuous real-time stream ingestion improves transit predictability by 38%.",
        needsCitation: true,
        citationStyle: "IEEE",
        citationText: "Department of Urban Logistics, Technical Report vol 14, 2025"
      }
    ];
  });

  // Collaborators
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);

  // Revision History
  const [revisions, setRevisions] = useState<Revision[]>(() => {
    const saved = localStorage.getItem("collabstudio_revisions");
    return saved ? JSON.parse(saved) : INITIAL_REVISIONS;
  });

  // Disputes & Conflicts list
  const [conflicts, setConflicts] = useState<Conflict[]>(() => {
    const saved = localStorage.getItem("collabstudio_conflicts");
    return saved ? JSON.parse(saved) : INITIAL_CONFLICTS;
  });

  // Active highlighted text passing to Assistant
  const [selectedText, setSelectedText] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>("sec-1");

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const trashedDocuments = documents.filter(d => d.isTrashed);
  const nonTrashedDocuments = documents.filter(d => !d.isTrashed);

  useEffect(() => {
    const saved = localStorage.getItem(`collabstudio_chat_${activeDocId}`);
    if (saved) {
      setChatHistory(JSON.parse(saved));
    } else {
      setChatHistory([
        {
          id: "welcome-1",
          sender: "ai",
          authorName: "Gemini Assistant",
          text: `Welcome to the Gemini-powered workspace for "${docTitle}"! I can help you summarize, improve, or brainstorm sections. Use the quick buttons or type a message below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeDocId, docTitle]);

  useEffect(() => {
    if (activeDocId) {
      localStorage.setItem(`collabstudio_chat_${activeDocId}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, activeDocId]);

  // AI Audit State
  const [auditResult, setAuditResult] = useState<{
    readabilityScore: number;
    redundancies: Array<{ message: string; suggestedFix: string }>;
    consistencyTips: string[];
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null);

  const { toasts, addToast } = useToast();

  // Host keyboard triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Multi-state Local Persistence triggers
  useEffect(() => {
    localStorage.setItem("collabstudio_docs", JSON.stringify(documents));
  }, [documents]);

  // Autosave current document content
  useEffect(() => {
    if (!activeDocId) return;
    setSavedStatus("saving");
    const timeout = setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === activeDocId ? { ...doc, title: docTitle, sections, lastModified: new Date().toISOString() } : doc
      ));
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 2000);
    }, 1000); // Debounce by 1s

    return () => clearTimeout(timeout);
  }, [sections, docTitle, activeDocId]);

  useEffect(() => {
    localStorage.setItem("collabstudio_active_doc_id", activeDocId);
  }, [activeDocId]);

  useEffect(() => {
    localStorage.setItem("collabstudio_comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("collabstudio_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collabstudio_citations", JSON.stringify(citations));
  }, [citations]);

  useEffect(() => {
    localStorage.setItem("collabstudio_revisions", JSON.stringify(revisions));
  }, [revisions]);

  useEffect(() => {
    localStorage.setItem("collabstudio_conflicts", JSON.stringify(conflicts));
  }, [conflicts]);

  useEffect(() => {
    // Moved to per-document effect
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("collabstudio_role", currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem("collabstudio_focus", focusMode ? "true" : "false");
  }, [focusMode]);

  useEffect(() => {
    localStorage.setItem("collabstudio_typewriter", typewriterMode ? "true" : "false");
  }, [typewriterMode]);

  useEffect(() => {
    localStorage.setItem("collabstudio_dark", darkPaperMode ? "true" : "false");
  }, [darkPaperMode]);

  useEffect(() => {
    localStorage.setItem("collabstudio_dashboard", showDashboard ? "true" : "false");
  }, [showDashboard]);

  useEffect(() => {
    localStorage.setItem("collabstudio_target_words", String(wordCountTarget));
  }, [wordCountTarget]);

  const handleRestoreVersion = (title: string, restoredSections: Section[]) => {
    setDocTitle(title);
    setSections(restoredSections);
    setActiveSectionId(restoredSections[0]?.id || null);
    
    setRevisions(prev => [
      {
        id: `rev-rest-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: "You (Primary)",
        summary: `Recovered back to: "${title}"`,
        title: title,
        sections: restoredSections
      },
      ...prev
    ]);

    setChatHistory(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        text: `🔄 Document timeline successfully restored back to prior checkpoint snapshot!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleUpdateCollaborator = (id: string, role: string) => {
    setCollaborators(prev => prev.map(c => c.id === id ? { ...c, role: role as any } : c));
  };

  const handleInviteCollaborator = (email: string, role: "Owner" | "Editor" | "Reviewer" | "Commenter" | "Viewer") => {
    const newCol: Collaborator = {
      id: `col-inv-${Date.now()}`,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role,
      color: "bg-indigo-650",
      isOnline: true,
      isTyping: false,
      activeSectionId: null
    };
    setCollaborators(prev => [...prev, newCol]);
  };

  const handleDeleteCollaborator = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };


  // Switch documents
  const loadDocument = (id: string) => {
    setActiveDocId(id);
  };

  // Document Actions
  const handleToggleStar = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, isStarred: !d.isStarred } : d));
  };

  const moveDocumentToTrash = (docId: string) => {
    const updated = documents.map(d => 
      d.id === docId ? { ...d, isTrashed: true, trashedAt: new Date().toISOString() } : d
    );
    setDocuments(updated);
    
    addToast("Moved to Trash. You can restore it anytime.", "success");
    
    if (docId === activeDocId) {
      // Find the first non-trashed document
      const nextDoc = updated.find(d => !d.isTrashed);
      if (nextDoc) {
        setActiveDocId(nextDoc.id);
      } else {
        handleNewDoc();
      }
    }
    setActiveView("editor");
  };

  const handleRestoreDoc = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, isTrashed: false, trashedAt: undefined } : d));
    addToast("Document restored.", "success");
  };

  const handleDeletePermanent = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    // Optional: Clean up document-specific localStorage data
    localStorage.removeItem(`collabstudio_chat_${docId}`);
    addToast("Document permanently deleted.", "info");
  };

  const handleNewDoc = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: "Untitled Document",
      sections: [
        { id: "sec-1", title: "Introduction", content: "" }
      ],
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isStarred: false,
      isTrashed: false,
      ownerId: "user-1",
      userPermission: "Owner",
      collaborators: INITIAL_COLLABORATORS
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  // Update section text blocks
  const handleUpdateSection = (id: string, updatedFields: Partial<Section>) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, ...updatedFields } : sec))
    );
  };

  const handleDuplicateSection = (id: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: `sec-copy-${Date.now()}`, title: `${prev[idx].title} (Copy)` };
      const newSections = [...prev];
      newSections.splice(idx + 1, 0, copy);
      return newSections;
    });
  };

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      
      const newSections = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
      return newSections;
    });
  };

  const handleReplaceAll = (search: string, replace: string) => {
    if (!search) return;
    setSections(prev => prev.map(s => ({
      ...s,
      content: s.content.split(search).join(replace),
      title: s.title.split(search).join(replace)
    })));
  };

  const handleReplaceNext = (search: string, replace: string) => {
    if (!search) return;
    // For simplicity in this demo, just replace the first occurrence found across all sections
    let replaced = false;
    setSections(prev => prev.map(s => {
      if (replaced) return s;
      if (s.content.includes(search)) {
        replaced = true;
        return { ...s, content: s.content.replace(search, replace) };
      }
      if (s.title.includes(search)) {
        replaced = true;
        return { ...s, title: s.title.replace(search, replace) };
      }
      return s;
    }));
  };

  // Apply templates
  const handleApplyTemplate = (template: DocTemplate) => {
    if (sections.length > 0 && sections[0].content.trim() !== "") {
      const confirmReplace = window.confirm(
        "Applying this template will overwrite the current content of this document. Are you sure you want to proceed?"
      );
      if (!confirmReplace) return;
    }

    setSections(template.sections);
    setActiveSectionId(template.sections[0]?.id || null);
    setDocTitle(`${template.name} - Standard Outline`);
    
    // Add Revisions list
    const newLog: Revision = {
      id: `rev-template-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: "You (Primary)",
      summary: `Applied official document preset framework: ${template.name}`,
      title: template.name,
      sections: template.sections
    };
    setRevisions(prev => [newLog, ...prev]);

    // AI feed details
    setChatHistory(prev => [
      ...prev,
      {
        id: `msg-t-${Date.now()}`,
        sender: "ai",
        authorName: "CollabStudio AI",
        text: `🚀 **New templates format framework applied successfully.** We have bootstrapped your center canvas with structured **${template.name}** headings. Check current requirements scores on the bottom auditor panel!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleAddComment = (text: string, isAi?: boolean) => {
    const activeSec = activeSectionId || "sec-1";
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      sectionId: activeSec,
      author: isAi ? "CollabStudio AI" : "You (Owner)",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isResolved: false,
      isAiSuggestion: isAi
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleResolveComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, isResolved: true } : c));
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleAddTask = (text: string, dueDate: string = "Next Monday", assignee: string = "You") => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      dueDate,
      assignee,
      isCompleted: false
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleExtractTasksByAi = () => {
    const foundTasks: string[] = [];
    sections.forEach(sec => {
      if (sec.content.toLowerCase().includes("credentials")) {
        foundTasks.push(`Move secret API credentials mentioned inside "${sec.title}" to secure server environment.`);
      }
      if (sec.content.toLowerCase().includes("port 8080")) {
        foundTasks.push(`Map network bridges for routing incoming data on port 8080.`);
      }
      if (sec.content.toLowerCase().includes("conflict") || sec.content.toLowerCase().includes("argue")) {
        foundTasks.push(`Resolve coordination disputes regarding cluster filter bounds inside ${sec.title}.`);
      }
    });

    if (foundTasks.length === 0) {
      foundTasks.push("Optimize worker thread telemetry queue limits.");
      foundTasks.push("Examine system compliance scores via the QA Auditor desk.");
    }

    foundTasks.forEach((tText, i) => {
      setTimeout(() => {
        handleAddTask(tText, "This Friday", "Leo Chang");
      }, i * 200);
    });

    addToast(`AI reviewed active document and extracted ${foundTasks.length} technical tasks!`, "success");
  };

  const handleAddCitationMarker = (text: string) => {
    const activeSec = activeSectionId || "sec-1";
    const newClaim: FactClaim = {
      id: `cit-${Date.now()}`,
      sectionId: activeSec,
      text,
      needsCitation: true,
      citationStyle: "IEEE",
      citationText: "Academic Research Association, Technical Manual, June 2026"
    };
    setCitations(prev => [...prev, newClaim]);
  };

  const handleChangeCitationStyle = (id: string, style: 'IEEE' | 'APA' | 'MLA' | 'Simple') => {
    setCitations(prev => prev.map(c => c.id === id ? { ...c, citationStyle: style } : c));
  };

  const handleRemoveCitation = (id: string) => {
    setCitations(prev => prev.filter(c => c.id !== id));
  };

  const handleRunCitationHelper = () => {
    setCitations(prev => prev.map(c => ({
      ...c,
      citationText: c.citationText || "Associated Telematics standards, Vol 12, Publisher Group 2026."
    })));
    addToast("AI reviewed claims and compiled official citation indexes!", "success");
  };

  const handleTriggerMeetingMinutes = (transcript: string) => {
    if (!transcript.trim()) return;
    
    const words = transcript.trim().split(/\s+/).length;
    const newSecId = `sec-meet-${Date.now()}`;
    const newSec: Section = {
      id: newSecId,
      title: `${sections.length + 1}. Unified Meeting Transcript Spec`,
      content: `### 🎙️ AI Synced Voice Record\n- **Abstract Summary**: Settled on cluster optimizations. Configured network routes to secure channels.\n- **Actionable requirements**: ${transcript}\n- **Parser calculations**: Analyzed ${words} spoken syllables.`
    };

    setSections(prev => [...prev, newSec]);
    setActiveSectionId(newSecId);
    addToast("Successfully converted discussion transcript into a complete workspace text block!", "success");
  };

  const handleTriggerDiffCompare = (revTitle: string, userText: string) => {
    addToast(`Side-by-side smart audit comparing current workspace with target baseline: "${revTitle}".`, "info");
  };

  const handleAddSection = () => {
    const newId = `sec-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      title: `${sections.length + 1}. New Specification Section`,
      content: "Type your specific technical directives, standards, or API routes details here..."
    };
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newId);
    
    const newLog: Revision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: "You (Primary)",
      summary: `Created section: "${newSection.title}"`,
      title: docTitle,
      sections: [...sections, newSection]
    };
    setRevisions((prev) => [newLog, ...prev]);
  };

  const handleDeleteSection = (id: string) => {
    const targetSection = sections.find((s) => s.id === id);
    if (!targetSection) return;
    
    setSections((prev) => prev.filter((sec) => sec.id !== id));
    if (activeSectionId === id) {
      setActiveSectionId(sections[0]?.id || null);
    }

    const newLog: Revision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: "You (Primary)",
      summary: `Deleted section: "${targetSection.title}"`,
      title: docTitle,
      sections: sections.filter((sec) => sec.id !== id)
    };
    setRevisions((prev) => [newLog, ...prev]);
  };

  const handleApplyEdit = (sectionId: string, improvedContent: string) => {
    handleUpdateSection(sectionId, { content: improvedContent });
    
    const newLog: Revision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: "CollabEditor AI",
      summary: `Applied recommended rewrite polish on "${sections.find(s => s.id === sectionId)?.title}"`,
      title: docTitle,
      sections: sections.map(s => s.id === sectionId ? { ...s, content: improvedContent } : s)
    };
    setRevisions((prev) => [newLog, ...prev]);
  };

  const handleResolveConflict = (conflictId: string, resolvedText: string) => {
    const targetConflict = conflicts.find(c => c.id === conflictId);
    if (!targetConflict) return;

    handleUpdateSection(targetConflict.sectionId, { content: resolvedText });

    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: "resolved", resolvedText } : c))
    );

    const newLog: Revision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: "CollabEditor AI",
      summary: `Unified dispute between ${targetConflict.authorA} and ${targetConflict.authorB} inside "${targetConflict.sectionTitle}"`,
      title: docTitle,
      sections: sections.map(s => s.id === targetConflict.sectionId ? { ...s, content: resolvedText } : s)
    };
    setRevisions((prev) => [newLog, ...prev]);
  };

  const handleSendMessage = (msg: string | ChatMessage) => {
    if (typeof msg === 'string') {
      const isAi = msg.startsWith("### 🤝 Conflict Reconciled") || msg.includes("reconciliation text") || msg.includes("cohesive document");
      const sender = isAi ? "ai" : "user";
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender,
        authorName: sender === "ai" ? "CollabEditor AI" : "You",
        text: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, newMsg]);
    } else {
      setChatHistory((prev) => [...prev, msg]);
    }
  };

  const handleInjectSection = (title: string, content: string) => {
    const newId = `sec-${Date.now()}`;
    setSections((prev) => [...prev, { id: newId, title, content }]);
    setActiveSectionId(newId);
  };

  const triggerDocumentAudit = async () => {
    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/gemini/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: docTitle, sections })
      });

      if (!response.ok) throw new Error("Document analysis failed.");
      const data = await response.json();

      setAuditResult({
        readabilityScore: data.readabilityScore || 68,
        redundancies: data.redundancies || [],
        consistencyTips: data.consistencyTips || []
      });
      setReadabilityScore(data.readabilityScore || 68);

      setChatHistory((prev) => [
        ...prev,
        {
          id: `msg-audit-${Date.now()}`,
          sender: "ai",
          authorName: "CollabStudio AI",
          text: `📊 **Document Audit Complete!**\n- Readability Score calculated: **${data.readabilityScore}/100**.\n- Style Consistency Tips logged in the *Audit Specs* tab.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setAuditResult({
        readabilityScore: 65,
        redundancies: [
          {
            message: "Information on Security Credentials matches Bearer token guidelines too closely.",
            suggestedFix: "Consolidate telemetry segments under Section 3 security guidelines."
          }
        ],
        consistencyTips: [
          "Leo uses highly structured tech jargon, while Sarah applies user-friendly words in H1.",
          "Standardize acronym formatting configurations."
        ]
      });
      setReadabilityScore(65);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Simulating live collaborative edits
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        return prev.map((col, idx) => {
          if (idx === randomIndex) {
            const isNowTyping = !col.isTyping;
            
            if (col.isTyping && !isNowTyping) {
              const mockEdits = [
                "tuned port validation telemetry buffers",
                "revised dispatcher bearer parameters",
                "polished transit routing definitions outline",
                "standardized JSON socket Handshake latency limits"
              ];
              const editSummary = mockEdits[Math.floor(Math.random() * mockEdits.length)];
              
              setRevisions((prevRev) => [
                {
                  id: `rev-sim-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  author: col.name,
                  summary: `Direct commit: ${editSummary}`,
                  title: docTitle,
                  sections: sections
                },
                ...prevRev
              ]);
            }

            return { 
              ...col, 
              isTyping: isNowTyping,
              activeSectionId: isNowTyping ? sections[Math.floor(Math.random() * sections.length)]?.id || "sec-2" : col.activeSectionId
            };
          }
          return col;
        });
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [sections, docTitle]);

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex flex-col font-sans select-text">
      
      {/* 1. Header component */}
      <Header
        title={docTitle}
        onChangeTitle={setDocTitle}
        collaborators={collaborators}
        sections={sections}
        savedStatus={savedStatus}
        onTriggerAnalyze={triggerDocumentAudit}
        analysisLoading={analysisLoading}
        readabilityScore={readabilityScore}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        typewriterMode={typewriterMode}
        setTypewriterMode={setTypewriterMode}
        darkPaperMode={darkPaperMode}
        setDarkPaperMode={setDarkPaperMode}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onTriggerOnboarding={() => {
          setShowOnboarding(true);
          setOnboardingStep(0);
        }}
        onOpenExport={() => setShowExportModal(true)}
        onOpenShare={() => setShowShareModal(true)}
        onOpenVersionHistory={() => setShowVersionHistory(true)}
        onToggleDashboard={() => setShowDashboard(prev => !prev)}
        showDashboard={showDashboard}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        addToast={addToast}
        onTriggerMoveToTrash={() => setTrashConfirmModal({ isOpen: true, docId: activeDocId, type: 'trash' })}
      />

      {/* 2. Main Workspace Layout Grid */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Permanent Workspace Navigation Sidebar (Left Sidebar) */}
        {!focusMode && (
          <LeftSidebar
            documents={documents}
            activeDocId={activeDocId}
            onSelectDoc={(id) => {
              setActiveDocId(id);
              setActiveView("editor");
              if (activeTab === "trash") setActiveTab("recent");
            }}
            onNewDoc={handleNewDoc}
            onOpenTemplates={() => setShowTemplatesModal(true)}
            showDashboard={showDashboard}
            onToggleDashboard={() => setShowDashboard(prev => !prev)}
            currentRole={currentRole}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab === "trash") setActiveView("trash");
              else setActiveView("editor");
            }}
            onRestoreDoc={handleRestoreDoc}
            onDeletePermanent={(id) => setTrashConfirmModal({ isOpen: true, docId: id, type: 'permanent' })}
          />
        )}

        {/* Center Canvas Workspace and Collapsible Bottom Dashboard */}
        <div className="flex-1 flex flex-col overflow-y-auto h-full min-h-0 bg-white">
          
          {activeView === "trash" ? (
            <TrashView 
              documents={trashedDocuments}
              onRestore={handleRestoreDoc}
              onDeleteForever={(id) => setTrashConfirmModal({ isOpen: true, docId: id, type: 'permanent' })}
              onBack={() => {
                setActiveTab("recent");
                setActiveView("editor");
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col h-full min-h-0">
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                <DocumentEditor
                  sections={sections}
                  onUpdateSection={handleUpdateSection}
                  onAddSection={handleAddSection}
                  onDeleteSection={handleDeleteSection}
                  onDuplicateSection={handleDuplicateSection}
                  onMoveSection={handleMoveSection}
                  collaborators={collaborators}
                  activeSectionId={activeSectionId}
                  setActiveSectionId={setActiveSectionId}
                  selectedText={selectedText}
                  setSelectedText={setSelectedText}
                  currentRole={currentRole}
                  focusMode={focusMode}
                  typewriterMode={typewriterMode}
                  darkPaperMode={darkPaperMode}
                  wordCountTarget={wordCountTarget}
                  setWordCountTarget={setWordCountTarget}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onReplaceAll={handleReplaceAll}
                  onReplaceNext={handleReplaceNext}
                  
                  // Premium Page-structure bindings
                  title={docTitle}
                  onChangeTitle={setDocTitle}
                  comments={comments}
                  onAddComment={handleAddComment}
                  onResolveComment={handleResolveComment}
                  showDashboard={showDashboard}
                  onToggleDashboard={() => setShowDashboard(prev => !prev)}
                  onTriggerAnalyze={triggerDocumentAudit}
                  analysisLoading={analysisLoading}
                  tasks={tasks}
                  isTrashed={documents.find(d => d.id === activeDocId)?.isTrashed}
                  onRestore={() => handleRestoreDoc(activeDocId)}
                />

                {/* AI Analytics and Secondary Dashboard Panel, Collapsible by Default */}
                {showDashboard && (
                  <div className="animate-fade-in w-full pb-8 border-t border-slate-205 pt-6">
                    <SmartDashboard
                      sections={sections}
                      onApplyTemplate={handleApplyTemplate}
                      comments={comments}
                      onAddComment={handleAddComment}
                      onResolveComment={handleResolveComment}
                      tasks={tasks}
                      onToggleTask={handleToggleTask}
                      onAddTask={handleAddTask}
                      onDeleteTask={handleDeleteTask}
                      onExtractTasksByAi={handleExtractTasksByAi}
                      citations={citations}
                      onAddCitationMarker={handleAddCitationMarker}
                      onChangeCitationStyle={handleChangeCitationStyle}
                      onRemoveCitation={handleRemoveCitation}
                      onRunCitationHelper={handleRunCitationHelper}
                      currentRole={currentRole}
                      onChangeRole={setCurrentRole}
                      onTriggerMeetingMinutes={handleTriggerMeetingMinutes}
                      onTriggerDiffCompare={handleTriggerDiffCompare}
                      addToast={addToast}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Real-time Assistant sidebar - Desktop and Mobile Drawer */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:z-0 lg:flex-shrink-0
          ${isAssistantOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${focusMode ? 'opacity-15 lg:opacity-30 hover:opacity-100' : ''}
        `}>
          <div className="h-full relative border-l border-slate-200">
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsAssistantOpen(false)}
              className="lg:hidden absolute top-4 left-[-40px] bg-white p-2 rounded-l-xl shadow-lg border-y border-l border-slate-200 text-slate-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <SidebarAssistant
              docTitle={docTitle}
              sections={sections}
              collaborators={collaborators}
              revisions={revisions}
              conflicts={conflicts}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              setChatHistory={setChatHistory}
              onApplyEdit={handleApplyEdit}
              activeSectionId={activeSectionId}
              selectedText={selectedText}
              onResolveConflict={handleResolveConflict}
              auditResult={auditResult}
              onClearConflict={(id) => setConflicts(prev => prev.filter(c => c.id !== id))}
              onInjectSection={handleInjectSection}
            />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isAssistantOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsAssistantOpen(false)}
          />
        )}

      </main>

      {/* OVERLAY: TEMPLATES SELECTION OVERLAY */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleApplyTemplate}
        currentSections={sections}
      />

      {/* OVERLAY: PREMIUM WORKSPACE SHARING MODAL */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        collaborators={collaborators}
        onUpdateCollaborator={handleUpdateCollaborator}
        onInviteCollaborator={handleInviteCollaborator}
        onDeleteCollaborator={handleDeleteCollaborator}
      />

      {/* OVERLAY: PREMIUM EXPORT CENTER MODULE */}
      <ExportCenterModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={docTitle}
        sections={sections}
        comments={comments}
        tasks={tasks}
        citations={citations}
      />

      {/* OVERLAY: COMMAND PALETTE SEARCH ENGINE */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        sections={sections}
        documents={documents}
        onSelectDoc={loadDocument}
        onNewDoc={handleNewDoc}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onToggleDashboard={() => setShowDashboard(prev => !prev)}
        onTriggerAnalyze={triggerDocumentAudit}
        setFocusMode={setFocusMode}
        setCurrentRole={setCurrentRole}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      {/* OVERLAY: REVISIONS TIMELINE DRAWER */}
      <VersionHistoryDrawer
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        revisions={revisions}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* OVERLAY: WALKTHROUGH ONBOARDING TARGET POPUP */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowOnboarding(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-400">Step {onboardingStep + 1} of 4</span>
            </div>

            {onboardingStep === 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">👑 Permissions and Roles Guardrails</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CollabStudio Premium equips you with customizable permissions gates. Use the role selector in the top right header to preview how read-only constraints secure paragraphs from unauthorized typing!
                </p>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[10px] text-amber-850 font-mono">
                  Tip: Editor textareas are completely locked whenever Viewer role is active.
                </div>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">✨ Permanent Navigation & Templates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toggle loadable outline specifications in the permanent left panel, or trigger the template overlay to bootstrap technical briefs instantly without cluttering edits.
                </p>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">🎙️ Meeting Mode and Voice Commands</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Need to translate a product transcript record into structural outlines? Tap the 'AI Analytics Desk' in the left side workspace and access the Meeting tab to synch transcription records.
                </p>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">🎯 Inline Formatting & Margin Comments</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Make edits, write citations, highlight selection text blocks to call local AI suggestion boxes, or write side comments side-by-side with your paragraphs.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                disabled={onboardingStep === 0}
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${onboardingStep === 0 ? 'text-slate-300 font-mono' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer'}`}
              >
                Previous
              </button>

              <div className="flex gap-2">
                {onboardingStep < 3 ? (
                  <button
                    onClick={() => setOnboardingStep(prev => prev + 1)}
                    className="text-xs font-bold px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="text-xs font-bold px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Conclude Tour</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: KEYBOARD HOTKEYS GUIDE MODAL */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full relative space-y-4">
            <button 
              onClick={() => setShowShortcuts(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-805 uppercase tracking-wide font-mono">Workspace Hotkeys Guide</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-sans">Leverage fast keyboard interactions anywhere inside the document container:</p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-600">Open Keyboard Help Help</span>
                <strong className="text-indigo-700 bg-slate-200/60 px-1.5 py-0.5 rounded">Ctrl + /</strong>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-600">Toggle Focus Mode Layout</span>
                <strong className="text-indigo-700 bg-slate-200/60 px-1.5 py-0.5 rounded">Ctrl + f</strong>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-600">Create New Headings Section</span>
                <strong className="text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">Ctrl + Enter</strong>
              </div>
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-center hover:bg-slate-900 cursor-pointer text-xs font-semibold transition"
            >
              Understand & Dismiss Guide
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`
              p-3 px-4 rounded-xl shadow-xl border animate-scale-up pointer-events-auto min-w-[240px] flex items-center gap-3
              ${t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 
                t.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 
                t.type === 'warning' ? 'bg-amber-500 text-white border-amber-400' : 
                'bg-slate-800 text-white border-slate-700'}
            `}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {t.type === 'error' && <X className="w-4 h-4" />}
            {t.type === 'warning' && <Info className="w-4 h-4" />}
            {t.type === 'info' && <Sparkles className="w-4 h-4" />}
            <span className="text-xs font-bold font-sans">{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
