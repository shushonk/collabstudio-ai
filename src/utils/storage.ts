import { Document, Section, Revision, ChatMessage } from "../types";

const STORAGE_KEYS = {
  DOCS: "collabstudio_docs",
  ACTIVE_DOC_ID: "collabstudio_active_doc_id",
  CUSTOM_TEMPLATES: "collabstudio_custom_templates",
  SETTINGS: "collabstudio_settings",
};

export const Storage = {
  getDocs: (): Document[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDocs: (docs: Document[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  },

  getActiveDocId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
  },

  setActiveDocId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  },

  getChatHistory: (docId: string): ChatMessage[] => {
    const saved = localStorage.getItem(`collabstudio_chat_${docId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveChatHistory: (docId: string, history: ChatMessage[]) => {
    localStorage.setItem(`collabstudio_chat_${docId}`, JSON.stringify(history));
  },

  getRevisions: (docId: string): Revision[] => {
    const saved = localStorage.getItem(`collabstudio_revisions_${docId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveRevisions: (docId: string, revisions: Revision[]) => {
    localStorage.setItem(`collabstudio_revisions_${docId}`, JSON.stringify(revisions));
  },

  getComments: (docId: string): any[] => {
    const saved = localStorage.getItem(`collabstudio_comments_${docId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveComments: (docId: string, comments: any[]) => {
    localStorage.setItem(`collabstudio_comments_${docId}`, JSON.stringify(comments));
  },
  
  getSettings: () => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { darkMode: false, typewriterMode: false };
  },
  
  saveSettings: (settings: any) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
