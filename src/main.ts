import './styles.css';
import { decryptDossier, encryptDossier, isEncryptedEnvelope, type EncryptedEnvelope } from './crypto';
import { deleteEnvelope, readEnvelope, writeEnvelope } from './db';
import { BUY_URL, cachedLicenseState, captureLicenseFromUrl, storeLicense, verifyLicense, type LicenseState } from './license';
import { CATEGORIES, createEmptyDossier, type DossierData, type DossierEntry, type TrustedContact } from './types';

type View = 'overview' | 'records' | 'people' | 'plan' | 'review' | 'settings';
const app = document.querySelector<HTMLDivElement>('#app')!;
const statusRegion = document.querySelector<HTMLDivElement>('#status')!;
const offlineBanner = document.querySelector<HTMLDivElement>('#offline-banner')!;
let envelope: EncryptedEnvelope | undefined;
let dossier: DossierData | undefined;
let passphrase = '';
let view: View = 'overview';
let license: LicenseState = cachedLicenseState();
let statusTimer = 0;

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

function setNetworkState(): void { offlineBanner.hidden = navigator.onLine; }
window.addEventListener('online', setNetworkState);
window.addEventListener('offline', setNetworkState);
setNetworkState();

function siteHeader(appMode = false): string {
  return `<header class="site-header${appMode ? ' app-header' : ''}">
    <a class="brand" href="/" aria-label="Family Digital Dossier home"><span class="brand-mark" aria-hidden="true"></span>${appMode ? '<h1>Family Digital Dossier</h1>' : '<span>Family Digital Dossier</span>'}</a>
    <nav class="header-links" aria-label="Site"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a>${appMode ? '<button class="button quiet" id="lock-button" type="button">Lock</button>' : '<a class="keep button quiet" href="#start">Open dossier</a>'}</nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div><strong>Family Digital Dossier</strong><p class="small muted">A private map, not a password vault.</p></div><div><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a><p class="small muted">Hero imagery generated for this product. No tracking.</p></div></footer>`;
}

function renderWelcome(error = ''): void {
  if (envelope) { renderUnlock(error); return; }
  app.innerHTML = `${siteHeader()}<main id="main" class="landing-main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Findability without full access</p><h1>Leave a map. Keep the keys.</h1>
      <p class="lede">Give someone you trust a clear route to essential records during illness or death—without putting passwords, documents, or account access in another company’s cloud.</p>
      <div class="actions"><a class="button primary" href="#start">Create my dossier</a><a class="button" href="#how">See what it stores</a></div>
      <div class="safety-note"><span aria-hidden="true">◆</span><div><strong>Never enter a password or recovery code.</strong><span class="small">Record what exists, where it is, and who to contact.</span></div></div>
    </div><div class="hero-art"><picture><source srcset="/assets/hero-archive.avif" type="image/avif"><source srcset="/assets/hero-archive.webp" type="image/webp"><img src="/assets/hero-archive.jpg" width="1280" height="853" alt="Seven paper record envelopes connected by orderly routes to a central sealed dossier" fetchpriority="high" decoding="async"></picture></div></section>
    <section id="how" class="principles"><div class="principles-inner"><p class="eyebrow">A locator, deliberately limited</p><h2>Three things your family needs</h2><div class="principles-grid">
      <div><span class="principle-number">01</span><h3>What exists</h3><p>List institutions, policies, important online accounts, legal files, and renewals.</p></div>
      <div><span class="principle-number">02</span><h3>Where to look</h3><p>Point to a safe, filing cabinet, adviser, or vault item—never copy the secret itself.</p></div>
      <div><span class="principle-number">03</span><h3>Who can help</h3><p>Connect each record to a trusted person or professional and leave calm instructions.</p></div>
    </div></div></section>
    <section id="start" class="setup-panel"><div class="setup-sheet"><p class="eyebrow">Stored only on this device</p><h2>Create your encrypted dossier</h2>
      <p>Your passphrase encrypts everything before it reaches browser storage. We cannot see or recover it.</p>${error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : ''}
      <form id="setup-form"><div class="field"><label for="new-passphrase">Passphrase</label><input id="new-passphrase" name="passphrase" type="password" minlength="12" autocomplete="new-password" required aria-describedby="passphrase-help"><span id="passphrase-help" class="field-hint">Use 4–6 unrelated words (at least 12 characters). Store a copy somewhere your executor can eventually access.</span></div>
      <div class="field"><label for="confirm-passphrase">Confirm passphrase</label><input id="confirm-passphrase" name="confirm" type="password" minlength="12" autocomplete="new-password" required></div>
      <label class="checkbox"><input name="understood" type="checkbox" required><span>I understand there is no reset or recovery if I lose this passphrase.</span></label>
      <button class="button primary" type="submit">Create encrypted dossier</button></form></div></section>
  </main>${footer()}`;
  document.querySelector<HTMLFormElement>('#setup-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLFormElement;
    const form = new FormData(target);
    const nextPassphrase = String(form.get('passphrase'));
    if (nextPassphrase !== String(form.get('confirm'))) { renderWelcome('The passphrases do not match.'); document.querySelector<HTMLInputElement>('#new-passphrase')?.focus(); return; }
    try {
      const button = target.querySelector('button')!; button.disabled = true; button.textContent = 'Encrypting on this device…';
      dossier = createEmptyDossier(); passphrase = nextPassphrase;
      await persist(); view = 'overview'; renderDossier(); showStatus('Encrypted dossier created on this device.');
    } catch (caught) { dossier = undefined; passphrase = ''; renderWelcome(caught instanceof Error ? caught.message : 'The dossier could not be created.'); }
  });
}

function renderUnlock(error = ''): void {
  app.innerHTML = `${siteHeader()}<main id="main"><section class="setup-panel"><div class="setup-sheet"><p class="eyebrow">Encrypted on this device</p><h2>Unlock your dossier</h2><p>Enter the passphrase you chose. It never leaves this browser.</p>
    ${error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : ''}<form id="unlock-form"><div class="field"><label for="passphrase">Passphrase</label><input id="passphrase" name="passphrase" type="password" autocomplete="current-password" required autofocus></div><button class="button primary" type="submit">Unlock dossier</button></form>
    <details><summary>Need to restore on this device?</summary><p class="small">Unlock first if a dossier already exists, then use Settings → Import encrypted backup. This avoids accidentally replacing local data.</p></details></div></section></main>${footer()}`;
  const input = document.querySelector<HTMLInputElement>('#passphrase'); input?.focus();
  document.querySelector<HTMLFormElement>('#unlock-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const target = event.currentTarget as HTMLFormElement; const button = target.querySelector('button')!; button.disabled = true; button.textContent = 'Unlocking…';
    try { passphrase = String(new FormData(target).get('passphrase')); dossier = await decryptDossier(envelope!, passphrase); renderDossier(); }
    catch (caught) { passphrase = ''; renderUnlock(caught instanceof Error ? caught.message : 'This dossier could not be unlocked.'); }
  });
}

async function persist(message = 'Changes encrypted and saved.'): Promise<void> {
  if (!dossier || !passphrase) return;
  dossier.updatedAt = new Date().toISOString();
  envelope = await encryptDossier(dossier, passphrase);
  await writeEnvelope(envelope);
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
  app.innerHTML = `${siteHeader(true)}<div class="app-shell"><aside class="sidebar"><div class="progress-seal" style="--progress:${progress * 3.6}deg" aria-label="Dossier ${progress}% complete"><div><strong>${progress}%</strong><span class="small">ready</span></div></div>
    <nav class="side-nav" aria-label="Dossier sections">${navItems.map(([key, label]) => `<button type="button" class="nav-button${view === key ? ' active' : ''}" data-view="${key}"${view === key ? ' aria-current="page"' : ''}>${label}</button>`).join('')}</nav><p id="save-state" class="save-state">Encrypted · saved locally</p></aside>
    <main id="main" class="main-panel" tabindex="-1">${renderView()}</main></div>${footer()}`;
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
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.view as View; renderDossier(); document.querySelector<HTMLElement>('#main')?.focus(); }));
  document.querySelector('#lock-button')?.addEventListener('click', () => { dossier = undefined; passphrase = ''; renderUnlock(); showStatus('Dossier locked.'); });
}

function nextReviewDate(): Date {
  const source = dossier!.reviews[0]?.date || dossier!.createdAt.slice(0, 10);
  const next = new Date(`${source}T12:00:00`); next.setMonth(next.getMonth() + dossier!.profile.reviewMonths); return next;
}

function overviewView(): string {
  const next = nextReviewDate(); const days = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return `<section><div class="section-heading"><div><p class="eyebrow">Your continuity map</p><h2>${dossier!.profile.ownerName ? `${escapeHtml(dossier!.profile.ownerName)}’s dossier` : 'Start with what matters most'}</h2><p>${dossier!.entries.length ? 'Keep each pointer current. Your dossier contains locations and instructions, never the secrets themselves.' : 'Add the first three records someone would urgently need to find. You can build from there.'}</p></div><button class="button primary" id="quick-add" type="button">Add a record</button></div>
    <div class="metric-grid"><div class="metric"><span class="eyebrow">Records</span><strong>${dossier!.entries.length}</strong><span>${Math.max(0, 10 - dossier!.entries.length)} to the ten-record goal</span></div><div class="metric"><span class="eyebrow">Trusted people</span><strong>${dossier!.contacts.length}</strong><span>${dossier!.contacts.length ? 'Available for handoff' : 'Add at least one contact'}</span></div><div class="metric"><span class="eyebrow">Next review</span><strong>${days < 0 ? 'Due' : `${days}d`}</strong><span>${humanDate(next.toISOString().slice(0, 10))}</span></div></div>
    <div class="safety-note"><span aria-hidden="true">◆</span><div><strong>This is not a password manager.</strong><span>Use a vault item name or physical location, not a password, PIN, recovery code, full account number, or secret key.</span></div></div>
    <h2>Next useful steps</h2><ul class="checklist">${quickSteps().map((item) => `<li class="check-item ${item.done ? 'done' : ''}"><span class="check-mark" aria-hidden="true">${item.done ? '✓' : '→'}</span><div><strong>${item.label}</strong><div class="small muted">${item.detail}</div></div></li>`).join('')}</ul></section>`;
}

function quickSteps(): Array<{ done: boolean; label: string; detail: string }> {
  return [
    { done: dossier!.entries.length >= 3, label: 'Map three essential records', detail: 'Begin with banking, insurance, and legal documents.' },
    { done: dossier!.contacts.length > 0, label: 'Name a trusted contact', detail: 'Add the person or professional who can help interpret the map.' },
    { done: !!dossier!.profile.executorInstructions, label: 'Write the first-hour instruction', detail: 'Tell your family what to do first and what not to do.' },
    { done: dossier!.reviews.length > 0, label: 'Complete a review', detail: 'Confirm that each location is still accurate.' },
  ];
}

function recordsView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">Locator inventory</p><h2>Essential records</h2><p>Record enough detail to locate an item, but no credentials or complete sensitive numbers.</p></div><button class="button primary" id="add-record" type="button">Add a record</button></div>
    ${dossier!.entries.length ? `<div class="toolbar"><div class="field"><label for="record-search">Search records</label><input id="record-search" type="search" placeholder="Title, category, institution"></div><div class="field"><label for="category-filter">Category</label><select id="category-filter"><option value="">All categories</option>${CATEGORIES.map((category) => `<option>${category}</option>`).join('')}</select></div></div><p id="record-count" class="small muted">${dossier!.entries.length} records</p><ul class="record-list" id="record-list">${dossier!.entries.map(recordMarkup).join('')}</ul>` : `<div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h3>No records mapped yet</h3><p>Add the bank, policy, legal document, or account your family would look for first.</p><button class="button primary" id="empty-add-record" type="button">Add the first record</button></div>`}
    <div class="safety-note"><span aria-hidden="true">!</span><div><strong>Keep secrets elsewhere.</strong><span>“Password manager → Banking folder” is a useful locator. The password itself is not.</span></div></div></section>`;
}

function recordMarkup(item: DossierEntry): string {
  const contact = dossier!.contacts.find((person) => person.id === item.contactId);
  const needsReview = !item.locator || (item.renewalDate && item.renewalDate < today());
  return `<li class="record${needsReview ? ' needs-review' : ''}" data-search="${escapeHtml(`${item.title} ${item.category} ${item.institution}`.toLowerCase())}" data-category="${escapeHtml(item.category)}"><h3>${escapeHtml(item.title)}</h3><div class="record-meta"><span>${escapeHtml(item.category)}</span>${item.institution ? `<span>${escapeHtml(item.institution)}</span>` : ''}<span>${item.locator ? `Located: ${escapeHtml(item.locator)}` : 'Location missing'}</span>${contact ? `<span>Contact: ${escapeHtml(contact.name)}</span>` : ''}</div><button class="icon-button" type="button" data-edit-record="${item.id}" aria-label="Edit ${escapeHtml(item.title)}">✎</button></li>`;
}

function peopleView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">Human routes</p><h2>Trusted people</h2><p>List family members and professionals who can locate or explain records. Adding someone here does not grant them legal authority.</p></div><button class="button primary" id="add-contact" type="button">Add a person</button></div>${dossier!.contacts.length ? `<ul class="record-list">${dossier!.contacts.map((person) => `<li class="record"><h3>${escapeHtml(person.name)}</h3><div class="record-meta"><span>${escapeHtml(person.role)}</span>${person.phone ? `<span>${escapeHtml(person.phone)}</span>` : ''}${person.email ? `<span>${escapeHtml(person.email)}</span>` : ''}</div><button class="icon-button" data-edit-contact="${person.id}" aria-label="Edit ${escapeHtml(person.name)}" type="button">✎</button></li>`).join('')}</ul>` : `<div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h3>No trusted people yet</h3><p>Add an executor, family contact, lawyer, accountant, or insurance adviser.</p><button class="button primary" id="empty-add-contact" type="button">Add a trusted person</button></div>`}</section>`;
}

function planView(): string {
  const profile = dossier!.profile;
  return `<section><div class="section-heading"><div><p class="eyebrow">First-hour plan</p><h2>Handoff instructions</h2><p>Write for a stressed reader. Give sequence and location, not legal conclusions.</p></div></div>
    <div class="legal-warning">Legal authority, privacy rights, inheritance, and account access rules vary by jurisdiction. This dossier is a locator, not a will, power of attorney, or legal advice. Consult a qualified local professional.</div>
    <form id="plan-form"><div class="two-column"><div class="field"><label for="owner-name">Whose dossier is this?</label><input id="owner-name" name="ownerName" value="${escapeHtml(profile.ownerName)}" autocomplete="name"></div><div class="field"><label for="jurisdiction">Jurisdiction</label><input id="jurisdiction" name="jurisdiction" value="${escapeHtml(profile.jurisdiction)}" placeholder="Country and state/province" aria-describedby="jurisdiction-help"><span id="jurisdiction-help" class="field-hint">Shown as context only; no local legal rules are inferred.</span></div></div>
    <div class="field"><label for="dossier-location">Where will your family find the passphrase and sealed cover?</label><input id="dossier-location" name="dossierLocation" value="${escapeHtml(profile.dossierLocation)}" placeholder="Example: sealed envelope with lawyer" aria-describedby="location-help"><span id="location-help" class="field-hint">Do not enter the passphrase here.</span></div>
    <div class="field"><label for="executor-instructions">What should they do first?</label><textarea id="executor-instructions" name="executorInstructions" placeholder="Example: Call my sister first. Contact the lawyer before closing accounts…">${escapeHtml(profile.executorInstructions)}</textarea></div>
    <div class="field"><label for="review-months">Review interval</label><select id="review-months" name="reviewMonths"><option value="3"${profile.reviewMonths === 3 ? ' selected' : ''}>Every 3 months</option><option value="6"${profile.reviewMonths === 6 ? ' selected' : ''}>Every 6 months</option><option value="12"${profile.reviewMonths === 12 ? ' selected' : ''}>Every 12 months</option></select></div><button class="button primary" type="submit">Save handoff plan</button></form></section>`;
}

function reviewChecks(): Array<{ done: boolean; text: string; detail: string }> {
  const missingLocations = dossier!.entries.filter((item) => !item.locator).length;
  const expired = dossier!.entries.filter((item) => item.renewalDate && item.renewalDate < today()).length;
  return [
    { done: dossier!.entries.length >= 10, text: 'At least ten locator entries', detail: `${dossier!.entries.length} of 10 mapped` },
    { done: dossier!.entries.length > 0 && missingLocations === 0, text: 'Every record has a location', detail: missingLocations ? `${missingLocations} need a location` : 'All mapped' },
    { done: dossier!.contacts.length > 0, text: 'At least one trusted contact', detail: `${dossier!.contacts.length} people listed` },
    { done: !!dossier!.profile.executorInstructions, text: 'First-hour instructions are written', detail: dossier!.profile.executorInstructions ? 'Instructions ready' : 'Still blank' },
    { done: expired === 0, text: 'Renewal dates are current', detail: expired ? `${expired} dates have passed` : 'No overdue dates' },
  ];
}

function coverMarkup(): string {
  return `<div class="cover-preview"><div class="cover-inner"><p class="eyebrow">Private continuity record</p><h2>Family Digital Dossier</h2><div class="cover-seal" aria-hidden="true"></div><p><strong>Prepared for</strong><br>${escapeHtml(dossier!.profile.ownerName || '________________________')}</p><p><strong>Jurisdiction noted</strong><br>${escapeHtml(dossier!.profile.jurisdiction || '________________________')}</p><p><strong>Passphrase / access instructions are kept at</strong><br>${escapeHtml(dossier!.profile.dossierLocation || '________________________')}</p><div class="legal-warning">This locator does not grant authority or replace a will, power of attorney, password vault, or local legal advice.</div><p class="small">Last reviewed: ${dossier!.reviews[0] ? humanDate(dossier!.reviews[0].date) : 'Not yet reviewed'} · Contains ${dossier!.entries.length} record pointers</p></div></div>`;
}

function reviewView(): string {
  const checks = reviewChecks(); const ready = checks.every((item) => item.done);
  return `<section><div class="section-heading screen-only"><div><p class="eyebrow">Six-month ritual</p><h2>Review and handoff</h2><p>Confirm that a trusted person can find three requested records using only the dossier.</p></div></div>
    <div class="screen-only"><ul class="checklist">${checks.map((item) => `<li class="check-item ${item.done ? 'done' : ''}"><span class="check-mark" aria-hidden="true">${item.done ? '✓' : '!'}</span><div><strong>${item.text}</strong><div class="small muted">${item.detail}</div></div></li>`).join('')}</ul>
    <div class="actions"><button class="button primary" id="complete-review" type="button">Complete today’s review</button><button class="button" id="three-record-drill" type="button"${dossier!.entries.length < 3 ? ' disabled' : ''}>Run 3-record drill</button></div>${ready ? '<div class="notice">Your checklist is complete. Print a fresh sealed cover and tell your trusted person where it is kept.</div>' : ''}
    ${dossier!.reviews.length ? `<div class="timeline"><h3>Review history</h3>${dossier!.reviews.map((item) => `<div class="timeline-item"><strong>${humanDate(item.date)}</strong><div class="small">${escapeHtml(item.note)} · ${item.entryCount} records</div></div>`).join('')}</div>` : ''}
    <h2>Printable sealed cover</h2><p>Print this page, write nothing secret on it, and store it where your trusted person expects.</p></div>${coverMarkup()}
    <div class="screen-only actions"><button class="button primary" id="print-cover" type="button">Print sealed cover</button></div>
    <div class="pro-panel screen-only"><p class="eyebrow">One-time dossier plus</p><h3>${license.unlocked ? 'Full handoff packet unlocked' : 'Print a complete handoff packet'}</h3><p>${license.unlocked ? 'Your packet can include the cover, handoff plan, trusted people, and every locator record.' : 'A one-time ₹799 purchase adds a full printable packet and reusable starter templates. The core dossier, encrypted backup, CSV export, and cover stay free.'}</p>${license.unlocked ? '<button class="button" id="print-packet" type="button">Print full packet</button>' : `<a class="button" href="${BUY_URL}">Buy one-time unlock</a>`}</div>
    ${license.unlocked ? `<div class="print-packet" hidden><h2>First-hour instructions</h2><p>${escapeHtml(dossier!.profile.executorInstructions || 'No instructions recorded.')}</p><h2>Trusted people</h2>${dossier!.contacts.map((person) => `<div class="record"><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(person.role)} · ${escapeHtml(person.phone)} · ${escapeHtml(person.email)}</p><p>${escapeHtml(person.notes)}</p></div>`).join('')}<h2>Record locator</h2>${dossier!.entries.map((item) => `<div class="record"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.category)} · ${escapeHtml(item.institution)}</p><p><strong>Location:</strong> ${escapeHtml(item.locator)}</p><p>${escapeHtml(item.instructions)}</p></div>`).join('')}</div>` : ''}</section>`;
}

function settingsView(): string {
  return `<section><div class="section-heading"><div><p class="eyebrow">Control and ownership</p><h2>Settings</h2><p>Back up the encrypted dossier, take a readable copy when appropriate, or change the local lock.</p></div></div>
    <h3>Your data</h3><div class="actions"><button class="button" id="export-backup" type="button">Export encrypted backup</button><button class="button" id="export-csv" type="button">Export readable CSV</button><button class="button" id="import-backup" type="button">Import encrypted backup</button></div><p class="small muted">Encrypted backups require their original passphrase. CSV files are not encrypted; store them carefully.</p>
    <h3>Passphrase</h3><button class="button" id="change-passphrase" type="button">Change passphrase</button>
    <div class="pro-panel"><p class="eyebrow">Dossier plus · one-time ₹799</p><h3>${license.unlocked ? 'License active' : 'Reusable planning tools'}</h3><p>${license.unlocked ? 'Starter templates and full packet printing are unlocked on this device.' : 'Unlock curated record templates and full handoff packet printing. No subscription. Core safety, accessibility, review, and data export remain free.'}</p>${license.notice ? `<p>${escapeHtml(license.notice)} <a href="${BUY_URL}">Buy again</a></p>` : ''}${license.unlocked ? '<button class="button" id="use-template" type="button">Add starter template</button>' : `<div class="actions"><a class="button" href="${BUY_URL}">Buy one-time unlock</a><button class="button" id="restore-license" type="button">Paste a license</button></div>`}<p class="small">Sociobot / Dodo is the merchant of record. Refunds are handled there and revoke the license. See <a href="/privacy/">privacy</a> and <a href="/terms/">terms</a>.</p></div>
    <h3>Remove local data</h3><p>This permanently removes the encrypted dossier from this browser. Export a backup first.</p><button class="button danger" id="delete-dossier" type="button">Delete this dossier</button></section>`;
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
  document.querySelector<HTMLFormElement>('#plan-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); dossier!.profile = { ownerName: String(form.get('ownerName')), jurisdiction: String(form.get('jurisdiction')), dossierLocation: String(form.get('dossierLocation')), executorInstructions: String(form.get('executorInstructions')), reviewMonths: Number(form.get('reviewMonths')) }; await persist('Handoff plan saved.'); renderDossier(); });
  document.querySelector('#complete-review')?.addEventListener('click', completeReview);
  document.querySelector('#three-record-drill')?.addEventListener('click', runDrill);
  document.querySelector('#print-cover')?.addEventListener('click', () => { document.body.classList.remove('packet-print'); window.print(); });
  document.querySelector('#print-packet')?.addEventListener('click', () => { document.body.classList.add('packet-print'); window.addEventListener('afterprint', () => document.body.classList.remove('packet-print'), { once: true }); window.print(); });
  document.querySelector('#export-backup')?.addEventListener('click', exportBackup);
  document.querySelector('#export-csv')?.addEventListener('click', exportCsv);
  document.querySelector('#import-backup')?.addEventListener('click', openImportDialog);
  document.querySelector('#change-passphrase')?.addEventListener('click', openPassphraseDialog);
  document.querySelector('#restore-license')?.addEventListener('click', openLicenseDialog);
  document.querySelector('#use-template')?.addEventListener('click', addTemplate);
  document.querySelector('#delete-dossier')?.addEventListener('click', openDeleteDialog);
}

function openDialog(content: string): HTMLDialogElement {
  const dialog = document.createElement('dialog'); dialog.innerHTML = `<div class="dialog-inner">${content}</div>`; document.body.append(dialog);
  const close = (): void => { dialog.close(); dialog.remove(); };
  dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); }); dialog.showModal();
  return dialog;
}

function openRecordDialog(id?: string): void {
  const existing = dossier!.entries.find((item) => item.id === id);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Record locator</p><h2>${existing ? 'Edit record' : 'Add a record'}</h2></div><button class="dialog-close" type="button" data-close aria-label="Close">×</button></div><form id="record-form">
    <div class="field"><label for="record-title">Record name</label><input id="record-title" name="title" value="${escapeHtml(existing?.title)}" required placeholder="Example: Life insurance policy" autofocus></div><div class="two-column"><div class="field"><label for="record-category">Category</label><select id="record-category" name="category">${CATEGORIES.map((category) => `<option${existing?.category === category ? ' selected' : ''}>${category}</option>`).join('')}</select></div><div class="field"><label for="record-institution">Institution or provider</label><input id="record-institution" name="institution" value="${escapeHtml(existing?.institution)}"></div></div>
    <div class="field"><label for="record-locator">Where is it found?</label><input id="record-locator" name="locator" value="${escapeHtml(existing?.locator)}" placeholder="Example: blue safe, top shelf" aria-describedby="locator-hint"><span id="locator-hint" class="field-hint">Use a physical place or password-vault item name. Never put a password here.</span></div><div class="field"><label for="record-reference">Safe reference label</label><input id="record-reference" name="reference" value="${escapeHtml(existing?.reference)}" placeholder="Nickname or last four digits only"></div>
    <div class="two-column"><div class="field"><label for="record-contact">Helpful contact</label><select id="record-contact" name="contactId"><option value="">No contact linked</option>${dossier!.contacts.map((person) => `<option value="${person.id}"${existing?.contactId === person.id ? ' selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></div><div class="field"><label for="record-renewal">Renewal / review date</label><input id="record-renewal" name="renewalDate" type="date" value="${escapeHtml(existing?.renewalDate)}"></div></div><div class="field"><label for="record-instructions">Locator notes</label><textarea id="record-instructions" name="instructions">${escapeHtml(existing?.instructions)}</textarea></div>
    <div class="actions"><button class="button primary" type="submit">${existing ? 'Save record' : 'Add record'}</button><button class="button" data-close type="button">Cancel</button>${existing ? '<button class="button danger" id="delete-record" type="button">Delete record</button>' : ''}</div></form>`);
  dialog.querySelector<HTMLFormElement>('#record-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const timestamp = new Date().toISOString(); const item: DossierEntry = { id: existing?.id || uid(), title: String(form.get('title')).trim(), category: String(form.get('category')) as DossierEntry['category'], institution: String(form.get('institution')).trim(), locator: String(form.get('locator')).trim(), reference: String(form.get('reference')).trim(), contactId: String(form.get('contactId')), renewalDate: String(form.get('renewalDate')), instructions: String(form.get('instructions')).trim(), reviewedAt: existing?.reviewedAt || '', createdAt: existing?.createdAt || timestamp, updatedAt: timestamp }; if (existing) dossier!.entries[dossier!.entries.indexOf(existing)] = item; else dossier!.entries.unshift(item); await persist(existing ? 'Record updated.' : 'Record added.'); dialog.close(); dialog.remove(); renderDossier(); });
  dialog.querySelector('#delete-record')?.addEventListener('click', async () => { if (!confirm(`Delete “${existing!.title}”? This cannot be undone.`)) return; dossier!.entries = dossier!.entries.filter((item) => item.id !== existing!.id); await persist('Record deleted.'); dialog.close(); dialog.remove(); renderDossier(); });
}

function openContactDialog(id?: string): void {
  const existing = dossier!.contacts.find((item) => item.id === id);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Trusted person</p><h2>${existing ? 'Edit person' : 'Add a person'}</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><form id="contact-form"><div class="two-column"><div class="field"><label for="contact-name">Name</label><input id="contact-name" name="name" value="${escapeHtml(existing?.name)}" required autofocus></div><div class="field"><label for="contact-role">Role</label><input id="contact-role" name="role" value="${escapeHtml(existing?.role)}" placeholder="Executor, lawyer, sibling"></div><div class="field"><label for="contact-phone">Phone</label><input id="contact-phone" name="phone" type="tel" value="${escapeHtml(existing?.phone)}" autocomplete="tel"></div><div class="field"><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" value="${escapeHtml(existing?.email)}" autocomplete="email"></div></div><div class="field"><label for="contact-notes">Notes</label><textarea id="contact-notes" name="notes">${escapeHtml(existing?.notes)}</textarea></div><div class="actions"><button class="button primary" type="submit">${existing ? 'Save person' : 'Add person'}</button><button class="button" data-close type="button">Cancel</button>${existing ? '<button class="button danger" id="delete-contact" type="button">Delete person</button>' : ''}</div></form>`);
  dialog.querySelector<HTMLFormElement>('#contact-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const person: TrustedContact = { id: existing?.id || uid(), name: String(form.get('name')).trim(), role: String(form.get('role')).trim(), phone: String(form.get('phone')).trim(), email: String(form.get('email')).trim(), notes: String(form.get('notes')).trim() }; if (existing) dossier!.contacts[dossier!.contacts.indexOf(existing)] = person; else dossier!.contacts.push(person); await persist(existing ? 'Person updated.' : 'Trusted person added.'); dialog.close(); dialog.remove(); renderDossier(); });
  dialog.querySelector('#delete-contact')?.addEventListener('click', async () => { if (!confirm(`Delete “${existing!.name}”? Linked records will keep their other details.`)) return; dossier!.contacts = dossier!.contacts.filter((person) => person.id !== existing!.id); dossier!.entries.forEach((item) => { if (item.contactId === existing!.id) item.contactId = ''; }); await persist('Person deleted.'); dialog.close(); dialog.remove(); renderDossier(); });
}

async function completeReview(): Promise<void> {
  dossier!.entries.forEach((item) => { item.reviewedAt = today(); });
  dossier!.reviews.unshift({ id: uid(), date: today(), note: 'Scheduled dossier review completed', entryCount: dossier!.entries.length });
  await persist('Review completed. Next review scheduled.'); renderDossier();
}

function runDrill(): void {
  const picks = [...dossier!.entries].sort(() => Math.random() - .5).slice(0, 3);
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Findability test</p><h2>Can a trusted person find these?</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>Without extra hints, ask them to explain where each item is located. Do not ask them to access the account.</p><ol>${picks.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span class="muted">Expected location: ${escapeHtml(item.locator || 'not recorded')}</span></li>`).join('')}</ol><div class="actions"><button class="button primary" id="drill-pass" type="button">All three were findable</button><button class="button" data-close type="button">Finish later</button></div>`);
  dialog.querySelector('#drill-pass')?.addEventListener('click', async () => { dossier!.reviews.unshift({ id: uid(), date: today(), note: 'Three-record findability drill passed', entryCount: dossier!.entries.length }); await persist('Findability drill recorded.'); dialog.close(); dialog.remove(); renderDossier(); });
}

function download(name: string, content: string, type: string): void { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
function exportBackup(): void { if (envelope) { download(`family-dossier-${today()}.encrypted.json`, JSON.stringify(envelope, null, 2), 'application/json'); showStatus('Encrypted backup exported.'); } }
function exportCsv(): void {
  if (!confirm('CSV is readable and not encrypted. Continue only if you can store the file safely.')) return;
  const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;
  const rows = [['Title', 'Category', 'Institution', 'Location', 'Safe reference', 'Renewal date', 'Instructions'], ...dossier!.entries.map((item) => [item.title, item.category, item.institution, item.locator, item.reference, item.renewalDate, item.instructions])];
  download(`family-dossier-${today()}.csv`, `\uFEFF${rows.map((row) => row.map(quote).join(',')).join('\n')}`, 'text/csv;charset=utf-8'); showStatus('Readable CSV exported.');
}

function openImportDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><div><p class="eyebrow">Replace local dossier</p><h2>Import encrypted backup</h2></div><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><div class="legal-warning">A valid backup will replace the dossier currently on this device. Export the current dossier first if you need it.</div><form id="import-form"><div class="field"><label for="backup-file">Encrypted JSON backup</label><input id="backup-file" name="file" type="file" accept="application/json,.json" required></div><div class="field"><label for="backup-passphrase">Backup passphrase</label><input id="backup-passphrase" name="backupPassphrase" type="password" autocomplete="current-password" required></div><button class="button primary" type="submit">Verify and replace dossier</button></form><div id="import-error" aria-live="assertive"></div>`);
  dialog.querySelector<HTMLFormElement>('#import-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const file = form.get('file'); const error = dialog.querySelector('#import-error')!; try { if (!(file instanceof File)) throw new Error('Choose an encrypted JSON backup.'); const parsed: unknown = JSON.parse(await file.text()); if (!isEncryptedEnvelope(parsed)) throw new Error('This is not a Family Digital Dossier encrypted backup.'); const backupPassphrase = String(form.get('backupPassphrase')); const restored = await decryptDossier(parsed, backupPassphrase); dossier = restored; passphrase = backupPassphrase; envelope = parsed; await writeEnvelope(parsed); dialog.close(); dialog.remove(); view = 'overview'; renderDossier(); showStatus('Encrypted backup restored.'); } catch (caught) { error.className = 'error'; error.textContent = caught instanceof Error ? caught.message : 'Backup could not be imported.'; } });
}

function openPassphraseDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><h2>Change passphrase</h2><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>This creates new encrypted data immediately. Update any stored passphrase instructions and export a fresh backup.</p><form id="passphrase-form"><div class="field"><label for="current-pass">Current passphrase</label><input id="current-pass" name="current" type="password" required autocomplete="current-password"></div><div class="field"><label for="next-pass">New passphrase</label><input id="next-pass" name="next" minlength="12" type="password" required autocomplete="new-password"></div><div class="field"><label for="next-confirm">Confirm new passphrase</label><input id="next-confirm" name="confirm" minlength="12" type="password" required autocomplete="new-password"></div><button class="button primary" type="submit">Change passphrase</button></form><div id="pass-error" aria-live="assertive"></div>`);
  dialog.querySelector<HTMLFormElement>('#passphrase-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const error = dialog.querySelector('#pass-error')!; if (String(form.get('current')) !== passphrase) { error.className = 'error'; error.textContent = 'The current passphrase is not correct.'; return; } if (form.get('next') !== form.get('confirm')) { error.className = 'error'; error.textContent = 'The new passphrases do not match.'; return; } passphrase = String(form.get('next')); await persist('Passphrase changed. Export a new backup.'); dialog.close(); dialog.remove(); });
}

function openLicenseDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><h2>Restore one-time purchase</h2><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><form id="license-form"><div class="field"><label for="license-token">License token</label><textarea id="license-token" name="token" required></textarea></div><button class="button primary" type="submit">Verify license</button></form><div id="license-error" aria-live="assertive"></div>`);
  dialog.querySelector<HTMLFormElement>('#license-form')!.addEventListener('submit', async (event) => { event.preventDefault(); const target = event.currentTarget as HTMLFormElement; const button = target.querySelector('button')!; button.disabled = true; button.textContent = 'Verifying…'; storeLicense(String(new FormData(target).get('token'))); license = await verifyLicense(true); if (license.unlocked) { dialog.close(); dialog.remove(); renderDossier(); showStatus('Dossier Plus unlocked on this device.'); } else { const error = dialog.querySelector('#license-error')!; error.className = 'error'; error.textContent = license.notice || 'That license could not be verified. Check the token and try again.'; button.disabled = false; button.textContent = 'Verify license'; } });
}

async function addTemplate(): Promise<void> {
  const labels: Array<[DossierEntry['category'], string]> = [['Banking', 'Primary bank'], ['Insurance', 'Life insurance'], ['Insurance', 'Health insurance'], ['Legal', 'Will or estate plan'], ['Property', 'Home or tenancy records'], ['Tax', 'Recent tax returns'], ['Health', 'Advance care documents'], ['Online account', 'Password manager'], ['Utilities', 'Mobile phone account'], ['Other', 'Identity documents']];
  const existing = new Set(dossier!.entries.map((item) => item.title.toLowerCase())); const stamp = new Date().toISOString();
  labels.filter(([, title]) => !existing.has(title.toLowerCase())).forEach(([category, title]) => dossier!.entries.push({ id: uid(), title, category, institution: '', locator: '', reference: '', contactId: '', renewalDate: '', instructions: 'Complete this locator; do not add a password or secret.', reviewedAt: '', createdAt: stamp, updatedAt: stamp }));
  await persist('Starter template added. Complete each location before relying on it.'); view = 'records'; renderDossier();
}

function openDeleteDialog(): void {
  const dialog = openDialog(`<div class="dialog-head"><h2>Delete local dossier?</h2><button class="dialog-close" data-close type="button" aria-label="Close">×</button></div><p>This permanently removes the encrypted dossier and its local history from this browser. Backups already downloaded are not affected.</p><form id="delete-form"><div class="field"><label for="delete-confirm">Type DELETE to confirm</label><input id="delete-confirm" name="confirm" required autocomplete="off"></div><button class="button danger" type="submit">Permanently delete dossier</button></form>`);
  dialog.querySelector<HTMLFormElement>('#delete-form')!.addEventListener('submit', async (event) => { event.preventDefault(); if (new FormData(event.currentTarget as HTMLFormElement).get('confirm') !== 'DELETE') { showStatus('Type DELETE exactly to confirm.'); return; } await deleteEnvelope(); envelope = undefined; dossier = undefined; passphrase = ''; dialog.close(); dialog.remove(); renderWelcome(); showStatus('Local dossier deleted.'); });
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => { if (navigator.serviceWorker.controller) showStatus('An app update is available and will be ready shortly.'); });
    navigator.serviceWorker.addEventListener('message', (event) => { if (event.data?.type === 'SW_UPDATED') showStatus('Offline copy ready.'); });
  } catch { showStatus('Offline installation is unavailable, but the dossier still works in this tab.'); }
}

async function init(): Promise<void> {
  captureLicenseFromUrl();
  license = cachedLicenseState();
  try { envelope = await readEnvelope(); renderWelcome(); }
  catch (caught) { app.innerHTML = `${siteHeader()}<main id="main" class="setup-panel"><div class="setup-sheet"><h2>Local storage is unavailable</h2><div class="error" role="alert">${escapeHtml(caught instanceof Error ? caught.message : 'This browser cannot open the local encrypted store.')}</div><p>Try a regular browser window with storage enabled. No data has been sent anywhere.</p></div></main>${footer()}`; }
  void verifyLicense().then((result) => { const changed = result.unlocked !== license.unlocked || result.notice !== license.notice; license = result; if (changed && dossier && view === 'settings') renderDossier(); });
  void registerServiceWorker();
}

void init();
