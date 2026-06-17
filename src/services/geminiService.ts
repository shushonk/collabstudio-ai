import { GoogleGenAI } from "@google/genai";
import { Section } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash";

let genAI: any = null;

if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
  genAI = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export interface DocumentContext {
  title: string;
  sections: Section[];
}

export const isGeminiEnabled = () => !!genAI;

/**
 * Generic reply generator (calls server-side API)
 */
export async function generateGeminiReply(
  message: string, 
  history: {role: 'user' | 'assistant', content: string}[], 
  context: DocumentContext
): Promise<string> {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn("Server AI Error:", errorData.error);
      return generateFallbackReply(message, context);
    }

    const data = await response.json();
    return data.reply || "I'm sorry, I couldn't generate a reply.";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return generateFallbackReply(message, context);
  }
}

/**
 * Summarize document (calls server-side API)
 */
export async function summarizeDocument(context: DocumentContext): Promise<any> {
  try {
    const response = await fetch("/api/gemini/analyze-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

/**
 * Improve selected text (calls server-side API)
 */
export async function improveSelectedText(
  text: string, 
  action: 'improve' | 'simplify' | 'shorten' | 'expand', 
  contextText: string
): Promise<any> {
  try {
    const response = await fetch("/api/gemini/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text, context: contextText }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

/**
 * Fallback logic for demo/failure mode
 */
function generateFallbackReply(message: string, context: DocumentContext): string {
  const msg = message.toLowerCase();
  const fullText = context.sections.map(s => s.content).join(" ");

  if (msg.includes("summarize")) {
    const sentences = fullText.split(/[.!?]/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : ".");
    return `[Demo Fallback] Summary: ${summary || "No significant content found to summarize."}`;
  }

  if (msg.includes("title")) {
    const firstWords = context.sections[0]?.content.split(" ").slice(0, 5).join(" ");
    return `[Demo Fallback] Suggested Title: ${firstWords || "New Technical Specification"} - RefinedDraft`;
  }

  if (msg.includes("action") || msg.includes("task")) {
    const actionSentences = fullText.split(/[.!?]/).filter(s => 
      /\b(must|should|need|assign|complete|finish|todo|action)\b/i.test(s)
    );
    if (actionSentences.length > 0) {
      return `[Demo Fallback] Action Items:\n${actionSentences.map(s => `- ${s.trim()}`).join("\n")}`;
    }
    return "[Demo Fallback] No clear action items detected. Try adding words like 'must' or 'complete' to your notes.";
  }

  if (msg.includes("improve") || msg.includes("make it professional")) {
    return "[Demo Fallback] I've analyzed your text and ensured technical consistency. The flow is now optimized for professional documentation.";
  }

  return "[Demo Fallback] Gemini API key not found. I'm currently running in limited demonstration mode. Once you add your key to .env, I can provide real-time AI assistance.";
}
