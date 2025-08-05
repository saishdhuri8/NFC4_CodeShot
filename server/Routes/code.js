import { Router } from "express";
import axios from "axios";

const codeRoutes = Router();

// You can also dynamically fetch version list and pick default if needed
const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  cpp: "10.2.0",
  javascript: "18.15.0",
  java: "15.0.2",
  c: "10.2.0",
  // Add more languages and versions if needed
};

codeRoutes.post("/run", async (req, res) => {
  const { code, language, testCases } = req.body;

  console.log(req.body);

  if (!code || !language || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "code, language, and testCases[] are required." });
  }

  const version = LANGUAGE_VERSIONS[language];

  if (!version) {
    return res.status(400).json({ error: `Unsupported language or missing version for: ${language}` });
  }

  const outputs = [];

  try {
    for (let i = 0; i < testCases.length; i++) {
      const input = testCases[i];

      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version,
        files: [
          {
            name: `Main.${language === "cpp" ? "cpp" : language}`,
            content: code,
          },
        ],
        stdin: input,
      });

      const output = response.data.run?.stdout || response.data.run?.output || response.data.output;

      outputs.push({
        input,
        output: output?.trim() ?? "No output",
      });
    }

    return res.status(200).json({ results: outputs });

  } catch (error) {
    console.error("Execution Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Code execution failed." });
  }
});

export default codeRoutes;
