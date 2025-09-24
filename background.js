//create a right click context menu;
browser.contextMenus.create({
    id: "ask-AI",
    title: "Ask AI about this",
    contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener(async(info, tab)=>{
// console.log(info.selectionText);
if (info.menuItemId === "ask-AI" && info.selectionText) {
    console.log("Storing selection:", info.selectionText);
    await browser.storage.local.set({ selectedText: info.selectionText });

    // Open the popup immediately
    // await browser.browserAction.openPopup();
  }

})

// Create context menu when extension is installed
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "summarize-page",
    title: "Summarize This Page",
    contexts: ["page"]
  });
});

// When the menu is clicked
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarize-page") {
    try {
      // Ask content script for page text
      const response = await browser.tabs.sendMessage(tab.id, { action: "getPageText" });
      console.log(response);
      
      const pageText = response?.text || "";

      if (!pageText) throw new Error("No text found on page");

      // Show a browser notification with the before thesummary
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/logo.png",
        title: "Page Summary",
        message: "Please wait for result."
      });

      // Send page text to your backend AI summarizer
      const res = await fetch("http://localhost:5000/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pageText })
      });

      const data = await res.json();
      const summary = data.summary || "No summary returned.";

      // Show a browser notification with the summary
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/logo.png",
        title: "Page Summary",
        message: summary.slice(0, 250) + (summary.length > 250 ? "…" : "")
      });
    } catch (err) {
      console.error(err);
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Error",
        message: err.message
      });
    }
  }
});