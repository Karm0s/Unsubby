console.log("ON BACKGROUND SCRIPT");
// browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "showPageAction") {
//     chrome.pageAction.show(sender.tab.id);
//   }
// });
//
browser.pageAction.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ["./contentScript.js"]
  });
});
