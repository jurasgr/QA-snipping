# QA Snipping Tool ✂️

A lightweight, non-intrusive Chrome Extension (Manifest V3) designed for QA engineers and developers to instantly capture screen regions, format metadata/URLs, and write rich HTML payloads directly to the system clipboard for seamless pasting into Jira, Slack, or Google Docs.

---

## ✨ Features

* **Custom Region Capture:** Drag and draw a bounding box over any active web page.
* **Dual Clipboard Payload:** Copies both high-resolution PNG image data and rich-text HTML links into a single `ClipboardItem`.
* **Two Operating Modes:**
  * **Combined Mode (`Cmd+V`):** Pastes the cropped screenshot and a hyperlink labeled `link` in a single paste action.
  * **Separate Mode:** Pastes the image via `Cmd+V` and the raw URL string via `Shift+Cmd+V`.
* **High-DPI Support:** Automatically scales cropped selection coordinates based on `window.devicePixelRatio` for Retina and 4K displays.
* **Non-Blocking UI:** Subtle overlay during selection and auto-dismissing toast notifications upon capture.
* **Privacy Focused:** 100% local execution with zero network payload transfers.

---

## 📁 Project Structure

```text
qa-snipping-tool/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js     # Service Worker handling shortcuts & tab capture
├── content.js        # Selection UI overlay & canvas image processing
├── popup.html        # Settings popup interface
└── popup.js          # Mode switcher state manager