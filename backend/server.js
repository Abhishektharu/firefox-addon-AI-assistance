import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyAO3TNR1-ynfYJsDjmmtgyVAPNoAkJLE0c";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/api/gemini", async (req, res) => {
  try {
    const { message, context, history } = req.body;

    const contents = [];

    // Convert history
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "assistant" ? "model" : h.role, // ✅ normalize
          parts: [{ text: h.text }],
        });
      }
    }

    // Add current user message
    contents.push({ role: "user", parts: [{ text: message }] });

    // Add context (as user, not system)
    if (context) {
      contents.unshift({
        role: "user",
        parts: [{ text: `Page context:\n${context}` }],
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({ contents });

    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
