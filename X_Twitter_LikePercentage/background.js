// Set the initial state in storage (enabled by default)
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
});

// Listen for action button clicks to toggle the state
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get("enabled", (data) => {
        const newState = !data.enabled;
        chrome.storage.local.set({ enabled: newState });

        // Update the action icon based on the new state
        chrome.action.setIcon({
            path: newState ? "icon_enabled.png" : "icon_disabled.png",
            tabId: tab.id,
        });

        // Notify the content script about the state change
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { enabled: newState });
            }
        });
    });
});
