document.addEventListener('DOMContentLoaded', async () => {
  const radios = document.querySelectorAll('input[name="mode"]');
  const { mode = 'combined' } = await chrome.storage.local.get('mode');
  
  radios.forEach(r => {
    if (r.value === mode) r.checked = true;
    
    r.addEventListener('change', (e) => {
      chrome.storage.local.set({ mode: e.target.value });
    });
  });
});