import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';

const CodeEditorAnimation = () => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentAction, setCurrentAction] = useState('typing');
    const [codeLines, setCodeLines] = useState([]);

    const codeContainerRef = useRef(null);
    

    const demoCode = [
        "// Welcome to Java Playground!",
        "import java.util.*;",
        "",
        "public class Main {",
        "  public static void main(String[] args) {",
        "    String name = \"Developer\";",
        "    System.out.println(greet(name));",
        "",
        "    int num = 7;",
        "    System.out.println(\"Factorial of \" + num + \" is: \" + factorial(num));",
        "",
        "    String word = \"madam\";",
        "    System.out.println(word + \" is palindrome? \" + isPalindrome(word));",
        "",
        "    int primeCandidate = 17;",
        "    System.out.println(primeCandidate + \" is prime? \" + isPrime(primeCandidate));",
        "  }",
        "",
        "  // Greet the user",
        "  public static String greet(String name) {",
        "    return \"Hello, \" + name + \"! Welcome to CodeCollab.\";",
        "  }",
        "",
        "  // Calculate factorial using recursion",
        "  public static long factorial(int n) {",
        "    if (n <= 1) return 1;",
        "    return n * factorial(n - 1);",
        "  }",
        "",
        "  // Check if a word is a palindrome",
        "  public static boolean isPalindrome(String str) {",
        "    int left = 0, right = str.length() - 1;",
        "    while (left < right) {",
        "      if (str.charAt(left) != str.charAt(right)) return false;",
        "      left++;",
        "      right--;",
        "    }",
        "    return true;",
        "  }",
        "",
        "  // Check if a number is prime",
        "  public static boolean isPrime(int n) {",
        "    if (n <= 1) return false;",
        "    if (n <= 3) return true;",
        "    if (n % 2 == 0 || n % 3 == 0) return false;",
        "    for (int i = 5; i * i <= n; i += 6) {",
        "      if (n % i == 0 || n % (i + 2) == 0) return false;",
        "    }",
        "    return true;",
        "  }",
        "}"
    ];
    useEffect(() => {
        if (codeContainerRef.current) {
            codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
        }
        }, [codeLines]);
    useEffect(() => {
        let timer;
        
        if (currentAction === 'typing') {
        timer = setInterval(() => {
            if (codeLines.length < demoCode.length) {
            setCodeLines(prev => [...prev, demoCode[prev.length]]);
            } else {
            setCurrentAction('deleting');
            }
        }, 150);
        } else {
        timer = setInterval(() => {
            if (codeLines.length > 0) {
            setCodeLines(prev => prev.slice(0, -1));
            } else {
            setCurrentAction('typing');
            }
        }, 50);
        }

        return () => clearInterval(timer);

    }, [currentAction, codeLines.length]);
    useEffect(() => {
        if (codeContainerRef.current) {
            codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
        }
        }, [codeLines]);

    const getTokenColor = (token) => {
        if (token.match(/\/\/.*/)) return 'text-gray-400 italic';
        if (token.match(/".*"/)) return 'text-green-400';
        if (token.match(/\b(public|class|static|void|return|if)\b/)) return 'text-purple-400';
        if (token.match(/\b(String|int)\b/)) return 'text-blue-400';
        if (token.match(/\b(Main|greet|fibonacci)\b/)) return 'text-yellow-300';
        return 'text-gray-200';
    };

    const renderCodeLine = (line, idx) => {
        return (
        <div key={idx} className="flex">
            <span className="text-gray-500 w-8 select-none">{idx + 1}</span>
            <div className="flex-1">
            {line.split(/(\/\/.*|".*?"|\b\w+\b|\d+|\S)/)
                .filter(Boolean)
                .map((token, i) => (
                <span key={i} className={getTokenColor(token)}>{token}</span>
                ))}
            </div>
        </div>
        );
    };

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full h-80 shadow-lg">
        {/* Window Controls */}
        <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400">Main.java</div>
        </div>
        
        {/* Code Area - Add ref here */}
        <div 
            ref={codeContainerRef}  // <-- THIS IS THE ADDED LINE
            className="p-4 font-mono text-sm h-[calc(100%-44px)] overflow-auto text-left"
        >
            {codeLines.map(renderCodeLine)}
            {currentAction === 'typing' && (
            <div className="flex">
                <span className="text-gray-500 w-8 select-none">{codeLines.length + 1}</span>
                <div className="flex-1">
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-5 bg-blue-400 align-middle"
                />
                </div>
            </div>
            )}
        </div>
        </div>
    );
};

export default CodeEditorAnimation;