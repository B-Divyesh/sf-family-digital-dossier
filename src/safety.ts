import type { DossierData } from './types';

export interface CredentialRisk {
  field: string;
  label: string;
}

interface TextField {
  field: string;
  label: string;
  value: string;
}

const CREDENTIAL_ASSIGNMENT = /\b(?:password|passwd|passcode|pin|recovery[\s-]?code|backup[\s-]?code|one[\s-]?time[\s-]?password|otp|2fa[\s-]?code|secret(?:[\s-]?key)?|api[\s-]?key|private[\s-]?key|seed[\s-]?phrase|mnemonic)\b\s*(?:=|:|\bis\b)\s*\S+/i;
const PRIVATE_KEY = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/;
const API_TOKEN = /\b(?:sk|pk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{12,}\b/i;

function passesLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function looksLikeStandaloneSecret(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 10 || trimmed.length > 160 || /\s/.test(trimmed)) return false;
  const characterClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(trimmed)).length;
  return characterClasses >= 3 && !/^(?:[A-Za-z]+[-_ ])?[A-Za-z]{0,5}\d{1,4}$/.test(trimmed);
}

export function looksLikeCredential(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  if (CREDENTIAL_ASSIGNMENT.test(normalized) || PRIVATE_KEY.test(normalized) || JWT.test(normalized) || API_TOKEN.test(normalized)) return true;
  if (passesLuhn(normalized)) return true;
  return looksLikeStandaloneSecret(normalized);
}

export function firstCredentialRisk(fields: TextField[]): CredentialRisk | undefined {
  const match = fields.find(({ value }) => looksLikeCredential(value));
  return match ? { field: match.field, label: match.label } : undefined;
}

export function findDossierCredentialRisks(dossier: DossierData): CredentialRisk[] {
  const fields: TextField[] = [
    { field: 'owner-name', label: 'owner name', value: dossier.profile.ownerName },
    { field: 'jurisdiction', label: 'jurisdiction', value: dossier.profile.jurisdiction },
    { field: 'dossier-location', label: 'passphrase and sealed-cover location', value: dossier.profile.dossierLocation },
    { field: 'executor-instructions', label: 'first-hour instructions', value: dossier.profile.executorInstructions },
  ];
  dossier.entries.forEach((entry, index) => {
    const record = entry.title || `record ${index + 1}`;
    fields.push(
      { field: `entry:${entry.id}:title`, label: `${record} — record name`, value: entry.title },
      { field: `entry:${entry.id}:institution`, label: `${record} — institution`, value: entry.institution },
      { field: `entry:${entry.id}:locator`, label: `${record} — location`, value: entry.locator },
      { field: `entry:${entry.id}:reference`, label: `${record} — safe reference`, value: entry.reference },
      { field: `entry:${entry.id}:instructions`, label: `${record} — locator notes`, value: entry.instructions },
    );
  });
  dossier.contacts.forEach((contact, index) => {
    const person = contact.name || `person ${index + 1}`;
    fields.push(
      { field: `contact:${contact.id}:name`, label: `${person} — name`, value: contact.name },
      { field: `contact:${contact.id}:role`, label: `${person} — role`, value: contact.role },
      { field: `contact:${contact.id}:phone`, label: `${person} — phone`, value: contact.phone },
      { field: `contact:${contact.id}:email`, label: `${person} — email`, value: contact.email },
      { field: `contact:${contact.id}:notes`, label: `${person} — notes`, value: contact.notes },
    );
  });
  dossier.reviews.forEach((review, index) => {
    fields.push({ field: `review:${review.id}:note`, label: `review ${index + 1} — note`, value: review.note });
  });
  return fields.filter(({ value }) => looksLikeCredential(value)).map(({ field, label }) => ({ field, label }));
}

export const CREDENTIAL_ERROR = 'This looks like a password, code, key, or other secret. Remove the secret and enter only where it can be found.';
