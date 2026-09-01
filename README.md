# QA Snipping Tool ✂️

A lightweight, non-intrusive Chrome Extension (Manifest V3) designed for QA engineers and developers to instantly capture screen regions, format metadata/URLs, and write rich HTML payloads directly to the system clipboard for seamless pasting into Jira, Slack, or Google Docs.

---

## ✨ Features

* **Custom Region Capture:** Drag and draw a bounding box over any active web page.
* **Dual Clipboard Payload:** Copies both high-resolution PNG image data and rich-text HTML links into a single `ClipboardItem`.
* **Two Operating Modes:**
  * **Combined Mode (`Cmd+V`):** Pastes the cropped screenshot and a hyperlink labeled `link` in a single paste action.
  * **Separate Mode:** Pastes the image via `Cmd+V` and the raw URL string via `Shift+Cmd+V`.
* **Non-Blocking UI:** Subtle overlay during selection and auto-dismissing toast notifications upon capture.
* **Privacy Focused:** 100% local execution with zero network payload transfers.

---
# QA Snipping Tool ✂️

Кароткае кіраўніцтва па выкарыстанні і ўсталёўцы пашырэння.

## ⚙️ Як гэта працуе

1. **Запуск:** Націсніце `Cmd + Shift + E` (або `Ctrl + Shift + E`) і вылучыце мышшу патрэбную вобласць экрана.
2. **Апрацоўка:** Пашырэнне аўтаматычна робіць кроп, атрымлівае URL бягучай старонкі і кладзе малюнак са спасылкай у буфер абмену.
3. **Устаўка:**
   * `Cmd + V` — устаўляе скрыншот і клікабельнае слова **link** (у *Combined Mode*) ці проста скрыншот (у *Separate Mode*).
   * `Shift + Cmd + V` — устаўляе чыстую тэкставую спасылку на старонку.

---

## Як усталяваць

1. **Захавайце файлы:** Змесціце ўсе файлы праекта ў адну папку на камп'ютары.
2. **Уключыце рэжым распрацоўшчыка:** 
   * Перайдзіце па адрасе `chrome://extensions/` у браўзеры.
   * Уключыце **«Рэжым распрацоўшчыка»** (*Developer mode*) у верхнім правым куце.
3. **Загрузіце пашырэнне:** 
   * Націсніце кнопку **«Загрузіць распакаванае»** (*Load unpacked*) у левым верхнім куце.
   * Абярыце папку з файламi пашырэння.
4. **Наладзьце клавішы:** 
   * Адкрыйце `chrome://extensions/shortcuts` у новай укладцы.
   * Для пункта **«Запусціць QA Snipping Tool»** прызначце комбінацыю `Cmd + Shift + W` (або іншую зручную).

---
## 📁 Project Structure

```text
qa-snipping-tool/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js     # Service Worker handling shortcuts & tab capture
├── content.js        # Selection UI overlay & canvas image processing
├── popup.html        # Settings popup interface
└── popup.js          # Mode switcher state manager# QA-snipping
