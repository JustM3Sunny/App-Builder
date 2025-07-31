import React, { useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";
    
const defaultCode = `
export default function App() {
  return <h1>Start typing a prompt above!</h1>;
}
`;

export default function PromptToAppBuilder() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return;
//     setLoading(true);

//     try {
//       const response = await fetch(
//         "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyCXTVHIyCWBioY2mq6NtfPMcJqdkjOFleU",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: `Respond ONLY with valid JSX code inside:\n\nexport default function App() { ... }\n\nPrompt:\n"${prompt}"`,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       const data = await response.json();
//       const responseText =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//       const cleanCode = responseText
//         .replace(/```(jsx|js)?/g, "")
//         .replace(/```/g, "")
//         .trim();

//       setCode(cleanCode || defaultCode);
//     } catch (err) {
//       console.error("Gemini error:", err);
//       setCode(`export default function App() {
//         return <h1>⚠️ Gemini API Error</h1>;
//       }`);
//     }

//     setLoading(false);
//   };
const handleGenerate = async () => {
  if (!prompt.trim()) return;
  setLoading(true);

  try {
    const response = await fetch("https://api.llm7.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_LLM7_API_KEY_HERE"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or whatever model llm7 offers
        messages: [
          {
            role: "user",
            content: `Convert the following prompt to valid React JSX code wrapped ONLY inside:

export default function App() { ... }

Prompt: "${prompt}"`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const cleanCode = text
      .replace(/```(jsx|js)?/g, "")
      .replace(/```/g, "")
      .trim();

    setCode(cleanCode || defaultCode);
  } catch (err) {
    console.error("LLM7 error:", err);
    setCode(`export default function App() {
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
      {/* Skiper-style prompt input */}
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

      {/* Code preview box */}
      <div style={{ marginTop: 40 }}>
        <Sandpack theme={amethyst} 
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
              editorHeight: 800,                // default is 300px
    editorWidthPercentage: 40  ,
            showNavigator: true,
            showTabs: true,
            showLineNumbers: true,
            initMode:"user-visible",
            initModeObserverOptions:{
              rootMargin: "500px",
            },
            wrapContent: true,
          }}
        />
      </div>
    </div>
  );
}
