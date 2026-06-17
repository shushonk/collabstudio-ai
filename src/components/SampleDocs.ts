import { Section, Collaborator, Conflict, Revision } from "../types";

export const INITIAL_SECTIONS: Section[] = [
  {
    id: "sec-1",
    title: "1. Executive Summary",
    content: "Project Apex aims to construct a unified telemetry router for next-generation smart-city public shuttle buses. By streaming localized traffic metrics, the service will reroute buses away from congested zones. Active contributors have converged on building an event-driven engine. However, there are still some formatting mismatches below about system metrics that need to be resolved."
  },
  {
    id: "sec-2",
    title: "2. Technical Architecture & Ingress",
    content: "The gateway binds on port 8080 and handles high-throughput JSON payloads. Real-time streams are ingested through high-speed WebSocket connections. Leo argues that we should utilize a strictly typed validation pipe to drop distorted GPS coordinates immediately to protect message health, whereas Alex wants to buffer all inputs and run fuzzy recovery on broken coordinates to enrich our visual maps."
  },
  {
    id: "sec-3",
    title: "3. API Key & Security Specifications",
    content: "To access the transit dispatch service, clients must present an authorized Bearer Token generated from their partner console. NOTE: For security reasons, we must warn clients never to store the system's private API credentials inside client-side JS bundles. Make sure to keep credentials strictly private. Private keys must always remain server-side and never be parsed by client browsers."
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: "collab-leo",
    name: "Leo Chang",
    color: "bg-emerald-500",
    role: "Tech Lead",
    isOnline: true,
    isTyping: false,
    activeSectionId: "sec-2"
  },
  {
    id: "collab-sarah",
    name: "Sarah Miller",
    color: "bg-fuchsia-500",
    role: "UX Writer",
    isOnline: true,
    isTyping: false,
    activeSectionId: "sec-1"
  },
  {
    id: "collab-alex",
    name: "Alex Rivera",
    color: "bg-amber-500",
    role: "Product Manager",
    isOnline: true,
    isTyping: false,
    activeSectionId: "sec-2"
  }
];

export const INITIAL_REVISIONS: Revision[] = [
  {
    id: "rev-1",
    timestamp: "10:15 AM",
    author: "Sarah Miller",
    summary: "Created the initial outline and drafted Executive Summary draft",
    title: "Project Apex Transport Spec",
    sections: [
      { id: "sec-1", title: "1. Executive Summary", content: "Initial stub for Project Apex smart transport telemetry gateway." },
      { id: "sec-2", title: "2. Technical Architecture & Ingress", content: "To be added." },
      { id: "sec-3", title: "3. API Key & Security Specifications", content: "Security parameters to follow TLS 1.3 standards." }
    ]
  },
  {
    id: "rev-2",
    timestamp: "10:30 AM",
    author: "Leo Chang",
    summary: "Populated ingest parameters, specified port 8080 constraints, and defined transit metrics limits",
    title: "Project Apex Transport Spec (Rev 2)",
    sections: [
      { id: "sec-1", title: "1. Executive Summary", content: "Project Apex telemetry router for smart-city public shuttle buses." },
      { id: "sec-2", title: "2. Technical Architecture & Ingress", content: "Gateway binds on port 8080 and handles high-throughput JSON payloads." },
      { id: "sec-3", title: "3. API Key & Security Specifications", content: "Security parameters to follow TLS 1.3 standards." }
    ]
  }
];

export const SHARED_DOCS: any[] = [
  {
    id: "doc-shared-1",
    title: "API Compliance Handshake Specs",
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isStarred: false,
    isTrashed: false,
    ownerId: "user-system",
    userPermission: "Viewer",
    collaborators: INITIAL_COLLABORATORS,
    sections: [
      {
        id: "sh-1-1",
        title: "Overview",
        content: "Detailed technical specifications for the API Compliance Handshake protocol, establishing a secure baseline for cross-cluster communication."
      },
      {
        id: "sh-1-2",
        title: "Authentication Flow",
        content: "Handshake processes must initiate with a signed challenge-response sequence. Use HMAC-SHA256 with rotating keys as defined in the global security baseline."
      },
      {
        id: "sh-1-3",
        title: "Request Signing",
        content: "Every inbound telemetry packet must include an X-Signature header. Payloads are canonicalized prior to hashing to prevent signature mismatches on varied JSON spacing."
      },
      {
        id: "sh-1-4",
        title: "Token Rotation",
        content: "Ephemeral tokens expire every 15 minutes. Clients must maintain a silent heartbeat refresh cycle on port 443."
      },
      {
        id: "sh-1-5",
        title: "Error Handling",
        content: "Return standard 4xx codes for malformed signatures. DO NOT return stack traces or internal infrastructure mapping in error responses."
      },
      {
        id: "sh-1-6",
        title: "Audit Logging",
        content: "All failed handshake attempts are logged to the security audit cluster. Metadata includes sender IP and TLS version mismatch errors."
      },
      {
        id: "sh-1-7",
        title: "Security Checklist",
        content: "- TLS 1.3 Minimum enforced\n- Perfect Forward Secrecy enabled\n- No fallback to SHA-1"
      }
    ]
  },
  {
    id: "doc-shared-2",
    title: "Corporate Policy Master outline",
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isStarred: false,
    isTrashed: false,
    ownerId: "user-system",
    userPermission: "Commenter",
    collaborators: INITIAL_COLLABORATORS,
    sections: [
      {
        id: "sh-2-1",
        title: "Purpose",
        content: "Define the fundamental data governance and access control frameworks across the corporate workspace ecosystem."
      },
      {
        id: "sh-2-2",
        title: "Access Policy",
        content: "Role-Based Access Control (RBAC) is the primary model. Permissions are audited quarterly via the compliance dashboard."
      },
      {
        id: "sh-2-3",
        title: "Data Handling Rules",
        content: "Sensitive telemetry coordinates must be sanitized in development environments. Production databases utilize field-level encryption."
      },
      {
        id: "sh-2-4",
        title: "Approval Workflow",
        content: "Critical policy changes require a two-person approval sign-off from the steering committee."
      },
      {
        id: "sh-2-5",
        title: "Compliance Requirements",
        content: "Adhere to ISO 27001 standards and localized data sovereignty laws."
      },
      {
        id: "sh-2-6",
        title: "Review Schedule",
        content: "Next major review: December 2026."
      }
    ]
  }
];

export const INITIAL_CONFLICTS: Conflict[] = [
  {
    id: "conf-1",
    sectionId: "sec-2",
    sectionTitle: "2. Technical Architecture & Ingress",
    originalText: "The gateway binds on port 8080 and handles high-throughput JSON payloads. Real-time streams are ingested through high-speed WebSocket connections.",
    authorA: "Leo Chang (Tech Lead)",
    versionA: "The telemetry router must discard distorted telemetry GPS lines in the filter pipe to avoid computing inaccurate averages. Buffer timeouts should represent strict 50ms windows.",
    authorB: "Alex Rivera (Product Manager)",
    versionB: "The telemetry router should always preserve incoming telemetry coordinates, running coordinates through a fuzzy linear interpolator to prevent route gaps in the UI dashboard analytics map.",
    status: "pending"
  }
];
