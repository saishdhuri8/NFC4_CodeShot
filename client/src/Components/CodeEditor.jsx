import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CodeEditor = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState(['']);
  const [outputs, setOutputs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  const problem = {
    title: 'Sum of Two Numbers',
    description: `Write a function that takes two numbers as input and returns their sum.

Example:
Input: 5, 3
Output: 8

Requirements:
1. Handle both positive and negative numbers
2. Return 0 if no arguments are provided
3. Handle decimal numbers properly`,
    examples: [
      { input: '5, 3', output: '8' },
      { input: '-2, 5', output: '3' },
      { input: '1.5, 2.5', output: '4' }
    ]
  };

  const templates = {
    javascript: `function sum(a, b) {
  const numA = a ? parseFloat(a) : 0;
  const numB = b ? parseFloat(b) : 0;
  return numA + numB;
}

const input = require('fs').readFileSync(0, 'utf-8').trim();
const [a, b] = input.split(',').map(item => item.trim());
console.log(sum(a, b));`,
    python: `def sum(a, b):
    try:
        num_a = float(a) if a else 0
        num_b = float(b) if b else 0
        return num_a + num_b
    except:
        return 0

import sys
input_data = sys.stdin.read().strip()
if ',' in input_data:
    a, b = map(str.strip, input_data.split(','))
else:
    a, b = input_data, ''
print(sum(a, b))`,
    java: `import java.util.*;

public class Main {
    public static double sum(String a, String b) {
        try {
            double numA = a.isEmpty() ? 0 : Double.parseDouble(a.trim());
            double numB = b.isEmpty() ? 0 : Double.parseDouble(b.trim());
            return numA + numB;
        } catch (Exception e) {
            return 0;
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.useDelimiter("\\\\A").next().trim();
        String[] parts = input.split(",");
        String a = parts.length > 0 ? parts[0].trim() : "";
        String b = parts.length > 1 ? parts[1].trim() : "";
        System.out.println(sum(a, b));
    }
}`,
    cpp: `#include <iostream>
#include <string>
#include <sstream>

using namespace std;

double sum(string a, string b) {
    try {
        double numA = a.empty() ? 0 : stod(a);
        double numB = b.empty() ? 0 : stod(b);
        return numA + numB;
    } catch (...) {
        return 0;
    }
}

int main() {
    string input;
    getline(cin, input);
    
    string a, b;
    size_t comma_pos = input.find(',');
    if (comma_pos != string::npos) {
        a = input.substr(0, comma_pos);
        b = input.substr(comma_pos + 1);
    } else {
        a = input;
    }
    
    a.erase(0, a.find_first_not_of(" \\t\\n\\r\\f\\v"));
    a.erase(a.find_last_not_of(" \\t\\n\\r\\f\\v") + 1);
    b.erase(0, b.find_first_not_of(" \\t\\n\\r\\f\\v"));
    b.erase(b.find_last_not_of(" \\t\\n\\r\\f\\v") + 1);
    
    cout << sum(a, b);
    return 0;
}`
  };

  useEffect(() => {
    setCode(templates[language]);
  }, [language]);

  const handleAddTestCase = () => {
    setTestCases([...testCases, '']);
  };

  const handleTestCaseChange = (index, value) => {
    const updated = [...testCases];
    updated[index] = value;
    setTestCases(updated);
  };

  const handleRemoveTestCase = (index) => {
    if (testCases.length > 1) {
      const updated = testCases.filter((_, i) => i !== index);
      setTestCases(updated);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutputs([]);
    setExecutionTime(0);
    const start = performance.now();

    const validTestCases = testCases.filter(tc => tc.trim() !== '');
    if (validTestCases.length === 0) {
      setOutputs([{ input: 'System', output: 'Please add at least one test case' }]);
      setIsRunning(false);
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:3000/run', {
        language,
        code,
        testCases: validTestCases
      });

      const end = performance.now();
      setExecutionTime(end - start);

      if (data.error) {
        setOutputs([{ input: 'Error', output: data.error }]);
      } else if (data.results) {
        setOutputs(data.results);
      } else {
        setOutputs([{ input: 'System', output: 'Unexpected response format' }]);
      }

    } catch (error) {
      const end = performance.now();
      setExecutionTime(end - start);
      setOutputs([{ input: 'System Error', output: error.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  const loadExampleTestCase = (index) => {
    const updated = [...testCases];
    updated[0] = problem.examples[index].input;
    setTestCases(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{problem.title}</h1>
            <div className="prose max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
              {problem.description}
            </div>

            <h3 className="text-lg font-semibold mb-2">Example Test Cases:</h3>
            <div className="space-y-3 mb-6">
              {problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Input:</div>
                      <div className="font-mono">{example.input}</div>
                    </div>
                    <button
                      onClick={() => loadExampleTestCase(index)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm"
                    >
                      Load
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-500">Output:</div>
                    <div className="font-mono">{example.output}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor + Controls */}
        <div className="space-y-4">
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
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run Code
                  </>
                )}
              </motion.button>
            </div>
          </div>

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

          {/* Test Cases */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Test Cases</h3>
              <button
                onClick={handleAddTestCase}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                + Add Case
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tc}
                    onChange={(e) => handleTestCaseChange(index, e.target.value)}
                    placeholder={`Input ${index + 1} (e.g., "5, 3")`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {testCases.length > 1 && (
                    <button
                      onClick={() => handleRemoveTestCase(index)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Results</h3>
              {executionTime > 0 && (
                <span className="text-sm text-gray-500">
                  {executionTime.toFixed(2)} ms
                </span>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto">
              {outputs.length > 0 ? (
                <div className="space-y-4">
                  {outputs.map((result, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-500">Input:</div>
                        <div className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm">{result.input}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Output:</div>
                        <div className={`font-mono p-2 rounded mt-1 text-sm ${
                          result.output.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-gray-800'
                        }`}>
                          {result.output}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {isRunning ? 'Running your code...' : 'Execution results will appear here'}
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
