chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("maang.in")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
    }
    if (changeInfo.status === "loading" && tab.url.includes("maang.in")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["api_observers/injector.js"]
        });
    }
});




