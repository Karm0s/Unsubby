console.log(document.title);
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UnsubbyPayload") {
    alert("Received message from React app: " + message.payload);
  }
})
