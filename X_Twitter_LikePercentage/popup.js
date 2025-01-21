document.addEventListener("DOMContentLoaded", () => {
  const togglePlugin = document.getElementById("togglePlugin");

  // Load the current state from storage
  chrome.storage.local.get("enabled", (data) => {
      togglePlugin.checked = data.enabled ?? true; // Default to true if undefined
  });

  // Update the state when the toggle is changed
  togglePlugin.addEventListener("change", () => {
      const isEnabled = togglePlugin.checked;
      chrome.storage.local.set({ enabled: isEnabled });

      // Notify content scripts of the change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { enabled: isEnabled });
          }
      });
  });
});
