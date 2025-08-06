// src/Components/CodeEditor.jsx





import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import {
  useRoom,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} from "@liveblocks/react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

import { useParams } from "react-router";

/* ------------------------- Replace with env vars in prod ------------------------- */
const LIVEBLOCKS_PUBLIC_KEY = "pk_dev_HxqY-jDyORfYfSHSzxwyJbzZCAZQrHmnnT91EKWngA_jX0BkgOQJvknHaMX_7DeO";
const GEMINI_API_KEY = "AIzaSyDbdAAQG7UBtiKJy591WYy2fi9ByKMJwk4";
/* --------------------------------------------------------------------------------- */

const CodeEditor = () => {

  const { roomId, initialPrompt } = useParams();

  const templates = {
    javascript: `function solution() {
  // Write your solution here
}`,
    python: `def solution():
    # Write your solution here
    pass`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
  };

  /* ------------------------ Inner editor (inside RoomProvider) ------------------------ */
  const EditorContent = ({ initialPrompt }) => {
    const [language, setLanguage] = useState("javascript");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [interviewerNotes, setInterviewerNotes] = useState("");
    const [candidatePrompt, setCandidatePrompt] = useState(initialPrompt || "");
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [isInterviewer, setIsInterviewer] = useState(false);


    const updateMyPresence = useUpdateMyPresence();
    const others = useOthers();
    const room = useRoom();

    // Yjs + WebRTC refs (optional peer-to-peer)
    const ydocRef = useRef(null);
    const webrtcRef = useRef(null);

    useEffect(() => {
      try {
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;
        const webrtcProvider = new WebrtcProvider(roomId, ydoc);
        webrtcRef.current = webrtcProvider;
      } catch (err) {
        console.error("Yjs/WebRTC init error:", err);
      }
      return () => {
        try {
          webrtcRef.current?.destroy?.();
        } catch (e) {
          console.error("webrtc cleanup err:", e);
        }
        try {
          ydocRef.current?.destroy?.();
        } catch (e) {
          console.error("ydoc cleanup err:", e);
        }
      };
    }, [roomId]);

    // Liveblocks storage & mutations
    const problem = useStorage((root) => root.problem);
    const code = useStorage((root) => root.code);

    const updateProblem = useMutation(
      ({ storage }, newProblem) => storage.set("problem", newProblem),
      []
    );
    const updateCode = useMutation(
      ({ storage }, newCode) => storage.set("code", newCode),
      []
    );

    // presence init
    useEffect(() => {
      try {
        updateMyPresence({ isTyping: false });
      } catch (e) { }
    }, [updateMyPresence]);

    // determine role from URL once
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      setIsInterviewer(params.get("role") === "interviewer");
    }, []);

    // ---------------------- Normalizers ----------------------
    const normalizeFieldToString = (v) => {
      if (v == null) return "";
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      // For objects/arrays, pretty-print compactly
      try {
        // If it's an array of strings, join them
        if (Array.isArray(v) && v.every((it) => typeof it === "string")) {
          return v.join("\n");
        }
        return JSON.stringify(v, null, 2);
      } catch (e) {
        return String(v);
      }
    };

    const normalizeRequirements = (r) => {
      if (!r) return [];
      if (Array.isArray(r)) {
        return r.map((item) => {
          if (typeof item === "string") return item;
          return normalizeFieldToString(item);
        });
      }
      // single string or object -> wrap into array-of-strings
      return [normalizeFieldToString(r)];
    };

    // ---------------------- Gemini fetching helper ----------------------
    const fetchQuestionFromPrompt = useCallback(
      async (prompt) => {
        if (!prompt || !prompt.trim()) {
          throw new Error("Empty prompt");
        }

        setIsGeneratingQuestion(true);
        setError(null);

        try {
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate a Data Structures and Algorithms coding problem based on the following prompt:\n\n${prompt}\n\nReturn the result as JSON exactly in this format:\n{ "title": "", "description": "", "requirements": [""], "sampleInput": "", "sampleOutput": "" }\n\nIMPORTANT: ensure all fields are either strings or arrays of strings. If you would return an object, convert it to a string.`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const data = await resp.json();
          const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!content) throw new Error("No content returned from Gemini");

          // Extract the first {...} block (safe-ish)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("Gemini response did not contain JSON");

          const parsed = JSON.parse(jsonMatch[0]);

          // Normalize fields (defensive)
          const newProblem = {
            title: normalizeFieldToString(parsed.title || "Untitled problem"),
            description: normalizeFieldToString(parsed.description || ""),
            requirements: normalizeRequirements(parsed.requirements),
            sampleInput: normalizeFieldToString(parsed.sampleInput || ""),
            sampleOutput: normalizeFieldToString(parsed.sampleOutput || ""),
          };

          // Update Liveblocks storage
          updateProblem(newProblem);

          // Reset code template to selected language
          updateCode(templates[language] || templates.javascript);

          return newProblem;
        } catch (err) {
          const msg = err?.message || String(err);
          setError(`Failed to generate question: ${msg}`);
          throw err;
        } finally {
          setIsGeneratingQuestion(false);
        }
      },
      [language, updateProblem, updateCode, templates]
    );

    // If initialPrompt exists, fetch a question on mount
    useEffect(() => {
      if (candidatePrompt && candidatePrompt.trim()) {
        fetchQuestionFromPrompt(candidatePrompt).catch(() => { });
      }
    }, [candidatePrompt, fetchQuestionFromPrompt]);

    // Manual generation (modal) uses the same helper
    const generateQuestion = useCallback(async () => {
      try {
        await fetchQuestionFromPrompt(candidatePrompt);
        setShowQuestionModal(false);
      } catch (e) {
        // error is already set in helper
      }
    }, [candidatePrompt, fetchQuestionFromPrompt]);

    // Mock analyzer (unchanged)
    const handleAnalyzeCode = async () => {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      setError(null);
      try {
        await new Promise((r) => setTimeout(r, 1500));
        setAnalysisResult({
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          efficiencyScore: Math.floor(Math.random() * 5) + 5,
          comment: "The solution looks efficient. Consider edge cases like empty input.",
        });
      } catch (err) {
        setError(`Failed to analyze code: ${err?.message || err}`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // ------------------------------ Safe render helpers ------------------------------
    const renderMaybeMultiline = (value) => {
      if (value == null || value === "") return null;
      const s = String(value);
      // if it looks like JSON (starts with { or [) or contains newline, render in <pre>
      if (s.trim().startsWith("{") || s.trim().startsWith("[") || s.includes("\n")) {
        return <pre className="whitespace-pre-wrap text-sm text-gray-300">{s}</pre>;
      }
      return <span>{s}</span>;
    };

    // ------------------------------ UI (kept identical) ------------------------------
    return (
      <div className="bg-[#0a0a0a] text-white min-h-screen">
        <div className="p-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Section */}
            <div className="bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-white">
                    {problem?.title || "Loading problem..."}
                  </h1>

                  {isInterviewer && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQuestionModal(true)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                    >
                      Edit Question
                    </motion.button>
                  )}
                </div>

                <div className="prose max-w-none text-gray-300 mb-6">
                  {problem?.description ? (
                    renderMaybeMultiline(problem.description)
                  ) : (
                    "Problem description will appear here"
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Requirements:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(problem?.requirements) && problem.requirements.length > 0 ? (
                        problem.requirements.map((req, i) => (
                          <li key={i} className="text-gray-300">
                            {renderMaybeMultiline(req) || <span className="text-gray-300">-</span>}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No requirements specified</li>
                      )}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#252525] p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Sample Input</h4>
                      <div className="font-mono text-sm text-gray-200 bg-[#333] p-2 rounded">
                        {problem?.sampleInput ? (
                          renderMaybeMultiline(problem.sampleInput)
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                    <div className="bg-[#252525] p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Sample Output</h4>
                      <div className="font-mono text-sm text-gray-200 bg-[#333] p-2 rounded">
                        {problem?.sampleOutput ? (
                          renderMaybeMultiline(problem.sampleOutput)
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isInterviewer && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">Interviewer Notes</h3>
                    <textarea
                      value={interviewerNotes}
                      onChange={(e) => setInterviewerNotes(e.target.value)}
                      placeholder="Private notes about the candidate's performance..."
                      className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="space-y-4">
              {/* Editor Controls */}
              <div className="bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] p-4">
                <div className="flex justify-between items-center">
                  <select
                    value={language}
                    onChange={(e) => {
                      const lang = e.target.value;
                      setLanguage(lang);
                      try {
                        updateCode(templates[lang]);
                      } catch (e) {
                        /* ignore */
                      }
                    }}
                    className="bg-[#252525] border border-[#333] text-white py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAnalyzeCode}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Analyze Code
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {Array.isArray(others) ? others.map(({ connectionId }) => (
                        <div key={connectionId} className="w-3 h-3 rounded-full bg-green-500" />
                      )) : null}
                      <span className="text-xs text-gray-400">{(Array.isArray(others) ? others.length : 0) + 1} online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] overflow-hidden" style={{ height: "300px" }}>
                <Editor
                  height="100%"
                  language={language}
                  value={code || templates.javascript}
                  onChange={(value) => {
                    try {
                      updateCode(value || "");
                    } catch (e) {
                      /* ignore */
                    }
                  }}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 20, bottom: 20 },
                    readOnly: false,
                  }}
                />
              </div>

              {/* Analysis Results */}
              <div className="bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] p-4">
                <h3 className="font-semibold text-lg mb-3 text-white">Analysis Results</h3>
                <div className="bg-[#252525] rounded-lg p-4 min-h-32 max-h-96 overflow-y-auto">
                  {error ? (
                    <div className="text-red-400 bg-red-900/50 p-3 rounded border border-red-800">{error}</div>
                  ) : analysisResult ? (
                    <div className="space-y-4 text-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-400">Time Complexity:</div>
                          <div className="font-mono bg-[#333] p-2 rounded mt-1 text-sm">
                            {analysisResult.timeComplexity}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-400">Space Complexity:</div>
                          <div className="font-mono bg-[#333] p-2 rounded mt-1 text-sm">
                            {analysisResult.spaceComplexity}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400">Efficiency Score:</div>
                        <div className="w-full bg-[#333] rounded-full h-2.5 mt-1">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" style={{ width: `${analysisResult.efficiencyScore * 10}%` }} />
                          <div className="text-xs text-right mt-1 text-gray-400">{analysisResult.efficiencyScore}/10</div>
                        </div>
                      </div>
                      {analysisResult.comment && (
                        <div>
                          <div className="text-sm font-medium text-gray-400">Feedback:</div>
                          <div className="mt-1 text-gray-300 bg-[#333] p-3 rounded">{analysisResult.comment}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic h-24 flex items-center justify-center">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing code...
                        </div>
                      ) : (
                        "Analysis results will appear here"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Modal */}
        <AnimatePresence>
          {showQuestionModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowQuestionModal(false)}>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#2a2a2a] p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">Generate New Question</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Problem Prompt</label>
                    <textarea
                      value={candidatePrompt}
                      onChange={(e) => setCandidatePrompt(e.target.value)}
                      placeholder="Describe the problem requirements..."
                      className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setShowQuestionModal(false)} className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors">
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={generateQuestion} disabled={isGeneratingQuestion} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                      {isGeneratingQuestion ? "Generating..." : "Generate Question"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ----------------------- Top-level providers ----------------------- */
  // NOTE: initialStorage.problem is minimal/empty — Gemini will populate it from initialPrompt
  return (
    <LiveblocksProvider publicApiKey={LIVEBLOCKS_PUBLIC_KEY}>
      <RoomProvider
        id={roomId}
        initialPresence={{ isTyping: false }}
        initialStorage={{
          problem: {
            title: "",
            description: "",
            requirements: [],
            sampleInput: "",
            sampleOutput: "",
          },
          code: templates.javascript,
        }}
      >
        <EditorContent initialPrompt={initialPrompt} />
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default CodeEditor;
