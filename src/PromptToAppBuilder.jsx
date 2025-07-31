

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
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
        background: "#f7f9fc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Prompt Input Section */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "16px 24px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
          maxWidth: "800px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <input
          type="text"
          placeholder="Ask Skiper AI to build a UI..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          style={{
            flex: 1,
            padding: "16px 20px",
            fontSize: "18px",
            background: "#f4f6f9",
            border: "none",
            outline: "none",
            borderRadius: "16px",
            color: "#222",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            marginLeft: "12px",
            background: loading ? "#ccc" : "#6c5ce7",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "24px",
            transition: "background 0.3s ease",
          }}
          title="Generate Code"
        >
          {loading ? "⏳" : "🚀"}
        </button>
      </div>

      {/* Preview Section */}
      <div
        style={{
          marginTop: "40px",
          width: "100%",
          maxWidth: "1200px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Sandpack
          theme={amethyst}
          template="react"
          files={{
            "/App.js": code,
          }}
          options={{
            editorHeight: 700,
            showTabs: true,
            showLineNumbers: true,
            wrapContent: true,
            initMode: "user-visible",
          }}
        />
      </div>
    </div>
  );
}