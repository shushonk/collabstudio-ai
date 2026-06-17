export interface Document {
  id: string;
  title: string;
  sections: Section[];
  lastModified: string;
  createdAt: string;
  isStarred: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  ownerId: string;
  collaborators: Collaborator[];
  userPermission: "Owner" | "Editor" | "Commenter" | "Viewer";
}

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  role: string;
  isOnline: boolean;
  isTyping: boolean;
  activeSectionId: string | null;
}

export interface DocumentState {
  title: string;
  sections: Section[];
  lastSavedAt: string;
}

export interface Revision {
  id: string;
  timestamp: string;
  author: string;
  summary: string;
  sections: Section[];
  title: string;
}

export interface Conflict {
  id: string;
  sectionId: string;
  sectionTitle: string;
  originalText: string;
  authorA: string;
  versionA: string;
  authorB: string;
  versionB: string;
  status: 'pending' | 'resolved';
  resolvedText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  authorName?: string;
  text: string;
  timestamp: string;
  // If editing request:
  original?: string;
  suggested?: string;
  changes?: string[];
}

export interface Comment {
  id: string;
  sectionId: string;
  author: string;
  text: string;
  timestamp: string;
  isResolved: boolean;
  isAiSuggestion?: boolean;
}

export interface FactClaim {
  id: string;
  sectionId: string;
  text: string;
  needsCitation: boolean;
  citationText?: string;
  citationStyle: 'IEEE' | 'APA' | 'MLA' | 'Simple';
}

export interface TaskItem {
  id: string;
  text: string;
  dueDate?: string;
  assignee?: string;
  isCompleted: boolean;
}

export interface DocTemplate {
  name: string;
  description: string;
  sections: Section[];
}

