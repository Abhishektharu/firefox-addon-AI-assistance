//create a right click context menu;
browser.contextMenus.create({
  id: "ask-AI",
  title: "Ask AI about this",
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  // console.log(info.selectionText);
  if (info.menuItemId === "ask-AI" && info.selectionText) {
    console.log("Storing selection:", info.selectionText);
    await browser.storage.local.set({ selectedText: info.selectionText });

    // Open the popup immediately
    // await browser.browserAction.openPopup();
  }
});

// Create context menu when extension is installed
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "summarize-page",
    title: "Summarize This Page",
    contexts: ["page"],
  });
});
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarize-page") {
    try {
      // Ask content script for page text
      const response = await browser.tabs.sendMessage(tab.id, { action: "getPageText" });
      const pageText = response?.text || "";
      if (!pageText) throw new Error("No text found on page");

      // Notify user while processing
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/logo.png",
        title: "Page Summary",
        message: "Please wait for result."
      });

      // Call backend to summarize
      const res = await fetch("http://localhost:5000/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pageText })
      });
      const data = await res.json();
      const summary = data.summary || "No summary returned.";


      const width = 700;
      const height = 500;
      // Center coordinates (use window.screen for primary display)
      const left = Math.round((screen.availWidth  - width)  / 2);
      const top  = Math.round((screen.availHeight - height) / 2);
      // Open a popup window (empty page first)
      const win = await browser.windows.create({
        url: browser.runtime.getURL("dialog/dialog.html"),
        type: "popup",
        width,
        height,
        left,
        top
      });

      // When the tab inside the new window is ready, send the summary
      const [popupTab] = win.tabs;
      browser.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === popupTab.id && info.status === "complete") {
          browser.tabs.onUpdated.removeListener(listener);
          browser.tabs.sendMessage(tabId, { type: "SHOW_SUMMARY", text: summary });
        }
      });
    } catch (err) {
      console.error(err);
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/logo.png",
        title: "Error",
        message: err.message
      });
    }
  }
});
