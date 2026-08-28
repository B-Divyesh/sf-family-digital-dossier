const banner = document.querySelector<HTMLDivElement>('#offline-banner');

async function reflectNetworkState(): Promise<void> {
  if (!banner) return;
  if (!navigator.onLine) { banner.hidden = false; return; }
  try {
    const response = await fetch(`/robots.txt?network-check=${Date.now()}`, { cache: 'no-store' });
    banner.hidden = response.ok;
  } catch {
    banner.hidden = false;
  }
}

window.addEventListener('online', () => { void reflectNetworkState(); });
window.addEventListener('offline', () => { if (banner) banner.hidden = false; });
void reflectNetworkState();
