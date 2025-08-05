import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import * as monaco from "monaco-editor";

export default function CollaborativeEditor({ roomName = "codecollab-room" }) {
  const editorRef = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider("wss://demos.yjs.dev", roomName, ydoc);
    const yText = ydoc.getText("monaco");

    // ✅ Enable proper JS support
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
    });

    // ✅ Inject DOM & ES type definitions
    // This adds proper definitions for `console`, `window`, `setTimeout`, etc.
    fetch("https://unpkg.com/typescript@5.3.3/lib/lib.dom.d.ts")
      .then(res => res.text())
      .then(domLib => {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          domLib,
          "file:///node_modules/lib.dom.d.ts"
        );
      });

    fetch("https://unpkg.com/typescript@5.3.3/lib/lib.esnext.d.ts")
      .then(res => res.text())
      .then(esLib => {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          esLib,
          "file:///node_modules/lib.esnext.d.ts"
        );
      });

    const model = monaco.editor.createModel(
      "",
      "javascript",
      monaco.Uri.parse("file:///main.js")
    );

    const editor = monaco.editor.create(divRef.current, {
      model,
      theme: "vs-dark",
      automaticLayout: true,
    });

    editorRef.current = editor;

    const monacoBinding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      provider.awareness
    );

    return () => {
      editor.dispose();
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomName]);

  return <div ref={divRef} style={{ height: "80vh", width: "100%" }} />;
}
