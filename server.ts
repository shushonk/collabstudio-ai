import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini API Client creator
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Assist and Writing API
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { action, text, context, tone, instruction } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing required string 'text'" });
    }

    const ai = getGeminiClient();
    
    let promptSuffix = "";
    if (action === "improve") {
      promptSuffix = "Improve the general spelling, grammar, readability, and overall quality of the text.";
    } else if (action === "simplify") {
      promptSuffix = "Simplify the text to make it extremely clear, readable, and easy to understand.";
    } else if (action === "shorten") {
      promptSuffix = "Shorten the text substantially by cutting out fluff/unnecessary words while keeping core facts.";
    } else if (action === "expand") {
      promptSuffix = "Expand on the ideas present in this text, adding professional details, transitions, and flow.";
    } else if (action === "tone" && tone) {
      promptSuffix = `Rewrite this text in a strictly ${tone} tone constraint.`;
    } else if (action === "custom" && instruction) {
      promptSuffix = `Follow this custom instruction carefully: "${instruction}"`;
    } else {
      promptSuffix = "Proofread, rewrite, and improve the style of this text.";
    }

    const systemInstruction = `
You are CollabEditor AI, an expert embedded collaborative document helper.
Your role is to help users write, rewrite, expand, simplify, and edit selected pieces of text.
You MUST output your response matching the requested JSON schema.
Ensure your rewrite preserves the author's key intent and factual info, but improves punctuation, structure, typography, and phrasing.
In the "changes" array, list exactly 2 to 4 bullet points explaining what you edited or improved, stating it professionally and briefly.
`;

    const contents = `
Surrounding/Full Document Context:
${context ? `"""\n${context}\n"""` : "No extra context provided."}

The selected text to rewrite/edit:
"""
${text}
"""

Task for selected text:
${promptSuffix}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            suggested: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short bullets list of precise stylistic or structural changes made."
            }
          },
          required: ["original", "suggested", "changes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response returned from the model.");
    }

    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Gemini Assist API error:", err);
    res.status(500).json({ error: err.message || "Failed to process writing assistance." });
  }
});

// 2. Summarize Changes API
app.post("/api/gemini/summarize-changes", async (req, res) => {
  try {
    const { changeLog } = req.body;
    if (!changeLog || !Array.isArray(changeLog)) {
      return res.status(400).json({ error: "Missing parameter 'changeLog' as array" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are CollabEditor AI, an assistant for collaborative editing.
Examine the history timeline of recent changes/updates made in the document, and output a structured response in JSON.
Your JSON must strictly match the schema specified.
- "updates": list what sections was edited by whom and summarize what they accomplished conceptually.
- "decisions": list any formatting/topic shifts or alignment milestones obvious in the logs.
- "actionItems": list 2-3 logical next steps for the team to complete or refine based on what is currently drafted.
Keep all points concise, professional, and directly linked to the provided timeline events.
`;

    const contents = `
Timeline events / change logs:
${JSON.stringify(changeLog, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: { type: Type.ARRAY, items: { type: Type.STRING } },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["updates", "decisions", "actionItems"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response returned from the model.");
    }

    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Gemini Summarize API error:", err);
    res.status(500).json({ error: err.message || "Failed to summarize timeline changes." });
  }
});

// 3. Reconcile Editing Conflicts API
app.post("/api/gemini/reconcile-conflicts", async (req, res) => {
  try {
    const { originalText, authorA, versionA, authorB, versionB } = req.body;
    if (!authorA || !authorB) {
      return res.status(400).json({ error: "Missing authors info" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are CollabEditor AI, a collaboration facilitator for real-time document teamwork.
You have encountered a paragraph conflict. Author A (${authorA}) and Author B (${authorB}) both updated the same block of original text concurrently.
Your job is to:
1. Reconcile both viewpoints intelligently. Create a unified "mergedText" that preserves any critical facts, assertions, or aesthetic views brought by both authors, keeping the language seamless, elegant, and professional.
2. Formulate "viewpointsPreserved" in exactly 2 bullet points explaining how you respected each author's perspective (e.g. "Drafted Leo's inclusion of safety benchmarks while adopting Sarah's customer-focused voice").
3. Create a brief "explanation" summarizing current alignment suggestions.
Return your response matching the specified JSON schema.
`;

    const contents = `
Original Paragraph / Text before edits:
"""
${originalText || "[No original text, newly inserted block]"}
"""

Author A ("${authorA}")'s proposed version:
"""
${versionA}
"""

Author B ("${authorB}")'s proposed version:
"""
${versionB}
"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mergedText: { type: Type.STRING },
            viewpointsPreserved: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING }
          },
          required: ["mergedText", "viewpointsPreserved", "explanation"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response returned from the model.");
    }

    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Gemini Reconcile API error:", err);
    res.status(500).json({ error: err.message || "Failed to reconcile conflicts." });
  }
});

// 4. Analyze Document Consistency, Redundancy, Readability
app.post("/api/gemini/analyze-document", async (req, res) => {
  try {
    const { title, sections } = req.body;
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: "Missing parameter 'sections'" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are CollabEditor AI, a structural reviewer and editor. 
Analyze the entire document including title and multiple sections written dynamically.
1. Determine a Flesch-Kincaid-like readability score from 0 (very dense) to 100 (high clarity, very readable).
2. Scan all section content for any duplicated ideas, redundant warnings, or repetitive blocks of information. List them in "redundancies", explaining which areas overlap and high level "suggestedFix" suggestions.
3. Offer 2-4 key stylistic advice or "consistencyTips" to align tone mismatch (such as Leo utilizing highly dry technical language while Sarah uses warm, casual language in another section).
Return strictly formatted JSON response.
`;

    const contents = `
Document Title: ${title || "Untitled Document"}
Sections of the document:
${sections.map((se: any, idx: number) => `\n--- Section ${idx+1}: ${se.title} ---\n${se.content}`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readabilityScore: { type: Type.INTEGER },
            redundancies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  message: { type: Type.STRING, description: "A message describing where redundancy or duplication was detected (e.g. 'Safety and Quickstart sections both define port setup')." },
                  suggestedFix: { type: Type.STRING, description: "Succinct instruction explaining how to consolidate." }
                },
                required: ["message", "suggestedFix"]
              }
            },
            consistencyTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["readabilityScore", "redundancies", "consistencyTips"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response returned from the model.");
    }

    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Gemini Analyze API error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze document metrics." });
  }
});

// 5. General Chat API with Document Context
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing parameter 'message'" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are CollabEditor AI, a versatile and helpful chat assistant living inside a collaborative document editor.
Your goal is to help the user with any questions they have, while specifically being aware of their current document content.
- Use a friendly, professional, and slightly technical tone.
- Reference the document context specifically if asked about the current file.
- If no document context is provided, answer normally.
- Keep responses concise but helpful.
`;

    const docContext = context ? `
Current Document Title: ${context.title || "Untitled"}
Current Document Content:
${context.sections?.map((s: any) => `## ${s.title}\n${s.content}`).join("\n\n") || "Empty"}
` : "No document currently active.";

    const contents = [
      { role: "user", parts: [{ text: docContext }] },
      { role: "model", parts: [{ text: "Understood. I have access to your document context. How can I help you with it today?" }] },
      ...(history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini Chat API error:", err);
    res.status(500).json({ error: err.message || "Failed to generate chat response." });
  }
});

// Standard API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CollabEditor Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
