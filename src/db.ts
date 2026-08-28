import type { EncryptedEnvelope } from './crypto';

const REAL_DB_NAME = 'family-digital-dossier';
const DEMO_DB_NAME = 'demo:family-digital-dossier';
const STORE_NAME = 'vault';
const VAULT_KEY = 'primary';

function openDatabase(demo = false): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(demo ? DEMO_DB_NAME : REAL_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your browser could not open local storage. Private browsing restrictions may be the cause.'));
  });
}

export async function readEnvelope(demo = false): Promise<EncryptedEnvelope | undefined> {
  const db = await openDatabase(demo);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(VAULT_KEY);
    request.onsuccess = () => resolve(request.result as EncryptedEnvelope | undefined);
    request.onerror = () => reject(new Error('The encrypted dossier could not be read from this device.'));
    transaction.oncomplete = () => db.close();
  });
}

export async function writeEnvelope(envelope: EncryptedEnvelope, demo = false): Promise<void> {
  const db = await openDatabase(demo);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(envelope, VAULT_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => reject(new Error('Changes could not be saved on this device. Export a backup before closing.'));
  });
}

export async function deleteEnvelope(demo = false): Promise<void> {
  const db = await openDatabase(demo);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(VAULT_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => reject(new Error('The local dossier could not be removed.'));
  });
}

export function deleteDemoDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DEMO_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('The sample dossier could not be reset.'));
    request.onblocked = () => reject(new Error('Close other sample-dossier tabs, then reset again.'));
  });
}
