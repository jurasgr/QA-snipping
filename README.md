# QA Snipping Tool ✂️

A lightweight Chrome Extension (Manifest V3) for QA engineers to instantly capture screen regions, format metadata/URLs, and paste rich payloads into Jira, Slack, Docs, or Sheets.

---

## ✨ Features / Магчымасці

* **Quick Capture:** Press `Cmd+Shift+E` (`Ctrl+Shift+E`) and drag to select any screen area.
* **Dual Payload:** Copies high-resolution PNG and clickable HTML link into a single clipboard item.
* **Two Modes:**
  * **Combined Mode (`Cmd+V`):** Pastes image + hyperlink labeled `link`.
  * **Separate Mode:** Pastes image via `Cmd+V`, raw URL via `Shift+Cmd+V`.
* **100% Private:** Executes locally in browser RAM with zero external requests.

---

## ⚙️ Installation / Усталёўка

1. Clone or download project files into a folder.
2. Open `chrome://extensions/` in Chrome and enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the extension folder.
4. *(Optional)* Customize shortcuts at `chrome://extensions/shortcuts`.

---

## 📊 Google Sheets Note / Для Гугл Табліц

Pasting via `Cmd+V` places the image over the grid by default. To put it inside a cell:
* Click the **3 dots** on the pasted image -> **Put image in selected cell** (*Змясціць малюнак у абраную ячэйку*).

---

## 📁 Project Structure / Структура праекта

```text
qa-snipping-tool/
├── manifest.json   # Manifest V3 config & permissions
├── background.js  # Service worker handling commands & capture
├── content.js     # Selection overlay UI & canvas image processing
├── popup.html     # Settings popup interface
└── popup.js       # Operating mode switcher state
