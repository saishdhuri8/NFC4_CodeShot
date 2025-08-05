import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

const CodeEditor = () => {
  // State management
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Problem data - Sum of Two Numbers
  const problem = {
    title: 'Sum of Two Numbers',
    description: `Write a function that takes two numbers as input and returns their sum.`,
    requirements: [
      'Handle both positive and negative numbers',
      'Return 0 if no arguments are provided',
      'Handle decimal numbers properly'
    ]
  };

  // Language templates with simple sum function
  const templates = {
    javascript: `function sum(a, b) {
  // Convert inputs to numbers
  const numA = a ? parseFloat(a) : 0;
  const numB = b ? parseFloat(b) : 0;
  return numA + numB;
}`,
    python: `def sum(a, b):
    try:
        num_a = float(a) if a else 0
        num_b = float(b) if b else 0
        return num_a + num_b
    except:
        return 0`,
    java: `public class Main {
    public static double sum(String a, String b) {
        try {
            double numA = a.isEmpty() ? 0 : Double.parseDouble(a.trim());
            double numB = b.isEmpty() ? 0 : Double.parseDouble(b.trim());
            return numA + numB;
        } catch (Exception e) {
            return 0;
        }
    }
}`,
    cpp: `#include <string>
using namespace std;

double sum(string a, string b) {
    try {
        double numA = a.empty() ? 0 : stod(a);
        double numB = b.empty() ? 0 : stod(b);
        return numA + numB;
    } catch (...) {
        return 0;
    }
}`
  };

  // Initialize code with template
  useEffect(() => {
    setCode(templates[language]);
  }, [language]);

  // Analyze code through backend
  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ps: problem.description,
          code,
          language
        })
      });

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setAnalysisResult(result);
      }
    } catch (err) {
      setError(`Failed to analyze code: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{problem.title}</h1>
            <div className="prose max-w-none text-gray-700 mb-6">
              {problem.description}
            </div>

            <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              {problem.requirements.map((req, i) => (
                <li key={i} className="text-gray-700">{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="space-y-4">
          {/* Editor Controls */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

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
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '300px' }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 20, bottom: 20 }
              }}
            />
          </div>

          {/* Analysis Results Section */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-lg mb-3">Analysis Results</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-32 max-h-96 overflow-y-auto">
              {error ? (
                <div className="text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              ) : analysisResult ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Time Complexity:</div>
                    <div className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">
                      {analysisResult.timeComplexity || 'Not available'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Space Complexity:</div>
                    <div className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">
                      {analysisResult.spaceComplexity || 'Not available'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Efficiency Score:</div>
                    <div className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">
                      {analysisResult.efficiencyScore ? `${analysisResult.efficiencyScore}/10` : 'Not rated'}
                    </div>
                  </div>
                  {analysisResult.comment && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Comment:</div>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {analysisResult.comment}
                      </ul>
                    </div>
                  )}
                
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {isAnalyzing ? 'Analyzing your code...' : 'Analysis results will appear here'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;