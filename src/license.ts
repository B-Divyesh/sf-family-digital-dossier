export const PRODUCT_SLUG = 'family-digital-dossier';
export const BILLING_BASE = 'https://api.sociobot.in/api/v1';
export const BUY_URL = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
const TOKEN_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;
const DAY = 86_400_000;

interface CachedVerdict { valid: boolean; checkedAt: number; }
export interface LicenseState { unlocked: boolean; notice: string; }

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as CachedVerdict;
    return verdict.valid ? { unlocked: true, notice: '' } : { unlocked: false, notice: 'License no longer active.' };
  } catch {
    return { unlocked: false, notice: '' };
  }
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, notice: '' };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as CachedVerdict;
    if (!force && Date.now() - cached.checkedAt < DAY) return cached.valid ? { unlocked: true, notice: '' } : { unlocked: false, notice: 'License no longer active.' };
  } catch { /* first verification */ }
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verification unavailable');
    const body = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: body.valid, checkedAt: Date.now() }));
    return body.valid ? { unlocked: true, notice: '' } : { unlocked: false, notice: 'License no longer active.' };
  } catch {
    return cachedLicenseState();
  }
}
