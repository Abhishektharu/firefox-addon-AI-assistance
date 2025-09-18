let messages = [];      // Conversation history
let pageContext = "";   // Optional, filled from content.js

// Attach event listener to the form instead of button
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  if (input.value.trim() === "") return;

  const userMessage = input.value.trim();
  addMessage("You", userMessage);

  // Store in history
  messages.push({ role: "user", text: userMessage });

  try {
    const res = await fetch("http://localhost:5000/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: messages,
        context: pageContext,
      }),
    });

    const data = await res.json();
    const aiReply = data.reply || "No response";

    addMessage("AI", aiReply);

    // Store AI reply in history
    messages.push({ role: "model", text: aiReply });

  } catch (error) {
    addMessage("Error", "⚠️ API error, try again.");
    console.error("Chat error:", error);
  }

  input.value = ""; // Clear input

  // ✅ Helper function
  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

document.getElementById("test").addEventListener("click", async()=>{
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const response = await browser.tabs.sendMessage(tab.id, { action: "getPageText" });
    console.log("Page text:", response.text); // Later send to backend/Gemini
  } catch (err) {
    console.error("Error fetching page text:", err);
  }
})
