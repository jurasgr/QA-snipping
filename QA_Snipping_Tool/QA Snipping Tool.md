QA Snipping Tool
A lightweight, non-intrusive Chrome Extension (Manifest V3) designed for QA engineers and developers to instantly capture screen regions, format metadata/URLs, and write rich HTML payloads to the system clipboard for pasting into Jira, Slack, or Google Docs.
Features
* Custom Region Capture: Drag and draw a bounding box over any active web tab.
* Dual Clipboard Payload: Copies both high-resolution PNG image data and rich-text HTML links into a single ClipboardItem.
* Two Operating Modes:
    * Combined Mode (Cmd+V): Pastes the cropped screenshot and a hyperlink labeled link in one action.
    * Separate Mode: Pastes the image via Cmd+V and plain text URL via Shift+Cmd+V.
* High-DPI Support: Automatically scales cropped selection coordinates based on window.devicePixelRatio for Retina displays.
* Non-Blocking UI: Subtle overlay during selection and auto-dismissing toast notifications.
File Structure
Make sure all files are in the same local directory:
Plaintext

qa-snipping-tool/
├── manifest.json
├── background.js
├── content.js
├── popup.html
└── popup.js
Installation Guide (Unpacked Developer Mode)
1. Clone or Create Files: Place manifest.json, background.js, content.js, popup.html, and popup.js in a single folder on your local machine.
2. Open Extensions Page: Open Google Chrome and navigate to chrome://extensions/.
3. Enable Developer Mode: Toggle the Developer mode switch in the top right corner.
4. Load Unpacked Extension: Click Load unpacked in the top left corner and select your folder.
5. Configure Keyboard Shortcut:
    * Open chrome://extensions/shortcuts in a new tab.
    * Locate QA Snipping Tool.
    * Under Run QA Snipping Tool, assign your preferred shortcut (e.g., Cmd+Shift+E on macOS or Ctrl+Shift+E on Windows).
How to Use
1. Navigate to any standard website.
2. Press Cmd + Shift + E (or click 📸 Capture Screenshot in the extension popup).
3. Click and drag your mouse to select the screen area you want to capture.
4. Release the mouse button.
5. Paste the output into your workspace:
    * Combined Mode (Cmd+V): Pastes the cropped image followed by the hyperlink labeled link.
    * Separate Mode (Cmd+V / Shift+Cmd+V): Cmd+V pastes the image; Shift+Cmd+V pastes the direct URL string.
6. Switch Modes: Click the extension icon in the toolbar to open the settings popup and choose your preferred copy mode.
How It Works (Architecture & GitHub Documentation)
1. Manifest V3 Service Worker Architecture
The extension operates under Chrome Manifest V3. The background.js service worker listens for shortcut events via chrome.commands.onCommand and extension messages via chrome.runtime.onMessage. It uses the activeTab permission to dynamically request tab access without asking for global site permissions.
2. Tab Capture & Script Injection Pipeline
When triggered:
1. background.js takes a full-tab screenshot using chrome.tabs.captureVisibleTab() in PNG format.
2. It injects content.js into the current active tab via chrome.scripting.executeScript().
3. It passes the full-resolution Base64 image payload and current user settings (chrome.storage.local) to the content script using chrome.tabs.sendMessage().
3. Selection Canvas & DPI Adjustment
1. content.js attaches a full-viewport fixed overlay (#qa-snipper-overlay) with a crosshair cursor.
2. Drag events construct a temporary visual bounding box.
3. Upon mouse release, the crop coordinates (x, y, w, h) are mapped onto an offscreen HTML5 <canvas>.
4. Coordinates are multiplied by window.devicePixelRatio to ensure crisp image rendering on 4K and Retina displays.
4. Rich Clipboard Payload Composition
The script uses the asynchronous navigator.clipboard.write() API to assemble a multi-MIME ClipboardItem:
* text/plain: Standard text fallback containing the active URL.
* text/html: HTML container wrapping <img src="base64..."> and <a href="URL">link</a>.
* image/png: Binary blob of the cropped region.
Rich-text editors (Jira, Slack, Confluence) consume the text/html payload to display the image inline alongside clickable hyperlinks, while standard plain-text inputs fallback gracefully to raw URL strings.
