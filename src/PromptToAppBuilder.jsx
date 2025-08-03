import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { amethyst, githubLight } from "@codesandbox/sandpack-themes";
import { FaRocket, FaDownload, FaSun, FaMoon, FaHistory } from "react-icons/fa";

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
  const [theme, setTheme] = useState("light");
  const [history, setHistory] = useState([]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("https://api.llm7.io/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_LLM7_API_KEY_HERE",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-2024-07-18",
          messages: [
            {
              role: "user",
              content: `Convert the following UI description into valid JSX code:

export default function App() {
  return (
    /* JSX here */
  );
}

- Must be self-contained
- Include React import
- Use proper hooks
- Output only valid code

Prompt: "${prompt}"`,
            },
          ],
        }),
      });

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "";
      text = text.replace(/```(jsx|js)?/g, "").replace(/```/g, "").trim();

      if (!text.includes(`import React`)) {
        text = `import React from "react";\n\n${text}`;
      }

      setCode(text);
      setHistory((prev) => [...prev, { prompt, code: text }]);
    } catch (err) {
      console.error("LLM7 error:", err);
      setCode(`import React from "react";
export default function App() {
  return <h1>⚠️ LLM7 API Error</h1>;
}`);
    }
    setLoading(false);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "App.js";
    a.click();
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-[#f5f7fb]"} p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6c5ce7]">⚡Lara – UI to React Code</h1>
        <div className="flex gap-3">
          <button onClick={toggleTheme} className="text-xl">
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={downloadCode} title="Export" className="text-xl">
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="flex items-center gap-4 bg-white shadow-xl rounded-2xl px-6 py-4">
        <input
          type="text"
          placeholder="Ask Lara to build a UI component..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1 text-lg px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-white text-xl bg-[#6c5ce7] hover:bg-[#5e54d8] transition-all px-5 py-3 rounded-full"
        >
          {loading ? "⏳" : <FaRocket />}
        </button>
      </div>

      {/* Code Preview */}
      <div className="mt-10 rounded-xl overflow-hidden shadow-2xl">
        <Sandpack
          theme={theme === "dark" ? amethyst : githubLight}
          template="react"
          files={{ "/App.js": code }}
          options={{
            editorHeight: 600,
            showTabs: true,
            showLineNumbers: true,
            wrapContent: true,
            initMode: "user-visible",
          }}
        />
      </div>

      {/* Prompt History */}
      {history.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaHistory /> Prompt History</h2>
          <ul className="list-disc ml-6 space-y-2">
            {history.slice(-5).reverse().map((item, i) => (
              <li key={i} className="text-gray-700">
                <strong>Prompt:</strong> {item.prompt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
