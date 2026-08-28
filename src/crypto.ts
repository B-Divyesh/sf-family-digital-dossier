import { isDossierData, type DossierData } from './types';

export const KDF_ITERATIONS = 310_000;
const CONTEXT = new TextEncoder().encode('family-digital-dossier:v1');

export interface EncryptedEnvelope {
  format: 'family-digital-dossier';
  version: 1;
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: string;
}

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptDossier(data: DossierData, passphrase: string): Promise<EncryptedEnvelope> {
  if (passphrase.length < 12) throw new Error('Use at least 12 characters for the passphrase.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, KDF_ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: CONTEXT }, key, plaintext);
  return {
    format: 'family-digital-dossier', version: 1, kdf: 'PBKDF2-SHA-256', iterations: KDF_ITERATIONS,
    salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt: new Date().toISOString(),
  };
}

export async function decryptDossier(envelope: EncryptedEnvelope, passphrase: string): Promise<DossierData> {
  if (envelope.format !== 'family-digital-dossier' || envelope.version !== 1) throw new Error('This backup format is not supported.');
  try {
    const salt = base64ToBytes(envelope.salt);
    const iv = base64ToBytes(envelope.iv);
    const key = await deriveKey(passphrase, salt, envelope.iterations);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource, additionalData: CONTEXT }, key, base64ToBytes(envelope.ciphertext) as BufferSource,
    );
    const value: unknown = JSON.parse(new TextDecoder().decode(plaintext));
    if (!isDossierData(value)) throw new Error('The decrypted dossier is incomplete.');
    return value;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('format') || error.message.includes('incomplete'))) throw error;
    throw new Error('That passphrase did not unlock this dossier. Check it and try again.', { cause: error });
  }
}

export function isEncryptedEnvelope(value: unknown): value is EncryptedEnvelope {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<EncryptedEnvelope>;
  return item.format === 'family-digital-dossier' && item.version === 1 && item.kdf === 'PBKDF2-SHA-256' &&
    typeof item.salt === 'string' && typeof item.iv === 'string' && typeof item.ciphertext === 'string';
}
