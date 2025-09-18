browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

  console.log("hello from content listener. ");

  //sends all the text from webpage
  if(request.action === "getPageText"){
    sendResponse({text: document.body ? document.body.innerText : ""})
  }

  //sends only the selected text 
  if(request.action === "getSelectionText"){
    sendResponse({text: window.getSelection().toString() });
  }

});
