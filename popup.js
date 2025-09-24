let messages = []; // Conversation history
let pageContext = ""; // Optional, filled from content.js
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
// Attach event listener to the form instead of button

// ✅ Prompt template buttons
document.querySelectorAll(".template-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const basePrompt = btn.textContent;
    // Prepend template to input, preserving existing text
    input.value = `${basePrompt}: ${input.value}`.trim();
    input.focus();
  });
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (input.value.trim() === "") return;

  const userMessage = input.value.trim();
  addMessage("You", userMessage);

  // Store in history
  messages.push({ role: "user", text: userMessage });

  try {
    loading.classList.remove("hidden"); // before fetch
    // const res = await fetch("http://localhost:5000/api/gemini", {
    const res = await fetch(
      "https://firefox-addon-ai-assistance.onrender.com/api/gemini",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          context: pageContext,
        }),
      }
    );
    loading.classList.add("hidden"); // after fetch

    const data = await res.json();
    const aiReply = data.reply || "No response";

    addMessage("AI", aiReply, true);

    // Store AI reply in history
    messages.push({ role: "model", text: aiReply });
  } catch (error) {
    addMessage("Error", "⚠️ API error, try again.");
    console.error("Chat error:", error);
  }
  loading.classList.add("hidden"); // after fetch

  input.value = ""; // Clear input

  // ✅ Helper function
  function addMessage(sender, text, isAI = false) {
    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    if (isAI) {
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋 copy ";
      copyBtn.className = "copy-btn";
      copyBtn.onclick = () => navigator.clipboard.writeText(text);
      msg.appendChild(copyBtn);
    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// document.getElementById("test").addEventListener("click", async () => {
//   try {
//     loading.classList.remove("hidden"); // before fetch
//     const [tab] = await browser.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     const response = await browser.tabs.sendMessage(tab.id, {
//       action: "getPageText",
//     });
//     console.log("Page text:", response.text); // Later send to backend/Gemini

//     loading.classList.add("hidden"); // after fetch
//   } catch (err) {
//     console.error("Error fetching page text:", err);
//   }
// });

document.addEventListener("DOMContentLoaded", async () => {
  const data = await browser.storage.local.get("selectedText");
  if (data.selectedText) {
    console.log("From context menu:", data.selectedText);

    // Optional: auto-fill input box
    document.getElementById("user-input").value = data.selectedText;

    // Clear after using
    await browser.storage.local.remove("selectedText");
  }
});
