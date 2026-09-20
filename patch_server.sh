#!/bin/bash
cat << 'INNER_EOF' >> server.ts

// 5. Metacognition Chat Endpoint
app.post("/api/metacognition/chat", async (req, res) => {
  const { history, message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ error: "Gemini API key not configured." });
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are the Metacognitive subsystem of EVE PRIME. Your purpose is self-reflection, analyzing internal agent execution logic, generating internal visual diagrams, and assisting the user in understanding system status.",
        temperature: 0.7
      }
    });

    // We could re-play history here using standard genai SDK methods if we had them mapped,
    // but for simplicity we'll just send the current message + history context.
    const prompt = `Conversation history:\n${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}\n\nUser: ${message}`;
    
    const response = await chat.sendMessage({ message: prompt });
    
    return res.json({
      role: "model",
      text: response.text
    });
  } catch (err: any) {
    console.error("Metacognition error:", err);
    res.status(500).json({ error: err.message });
  }
});
INNER_EOF
