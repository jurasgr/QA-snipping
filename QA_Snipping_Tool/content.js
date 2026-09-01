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

  // Закрыццё па клавішы Escape
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
    currentX = e.clientX; // Выпраўленне: ініцыялізацыя пачатковых каардынат
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

  overlay.addEventListener('mouseup', async () => {
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
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = rect.w;
      canvas.height = rect.h;
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      ctx.drawImage(img, rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr, 0, 0, rect.w, rect.h);

      const croppedBase64 = canvas.toDataURL('image/png');
      await processAndCopyData(croppedBase64, mode);
    };
    img.src = fullScreenImageUrl;
  });
}

async function processAndCopyData(imageBase64, mode) {
  const currentUrl = window.location.href;

  try {
    const res = await fetch(imageBase64);
    const imageBlob = await res.blob();
    const textBlob = new Blob([currentUrl], { type: 'text/plain' });

    const htmlContent = mode === 'combined' 
      ? `<img src="${imageBase64}"><br><a href="${encodeURI(currentUrl)}">link</a>`
      : `<img src="${imageBase64}">`;

    const clipboardData = {
      'text/plain': textBlob,
      'image/png': imageBlob,
      'text/html': new Blob([htmlContent], { type: 'text/html' })
    };

    const clipboardItem = new ClipboardItem(clipboardData);
    await navigator.clipboard.write([clipboardItem]);

    const msg = mode === 'combined' 
      ? "✅ Скрыншот + спасылка ў буферы!" 
      : "✅ Скрыншот у буферы!";
    showToast(msg);
  } catch (err) {
    showToast("❌ Памылка капіявання", true);
    console.error(err);
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
