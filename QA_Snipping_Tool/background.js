chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "take_screenshot") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return;

  // Праверка на сістэмныя і забароненыя старонкі
  const isRestrictedUrl = 
    tab.url.startsWith("chrome://") || 
    tab.url.startsWith("https://chrome.google.com") ||
    tab.url.startsWith("https://chromewebstore.google.com");

  if (isRestrictedUrl) return;

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const { mode = 'combined' } = await chrome.storage.local.get('mode');

    // Выкарыстоўваем await замест callback
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    await chrome.tabs.sendMessage(tab.id, { 
      action: "start_crop", 
      image: dataUrl, 
      mode: mode 
    });
  } catch (err) {
    console.error("❌ Памылка ў background.js:", err);
  }
});
