import { useState, useEffect, useRef } from "react";

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export interface UseVoiceOptions {
  onCommandDetected?: (command: string, recognizedText: string) => void;
  onDictationDetected?: (dictation: string) => void;
  onSpeechEnd?: (finalText: string, isCommand: boolean) => void;
}

const COMMAND_KEYWORDS = [
  "rewrite", "summarize", "shorter", "shorten", "expand", "bullet", "list", "points",
  "fix", "grammar", "correct", "read", "speak", "aloud", "stop", "pause", "resume",
  "action", "items", "generate", "create", "heading", "title", "audit", "simplify"
];

export function useVoice({ onCommandDetected, onDictationDetected, onSpeechEnd }: UseVoiceOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Recognition and synthesis refs
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isIntentionalStop = useRef(false);

  // Initialize browser Web Speech support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  // Speech Recognition control
  const startListening = () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    isIntentionalStop.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser. Please try Chrome/Edge.");
      return;
    }

    try {
      // If already speaking, stop it first
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceState("listening");
      };

      rec.onresult = (event: any) => {
        let final = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => prev + " " + final);
        }
        setInterimTranscript(interim);
      };

      rec.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setError("Microphone permission was denied. Please grant microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          // Ignore general silent pauses
        } else {
          setError(`Speech recognition issue: ${event.error}`);
        }
        setVoiceState("idle");
      };

      rec.onend = () => {
        if (!isIntentionalStop.current && voiceState === "listening") {
          // Restart if not intentionally stopped to simulate continuous dictation
          try {
            recognitionRef.current.start();
          } catch (e) {
            setVoiceState("idle");
          }
        } else {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setError(`Failed to launch recording: ${err.message}`);
      setVoiceState("idle");
    }
  };

  const stopListening = () => {
    isIntentionalStop.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState("idle");

    // Process final transcription text
    const finalText = (transcript + " " + interimTranscript).trim();
    if (finalText) {
      // Classify as command vs dictation
      const normalized = finalText.toLowerCase();
      const isCmd = COMMAND_KEYWORDS.some((kw) => normalized.includes(kw));

      if (isCmd) {
        if (onCommandDetected) onCommandDetected(normalized, finalText);
      } else {
        if (onDictationDetected) onDictationDetected(finalText);
      }

      if (onSpeechEnd) {
        onSpeechEnd(finalText, isCmd);
      }
    }
  };

  // Text-To-Speech Controls
  const speakText = (text: string, onEndCallback?: () => void) => {
    try {
      if (!window.speechSynthesis) {
        setError("Browser does not support Text-To-Speech.");
        return;
      }

      // Cancel ongoing first
      window.speechSynthesis.cancel();

      if (!text || !text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.0;

      utterance.onstart = () => {
        setVoiceState("speaking");
      };

      utterance.onend = () => {
        setVoiceState("idle");
        if (onEndCallback) {
          onEndCallback();
        }
      };

      utterance.onerror = (e) => {
        console.error("TTS speech error", e);
        setVoiceState("idle");
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error(err);
      setVoiceState("idle");
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  return {
    isSupported,
    voiceState,
    setVoiceState,
    transcript: transcript.trim() + (interimTranscript ? " " + interimTranscript : ""),
    error,
    setError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  };
}
