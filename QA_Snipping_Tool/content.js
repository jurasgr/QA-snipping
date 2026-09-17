const oldOverlay = document.getElementById('qa-snipper-overlay');
if (oldOverlay) oldOverlay.remove();

if (!window.qaSnipperInjected) {
  window.qaSnipperInjected = true;
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start_crop") {
      initCropUI(request.image, request.mode);
    }
  });
}

function initCropUI(fullScreenImageUrl, mode) {
  const existingOverlay = document.getElementById('qa-snipper-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'qa-snipper-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5); z-index: 999999; cursor: crosshair;
  `;

  const selection = document.createElement('div');
  selection.style.cssText = `
    position: absolute; border: 2px dashed #00ff00; background: rgba(0,255,0,0.1);
    display: none; pointer-events: none;
  `;
  overlay.appendChild(selection);
  document.body.appendChild(overlay);

  let isDrawing = false;
  let startX = 0, startY = 0, currentX = 0, currentY = 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };
  window.addEventListener('keydown', handleKeyDown);

  function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  overlay.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    currentY = e.clientY;
    selection.style.left = startX + 'px';
    selection.style.top = startY + 'px';
    selection.style.width = '0px';
    selection.style.height = '0px';
    selection.style.display = 'block';
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    currentX = e.clientX;
    currentY = e.clientY;
    selection.style.left = Math.min(startX, currentX) + 'px';
    selection.style.top = Math.min(startY, currentY) + 'px';
    selection.style.width = Math.abs(currentX - startX) + 'px';
    selection.style.height = Math.abs(currentY - startY) + 'px';
  });

  overlay.addEventListener('mouseup', () => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = {
      x: Math.min(startX, currentX),
      y: Math.min(startY, currentY),
      w: Math.abs(currentX - startX),
      h: Math.abs(currentY - startY)
    };

    cleanup();

    if (rect.w < 10 || rect.h < 10) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = rect.w;
      canvas.height = rect.h;
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      ctx.drawImage(img, rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr, 0, 0, rect.w, rect.h);

      // Сінхроннае стварэнне Base64 і Blob без асінхронных запінак
      const imageBase64 = canvas.toDataURL('image/png');
      const imageBlob = dataURLtoBlob(imageBase64);

      processAndCopyData(imageBase64, imageBlob, mode);
    };
    img.src = fullScreenImageUrl;
  });
}

// Хуткая сінхронная канвертацыя Base64 у Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function processAndCopyData(imageBase64, imageBlob, mode) {
  const currentUrl = window.location.href;
  const isGoogleSheets = currentUrl.includes('docs.google.com/spreadsheets');

  try {
    let clipboardData = {};

    if (isGoogleSheets) {
      // Для Google Sheets пакідаем ТОЛЬКІ выяву, каб Cmd+V гарантавана ўстаўляў малюнак
      clipboardData = {
        'image/png': imageBlob
      };
    } else if (mode === 'combined') {
      // РЭЖЫМ 1:
      // Cmd+V       -> HTML (Скрыншот + клікабельнае "link")
      // Shift+Cmd+V -> Plain Text (чыстая тэкставая спасылка)
      const textBlob = new Blob([currentUrl], { type: 'text/plain' });
      const htmlContent = `<img src="${imageBase64}"><br><a href="${encodeURI(currentUrl)}">link</a>`;
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

      clipboardData = {
        'image/png': imageBlob,
        'text/html': htmlBlob,
        'text/plain': textBlob
      };
    } else {
      // РЭЖЫМ 2:
      // Cmd+V       -> Скрыншот (праграмы выбіраюць image/png, бо няма HTML)
      // Shift+Cmd+V -> Спасылка (прымусова бярэ text/plain)
      const textBlob = new Blob([currentUrl], { type: 'text/plain' });

      clipboardData = {
        'image/png': imageBlob,
        'text/plain': textBlob
      };
    }

    const clipboardItem = new ClipboardItem(clipboardData);
    
    navigator.clipboard.write([clipboardItem]).then(() => {
      const msg = isGoogleSheets
        ? "✅ Скрыншот у буферы (аўтаматам для Google Sheets)!"
        : (mode === 'combined'
            ? "✅ Рэжым 1: Cmd+V (скрыншот + link) | Shift+Cmd+V (URL)"
            : "✅ Рэжым 2: Cmd+V (скрыншот) | Shift+Cmd+V (URL)");
      showToast(msg);
    }).catch((err) => {
      console.error("Памылка запісу ў буфер:", err);
      showToast("❌ Памылка капіявання", true);
    });

  } catch (err) {
    console.error("Памылка стварэння ClipboardItem:", err);
    showToast("❌ Памылка капіявання", true);
  }
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${isError ? '#e74c3c' : '#2ecc71'}; color: white;
    padding: 12px 20px; border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000000;
    transition: opacity 0.3s, transform 0.3s; opacity: 0; transform: translateY(-10px);
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
