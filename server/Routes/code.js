import { Router } from "express";
import axios from "axios";

const codeRoutes = Router();

const GEMINI_API_KEY = "AIzaSyDbdAAQG7UBtiKJy591WYy2fi9ByKMJwk4";
const GEMINI_MODEL = "gemini-2.5-flash"; // Using 1.5-flash for better performance
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt({ ps, code, language }) {
  return `
Analyze this ${language} code for time/space complexity and correctness.
Return ONLY this JSON structure (no extra text):

{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "efficiencyScore": 1-10,
  "comment": "Over here you have to provide a short comment on the code where it was right or wrong you dont have to give any solution to the problem keep this part as small as possible one more this here dont tell what is wrong just"
}

Problem: ${ps.substring(0, 500)} // Truncate if too long
Code:
\`\`\`${language}
${code.substring(0, 1000)} // Truncate if too long
\`\`\``.trim();
}

async function callGemini(prompt) {
  const response = await axios.post(
    `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 3000
      }
    },
    { timeout: 60000 }
  );
  return response.data;
}

function extractJsonFromResponse(text) {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json|```/g, '').trim();

    // Find the first { and last } to extract JSON
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in response');
    }

    const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    throw error;
  }
}

codeRoutes.post("/run", async (req, res) => {
  try {
    const { ps, code, language } = req.body;

    // Validate input
    if (!ps || !code || !language) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["ps", "code", "language"]
      });
    }

    const prompt = buildPrompt({ ps, code, language });
    const geminiResponse = await callGemini(prompt);

    // Extract text from Gemini response
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(geminiResponse);

    console.log('Gemini raw response:', responseText);

    // Parse the JSON response
    let analysis;
    try {
      analysis = extractJsonFromResponse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse analysis",
        details: parseError.message,
        rawResponse: responseText
      });
    }

    // Validate and normalize the response
    const result = {
      timeComplexity: analysis.timeComplexity || "Not provided",
      spaceComplexity: analysis.spaceComplexity || "Not provided",
      efficiencyScore: analysis.efficiencyScore ?
        Math.max(1, Math.min(10, Math.round(analysis.efficiencyScore))) : null,
      comment: analysis.comment || "No analysis provided",
      success: true
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: "Analysis failed",
      details: error.message,
      success: false
    });
  }
});

export default codeRoutes;