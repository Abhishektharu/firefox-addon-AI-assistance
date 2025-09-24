browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_SUMMARY") {
    document.getElementById("dialog-box").textContent = msg.text;
  }
});
