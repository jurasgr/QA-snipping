chrome.commands.onCommand.addListener(async (command) => {
  if (command === "take_screenshot") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("https://chrome.google.com"))) {
      return;
    }

    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      const { mode = 'combined' } = await chrome.storage.local.get('mode');

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }, () => {
        if (chrome.runtime.lastError) return;
        chrome.tabs.sendMessage(tab.id, { action: "start_crop", image: dataUrl, mode: mode });
      });
    } catch (err) {
      console.error("❌ Памылка ў background.js:", err);
    }
  }
});