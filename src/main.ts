import './styles.css';
import { decryptDossier, encryptDossier, isEncryptedEnvelope, type EncryptedEnvelope } from './crypto';
import { deleteDemoDatabase, deleteEnvelope, readEnvelope, writeEnvelope } from './db';
import { createDemoDossier, DEMO_PASSPHRASE } from './demo';
import { CREDENTIAL_ERROR, findDossierCredentialRisks, firstCredentialRisk, looksLikeCredential } from './safety';
import { CATEGORIES, createEmptyDossier, type DossierData, type DossierEntry, type TrustedContact } from './types';

type View = 'overview' | 'records' | 'people' | 'plan' | 'review' | 'settings';
const app = document.querySelector<HTMLDivElement>('#app')!;
const statusRegion = document.querySelector<HTMLDivElement>('#status')!;
document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector<HTMLElement>('#main')?.focus();
  history.replaceState(history.state, '', `${location.pathname}${location.search}#main`);
});
let envelope: EncryptedEnvelope | undefined;
let dossier: DossierData | undefined;
let passphrase = '';
let view: View = 'overview';
let statusTimer = 0;
let demoMode = false;
const BUILD_ID = 'polish-3';
const SITE_URL = 'https://family-digital-dossier.sociobot.in';

const escapeHtml = (value: string | number | undefined): string => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
const uid = (): string => crypto.randomUUID();
const today = (): string => new Date().toISOString().slice(0, 10);
const humanDate = (value: string): string => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)) : 'Not set';

function showStatus(message: string): void {
  window.clearTimeout(statusTimer);
  statusRegion.textContent = message;
  statusRegion.hidden = false;
  statusTimer = window.setTimeout(() => { statusRegion.hidden = true; }, 4500);
}

function rejectCredentialLikeInput(form: HTMLFormElement, fields: Array<{ field: string; label: string; value: string }>, errorId: string): boolean {
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  const error = form.querySelector<HTMLElement>(`#${errorId}`)!;
  const risk = firstCredentialRisk(fields);
  if (!risk) { error.textContent = ''; error.className = ''; return false; }
  error.className = 'error';
  error.textContent = `${risk.label}: ${CREDENTIAL_ERROR}`;
  const control = form.elements.namedItem(risk.field);
  if (control instanceof HTMLElement) { control.setAttribute('aria-invalid', 'true'); control.focus(); }
  return true;
}

function allowReadableOutput(): boolean {
  const risks = dossier ? findDossierCredentialRisks(dossier) : [];
  if (!risks.length) return true;
  showStatus(`Remove credential-like content from ${risks[0].label} before printing or exporting.`);
  return false;
}

function safeReadableText(value: string, fallback = ''): string {
  return escapeHtml(looksLikeCredential(value) ? '[Credential-like content hidden — edit and remove it]' : (value || fallback));
}

function siteHeader(appMode = false): string {
  return `<header class="site-header${appMode ? ' app-header' : ''}">
    <a class="brand" href="/" aria-label="Family Digital Dossier home"><span class="brand-mark" aria-hidden="true"></span><span>Family Digital Dossier</span></a>
    <nav class="header-links" aria-label="Site"><a href="/?demo=1">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a>${appMode ? (demoMode ? '' : '<button class="button quiet" id="lock-button" type="button">Lock</button>') : `<a class="button quiet" href="${envelope ? '/overview' : '#start'}">${envelope ? 'Unlock dossier' : 'Create a dossier'}</a>`}</nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div><strong>Family Digital Dossier</strong><p class="small muted">A private guide to essential family records.</p></div><div><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="https://sociobot.in" aria-label="Built by Param Factory (opens external)">Built by Param Factory (opens external)</a><p class="small muted">We generated the original artwork for this product. Build ${BUILD_ID}.</p></div></footer>`;
}

function demoBanner(): string {
  return demoMode ? `<aside class="demo-banner" aria-label="Sample dossier"><strong>Demo — sample data, nothing is saved to your dossier.</strong><div><button class="text-button" id="reset-demo" type="button">Reset demo</button><button class="text-button" id="start-real" type="button">Start for real</button></div></aside>` : '';
}

function setMetadata(title: string, description: string, path: string): void {
  document.title = title;
  const canonical = `${SITE_URL}${path}`;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

const routeNames: Record<View, string> = { overview: 'Overview', records: 'Records', people: 'Trusted people', plan: 'Handoff plan', review: 'Review and print', settings: 'Settings' };
const routePath = (nextView: View): string => `${demoMode ? '/demo' : ''}${nextView === 'overview' ? (demoMode ? '' : '/overview') : `/${nextView}`}` || '/';

function routeViewFromPath(): View | undefined {
  const parts = location.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (parts[0] === 'demo') parts.shift();
  if (!parts.length) return demoMode ? 'overview' : undefined;
  return navItems.some(([key]) => key === parts[0]) ? parts[0] as View : undefined;
}

function navigateView(nextView: View, replace = false): void {
  view = nextView;
  const path = routePath(nextView);
  if (!replace) history.replaceState({ ...history.state, view, demo: demoMode, scrollY: window.scrollY }, '', location.href);
  history[replace ? 'replaceState' : 'pushState']({ view: nextView, demo: demoMode }, '', path);
  renderDossier();
  const heading = document.querySelector<HTMLElement>('main h1');
  heading?.focus();
  const announcement = document.querySelector('#route-status');
  if (announcement) announcement.textContent = `${routeNames[nextView]} loaded`;
}

function renderWelcome(error = ''): void {
  if (envelope) { renderUnlock(error); return; }
  setMetadata('Family Digital Dossier — map essential family records', 'Prepare a private, offline guide to essential records for family or an executor. Do not store passwords or documents.', '/');
  app.innerHTML = `${siteHeader()}<main id="main" class="landing-main" tabindex="-1">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Help without sharing passwords</p><h1>Map essential records for someone you trust</h1>
      <p class="lede">For adults helping family or an executor find records during illness or after death.</p>
      <div class="actions"><a class="button primary" href="/?demo=1">Try it with sample data</a><a class="button" href="#start">Create encrypted dossier</a></div>
      <p class="action-note">The sample opens as a filled, private dossier.</p>
      <ul class="fact-strip" aria-label="Key facts"><li>Saved on this device</li><li>Works offline after setup</li><li>All tools are free</li></ul>
      <div class="safety-note"><span aria-hidden="true">◆</span><div><strong>Never enter a password or recovery code.</strong><span class="small">Record what exists, where it is, and who to contact.</span></div></div>
    </div><div class="hero-art"><picture><source srcset="/assets/hero-archive.a969e117.avif" type="image/avif"><source srcset="/assets/hero-archive.616a017b.webp" type="image/webp"><img src="/assets/hero-archive.19baff82.jpg" width="1280" height="853" alt="Seven paper record envelopes connected by orderly routes to a central sealed dossier" fetchpriority="high" decoding="async"></picture></div></section>
    <section class="sample-preview" aria-labelledby="preview-title"><div><p class="eyebrow">A filled dossier at a glance</p><h2 id="preview-title">See the record guide before you start</h2><p>Preview locations, trusted people, review dates, and first steps without entering personal details.</p><a class="text-link" href="/?demo=1">Open the complete sample dossier →</a></div><div class="preview-sheet" aria-label="Sample record preview"><div class="preview-seal">80%<span>ready</span></div><div><strong>Term life insurance policy</strong><span>Red estate folder, insurance divider</span></div><div><strong>Signed will</strong><span>Original held by Rao Legal</span></div><div><strong>Primary bank accounts</strong><span>Statements in study safe</span></div></div></section>
    <section id="how" class="principles"><div class="principles-inner"><p class="eyebrow">How it works</p><h2>Prepare the handoff in three steps</h2><div class="principles-grid">
      <div><span class="principle-number">01</span><h3>List record locations</h3><p>Name each record and point to its safe location. Keep every secret elsewhere.</p></div>
      <div><span class="principle-number">02</span><h3>Name trusted people</h3><p>Link a family member or professional to each record when they can help.</p></div>
      <div><span class="principle-number">03</span><h3>Print or export the handoff</h3><p>Review the dossier, then print a cover or save an encrypted backup.</p></div>
    </div></div></section>
    <section class="limits"><div><p class="eyebrow">Deliberately limited</p><h2>What this dossier does not do</h2><p>The app has no document upload or account-access feature. Do not paste passwords or document contents into notes.</p><p>It does not give legal advice. Your passphrase encrypts the dossier before this browser saves it. There is no account or recovery reset.</p></div></section>
    <section id="start" class="setup-panel"><div class="setup-sheet"><p class="eyebrow">Stored only on this device</p><h2>Create your encrypted dossier</h2>
      <p>Your passphrase encrypts the dossier before this browser saves it. We cannot see or recover it.</p>${error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : ''}
      <form id="setup-form"><div class="field"><label for="new-passphrase">Passphrase</label><input id="new-passphrase" name="passphrase" type="password" minlength="12" autocomplete="new-password" required aria-describedby="passphrase-help"><span id="passphrase-help" class="field-hint">Use 4–6 unrelated words (at least 12 characters). Store a copy somewhere your executor can eventually access.</span></div>
      <div class="field"><label for="confirm-passphrase">Confirm passphrase</label><input id="confirm-passphrase" name="confirm" type="password" minlength="12" autocomplete="new-password" required></div>
      <label class="checkbox"><input name="understood" type="checkbox" required><span>I understand there is no reset or recovery if I lose this passphrase.</span></label>
      <button class="button primary" type="submit">Create encrypted dossier</button></form></div></section>
  </main>${footer()}`;
  if (location.hash === '#main') document.querySelector<HTMLElement>('#main')?.focus();
  document.querySelector<HTMLFormElement>('#setup-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLFormElement;
    const form = new FormData(target);
    const nextPassphrase = String(form.get('passphrase'));
    if (nextPassphrase !== String(form.get('confirm'))) { renderWelcome('The passphrases do not match.'); document.querySelector<HTMLInputElement>('#new-passphrase')?.focus(); return; }
    try {
      const button = target.querySelector('button')!; button.disabled = true; button.textContent = 'Encrypting on this device…';
      dossier = createEmptyDossier(); passphrase = nextPassphrase;
      await persist(); navigateView('overview'); showStatus('Encrypted dossier created on this device.');
    } catch (caught) { dossier = undefined; passphrase = ''; renderWelcome(caught instanceof Error ? caught.message : 'The dossier could not be created.'); }
  });
}

function renderUnlock(error = ''): void {
  setMetadata('Unlock dossier — Family Digital Dossier', 'Unlock the encrypted family record guide stored on this device.', location.pathname);
  app.innerHTML = `${siteHeader()}<main id="main"><section class="setup-panel"><div class="setup-sheet"><p class="eyebrow">Encrypted on this device</p><h1 class="page-title">Unlock your dossier</h1><p>Enter the passphrase you chose. It never leaves this browser.</p>
    ${error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : ''}<form id="unlock-form"><div class="field"><label for="passphrase">Passphrase</label><input id="passphrase" name="passphrase" type="password" autocomplete="current-password" required autofocus></div><button class="button primary" type="submit">Unlock dossier</button></form>
    <details><summary>Need to restore on this device?</summary><p class="small">Unlock first if a dossier already exists, then use Settings → Import encrypted backup. This avoids accidentally replacing local data.</p></details></div></section></main>${footer()}`;
  const input = document.querySelector<HTMLInputElement>('#passphrase'); input?.focus();
  document.querySelector<HTMLFormElement>('#unlock-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const target = event.currentTarget as HTMLFormElement; const button = target.querySelector('button')!; button.disabled = true; button.textContent = 'Unlocking…';
    try { passphrase = String(new FormData(target).get('passphrase')); dossier = await decryptDossier(envelope!, passphrase); if (location.pathname === '/') navigateView('overview'); else renderDossier(); }
    catch (caught) { passphrase = ''; renderUnlock(caught instanceof Error ? caught.message : 'This dossier could not be unlocked.'); }
  });
}

async function persist(message = 'Changes encrypted and saved.'): Promise<void> {
  if (!dossier || !passphrase) return;
  dossier.updatedAt = new Date().toISOString();
  envelope = await encryptDossier(dossier, passphrase);
  await writeEnvelope(envelope, demoMode);
  const label = document.querySelector<HTMLElement>('#save-state');
  if (label) label.textContent = `Saved locally at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (message) showStatus(message);
}

function dossierProgress(): number {
  if (!dossier) return 0;
  const recordScore = Math.min(dossier.entries.length, 10) * 6;
  const locatorScore = dossier.entries.length ? Math.round(dossier.entries.filter((item) => item.locator).length / dossier.entries.length * 15) : 0;
  return Math.min(100, recordScore + locatorScore + (dossier.contacts.length ? 10 : 0) + (dossier.profile.executorInstructions ? 10 : 0) + (dossier.profile.jurisdiction ? 5 : 0));
}

const navItems: Array<[View, string]> = [['overview', 'Overview'], ['records', 'Records'], ['people', 'People'], ['plan', 'Handoff plan'], ['review', 'Review & print'], ['settings', 'Settings']];

function renderDossier(): void {
  if (!dossier) return;
  const progress = dossierProgress();
  const risks = findDossierCredentialRisks(dossier);
  setMetadata(`${demoMode && view === 'overview' ? 'Demo' : routeNames[view]} — Family Digital Dossier`, `View the ${routeNames[view].toLowerCase()} section of the encrypted family record guide.`, routePath(view));
  app.innerHTML = `${siteHeader(true)}${demoBanner()}<div id="route-status" class="sr-only" aria-live="polite"></div><div class="app-shell"><aside class="sidebar"><div class="progress-seal" style="--progress:${progress * 3.6}deg" aria-label="Dossier ${progress}% complete"><div><strong>${progress}%</strong><span class="small">ready</span></div></div>
    <nav class="side-nav" aria-label="Dossier sections">${navItems.map(([key, label]) => `<a href="${routePath(key)}" class="nav-button${view === key ? ' active' : ''}" data-view="${key}"${view === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><p id="save-state" class="save-state">Encrypted · saved ${demoMode ? 'in sample space' : 'locally'}</p></aside>
    <main id="main" class="main-panel" tabindex="-1">${risks.length ? `<div class="error credential-warning" role="alert"><strong>Credential-like content is blocked from print and readable export.</strong><span>Edit and remove it from ${escapeHtml(risks[0].label)}. Encrypted backup remains available so no data is destroyed.</span></div>` : ''}${renderView()}</main></div>${footer()}`;
  bindCommonEvents();
  bindViewEvents();
}

function renderView(): string {
  switch (view) {
    case 'records': return recordsView();
    case 'people': return peopleView();
    case 'plan': return planView();
    case 'review': return reviewView();
    case 'settings': return settingsView();
    default: return overviewView();
  }
}

function bindCommonEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-view]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); navigateView(link.dataset.view as View); }));
  document.querySelector('#lock-button')?.addEventListener('click', () => { dossier = undefined; passphrase = ''; renderUnlock(); showStatus('Dossier locked.'); });
  document.querySelector('#reset-demo')?.addEventListener('click', () => { void resetDemo(); });
  document.querySelector('#start-real')?.addEventListener('click', () => { void leaveDemo(); });
}

function nextReviewDate(): Date {
  const source = dossier!.reviews[0]?.date || dossier!.createdAt.slice(0, 10);
  const next = new Date(`${source}T12:00:00`); next.setMonth(next.getMonth() + dossier!.profile.reviewMonths); return next;
}

function overviewView(): string {
  const next = nextReviewDate(); const days = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return `<section><div class="section-heading"><div><p class="eyebrow">Your record guide</p><h1 class="view-title" tabindex="-1">${dossier!.profile.ownerName ? `${escapeHtml(dossier!.profile.ownerName)}’s dossier` : 'Start with what matters most'}</h1><p>${dossier!.entries.length ? 'Keep each location current. Your dossier contains locations and instructions, never the secrets themselves.' : 'Add the first three records someone would urgently need to find. You can build from there.'}</p></div><button class="button primary" id="quick-add" type="button">Add a record</button></div>
    <div class="metric-grid"><div class="metric"><span class="eyebrow">Records</span><strong>${dossier!.entries.length}</strong><span>${Math.max(0, 10 - dossier!.entries.length)} to the ten-record goal</span></div><div class="metric"><span class="eyebrow">Trusted people</span><strong>${dossier!.contacts.length}</strong><span>${dossier!.contacts.length ? 'Available for handoff' : 'Add at least one contact'}</span></div><div class="metric"><span class="eyebrow">Next review</span><strong>${days < 0 ? 'Due' : `${days}d`}</strong><span>${humanDate(next.toISOString().slice(0, 10))}</span></div></div>
    <div class="safety-note"><span aria-hidden="true">◆</span><div><strong>This is not a password manager.</strong><span>Use a vault item name or physical location, not a password, PIN, recovery code, full account number, or secret key.</span></div></div>
    <h2>Next useful steps</h2><ul class="checklist">${quickSteps().map((item) => `<li class="check-item ${item.done ? 'done' : ''}"><span class="check-mark" aria-hidden="true">${item.done ? '✓' : '→'}</span><div><strong>${item.label}</strong><div class="small muted">${item.detail}</div></div></li>`).join('')}</ul></section>`;
}

function quickSteps(): Array<{ done: boolean; label: string; detail: string }> {
  return [
    { done: dossier!.entries.length >= 3, label: 'List three essential records', detail: 'Begin with banking, insurance, and legal documents.' },
    { done: dossier!.contacts.length > 0, label: 'Name a trusted contact', detail: 'Add the person or professional who can explain the dossier.' },
    { done: !!dossier!.profile.executorInstructions, label: 'Write the first-hour instruction', detail: 'Tell your family what to do first and what not to do.' },
    { done: dossier!.reviews.length > 0, label: 'Complete a review', detail: 'Confirm that each location is still accurate.' },
  ];
}

function recordsView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">Record locations</p><h1 class="view-title" tabindex="-1">Essential records</h1><p>Record enough detail to locate an item, but no credentials or complete sensitive numbers.</p></div><button class="button primary" id="add-record" type="button">Add a record</button></div>
    ${dossier!.entries.length ? `<div class="toolbar"><div class="field"><label for="record-search">Search records</label><input id="record-search" type="search" placeholder="Title, category, institution"></div><div class="field"><label for="category-filter">Category</label><select id="category-filter"><option value="">All categories</option>${CATEGORIES.map((category) => `<option>${category}</option>`).join('')}</select></div></div><p id="record-count" class="small muted">${dossier!.entries.length} ${dossier!.entries.length === 1 ? 'record' : 'records'}</p><ul class="record-list" id="record-list">${dossier!.entries.map(recordMarkup).join('')}</ul>` : `<div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h2>No records mapped yet</h2><p>Add the bank, policy, legal document, or account your family would look for first.</p><button class="button primary" id="empty-add-record" type="button">Add the first record</button></div>`}
    <div class="safety-note"><span aria-hidden="true">!</span><div><strong>Keep secrets elsewhere.</strong><span>“Password manager → Banking folder” is a useful location. The password itself is not.</span></div></div></section>`;
}

function recordMarkup(item: DossierEntry): string {
  const contact = dossier!.contacts.find((person) => person.id === item.contactId);
  const needsReview = !item.locator || (item.renewalDate && item.renewalDate < today());
  return `<li class="record${needsReview ? ' needs-review' : ''}" data-search="${escapeHtml(`${item.title} ${item.category} ${item.institution}`.toLowerCase())}" data-category="${escapeHtml(item.category)}"><h2 class="record-heading">${safeReadableText(item.title)}</h2><div class="record-meta"><span>${escapeHtml(item.category)}</span>${item.institution ? `<span>${safeReadableText(item.institution)}</span>` : ''}<span>${item.locator ? `Located: ${safeReadableText(item.locator)}` : 'Location missing'}</span>${contact ? `<span>Contact: ${safeReadableText(contact.name)}</span>` : ''}</div><button class="icon-button" type="button" data-edit-record="${item.id}" aria-label="Edit ${looksLikeCredential(item.title) ? 'record with blocked credential-like content' : escapeHtml(item.title)}">✎</button></li>`;
}

function peopleView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">People who can help</p><h1 class="view-title" tabindex="-1">Trusted people</h1><p>List family members and professionals who can locate or explain records. Adding someone here does not grant them legal authority.</p></div><button class="button primary" id="add-contact" type="button">Add a person</button></div>${dossier!.contacts.length ? `<ul class="record-list">${dossier!.contacts.map((person) => `<li class="record"><h2 class="record-heading">${safeReadableText(person.name)}</h2><div class="record-meta"><span>${safeReadableText(person.role)}</span>${person.phone ? `<span>${safeReadableText(person.phone)}</span>` : ''}${person.email ? `<span>${safeReadableText(person.email)}</span>` : ''}</div><button class="icon-button" data-edit-contact="${person.id}" aria-label="Edit ${looksLikeCredential(person.name) ? 'person with blocked credential-like content' : escapeHtml(person.name)}" type="button">✎</button></li>`).join('')}</ul>` : `<div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h2>No trusted people yet</h2><p>Add an executor, family contact, lawyer, accountant, or insurance adviser.</p><button class="button primary" id="empty-add-contact" type="button">Add a trusted person</button></div>`}</section>`;
}

function planView(): string {
  const profile = dossier!.profile;
  return `<section><div class="section-heading"><div><p class="eyebrow">First-hour plan</p><h1 class="view-title" tabindex="-1">Handoff instructions</h1><p>Write for a stressed reader. Give sequence and location, not legal conclusions.</p></div></div>
    <div class="legal-warning">Legal authority, privacy rights, inheritance, and account access rules vary by jurisdiction. This dossier is a record guide, not a will or power of attorney. Consult a qualified local professional.</div>
    <form id="plan-form"><div class="two-column"><div class="field"><label for="owner-name">Whose dossier is this?</label><input id="owner-name" name="ownerName" value="${escapeHtml(profile.ownerName)}" autocomplete="name"></div><div class="field"><label for="jurisdiction">Jurisdiction</label><input id="jurisdiction" name="jurisdiction" value="${escapeHtml(profile.jurisdiction)}" placeholder="Country and state/province" aria-describedby="jurisdiction-help"><span id="jurisdiction-help" class="field-hint">Shown as context only; no local legal rules are inferred.</span></div></div>
    <div class="field"><label for="dossier-location">Where will your family find the passphrase and sealed cover?</label><input id="dossier-location" name="dossierLocation" value="${escapeHtml(profile.dossierLocation)}" placeholder="Example: sealed envelope with lawyer" aria-describedby="location-help"><span id="location-help" class="field-hint">Do not enter the passphrase here.</span></div>
    <div class="field"><label for="executor-instructions">What should they do first?</label><textarea id="executor-instructions" name="executorInstructions" placeholder="Example: Call my sister first. Contact the lawyer before closing accounts…">${escapeHtml(profile.executorInstructions)}</textarea></div>
    <div class="field"><label for="review-months">Review interval</label><select id="review-months" name="reviewMonths"><option value="3"${profile.reviewMonths === 3 ? ' selected' : ''}>Every 3 months</option><option value="6"${profile.reviewMonths === 6 ? ' selected' : ''}>Every 6 months</option><option value="12"${profile.reviewMonths === 12 ? ' selected' : ''}>Every 12 months</option></select></div><div id="plan-error" aria-live="assertive"></div><button class="button primary" type="submit">Save handoff plan</button></form></section>`;
}

function reviewChecks(): Array<{ done: boolean; text: string; detail: string }> {
  const missingLocations = dossier!.entries.filter((item) => !item.locator).length;
  const expired = dossier!.entries.filter((item) => item.renewalDate && item.renewalDate < today()).length;
  return [
    { done: dossier!.entries.length >= 10, text: 'At least ten records', detail: `${dossier!.entries.length} of 10 listed` },
    { done: dossier!.entries.length > 0 && missingLocations === 0, text: 'Every record has a location', detail: missingLocations ? `${missingLocations} need a location` : 'All mapped' },
    { done: dossier!.contacts.length > 0, text: 'At least one trusted contact', detail: `${dossier!.contacts.length} people listed` },
    { done: !!dossier!.profile.executorInstructions, text: 'First-hour instructions are written', detail: dossier!.profile.executorInstructions ? 'Instructions ready' : 'Still blank' },
    { done: expired === 0, text: 'Renewal dates are current', detail: expired ? `${expired} dates have passed` : 'No overdue dates' },
  ];
}

function coverMarkup(): string {
  return `<div class="cover-preview"><div class="cover-inner"><p class="eyebrow">Private record guide</p><h2>Family Digital Dossier</h2><div class="cover-seal" aria-hidden="true"></div><p><strong>Prepared for</strong><br>${safeReadableText(dossier!.profile.ownerName, '________________________')}</p><p><strong>Jurisdiction noted</strong><br>${safeReadableText(dossier!.profile.jurisdiction, '________________________')}</p><p><strong>Passphrase and access instructions are kept at</strong><br>${safeReadableText(dossier!.profile.dossierLocation, '________________________')}</p><div class="legal-warning">This dossier does not grant authority or replace a will, power of attorney, password vault, or local legal advice.</div><p class="small">Last reviewed: ${dossier!.reviews[0] ? humanDate(dossier!.reviews[0].date) : 'Not yet reviewed'} · Contains ${dossier!.entries.length} records</p></div></div>`;
}

function reviewView(): string {
  const checks = reviewChecks(); const ready = checks.every((item) => item.done);
  return `<section><div class="section-heading screen-only"><div><p class="eyebrow">Six-month review</p><h1 class="view-title" tabindex="-1">Review and handoff</h1><p>Confirm that a trusted person can find three requested records using only the dossier.</p></div></div>
    <div class="screen-only"><ul class="checklist">${checks.map((item) => `<li class="check-item ${item.done ? 'done' : ''}"><span class="check-mark" aria-hidden="true">${item.done ? '✓' : '!'}</span><div><strong>${item.text}</strong><div class="small muted">${item.detail}</div></div></li>`).join('')}</ul>
    <div class="actions"><button class="button primary" id="complete-review" type="button">Complete today’s review</button><button class="button" id="three-record-drill" type="button"${dossier!.entries.length < 3 ? ' disabled' : ''}>Run 3-record drill</button></div>${ready ? '<div class="notice">Your checklist is complete. Print a fresh sealed cover and tell your trusted person where it is kept.</div>' : ''}
    ${dossier!.reviews.length ? `<div class="timeline"><h2>Review history</h2>${dossier!.reviews.map((item) => `<div class="timeline-item"><strong>${humanDate(item.date)}</strong><div class="small">${safeReadableText(item.note)} · ${item.entryCount} records</div></div>`).join('')}</div>` : ''}
    <h2>Printable sealed cover</h2><p>Print this page, write nothing secret on it, and store it where your trusted person expects.</p></div>${coverMarkup()}
    <div class="screen-only actions"><button class="button primary" id="print-cover" type="button">Print sealed cover</button></div>
    </section>`;
}

function settingsView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">Control and ownership</p><h1 class="view-title" tabindex="-1">Settings</h1><p>Back up the encrypted dossier, take a readable copy when appropriate, or change the local lock.</p></div></div>
    <h2>Your data</h2><div class="actions"><button class="button" id="export-backup" type="button">Export encrypted backup</button><button class="button" id="export-csv" type="button">Export readable CSV</button><button class="button" id="import-backup" type="button">Import encrypted backup</button></div><p class="small muted">Encrypted backups require their original passphrase. CSV files are not encrypted; store them carefully.</p>
    <h2>Passphrase</h2><button class="button" id="change-passphrase" type="button">Change passphrase</button>
    <h2>Remove local data</h2><p>This permanently removes the encrypted dossier from this browser. Export a backup first.</p><button class="button danger" id="delete-dossier" type="button">Delete this dossier</button></section>`;
}

function bindViewEvents(): void {
  document.querySelector('#quick-add')?.addEventListener('click', () => openRecordDialog());
  document.querySelector('#add-record')?.addEventListener('click', () => openRecordDialog());
  document.querySelector('#empty-add-record')?.addEventListener('click', () => openRecordDialog());
  document.querySelectorAll<HTMLElement>('[data-edit-record]').forEach((button) => button.addEventListener('click', () => openRecordDialog(button.dataset.editRecord)));
  const filterRecords = (): void => {
    const query = document.querySelector<HTMLInputElement>('#record-search')?.value.toLowerCase() || '';
    const category = document.querySelector<HTMLSelectElement>('#category-filter')?.value || '';
    let visible = 0;
    document.querySelectorAll<HTMLElement>('#record-list .record').forEach((record) => { const show = record.dataset.search!.includes(query) && (!category || record.dataset.category === category); record.hidden = !show; if (show) visible++; });
    const count = document.querySelector('#record-count'); if (count) count.textContent = `${visible} ${visible === 1 ? 'record' : 'records'} shown`;
  };
  document.querySelector('#record-search')?.addEventListener('input', filterRecords);
  document.querySelector('#category-filter')?.addEventListener('change', filterRecords);
  document.querySelector('#add-contact')?.addEventListener('click', () => openContactDialog());
  document.querySelector('#empty-add-contact')?.addEventListener('click', () => openContactDialog());
  document.querySelectorAll<HTMLElement>('[data-edit-contact]').forEach((button) => button.addEventListener('click', () => openContactDialog(button.dataset.editContact)));
  document.querySelector<HTMLFormElement>('#plan-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLFormElement;
    const form = new FormData(target);
    if (rejectCredentialLikeInput(target, [
      { field: 'ownerName', label: 'Owner name', value: String(form.get('ownerName')) },
      { field: 'jurisdiction', label: 'Jurisdiction', value: String(form.get('jurisdiction')) },
      { field: 'dossierLocation', label: 'Passphrase and sealed-cover location', value: String(form.get('dossierLocation')) },
      { field: 'executorInstructions', label: 'First-hour instructions', value: String(form.get('executorInstructions')) },
    ], 'plan-error')) return;
    dossier!.profile = { ownerName: String(form.get('ownerName')), jurisdiction: String(form.get('jurisdiction')), dossierLocation: String(form.get('dossierLocation')), executorInstructions: String(form.get('executorInstructions')), reviewMonths: Number(form.get('reviewMonths')) };
    await persist('Handoff plan saved.'); renderDossier();
  });
  document.querySelector('#complete-review')?.addEventListener('click', completeReview);
  document.querySelector('#three-record-drill')?.addEventListener('click', runDrill);
  document.querySelector('#print-cover')?.addEventListener('click', () => { if (!allowReadableOutput()) return; document.body.classList.remove('packet-print'); window.print(); });
  document.querySelector('#export-backup')?.addEventListener('click', exportBackup);
  document.querySelector('#export-csv')?.addEventListener('click', exportCsv);
  document.querySelector('#import-backup')?.addEventListener('click', openImportDialog);
  document.querySelector('#change-passphrase')?.addEventListener('click', openPassphraseDialog);
  document.querySelector('#delete-dossier')?.addEventListener('click', openDeleteDialog);
}

function openDialog(content: string): HTMLDialogElement {
  const origin = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const dialog = document.createElement('dialog'); dialog.innerHTML = `<div class="dialog-inner">${content}</div>`; document.body.append(dialog);
  const close = (): void => { dialog.close(); dialog.remove(); origin?.focus(); };
  dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); }); dialog.showModal();
  return dialog;
}

function openRecordDialog(id?: string): void {
  const existing = dossier!.entries.find((item) => item.id === id);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Record location</p><h2>${existing ? 'Edit record' : 'Add a record'}</h2></div><button class="dialog-close" type="button" data-close aria-label="Close">×</button></div><form id="record-form">
    <div class="field"><label for="record-title">Record name</label><input id="record-title" name="title" value="${escapeHtml(existing?.title)}" required placeholder="Example: Life insurance policy" autofocus></div><div class="two-column"><div class="field"><label for="record-category">Category</label><select id="record-category" name="category">${CATEGORIES.map((category) => `<option${existing?.category === category ? ' selected' : ''}>${category}</option>`).join('')}</select></div><div class="field"><label for="record-institution">Institution or provider</label><input id="record-institution" name="institution" value="${escapeHtml(existing?.institution)}"></div></div>
    <div class="field"><label for="record-locator">Where is it found?</label><input id="record-locator" name="locator" value="${escapeHtml(existing?.locator)}" placeholder="Example: blue safe, top shelf" aria-describedby="locator-hint"><span id="locator-hint" class="field-hint">Use a physical place or password-vault item name. Credential-like text is blocked.</span></div><div class="field"><label for="record-reference">Safe reference label</label><input id="record-reference" name="reference" value="${escapeHtml(existing?.reference)}" placeholder="Nickname or last four digits only"></div>
    <div class="two-column"><div class="field"><label for="record-contact">Helpful contact</label><select id="record-contact" name="contactId"><option value="">No contact linked</option>${dossier!.contacts.map((person) => `<option value="${person.id}"${existing?.contactId === person.id ? ' selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></div><div class="field"><label for="record-renewal">Renewal / review date</label><input id="record-renewal" name="renewalDate" type="date" value="${escapeHtml(existing?.renewalDate)}"></div></div><div class="field"><label for="record-instructions">Location notes</label><textarea id="record-instructions" name="instructions">${escapeHtml(existing?.instructions)}</textarea></div>
    <div id="record-error" role="alert" aria-live="assertive"></div><div class="actions"><button class="button primary" type="submit">${existing ? 'Save record' : 'Add record'}</button><button class="button" data-close type="button">Cancel</button>${existing ? '<button class="button danger" id="delete-record" type="button">Delete record</button>' : ''}</div></form>`);
  dialog.querySelector<HTMLFormElement>('#record-form')!.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLFormElement;
    const form = new FormData(target);
    if (rejectCredentialLikeInput(target, [
      { field: 'title', label: 'Record name', value: String(form.get('title')) },
      { field: 'institution', label: 'Institution or provider', value: String(form.get('institution')) },
      { field: 'locator', label: 'Location', value: String(form.get('locator')) },
      { field: 'reference', label: 'Safe reference', value: String(form.get('reference')) },
      { field: 'instructions', label: 'Location notes', value: String(form.get('instructions')) },
    ], 'record-error')) return;
    const timestamp = new Date().toISOString();
    const item: DossierEntry = { id: existing?.id || uid(), title: String(form.get('title')).trim(), category: String(form.get('category')) as DossierEntry['category'], institution: String(form.get('institution')).trim(), locator: String(form.get('locator')).trim(), reference: String(form.get('reference')).trim(), contactId: String(form.get('contactId')), renewalDate: String(form.get('renewalDate')), instructions: String(form.get('instructions')).trim(), reviewedAt: existing?.reviewedAt || '', createdAt: existing?.createdAt || timestamp, updatedAt: timestamp };
    if (existing) dossier!.entries[dossier!.entries.indexOf(existing)] = item; else dossier!.entries.unshift(item);
    await persist(existing ? 'Record updated.' : 'Record added.'); dialog.close(); dialog.remove(); renderDossier();
  });
  dialog.querySelector('#delete-record')?.addEventListener('click', async () => { if (!confirm(`Delete “${existing!.title}”? This cannot be undone.`)) return; dossier!.entries = dossier!.entries.filter((item) => item.id !== existing!.id); await persist('Record deleted.'); dialog.close(); dialog.remove(); renderDossier(); });
}

function openContactDialog(id?: string): void {
  const existing = dossier!.contacts.find((item) => item.id === id);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Trusted person</p><h2>${existing ? 'Edit person' : 'Add a person'}</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><form id="contact-form"><div class="two-column"><div class="field"><label for="contact-name">Name</label><input id="contact-name" name="name" value="${escapeHtml(existing?.name)}" required autofocus></div><div class="field"><label for="contact-role">Role</label><input id="contact-role" name="role" value="${escapeHtml(existing?.role)}" placeholder="Executor, lawyer, sibling"></div><div class="field"><label for="contact-phone">Phone</label><input id="contact-phone" name="phone" type="tel" value="${escapeHtml(existing?.phone)}" autocomplete="tel"></div><div class="field"><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" value="${escapeHtml(existing?.email)}" autocomplete="email"></div></div><div class="field"><label for="contact-notes">Notes</label><textarea id="contact-notes" name="notes">${escapeHtml(existing?.notes)}</textarea></div><div id="contact-error" aria-live="assertive"></div><div class="actions"><button class="button primary" type="submit">${existing ? 'Save person' : 'Add person'}</button><button class="button" data-close type="button">Cancel</button>${existing ? '<button class="button danger" id="delete-contact" type="button">Delete person</button>' : ''}</div></form>`);
  dialog.querySelector<HTMLFormElement>('#contact-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const target = event.currentTarget as HTMLFormElement; const form = new FormData(target); if (rejectCredentialLikeInput(target, [{ field: 'name', label: 'Name', value: String(form.get('name')) }, { field: 'role', label: 'Role', value: String(form.get('role')) }, { field: 'phone', label: 'Phone', value: String(form.get('phone')) }, { field: 'email', label: 'Email', value: String(form.get('email')) }, { field: 'notes', label: 'Notes', value: String(form.get('notes')) }], 'contact-error')) return; const person: TrustedContact = { id: existing?.id || uid(), name: String(form.get('name')).trim(), role: String(form.get('role')).trim(), phone: String(form.get('phone')).trim(), email: String(form.get('email')).trim(), notes: String(form.get('notes')).trim() }; if (existing) dossier!.contacts[dossier!.contacts.indexOf(existing)] = person; else dossier!.contacts.push(person); await persist(existing ? 'Person updated.' : 'Trusted person added.'); dialog.close(); dialog.remove(); renderDossier(); });
  dialog.querySelector('#delete-contact')?.addEventListener('click', async () => { if (!confirm(`Delete “${existing!.name}”? Linked records will keep their other details.`)) return; dossier!.contacts = dossier!.contacts.filter((person) => person.id !== existing!.id); dossier!.entries.forEach((item) => { if (item.contactId === existing!.id) item.contactId = ''; }); await persist('Person deleted.'); dialog.close(); dialog.remove(); renderDossier(); });
}

async function completeReview(): Promise<void> {
  dossier!.entries.forEach((item) => { item.reviewedAt = today(); });
  dossier!.reviews.unshift({ id: uid(), date: today(), note: 'Scheduled dossier review completed', entryCount: dossier!.entries.length });
  await persist('Review completed. Next review scheduled.'); renderDossier();
}

function runDrill(): void {
  const picks = [...dossier!.entries].sort(() => Math.random() - .5).slice(0, 3);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Location test</p><h2>Can a trusted person find these?</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>Without extra hints, ask them to explain where each item is located. Do not ask them to access the account.</p><ol>${picks.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span class="muted">Expected location: ${escapeHtml(item.locator || 'not recorded')}</span></li>`).join('')}</ol><div class="actions"><button class="button primary" id="drill-pass" type="button">All three locations worked</button><button class="button" data-close type="button">Finish later</button></div>`);
  dialog.querySelector('#drill-pass')?.addEventListener('click', async () => { dossier!.reviews.unshift({ id: uid(), date: today(), note: 'Three-record location drill passed', entryCount: dossier!.entries.length }); await persist('Location drill recorded.'); dialog.close(); dialog.remove(); renderDossier(); });
}

function download(name: string, content: string, type: string): void { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
function exportBackup(): void { if (envelope) { download(`family-dossier-${today()}.encrypted.json`, JSON.stringify(envelope, null, 2), 'application/json'); showStatus('Encrypted backup exported.'); } }
function exportCsv(): void {
  if (!allowReadableOutput()) return;
  if (!confirm('CSV is readable and not encrypted. Continue only if you can store the file safely.')) return;
  const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;
  const rows = [['Title', 'Category', 'Institution', 'Location', 'Safe reference', 'Renewal date', 'Instructions'], ...dossier!.entries.map((item) => [item.title, item.category, item.institution, item.locator, item.reference, item.renewalDate, item.instructions])];
  download(`family-dossier-${today()}.csv`, `\uFEFF${rows.map((row) => row.map(quote).join(',')).join('\n')}`, 'text/csv;charset=utf-8'); showStatus('Readable CSV exported.');
}

function openImportDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Replace local dossier</p><h2>Import encrypted backup</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><div class="legal-warning">A valid backup will replace the dossier currently on this device. Export the current dossier first if you need it.</div><form id="import-form"><div class="field"><label for="backup-file">Encrypted JSON backup</label><input id="backup-file" name="file" type="file" accept="application/json,.json" required></div><div class="field"><label for="backup-passphrase">Backup passphrase</label><input id="backup-passphrase" name="backupPassphrase" type="password" autocomplete="current-password" required></div><button class="button primary" type="submit">Verify and replace dossier</button></form><div id="import-error" aria-live="assertive"></div>`);
  dialog.querySelector<HTMLFormElement>('#import-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const file = form.get('file'); const error = dialog.querySelector('#import-error')!; try { if (!(file instanceof File)) throw new Error('Choose an encrypted JSON backup.'); const parsed: unknown = JSON.parse(await file.text()); if (!isEncryptedEnvelope(parsed)) throw new Error('This is not a Family Digital Dossier encrypted backup.'); const backupPassphrase = String(form.get('backupPassphrase')); const restored = await decryptDossier(parsed, backupPassphrase); const risks = findDossierCredentialRisks(restored); if (risks.length) throw new Error(`This backup contains credential-like content in ${risks[0].label}. Remove it in the original dossier before importing.`); dossier = restored; passphrase = backupPassphrase; envelope = parsed; await writeEnvelope(parsed, demoMode); dialog.close(); dialog.remove(); navigateView('overview', true); showStatus('Encrypted backup restored.'); } catch (caught) { error.className = 'error'; error.textContent = caught instanceof Error ? caught.message : 'Backup could not be imported.'; } });
}

function openPassphraseDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><h2>Change passphrase</h2><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>This creates new encrypted data immediately. Update any stored passphrase instructions and export a fresh backup.</p><form id="passphrase-form"><div class="field"><label for="current-pass">Current passphrase</label><input id="current-pass" name="current" type="password" required autocomplete="current-password"></div><div class="field"><label for="next-pass">New passphrase</label><input id="next-pass" name="next" minlength="12" type="password" required autocomplete="new-password"></div><div class="field"><label for="next-confirm">Confirm new passphrase</label><input id="next-confirm" name="confirm" minlength="12" type="password" required autocomplete="new-password"></div><button class="button primary" type="submit">Change passphrase</button></form><div id="pass-error" aria-live="assertive"></div>`);
  dialog.querySelector<HTMLFormElement>('#passphrase-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const error = dialog.querySelector('#pass-error')!; if (String(form.get('current')) !== passphrase) { error.className = 'error'; error.textContent = 'The current passphrase is not correct.'; return; } if (form.get('next') !== form.get('confirm')) { error.className = 'error'; error.textContent = 'The new passphrases do not match.'; return; } passphrase = String(form.get('next')); await persist('Passphrase changed. Export a new backup.'); dialog.close(); dialog.remove(); });
}

function openDeleteDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><h2>Delete local dossier?</h2><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>This permanently removes the encrypted dossier and its local history from this browser. Backups already downloaded are not affected.</p><form id="delete-form"><div class="field"><label for="delete-confirm">Type DELETE to confirm</label><input id="delete-confirm" name="confirm" required autocomplete="off"></div><button class="button danger" type="submit">Permanently delete dossier</button></form>`);
  dialog.querySelector<HTMLFormElement>('#delete-form')!.addEventListener('submit', async (event) => { event.preventDefault(); if (new FormData(event.currentTarget as HTMLFormElement).get('confirm') !== 'DELETE') { showStatus('Type DELETE exactly to confirm.'); return; } await deleteEnvelope(demoMode); envelope = undefined; dossier = undefined; passphrase = ''; dialog.close(); dialog.remove(); if (demoMode) await seedDemo(); else renderWelcome(); showStatus(demoMode ? 'Sample dossier reset.' : 'Local dossier deleted.'); });
}

async function seedDemo(): Promise<void> {
  dossier = createDemoDossier();
  passphrase = DEMO_PASSPHRASE;
  envelope = await encryptDossier(dossier, passphrase);
  await writeEnvelope(envelope, true);
  view = routeViewFromPath() || 'overview';
  renderDossier();
}

async function resetDemo(): Promise<void> {
  envelope = undefined;
  dossier = undefined;
  passphrase = '';
  await deleteDemoDatabase();
  history.replaceState({ view: 'overview', demo: true }, '', '/demo');
  await seedDemo();
  showStatus('Sample dossier reset.');
}

async function leaveDemo(): Promise<void> {
  envelope = undefined;
  dossier = undefined;
  passphrase = '';
  await deleteDemoDatabase();
  location.assign('/');
}

function renderNotFound(): void {
  setMetadata('Page not found — Family Digital Dossier', 'This Family Digital Dossier page does not exist.', '/404');
  app.innerHTML = `${siteHeader()}<main id="main" class="not-found" tabindex="-1"><div class="lost-sheet" aria-hidden="true"></div><p class="eyebrow">Page not found</p><h1 tabindex="-1">This record route is missing</h1><p>The address does not match a dossier page. Return home or open the sample dossier.</p><div class="actions"><a class="button primary" href="/">Return home</a><a class="button" href="/?demo=1">Open sample dossier</a></div></main>${footer()}`;
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => { if (navigator.serviceWorker.controller) showStatus('An app update is available and will be ready shortly.'); });
    navigator.serviceWorker.addEventListener('message', (event) => { if (event.data?.type === 'SW_UPDATED') showStatus('The app is ready to use offline.'); });
  } catch { showStatus('Offline installation is unavailable, but the dossier still works in this tab.'); }
}

async function init(): Promise<void> {
  const requestedDemo = new URL(location.href).searchParams.get('demo') === '1';
  demoMode = requestedDemo || location.pathname === '/demo' || location.pathname.startsWith('/demo/');
  if (requestedDemo) history.replaceState({ view: 'overview', demo: true }, '', '/demo');
  const requestedView = routeViewFromPath();
  const isHome = location.pathname === '/';
  if (!isHome && !requestedView) { renderNotFound(); void registerServiceWorker(); return; }
  view = requestedView || 'overview';
  try {
    envelope = await readEnvelope(demoMode);
    if (demoMode) {
      if (!envelope) await seedDemo();
      else { passphrase = DEMO_PASSPHRASE; dossier = await decryptDossier(envelope, passphrase); renderDossier(); }
    } else if (requestedView) {
      if (envelope) renderUnlock(); else renderWelcome();
    } else renderWelcome();
  }
  catch (caught) { app.innerHTML = `${siteHeader()}<main id="main" class="setup-panel"><div class="setup-sheet"><h1 class="page-title">Local storage is unavailable</h1><div class="error" role="alert">${escapeHtml(caught instanceof Error ? caught.message : 'This browser cannot open the local encrypted store.')}</div><p>Try a regular browser window with storage enabled. No data has been sent anywhere.</p></div></main>${footer()}`; }
  void registerServiceWorker();
}

window.addEventListener('popstate', (event) => {
  const nextView = routeViewFromPath();
  if (!nextView || !dossier) { location.reload(); return; }
  view = nextView;
  renderDossier();
  document.querySelector<HTMLElement>('main h1')?.focus();
  const announcement = document.querySelector('#route-status');
  if (announcement) announcement.textContent = `${routeNames[nextView]} loaded`;
  requestAnimationFrame(() => window.scrollTo(0, Number(event.state?.scrollY) || 0));
});

void init();
