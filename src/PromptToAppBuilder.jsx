
import React, { useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";

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
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Convert the following UI description into valid JSX code.
Wrap the final output ONLY inside:

export default function App() {
  return (
    /* JSX here */
  );
}

Make sure:
- The JSX is self-contained
- All React hooks are fully defined (e.g., useState, useEffect)
- Add 'import React from "react";' if needed
- The code is meant to run inside Sandpack so avoid unimported React APIs
- Output only valid code

Prompt: "${prompt}"`,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "";

      // Clean up response
      text = text.replace(/```(jsx|js)?/g, "").replace(/```/g, "").trim();

      // Inject React import if missing
      if (!text.includes(`import React`)) {
        text = `import React from "react";\n\n${text}`;
      }

      setCode(text || defaultCode);
    } catch (err) {
      console.error("LLM7 error:", err);
      setCode(`import React from "react";

export default function App() {
  return <h1>⚠️ LLM7 API Error</h1>;
}`);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "sans-serif",
        background: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      {/* Prompt Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#eee",
          borderRadius: 20,
          padding: 16,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <input
          type="text"
          placeholder="Ask Skiper Ai..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          style={{
            flex: 1,
            padding: "14px 20px",
            fontSize: 18,
            background: "#e4e4e4",
            border: "none",
            outline: "none",
            borderRadius: 16,
            color: "#000",
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            marginLeft: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            opacity: loading ? 0.5 : 1,
          }}
          title="Generate Code"
        >
          🚀
        </button>
      </div>

      {/* Code Preview */}
      <div style={{ marginTop: 40 }}>
        <Sandpack
          theme={amethyst}
          style={{
            height: "800px",
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #ccc",
          }}
          template="react"
          files={{
            "/App.js": code,
          }}
          options={{
            editorHeight: 800,
            editorWidthPercentage: 40,
            showNavigator: true,
            showTabs: true,
            showLineNumbers: true,
            wrapContent: true,
            initMode: "user-visible",
            initModeObserverOptions: {
              rootMargin: "500px",
            },
          }}
        />
      </div>
    </div>
  );
}
