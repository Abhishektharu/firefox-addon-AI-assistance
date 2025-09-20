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