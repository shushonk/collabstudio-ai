import { DocTemplate } from "../types";

export const DOCUMENT_TEMPLATES: DocTemplate[] = [
  {
    name: "Project Proposal",
    description: "Pitch a new initiative or product, highlighting goals, scope, and key deliverables.",
    sections: [
      {
        id: "prop-1",
        title: "1. Executive Summary & Goals",
        content: "We propose the initiative Project Summit to modernize our system with an AI-driven automation framework. Our objective is to increase transaction parsing efficiency by 40% and eliminate high-latency bottleneck points in our current synchronous job pipeline."
      },
      {
        id: "prop-2",
        title: "2. Scope of Work",
        content: "This project will cover the implementation of high-throughput server side ingestion pipelines, integration of localized caching layers, and the release of custom web dash visualizers. It excludes migrating historical legacy data older than 24 months."
      },
      {
        id: "prop-3",
        title: "3. Timber & Milestones",
        content: "Phase 1: Initial Discovery and Schema Definitions (Weeks 1-3). Phase 2: Core Event Engine and Pipeline Implementation (Weeks 4-8). Phase 3: Validation, Security audits, and Deployment (Weeks 9-12)."
      }
    ]
  },
  {
    name: "Meeting Notes",
    description: "Track discussion summaries, key architecture decisions, and action items.",
    sections: [
      {
        id: "meet-1",
        title: "1. Meeting Overview",
        content: "Date: June 16, 2026. Attendees: John Doe, Sarah Miller, Leo Chang. Objective: Discuss the backend telemetry latency issue and align on the pipeline optimization timeline."
      },
      {
        id: "meet-2",
        title: "2. Discussion & Decisions",
        content: "Leo Chang suggested moving the telemetry parser to a worker thread pool. Sarah Miller proposed adding client-side debouncing of 300ms to avoid overwhelming socket connections. This will be integrated into the Q3 release schedule."
      },
      {
        id: "meet-3",
        title: "3. Action Items",
        content: "- Leo Chang: Implement prototype cluster clustering in Node.js (Due Friday).\n- Sarah Miller: Adjust UI polling triggers in dashboard views.\n- Alex Rivera: Verify AWS CloudWatch throughput limits."
      }
    ]
  },
  {
    name: "Technical Documentation",
    description: "Write structured technical manuals or software API setup guidelines.",
    sections: [
      {
        id: "tech-1",
        title: "1. System Overview",
        content: "The gateway binds on port 3000 to coordinate upstream service requests. The system routes inbound JSON telemetry logs through a robust schema validation pipe before storing records inside a distributed database."
      },
      {
        id: "tech-2",
        title: "2. Quickstart Reference",
        content: "To initiate the local dev stack, run `npm install` and `npm run dev`. Config options can be adjusted in the `.env` settings file, requiring variable token overrides for secure API key environments."
      }
    ]
  },
  {
    name: "Product Requirements Document",
    description: "Perfect for product managers detailing features, user stories, and specs.",
    sections: [
      {
        id: "prd-1",
        title: "1. Problem Statement & Value Prop",
        content: "Users currently lose track of edit histories during rapid multi-user writing sessions. A live edit playback feature ensures every user can audit additions, re-trace edits, and resolve disputes immediately."
      },
      {
        id: "prd-2",
        title: "2. User Stories",
        content: "- As a writer, I want to see which author contributed a particular sentence so that I can attribute credits.\n- As a co-author, I want to merge conflicting drafts cleanly so that I do not accidentally delete important ideas."
      },
      {
        id: "prd-3",
        title: "3. Release Requirements",
        content: "P1: Real-time user cursor sync. P1: Interactive conflict resolver interface. P2: Spoken voice controls for quick editing presets."
      }
    ]
  },
  {
    name: "Research Report",
    description: "An academic study design layout, complete with thesis objectives and data analysis.",
    sections: [
      {
        id: "res-1",
        title: "1. Abstract",
        content: "This study investigates the impact of real-time collaborative text editing on team writing efficiency. We analyze response latencies of AI-prompted suggestions against traditional manual correction processes."
      },
      {
        id: "res-2",
        title: "2. Methodology",
        content: "A controlled trial was administered to 120 professional editors. Quantitative factors included drafting time, keystroke counts, error correction rates, and subjective feedback regarding active assistance quality."
      },
      {
        id: "res-3",
        title: "3. Findings & Conclusions",
        content: "Teams utilizing continuous speech-to-text dictation paired with server-side AI rewrite actions finished drafts 37% faster, reporting higher overall cohesion."
      }
    ]
  },
  {
    name: "Resume / CV Draft",
    description: "Structure your professional background, milestones, and technical skillset.",
    sections: [
      {
        id: "cv-1",
        title: "1. Professional Profile",
        content: "Results-driven Staff Engineer with 8+ years of enterprise experience designing scalable backend architectures, real-time sync systems, and high-performance React user experiences."
      },
      {
        id: "cv-2",
        title: "2. Key Technical Achievements",
        content: "- Built decentralized real-time chat gateway handling 100k synchronous connections.\n- Developed serverless processing pipelines reducing cold start speeds by 55%."
      }
    ]
  },
  {
    name: "Blog Article",
    description: "Draft engaging content with structured paragraphs, examples, and callouts.",
    sections: [
      {
        id: "blog-1",
        title: "1. Introduction",
        content: "Writing is rarely a solo sport. In today's digital landscape, we constantly co-create, brainstorm, and review documents together. Yet, collaboration systems remain slow and prone to painful edit conflicts."
      },
      {
        id: "blog-2",
        title: "2. The AI Revolution in Documents",
        content: "Imagine a text editor that doesn't just listen to your keystrokes, but understands the intent behind your collaborations, acts as a mediator inside conflicts, and accepts speech directions seamlessly."
      }
    ]
  },
  {
    name: "Business Email",
    description: "A formal proposal, outreach, or client newsletter announcement template.",
    sections: [
      {
        id: "email-1",
        title: "1. Project Status Update Email",
        content: "Subject: Major Progress Milestone Achieved - Project Apex Telemetry Gateway\n\nDear Steering Committee,\n\nI am delighted to report that our core event processing backend has been successfully integrated and validated on port 8080."
      },
      {
        id: "email-2",
        title: "2. Call To Action",
        content: "Please review the updated transit specifications model by Friday afternoon and provide any architectural feedback directly using the collaborative system's comment sideview. Thank you."
      }
    ]
  },
  {
    name: "Study Notes",
    description: "Organize theoretical concepts, quick summary definitions, and cheat-lists.",
    sections: [
      {
        id: "study-1",
        title: "1. Key Concepts: Distributed Systems",
        content: "Topic 1: CAP Theorem. In any network partition event, a distributed data store can prioritize either Consistency or Availability, but cannot guarantee both concurrently."
      },
      {
        id: "study-2",
        title: "2. Summary Definitions",
        content: "Consistency: Every read receives the most recent write or an error.\nAvailability: Every request receives a non-error response, without the guarantee details."
      }
    ]
  },
  {
    name: "Software Design Document",
    description: "Deep dive system architectures, scaling layouts, and security blueprints.",
    sections: [
      {
        id: "sdd-1",
        title: "1. Engineering Goals & Architecture",
        content: "We are designing a microservices-based ingest engine for Project Apex telemetry records. Scalability criteria require backing nodes that support horizontal container expansion across regions."
      },
      {
        id: "sdd-2",
        title: "2. Security & Token Infrastructure",
        content: "Requests are verified at the gateway middleware level using cryptographic JWT validation. Private decryption keys are supplied by secure KMS systems on server-side containers."
      }
    ]
  },
  {
    name: "Bug Report",
    description: "File issues clearly with steps to reproduce, actual vs expected, and logs.",
    sections: [
      {
        id: "bug-1",
        title: "1. Problem Description",
        content: "Bug ID: BUG-992. High CPU usage spikes to 98% when receiving distorted coordinate entries from device simulators. WebSocket drops connections continuously."
      },
      {
        id: "bug-2",
        title: "2. Steps to Reproduce",
        content: "1. Start local mock gateway.\n2. Ingest payload with empty latitude inputs.\n3. Observe node task-pool lock-up."
      }
    ]
  },
  {
    name: "Sprint Planning Document",
    description: "Establish task velocities, sprint deliverables, and team bandwidth allocations.",
    sections: [
      {
        id: "sprint-1",
        title: "1. Sprint Goals: Sprint 24",
        content: "Deliverable A: Complete full integration of browser speech-to-text controls. Deliverable B: Stabilize document health dashboard and layout constraints."
      },
      {
        id: "sprint-2",
        title: "2. Backlog Allocation",
        content: "- Feature 104: Text-To-Speech reader implementation (Leo Chang - 5 Points).\n- Feature 105: UI focus mode and template gallery setup (Sarah Miller - 3 Points)."
      }
    ]
  }
];
