// import { useRoom, useOthers, useBroadcastEvent, useEventListener, useSelf } from "../../liveblocks.config";
// import { getYjsProviderForRoom } from "@liveblocks/yjs";
// import { Editor } from "@monaco-editor/react";
// import { MonacoBinding } from "y-monaco";
// import { useEffect, useState, useRef } from "react";
// import { Tldraw } from "@tldraw/tldraw";
// import "@tldraw/tldraw/tldraw.css";

// export function CollaborativeEditor({ onShareClick }) {
//   const [editorRef, setEditorRef] = useState(null); // Monaco editor instance
//   const monacoRef = useRef(null); // Monaco global object
//   const [language, setLanguage] = useState("javascript");
//   const [output, setOutput] = useState("");
//   const [isRunning, setIsRunning] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const room = useRoom();
//   const others = useOthers() || [];
//   const self = useSelf();
//   const broadcast = useBroadcastEvent();
//   const yProvider = room ? getYjsProviderForRoom(room) : null;
//   const outputRef = useRef(null);
//   const chatRef = useRef(null);
//   const [showWhiteboard, setShowWhiteboard] = useState(false);

//   // Language boilerplate codes
//   const boilerplateCodes = {
//     javascript:
//       "// Welcome to CodeCollab!\n// Write JavaScript code here\n\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This code runs in real-time!';\n}\n\nexample();",
//     python:
//       "# Welcome to CodeCollab!\n# Write Python code here\n\nprint('Hello World!')\n\ndef example():\n    return 'This code runs in real-time!'\n\nprint(example())",
//     java:
//       "// Welcome to CodeCollab!\n// Write Java code here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n        System.out.println(example());\n    }\n    \n    public static String example() {\n        return \"This code runs in real-time!\";\n    }\n}",
//     cpp:
//       "// Welcome to CodeCollab!\n// Write C++ code here\n\n#include <iostream>\nusing namespace std;\n\nstring example() {\n    return \"This code runs in real-time!\";\n}\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    cout << example() << endl;\n    return 0;\n}"
//   };

//   // Set up Yjs binding for collaboration
//   useEffect(() => {
//     if (!editorRef || !yProvider) return;

//     let binding = null;
//     try {
//       const yDoc = yProvider.getYDoc();
//       const yText = yDoc.getText("monaco");
//       // Create MonacoBinding; guard against missing model
//       const model = editorRef.getModel();
//       if (model) {
//         binding = new MonacoBinding(yText, model, new Set([editorRef]), yProvider.awareness);
//       }
//     } catch (err) {
//       // Do not crash the app — log for debugging
//       // eslint-disable-next-line no-console
//       console.error("Failed to create MonacoBinding:", err);
//     }

//     return () => {
//       try {
//         binding && binding.destroy();
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.warn("Error destroying MonacoBinding:", err);
//       }
//     };
//   }, [editorRef, yProvider, room?.id]);

//   // When language changes, update monaco model language and reset boilerplate if needed
//   useEffect(() => {
//     if (editorRef && monacoRef.current) {
//       try {
//         // Update the model language so syntax highlighting matches
//         monacoRef.current.editor.setModelLanguage(editorRef.getModel(), language);
//       } catch (err) {
//         // ignore if it fails
//       }
//       // Replace the content with the selected boilerplate (keeps collaborative model in sync)
//       editorRef.setValue(boilerplateCodes[language] || "");
//     }
//   }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Handle incoming chat messages
//   useEventListener((event) => {
//     // Depending on the liveblocks version, event may be the event object directly
//     if (!event) return;

//     const type = event.type ?? (event?.event?.type);
//     const payload = event.payload ?? (event?.event?.payload);

//     if (type === "CHAT_MESSAGE" && payload) {
//       setMessages((prev) => [...prev, payload]);
//       scrollChatToBottom();
//     }

//     // If you plan to handle EXECUTE_CODE events from others, you can add logic here
//   });

//   // Display other users' cursors
//   const renderCollaboratorCursors = () => {
//     return others.map(({ connectionId, presence }) => {
//       if (!presence?.cursor) return null;

//       const hue = parseInt(String(connectionId), 36) % 360;
//       const color = `hsl(${hue}, 80%, 60%)`;

//       return (
//         <div
//           key={connectionId}
//           className="absolute z-10 w-2 h-6 rounded-sm"
//           style={{
//             left: presence.cursor.x,
//             top: presence.cursor.y,
//             transform: "translateY(-50%)",
//             backgroundColor: color
//           }}
//         />
//       );
//     });
//   };

//   // Simulated execution for all languages
//   const executeCode = async (code) => {
//     const consoleOutput = [];
//     const originalConsole = {
//       log: console.log,
//       error: console.error,
//       warn: console.warn,
//       info: console.info
//     };

//     // Intercept console methods to capture output
//     const interceptConsole = (method) => (...args) => {
//       const message = args
//         .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
//         .join(" ");
//       consoleOutput.push(message);
//       originalConsole[method](...args);
//     };

//     console.log = interceptConsole("log");
//     console.error = interceptConsole("error");
//     console.warn = interceptConsole("warn");
//     console.info = interceptConsole("info");

//     try {
//       let result;

//       // Simulate execution based on language
//       switch (language) {
//         case "python":
//           // Simulate Python execution
//           consoleOutput.push(">>> " + code.split("\n").join("\n>>> "));
//           consoleOutput.push("Hello World!");
//           consoleOutput.push("This code runs in real-time!");
//           result = "Python execution completed successfully";
//           break;

//         case "java":
//           // Simulate Java execution
//           consoleOutput.push("Compiling Main.java...");
//           consoleOutput.push("Running Main.class...");
//           consoleOutput.push("Hello World!");
//           consoleOutput.push("This code runs in real-time!");
//           result = "Java execution completed successfully";
//           break;

//         case "cpp":
//           // Simulate C++ execution
//           consoleOutput.push("Compiling with g++...");
//           consoleOutput.push("Running executable...");
//           consoleOutput.push("Hello World!");
//           consoleOutput.push("This code runs in real-time!");
//           result = "C++ execution completed successfully";
//           break;

//         default: // JavaScript
//           // Actual JavaScript execution
//           result = new Function(
//             `"use strict";\ntry {\n${code}\n} catch(e) { console.error('Runtime Error:', e.stack || e.message); throw e; }`
//           )();
//       }

//       return {
//         success: true,
//         output: consoleOutput.join("\n"),
//         result
//       };
//     } catch (error) {
//       // Only show error message without the stack trace
//       const errorMessage = error.stack ? error.stack.split("\n")[0] : error.message;

//       return {
//         success: false,
//         output: consoleOutput.join("\n") + (consoleOutput.length ? "\n\n" : "") + `${errorMessage}`,
//         error
//       };
//     } finally {
//       // Restore original console methods
//       console.log = originalConsole.log;
//       console.error = originalConsole.error;
//       console.warn = originalConsole.warn;
//       console.info = originalConsole.info;
//     }
//   };

//   // Run code and show output
//   const runCode = async () => {
//     if (!editorRef || isRunning) return;

//     setIsRunning(true);
//     const code = editorRef.getValue();

//     // Clear output before execution
//     setOutput("");

//     try {
//       // Broadcast the execution event (so others can react)
//       if (room) {
//         try {
//           await room.broadcastEvent({ type: "EXECUTE_CODE" });
//         } catch (err) {
//           // do not block execution if broadcast fails
//           // eslint-disable-next-line no-console
//           console.warn("Broadcast failed:", err);
//         }
//       }

//       const { success, output: executionOutput } = await executeCode(code);

//       if (executionOutput && executionOutput.trim()) {
//         setOutput(executionOutput);
//       } else {
//         setOutput(success ? "Code executed successfully (no output)" : "Execution failed (no error details)");
//       }

//       // Scroll to bottom after execution
//       setTimeout(() => {
//         if (outputRef.current) {
//           outputRef.current.scrollTop = outputRef.current.scrollHeight;
//         }
//       }, 50);
//     } catch (error) {
//       setOutput(`CRITICAL ERROR: ${error.message}`);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   // Clear output
//   const clearOutput = () => setOutput("");

//   // Send chat message
//   const sendMessage = () => {
//     if (!newMessage.trim()) return;

//     const message = {
//       id: Date.now(),
//       text: newMessage,
//       sender: self?.info?.name || `User-${Math.floor(Math.random() * 1000)}`,
//       timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     };

//     // broadcast if available, otherwise just append locally
//     try {
//       broadcast && broadcast({ type: "CHAT_MESSAGE", payload: message });
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.warn("Broadcast error:", err);
//     }

//     setMessages((prev) => [...prev, message]);
//     setNewMessage("");
//     scrollChatToBottom();
//   };

//   // Scroll chat to bottom
//   const scrollChatToBottom = () => {
//     setTimeout(() => {
//       try {
//         chatRef.current?.scrollTo({
//           top: chatRef.current.scrollHeight,
//           behavior: "smooth"
//         });
//       } catch (err) {
//         // ignore
//       }
//     }, 50);
//   };

//   // Available languages
//   const languages = [
//     { value: "javascript", label: "JavaScript" },
//     { value: "python", label: "Python" },
//     { value: "java", label: "Java" },
//     { value: "cpp", label: "C++" }
//   ];

//   return (
//     <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
//       {/* Header */}
//       <header className="bg-gray-800 border-b border-gray-700 p-4">
//         <div className="container mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <div className="text-2xl font-bold text-blue-400">CodeCollab</div>
//             <div className="text-sm bg-gray-700 px-2 py-1 rounded-full">v1.0.0</div>
//           </div>
//           <div className="flex items-center space-x-4">
//             {!showWhiteboard && (
//               <div className="flex items-center space-x-2">
//                 <span className="text-gray-400">Language:</span>
//                 <select
//                   value={language}
//                   onChange={(e) => setLanguage(e.target.value)}
//                   className="bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {languages.map((lang) => (
//                     <option key={lang.value} value={lang.value}>
//                       {lang.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => setShowWhiteboard(!showWhiteboard)}
//                 className={`text-sm px-3 py-1 rounded-md font-medium ${
//                   showWhiteboard ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300"
//                 }`}
//               >
//                 {showWhiteboard ? "Show Editor" : "Show Whiteboard"}
//               </button>
//               <div className="text-sm bg-gray-700 px-3 py-1 rounded-full flex items-center">
//                 <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
//                 <span>{room?.id ?? "No Room"}</span>
//               </div>
//               <button onClick={onShareClick} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">
//                 Share Room Name
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Editor/Whiteboard + Output Column */}
//         <div className="flex-1 flex flex-col container mx-auto p-4 space-y-4 overflow-hidden">
//           {showWhiteboard ? (
//             <div className="flex-1 bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700 relative">
//               <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
//                 <h2 className="font-medium text-gray-300">Whiteboard</h2>
//               </div>
//               <div className="absolute inset-0" style={{ top: "40px", bottom: 0 }}>
//                 <Tldraw showMenu={true} showTools={true} persistenceKey="tldraw-liveblocks" />
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* Editor Section */}
//               <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
//                 <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
//                   <h2 className="font-medium text-gray-300">Editor</h2>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={runCode}
//                       disabled={isRunning}
//                       className={`px-4 py-1 rounded-md font-medium flex items-center ${
//                         isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
//                       }`}
//                     >
//                       {isRunning ? (
//                         <>
//                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                           Executing...
//                         </>
//                       ) : (
//                         "Run Code"
//                       )}
//                     </button>
//                     <button onClick={clearOutput} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded-md font-medium text-gray-300">
//                       Clear Output
//                     </button>
//                   </div>
//                 </div>
//                 <div className="flex-1 relative">
//                   {renderCollaboratorCursors()}
//                   <Editor
//                     height="100%"
//                     theme="vs-dark"
//                     language={language}
//                     defaultValue={boilerplateCodes[language] || ""}
//                     onMount={(editor, monaco) => {
//                       monacoRef.current = monaco;
//                       setEditorRef(editor);
//                       editor.setValue(boilerplateCodes[language] || "");
//                     }}
//                     options={{
//                       minimap: { enabled: false },
//                       fontSize: 14,
//                       automaticLayout: true,
//                       wordWrap: "on",
//                       padding: { top: 15 },
//                       renderWhitespace: "selection",
//                       cursorStyle: "block-outline",
//                       mouseStyle: "text"
//                     }}
//                     beforeMount={(monaco) => {
//                       try {
//                         monaco.editor.defineTheme("custom-dark", {
//                           base: "vs-dark",
//                           inherit: true,
//                           rules: [],
//                           colors: {
//                             "editor.background": "#1F2937"
//                           }
//                         });
//                       } catch (err) {
//                         // ignore
//                       }
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Output Section */}
//               <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
//                 <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
//                   <h2 className="font-medium text-gray-300">Output</h2>
//                   <div className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</div>
//                 </div>
//                 <pre ref={outputRef} className="p-4 bg-gray-850 text-gray-200 font-mono text-sm h-40 overflow-y-auto whitespace-pre-wrap">
//                   {output || "Execution results will appear here..."}
//                 </pre>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Chat Sidebar */}
//         <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
//           <div className="p-3 border-b border-gray-700">
//             <h3 className="font-medium text-gray-300">Live Chat ({(others?.length ?? 0) + 1} online)</h3>
//           </div>
//           <div ref={chatRef} className="flex-1 p-3 overflow-y-auto space-y-3">
//             {messages.length === 0 ? (
//               <p className="text-gray-500 text-center mt-4">No messages yet</p>
//             ) : (
//               messages.map((message) => (
//                 <div key={message.id} className="bg-gray-750 p-2 rounded-lg">
//                   <div className="flex justify-between items-baseline">
//                     <span className="font-medium text-blue-400">{message.sender}</span>
//                     <span className="text-xs text-gray-500">{message.timestamp}</span>
//                   </div>
//                   <p className="mt-1 text-gray-200">{message.text}</p>
//                 </div>
//               ))
//             )}
//           </div>
//           <div className="p-3 border-t border-gray-700">
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                 placeholder="Type a message..."
//                 className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
//                 Send
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-gray-800 border-t border-gray-700 p-3 text-center text-sm text-gray-400">
//         <p>Share this room URL to collaborate in real-time • All changes are synchronized instantly</p>
//       </footer>
//     </div>
//   );
// }




import React, { useEffect, useState, useRef } from "react";
import { useRoom, useOthers, useBroadcastEvent, useEventListener, useSelf } from "../../liveblocks.config";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export function CollaborativeEditor({ onShareClick }) {
  const [editorRef, setEditorRef] = useState(null);
  const monacoRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const room = useRoom();
  const others = useOthers() || [];
  const self = useSelf();
  const broadcast = useBroadcastEvent();
  const yProvider = room ? getYjsProviderForRoom(room) : null;
  const outputRef = useRef(null);
  const chatRef = useRef(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // Hard-coded Piston endpoint (public instance)
  const PISTON_ENDPOINT = "https://emkc.org/api/v2/piston/execute";

  const boilerplateCodes = {
    javascript:
      "// Welcome to CodeCollab!\n// Write JavaScript code here\n\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This code runs in real-time!';\n}\n\nexample();",
    python:
      "# Welcome to CodeCollab!\n// Write Python code here\n\nprint('Hello World!')\n\ndef example():\n    return 'This code runs in real-time!'\n\nprint(example())",
    java:
      "// Welcome to CodeCollab!\n// Write Java code here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n        System.out.println(example());\n    }\n    \n    public static String example() {\n        return \"This code runs in real-time!\";\n    }\n}",
    cpp:
      "// Welcome to CodeCollab!\n// Write C++ code here\n\n#include <iostream>\nusing namespace std;\n\nstring example() {\n    return \"This code runs in real-time!\";\n}\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    cout << example() << endl;\n    return 0;\n}"
  };

  // Yjs - Monaco binding
  useEffect(() => {
    if (!editorRef || !yProvider) return;
    let binding = null;
    try {
      const yDoc = yProvider.getYDoc();
      const yText = yDoc.getText("monaco");
      const model = editorRef.getModel();
      if (model) {
        binding = new MonacoBinding(yText, model, new Set([editorRef]), yProvider.awareness);
      }
    } catch (err) {
      console.error("Failed to create MonacoBinding:", err);
    }
    return () => {
      try {
        binding && binding.destroy();
      } catch (err) {
        console.warn("Error destroying MonacoBinding:", err);
      }
    };
  }, [editorRef, yProvider, room?.id]);

  // Sync editor language & boilerplate
  useEffect(() => {
    if (editorRef && monacoRef.current) {
      try {
        monacoRef.current.editor.setModelLanguage(editorRef.getModel(), language);
      } catch (err) {
        // ignore
      }
      editorRef.setValue(boilerplateCodes[language] || "");
    }
  }, [language]);

  // Incoming chat events - FIXED THIS PART
  useEventListener(({ event }) => {
    if (event && event.type === "CHAT_MESSAGE") {
      setMessages((prev) => [...prev, event.payload]);
      scrollChatToBottom();
    }
  });

  // Render collaborator cursors based on presence.cursor
  const renderCollaboratorCursors = () => {
    return others.map(({ connectionId, presence }) => {
      if (!presence?.cursor) return null;
      const hue = parseInt(String(connectionId), 36) % 360;
      const color = `hsl(${hue}, 80%, 60%)`;
      return (
        <div
          key={connectionId}
          className="absolute z-10 w-2 h-6 rounded-sm"
          style={{
            left: presence.cursor.x,
            top: presence.cursor.y,
            transform: "translateY(-50%)",
            backgroundColor: color
          }}
        />
      );
    });
  };

  // Execute JS locally and capture console output
  const executeJSLocally = async (code) => {
    const consoleOutput = [];
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    const interceptConsole = (method) => (...args) => {
      const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ");
      consoleOutput.push(message);
      originalConsole[method](...args);
    };

    console.log = interceptConsole("log");
    console.error = interceptConsole("error");
    console.warn = interceptConsole("warn");
    console.info = interceptConsole("info");

    try {
      const result = new Function(`"use strict";\ntry {\n${code}\n} catch(e) { console.error('Runtime Error:', e.stack || e.message); throw e; }`)();
      return { success: true, output: consoleOutput.join("\n"), result };
    } catch (error) {
      const errorMessage = error.stack ? error.stack.split("\n")[0] : error.message;
      return { success: false, output: consoleOutput.join("\n") + (consoleOutput.length ? "\n\n" : "") + `${errorMessage}`, error };
    } finally {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    }
  };

  // Execute via Piston (public endpoint) for non-JS languages
  const executeOnPiston = async (lang, code) => {
    try {
      const filename = lang === "java" ? "Main.java" : lang === "cpp" ? "main.cpp" : "main";
      const payload = {
        language: lang,
        version: "*",
        files: [{ name: filename, content: code }]
      };

      const res = await fetch(PISTON_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errText = `Piston request failed: ${res.status} ${res.statusText}`;
        try {
          const j = await res.json();
          if (j?.message) errText += ` — ${j.message}`;
        } catch (e) {
          // ignore
        }
        return { success: false, output: errText };
      }

      const data = await res.json();

      if (data?.run) {
        return { success: true, output: data.run.output || data.run.stdout || data.run.stderr || "No run output", raw: data };
      } else if (data?.compile) {
        return { success: true, output: data.compile.output || data.compile.stdout || data.compile.stderr || "No compile output", raw: data };
      } else {
        return { success: true, output: JSON.stringify(data) };
      }
    } catch (err) {
      return { success: false, output: `Network/Execution error: ${err.message}`, error: err };
    }
  };

  // Main run handler: JS local, others via Piston
  const runCode = async () => {
    if (!editorRef || isRunning) return;
    setIsRunning(true);
    setOutput("");

    const code = editorRef.getValue();

    try {
      if (room) {
        try {
          await room.broadcastEvent({ type: "EXECUTE_CODE" });
        } catch (err) {
          console.warn("Broadcast failed:", err);
        }
      }

      let result;
      if (language === "javascript") {
        result = await executeJSLocally(code);
      } else {
        result = await executeOnPiston(language, code);
      }

      if (result?.output && String(result.output).trim()) {
        setOutput(String(result.output));
      } else {
        setOutput(result.success ? "Code executed successfully (no output)" : "Execution failed (no details)");
      }

      setTimeout(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }, 50);
    } catch (err) {
      setOutput(`CRITICAL ERROR: ${err?.message ?? String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => setOutput("");

  // FIXED THE SEND MESSAGE FUNCTION
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: self?.info?.name || `User-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    // Add the message to local state immediately
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    scrollChatToBottom();
    
    // Broadcast the message to other users
    try {
      broadcast({ type: "CHAT_MESSAGE", payload: message });
    } catch (err) {
      console.error("Failed to broadcast message:", err);
    }
  };

  const scrollChatToBottom = () => {
    setTimeout(() => {
      try {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      } catch (err) {
        // ignore
      }
    }, 50);
  };

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-400">CodeCollab</div>
            <div className="text-sm bg-gray-700 px-2 py-1 rounded-full">v1.0.0</div>
          </div>
          <div className="flex items-center space-x-4">
            {!showWhiteboard && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className={`text-sm px-3 py-1 rounded-md font-medium ${
                  showWhiteboard ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {showWhiteboard ? "Show Editor" : "Show Whiteboard"}
              </button>
              <div className="text-sm bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>{room?.id ?? "No Room"}</span>
              </div>
              <button onClick={onShareClick} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">
                Share Room Name
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor/Whiteboard + Output Column */}
        <div className="flex-1 flex flex-col container mx-auto p-4 space-y-4 overflow-hidden">
          {showWhiteboard ? (
            <div className="flex-1 bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700 relative">
              <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
                <h2 className="font-medium text-gray-300">Whiteboard</h2>
              </div>
              <div className="absolute inset-0" style={{ top: "40px", bottom: 0 }}>
                <Tldraw showMenu={true} showTools={true} persistenceKey="tldraw-liveblocks" />
              </div>
            </div>
          ) : (
            <>
              {/* Editor Section */}
              <div className="flex-1 flex flex-col bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
                  <h2 className="font-medium text-gray-300">Editor</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className={`px-4 py-1 rounded-md font-medium flex items-center ${
                        isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Executing...
                        </>
                      ) : (
                        "Run Code"
                      )}
                    </button>
                    <button onClick={clearOutput} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded-md font-medium text-gray-300">
                      Clear Output
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  {renderCollaboratorCursors()}
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    defaultValue={boilerplateCodes[language] || ""}
                    onMount={(editor, monaco) => {
                      monacoRef.current = monaco;
                      setEditorRef(editor);
                      editor.setValue(boilerplateCodes[language] || "");
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                      wordWrap: "on",
                      padding: { top: 15 },
                      renderWhitespace: "selection",
                      cursorStyle: "block-outline",
                      mouseStyle: "text"
                    }}
                    beforeMount={(monaco) => {
                      try {
                        monaco.editor.defineTheme("custom-dark", {
                          base: "vs-dark",
                          inherit: true,
                          rules: [],
                          colors: { "editor.background": "#1F2937" }
                        });
                      } catch (err) {
                        // ignore
                      }
                    }}
                  />
                </div>
              </div>

              {/* Output Section */}
              <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center bg-gray-750 px-4 py-2 border-b border-gray-700">
                  <h2 className="font-medium text-gray-300">Output</h2>
                  <div className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</div>
                </div>
                <pre ref={outputRef} className="p-4 bg-gray-850 text-gray-200 font-mono text-sm h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-700">
                  {output || "Execution results will appear here..."}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-medium text-gray-300">Live Chat ({(others?.length ?? 0) + 1} online)</h3>
          </div>
          <div ref={chatRef} className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-4">No messages yet</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-750 p-2 rounded-lg">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-blue-400">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="mt-1 text-gray-200">{message.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-3 text-center text-sm text-gray-400">
        <p>Share this room URL to collaborate in real-time • All changes are synchronized instantly</p>
      </footer>
    </div>
  );
}