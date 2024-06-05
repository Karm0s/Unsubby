browser.pageAction.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ["./contentScript.js"]
  });
});
