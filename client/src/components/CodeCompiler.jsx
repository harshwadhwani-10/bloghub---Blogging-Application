import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism.css';

const CodeCompiler = () => {
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState('default');
    const [activeLine, setActiveLine] = useState(1);
    const [multiCursors, setMultiCursors] = useState([]);
    const editorRef = useRef(null);
    const codeRef = useRef(null);
    const textareaRef = useRef(null);

    // Set default code when language changes
    useEffect(() => {
        setCode(getDefaultCode(language));
    }, [language]);

    // Apply syntax highlighting when code or language changes
    useEffect(() => {
        if (codeRef.current) {
            const highlightedCode = Prism.highlight(
                code,
                Prism.languages[getPrismLanguage(language)],
                getPrismLanguage(language)
            );
            codeRef.current.innerHTML = highlightedCode;
        }
    }, [code, language]);

    // Apply theme to the editor
    useEffect(() => {
        if (editorRef.current) {
            // Remove all theme classes
            editorRef.current.classList.remove(
                'theme-default', 
                'theme-monokai', 
                'theme-winter', 
                'theme-dracula',
                'theme-solarized-dark',
                'theme-nord',
                'theme-gruvbox-dark'
            );
            // Add the selected theme class
            editorRef.current.classList.add(`theme-${theme}`);
        }
    }, [theme]);

    // Track active line when cursor position changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleSelectionChange = () => {
            const selectionStart = textarea.selectionStart;
            const textBeforeCursor = code.substring(0, selectionStart);
            const lineNumber = textBeforeCursor.split('\n').length;
            setActiveLine(lineNumber);
        };

        textarea.addEventListener('keyup', handleSelectionChange);
        textarea.addEventListener('click', handleSelectionChange);
        textarea.addEventListener('mouseup', handleSelectionChange);

        return () => {
            textarea.removeEventListener('keyup', handleSelectionChange);
            textarea.removeEventListener('click', handleSelectionChange);
            textarea.removeEventListener('mouseup', handleSelectionChange);
        };
    }, [code]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleKeyDown = (e) => {
            // Toggle comment (Ctrl + /)
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                toggleComment();
            }
            
            // Duplicate line down (Shift + Alt + DownArrow)
            if (e.shiftKey && e.altKey && e.key === 'ArrowDown') {
                e.preventDefault();
                duplicateLineDown();
            }
            
            // Duplicate line up (Shift + Alt + UpArrow)
            if (e.shiftKey && e.altKey && e.key === 'ArrowUp') {
                e.preventDefault();
                duplicateLineUp();
            }
            
            // Select next occurrence (Ctrl + D)
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                selectNextOccurrence();
            }
            
            // Select all occurrences (Ctrl + Shift + L)
            if (e.ctrlKey && e.shiftKey && e.key === 'l') {
                e.preventDefault();
                selectAllOccurrences();
            }
            
            // Delete previous word (Ctrl + Backspace)
            if (e.ctrlKey && e.key === 'Backspace') {
                e.preventDefault();
                deletePreviousWord();
            }
            
            // Indent (Tab)
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                indentSelection();
            }
            
            // Unindent (Shift + Tab)
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                unindentSelection();
            }
        };

        // Handle multi-cursor (Alt + Click)
        const handleMouseDown = (e) => {
            if (e.altKey) {
                e.preventDefault();
                addMultiCursor(e);
            }
        };

        textarea.addEventListener('keydown', handleKeyDown);
        textarea.addEventListener('mousedown', handleMouseDown);

        return () => {
            textarea.removeEventListener('keydown', handleKeyDown);
            textarea.removeEventListener('mousedown', handleMouseDown);
        };
    }, [code, language]);

    // Handle auto-closing brackets, braces, and quotes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleKeyPress = (e) => {
            const char = e.key;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            // Auto-closing pairs
            const pairs = {
                '(': ')',
                '{': '}',
                '[': ']',
                '"': '"',
                "'": "'",
                '<': '>'
            };
            
            // Check if the pressed key is an opening character
            if (pairs[char]) {
                const closingChar = pairs[char];
                
                // Check if the next character is already the closing character
                const nextChar = code.charAt(end);
                
                if (nextChar === closingChar) {
                    // If the next character is already the closing character, just move the cursor
                    e.preventDefault();
                    textarea.setSelectionRange(end + 1, end + 1);
                    return;
                }
                
                // Insert the closing character and keep the cursor in between
                e.preventDefault();
                const newCode = code.substring(0, start) + char + closingChar + code.substring(end);
                setCode(newCode);
                
                // Move cursor between the opening and closing characters
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + 1, start + 1);
                }, 0);
            }
        };

        textarea.addEventListener('keypress', handleKeyPress);

        return () => {
            textarea.removeEventListener('keypress', handleKeyPress);
        };
    }, [code]);

    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput('Running...');
        
        try {
            // Submit code for execution
            const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    'X-RapidAPI-Key': '37e9c2d87cmsh7a577a74aeda512p1c4021jsnb9c1e078f7c5'
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: getLanguageId(language),
                    stdin: ''
                })
            });

            const data = await response.json();
            
            // Wait for 1 second before checking the result
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get the submission result
            const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${data.token}`, {
                headers: {
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    'X-RapidAPI-Key': '37e9c2d87cmsh7a577a74aeda512p1c4021jsnb9c1e078f7c5'
                }
            });

            const resultData = await resultResponse.json();
            
            if (resultData.stderr) {
                setOutput(resultData.stderr);
            } else if (resultData.stdout) {
                setOutput(resultData.stdout);
            } else if (resultData.compile_output) {
                setOutput(resultData.compile_output);
            } else {
                setOutput('No output available');
            }
        } catch (error) {
            setOutput('Error running code: ' + error.message);
        }
        setIsLoading(false);
    };

    const getLanguageId = (lang) => {
        switch (lang) {
            case 'cpp':
                return 54; // C++ (GCC 9.2.0)
            case 'c':
                return 50; // C (GCC 9.2.0)
            case 'java':
                return 62; // Java (OpenJDK 13.0.1)
            default:
                return 54;
        }
    };

    const getPrismLanguage = (lang) => {
        switch (lang) {
            case 'cpp':
                return 'cpp';
            case 'c':
                return 'c';
            case 'java':
                return 'java';
            default:
                return 'cpp';
        }
    };

    const getDefaultCode = (lang) => {
        switch (lang) {
            case 'cpp':
                return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
            case 'c':
                return `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
            case 'java':
                return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
            default:
                return '';
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    // Generate line numbers for the gutter
    const renderLineNumbers = () => {
        const lines = code.split('\n');
        return (
            <div className="line-numbers">
                {lines.map((_, index) => (
                    <div 
                        key={index} 
                        className={`line-number ${index + 1 === activeLine ? 'active-line-number' : ''}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
        );
    };

    // Keyboard shortcut handlers
    const toggleComment = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lines = code.split('\n');
        
        // Get the selected lines
        const startLine = code.substring(0, start).split('\n').length - 1;
        const endLine = code.substring(0, end).split('\n').length - 1;
        
        // Determine comment style based on language
        const commentStyle = language === 'python' ? '#' : '//';
        
        // Check if all selected lines are already commented
        let allCommented = true;
        for (let i = startLine; i <= endLine; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith(commentStyle)) {
                allCommented = false;
                break;
            }
        }
        
        // Toggle comments
        for (let i = startLine; i <= endLine; i++) {
            const line = lines[i];
            if (allCommented) {
                // Remove comment
                if (line.trim().startsWith(commentStyle)) {
                    lines[i] = line.replace(new RegExp(`^\\s*${commentStyle}\\s?`), '');
                }
            } else {
                // Add comment
                if (line.trim() && !line.trim().startsWith(commentStyle)) {
                    lines[i] = line.replace(/^(\s*)/, `$1${commentStyle} `);
                }
            }
        }
        
        const newCode = lines.join('\n');
        setCode(newCode);
        
        // Restore selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, end);
        }, 0);
    };

    const duplicateLineDown = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lines = code.split('\n');
        
        // Get the current line
        const currentLine = code.substring(0, start).split('\n').length - 1;
        
        // Insert the current line below
        lines.splice(currentLine + 1, 0, lines[currentLine]);
        
        const newCode = lines.join('\n');
        setCode(newCode);
        
        // Move cursor to the duplicated line
        const newPosition = code.substring(0, start).split('\n').length * (lines[currentLine].length + 1);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const duplicateLineUp = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lines = code.split('\n');
        
        // Get the current line
        const currentLine = code.substring(0, start).split('\n').length - 1;
        
        // Insert the current line above
        lines.splice(currentLine, 0, lines[currentLine]);
        
        const newCode = lines.join('\n');
        setCode(newCode);
        
        // Move cursor to the duplicated line
        const newPosition = code.substring(0, start).split('\n').length * (lines[currentLine].length + 1) - (lines[currentLine].length + 1);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const selectNextOccurrence = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // If no text is selected, select the word at the cursor
        if (start === end) {
            const beforeCursor = code.substring(0, start);
            const afterCursor = code.substring(start);
            
            // Find word boundaries
            const beforeMatch = beforeCursor.match(/\w+$/);
            const afterMatch = afterCursor.match(/^\w+/);
            
            if (beforeMatch && afterMatch) {
                const word = beforeMatch[0] + afterMatch[0];
                const wordStart = start - beforeMatch[0].length;
                const wordEnd = start + afterMatch[0].length;
                
                // Select the word
                textarea.setSelectionRange(wordStart, wordEnd);
                return;
            }
        }
        
        // If text is selected, find the next occurrence
        const selectedText = code.substring(start, end);
        if (selectedText) {
            const nextOccurrence = code.indexOf(selectedText, end);
            if (nextOccurrence !== -1) {
                textarea.setSelectionRange(nextOccurrence, nextOccurrence + selectedText.length);
            }
        }
    };

    const selectAllOccurrences = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // If no text is selected, select the word at the cursor
        if (start === end) {
            const beforeCursor = code.substring(0, start);
            const afterCursor = code.substring(start);
            
            // Find word boundaries
            const beforeMatch = beforeCursor.match(/\w+$/);
            const afterMatch = afterCursor.match(/^\w+/);
            
            if (beforeMatch && afterMatch) {
                const word = beforeMatch[0] + afterMatch[0];
                const wordStart = start - beforeMatch[0].length;
                const wordEnd = start + afterMatch[0].length;
                
                // Select the word
                textarea.setSelectionRange(wordStart, wordEnd);
                return;
            }
        }
        
        // If text is selected, find all occurrences
        const selectedText = code.substring(start, end);
        if (selectedText) {
            // This is a simplified version - in a real editor, you'd use a more sophisticated approach
            // to handle multiple selections
            const regex = new RegExp(selectedText, 'g');
            const matches = [...code.matchAll(regex)];
            
            if (matches.length > 1) {
                // For now, we'll just select the next occurrence
                const nextOccurrence = code.indexOf(selectedText, end);
                if (nextOccurrence !== -1) {
                    textarea.setSelectionRange(nextOccurrence, nextOccurrence + selectedText.length);
                }
            }
        }
    };

    const deletePreviousWord = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // If text is selected, delete it
        if (start !== end) {
            const newCode = code.substring(0, start) + code.substring(end);
            setCode(newCode);
            
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start);
            }, 0);
            return;
        }
        
        // Find the start of the previous word
        const beforeCursor = code.substring(0, start);
        const match = beforeCursor.match(/\w+\s*$/);
        
        if (match) {
            const wordStart = start - match[0].length;
            const newCode = code.substring(0, wordStart) + code.substring(start);
            setCode(newCode);
            
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(wordStart, wordStart);
            }, 0);
        }
    };

    const indentSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lines = code.split('\n');
        
        // Get the selected lines
        const startLine = code.substring(0, start).split('\n').length - 1;
        const endLine = code.substring(0, end).split('\n').length - 1;
        
        // Indent selected lines
        for (let i = startLine; i <= endLine; i++) {
            lines[i] = '    ' + lines[i];
        }
        
        const newCode = lines.join('\n');
        setCode(newCode);
        
        // Restore selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + 4, end + 4);
        }, 0);
    };

    const unindentSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lines = code.split('\n');
        
        // Get the selected lines
        const startLine = code.substring(0, start).split('\n').length - 1;
        const endLine = code.substring(0, end).split('\n').length - 1;
        
        // Unindent selected lines
        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].startsWith('    ')) {
                lines[i] = lines[i].substring(4);
            } else if (lines[i].startsWith('\t')) {
                lines[i] = lines[i].substring(1);
            }
        }
        
        const newCode = lines.join('\n');
        setCode(newCode);
        
        // Restore selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, end);
        }, 0);
    };

    const addMultiCursor = (e) => {
        // This is a simplified version - in a real editor, you'd use a more sophisticated approach
        // to handle multiple cursors
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Get the click position
        const rect = textarea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate the line and column
        const lineHeight = 20; // Approximate line height
        const charWidth = 8; // Approximate character width
        
        const line = Math.floor(y / lineHeight);
        const column = Math.floor(x / charWidth);
        
        // Find the position in the text
        const lines = code.split('\n');
        let position = 0;
        
        for (let i = 0; i < line; i++) {
            position += lines[i].length + 1; // +1 for the newline
        }
        
        position += Math.min(column, lines[line].length);
        
        // Set the cursor position
        textarea.focus();
        textarea.setSelectionRange(position, position);
    };

    return (
        <Card className="mt-8">
            <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Code Playground</h2>
                        <div className="flex gap-2">
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="monokai">Monokai</SelectItem>
                                    <SelectItem value="winter">Winter is Coming</SelectItem>
                                    <SelectItem value="dracula">Dracula</SelectItem>
                                    <SelectItem value="solarized-dark">Solarized Dark</SelectItem>
                                    <SelectItem value="nord">Nord</SelectItem>
                                    <SelectItem value="gruvbox-dark">Gruvbox Dark</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={language} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cpp">C++</SelectItem>
                                    <SelectItem value="c">C</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="code-editor-wrapper">
                        <div className="code-editor" ref={editorRef}>
                            {renderLineNumbers()}
                            <div className="editor-content">
                                <textarea
                                    ref={textareaRef}
                                    className="code-textarea"
                                    value={code}
                                    onChange={handleCodeChange}
                                    spellCheck="false"
                                    placeholder={`Write your ${language.toUpperCase()} code here...`}
                                />
                                <pre className="code-highlight" ref={codeRef}>
                                    <code className={`language-${getPrismLanguage(language)}`}></code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleRunCode} 
                        disabled={isLoading}
                        className="w-full bg-violet-500 hover:bg-violet-600"
                    >
                        {isLoading ? 'Running...' : 'Run Code'}
                    </Button>

                    <div className="border rounded-md p-4 bg-gray-50">
                        <h3 className="font-semibold mb-2">Output:</h3>
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                            {output || 'No output yet'}
                        </pre>
                    </div>
                </div>
            </CardContent>

            <style>
                {`
                /* Code Editor Wrapper */
                .code-editor-wrapper {
                    position: relative;
                    height: 16rem;
                    border-radius: 0.375rem;
                    overflow: auto; /* Make the wrapper the only scrollable container */
                }
                
                /* Code Editor Container */
                .code-editor {
                    position: relative;
                    height: 100%;
                    width: 100%;
                    display: flex;
                    /* Remove overflow: auto here */
                }
                
                /* Line Numbers */
                .line-numbers {
                    width: 40px;
                    padding-top: 1rem;
                    padding-right: 0.5rem;
                    text-align: right;
                    user-select: none;
                    border-right: 1px solid rgba(128, 128, 128, 0.2);
                    flex-shrink: 0;
                }
                
                .line-number {
                    font-size: 12px;
                    color: #666;
                    padding: 0 0.5rem;
                    height: 1.5em;
                }
                
                .active-line-number {
                    font-weight: bold;
                }
                
                /* Editor Content */
                .editor-content {
                    position: relative;
                    flex: 1;
                    height: 100%;
                }
                
                /* Code Textarea */
                .code-textarea {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: 1rem;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: none;
                    overflow: hidden; /* Remove scroll from textarea */
                    z-index: 1;
                    opacity: 0.5;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-variant-ligatures: none;
                    font-feature-settings: "liga" 0, "calt" 0, "dlig" 0, "hlig" 0;
                }
                
                /* Code Highlight */
                .code-highlight {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: 1rem;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    overflow: hidden; /* Remove scroll from highlight */
                    z-index: 0;
                    pointer-events: none;
                    font-variant-ligatures: none;
                    font-feature-settings: "liga" 0, "calt" 0, "dlig" 0, "hlig" 0;
                }
                
                /* Default Theme */
                .theme-default {
                    background-color: #FFFFFF;
                    color: #000000;
                    border: 1px solid #e5e7eb;
                }
                .theme-default .code-textarea {
                    caret-color: #000000;
                }
                .theme-default .line-number {
                    color: #666;
                }
                .theme-default .active-line-number {
                    color: #000;
                    background-color: rgba(0, 0, 0, 0.05);
                }
                
                /* Monokai Theme */
                .theme-monokai {
                    background-color: #272822;
                    color: #F8F8F2;
                    border: 1px solid #3e3d32;
                }
                .theme-monokai .code-textarea {
                    caret-color: #F8F8F2;
                }
                .theme-monokai .line-number {
                    color: #75715E;
                }
                .theme-monokai .active-line-number {
                    color: #F8F8F2;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Winter is Coming Theme */
                .theme-winter {
                    background-color: #282C34;
                    color: #ABB2BF;
                    border: 1px solid #2d2d3f;
                }
                .theme-winter .code-textarea {
                    caret-color: #ABB2BF;
                }
                .theme-winter .line-number {
                    color: #5C6370;
                }
                .theme-winter .active-line-number {
                    color: #ABB2BF;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Dracula Theme */
                .theme-dracula {
                    background-color: #282A36;
                    color: #F8F8F2;
                    border: 1px solid #44475a;
                }
                .theme-dracula .code-textarea {
                    caret-color: #F8F8F2;
                }
                .theme-dracula .line-number {
                    color: #6272A4;
                }
                .theme-dracula .active-line-number {
                    color: #F8F8F2;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Solarized Dark Theme */
                .theme-solarized-dark {
                    background-color: #002B36;
                    color: #839496;
                    border: 1px solid #073642;
                }
                .theme-solarized-dark .code-textarea {
                    caret-color: #839496;
                }
                .theme-solarized-dark .line-number {
                    color: #586E75;
                }
                .theme-solarized-dark .active-line-number {
                    color: #839496;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Nord Theme */
                .theme-nord {
                    background-color: #2E3440;
                    color: #D8DEE9;
                    border: 1px solid #3B4252;
                }
                .theme-nord .code-textarea {
                    caret-color: #D8DEE9;
                }
                .theme-nord .line-number {
                    color: #616E88;
                }
                .theme-nord .active-line-number {
                    color: #D8DEE9;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Gruvbox Dark Theme */
                .theme-gruvbox-dark {
                    background-color: #282828;
                    color: #EBDBB2;
                    border: 1px solid #3C3836;
                }
                .theme-gruvbox-dark .code-textarea {
                    caret-color: #EBDBB2;
                }
                .theme-gruvbox-dark .line-number {
                    color: #928374;
                }
                .theme-gruvbox-dark .active-line-number {
                    color: #EBDBB2;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                /* Custom Prism.js Theme Overrides */
                .theme-default .token.comment { color: #008000; }
                .theme-default .token.keyword { color: #0000FF; }
                .theme-default .token.string { color: #A31515; }
                .theme-default .token.function { color: #795E26; }
                .theme-default .token.number { color: #098658; }
                .theme-default .token.operator { color: #000000; }
                .theme-default .token.punctuation { color: #000000; }
                
                .theme-monokai .token.comment { color: #75715E; }
                .theme-monokai .token.keyword { color: #F92672; }
                .theme-monokai .token.string { color: #E6DB74; }
                .theme-monokai .token.function { color: #A6E22E; }
                .theme-monokai .token.number { color: #AE81FF; }
                .theme-monokai .token.operator { color: #F8F8F2; }
                .theme-monokai .token.punctuation { color: #F8F8F2; }
                
                .theme-winter .token.comment { color: #5C6370; }
                .theme-winter .token.keyword { color: #61AFEF; }
                .theme-winter .token.string { color: #98C379; }
                .theme-winter .token.function { color: #E5C07B; }
                .theme-winter .token.number { color: #D19A66; }
                .theme-winter .token.operator { color: #ABB2BF; }
                .theme-winter .token.punctuation { color: #ABB2BF; }
                
                .theme-dracula .token.comment { color: #6272A4; }
                .theme-dracula .token.keyword { color: #FF79C6; }
                .theme-dracula .token.string { color: #F1FA8C; }
                .theme-dracula .token.function { color: #50FA7B; }
                .theme-dracula .token.number { color: #BD93F9; }
                .theme-dracula .token.operator { color: #F8F8F2; }
                .theme-dracula .token.punctuation { color: #F8F8F2; }
                
                .theme-solarized-dark .token.comment { color: #586E75; }
                .theme-solarized-dark .token.keyword { color: #268BD2; }
                .theme-solarized-dark .token.string { color: #2AA198; }
                .theme-solarized-dark .token.function { color: #B58900; }
                .theme-solarized-dark .token.number { color: #D33682; }
                .theme-solarized-dark .token.operator { color: #CCCCCC; }
                .theme-solarized-dark .token.punctuation { color: #839496; }
                
                .theme-nord .token.comment { color: #616E88; }
                .theme-nord .token.keyword { color: #81A1C1; }
                .theme-nord .token.string { color: #A3BE8C; }
                .theme-nord .token.function { color: #EBCB8B; }
                .theme-nord .token.number { color: #B48EAD; }
                .theme-nord .token.operator { color: #D8DEE9; }
                .theme-nord .token.punctuation { color: #D8DEE9; }
                
                .theme-gruvbox-dark .token.comment { color: #928374; }
                .theme-gruvbox-dark .token.keyword { color: #FB4934; }
                .theme-gruvbox-dark .token.string { color: #B8BB26; }
                .theme-gruvbox-dark .token.function { color: #FABD2F; }
                .theme-gruvbox-dark .token.number { color: #D3869B; }
                .theme-gruvbox-dark .token.operator { color: #EBDBB2; }
                .theme-gruvbox-dark .token.punctuation { color: #EBDBB2; }
                `}
            </style>
        </Card>
    );
};

export default CodeCompiler; 