import React, { useState, useEffect, useCallback } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultCode = `
import React from "react";

export default function App() {
  return <h1>Start typing a prompt above!</h1>;
}
`;

export default function PromptToAppBuilder() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("light");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [previewMode, setPreviewMode] = useState("desktop");

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("codeTemplates");
    if (saved) setSavedTemplates(JSON.parse(saved));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a valid prompt!");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("https://api.llm7.io/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_LLM7_API_KEY_HERE",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo", // Upgraded model
          messages: [
            {
              role: "user",
              content: `Convert this UI description into valid JSX code with Tailwind CSS for styling.
Wrap the output ONLY inside:

export default function App() {
  return (
    /* JSX here */
  );
}

Requirements:
- Use Tailwind CSS classes for responsive, modern styling
- Include proper React hooks with full definitions
- Add 'import React from "react";' at the top
- Ensure code is optimized for Sandpack
- Include error boundaries
- Add loading states where applicable
- Make it responsive for mobile and desktop
- Add comments for clarity

Prompt: "${prompt}"`,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "";

      // Clean and validate response
      text = text.replace(/```(jsx|js)?/g, "").replace(/```/g, "").trim();
      if (!text.includes(`import React`)) {
        text = `import React from "react";\n\n${text}`;
      }

      setCode(text);
      setHistory((prev) => [...prev, { prompt, code: text, timestamp: new Date() }].slice(-10));
      toast.success("Code generated successfully!");
    } catch (err) {
      console.error("LLM7 error:", err);
      setCode(`import React from "react";

export default function App() {
  return <h1>⚠️ Failed to generate code. Please try again.</h1>;
}`);
      toast.error("Failed to generate code. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const saveTemplate = () => {
    if (!code) return;
    const templateName = prompt("Enter template name:");
    if (templateName) {
      const newTemplates = [...savedTemplates, { name: templateName, code }];
      setSavedTemplates(newTemplates);
      localStorage.setItem("codeTemplates", JSON.stringify(newTemplates));
      toast.success("Template saved!");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const switchPreviewMode = (mode) => {
    setPreviewMode(mode);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900 text-white"
      } p-6 font-sans`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Skiper AI Code Builder</h1>
        <div className="space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={saveTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Template
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Prompt Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Describe your UI (e.g., 'A todo list with a form and delete buttons')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="flex-1 p-4 text-lg bg-gray-100 dark:bg-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`p-4 rounded-full ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white transition-colors duration-200`}
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "🚀 Generate"
            )}
          </button>
        </div>

        {/* Preview Mode Controls */}
        <div className="flex gap-4">
          {["desktop", "tablet", "mobile"].map((mode) => (
            <button
              key={mode}
              onClick={() => switchPreviewMode(mode)}
              className={`px-4 py-2 rounded-lg ${
                previewMode === mode
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div
          className={`rounded-2xl overflow-hidden shadow-xl ${
            previewMode === "mobile" ? "max-w-sm" : previewMode === "tablet" ? "max-w-2xl" : "max-w-7xl"
          } mx-auto transition-all duration-300`}
        >
          <Sandpack
            theme={theme === "light" ? amethyst : "dark"}
            template="react"
            files={{
              "/App.js": code,
              "/index.css": `
                @import 'tailwindcss/base';
                @import 'tailwindcss/components';
                @import 'tailwindcss/utilities';
              `,
            }}
            options={{
              editorHeight: 700,
              showTabs: true,
              showLineNumbers: true,
              wrapContent: true,
              initMode: "user-visible",
            }}
            customSetup={{
              dependencies: {
                "tailwindcss": "latest",
              },
            }}
          />
        </div>

        {/* History Panel */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generation History</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setCode(item.code)}
                >
                  <p className="font-medium">{item.prompt}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Templates */}
        {savedTemplates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setCode(template.code)}
                >
                  <p className="font-medium">{template.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
