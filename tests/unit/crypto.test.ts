import { describe, expect, it } from 'vitest';
import { decryptDossier, encryptDossier, isEncryptedEnvelope } from '../../src/crypto';
import { createEmptyDossier } from '../../src/types';

describe('encrypted dossier', () => {
  it('round-trips without exposing plaintext', async () => {
    const dossier = createEmptyDossier();
    dossier.profile.ownerName = 'Alex Example';
    const encrypted = await encryptDossier(dossier, 'correct horse archive staple');
    expect(isEncryptedEnvelope(encrypted)).toBe(true);
    expect(encrypted.ciphertext).not.toContain('Alex Example');
    await expect(decryptDossier(encrypted, 'correct horse archive staple')).resolves.toMatchObject({ profile: { ownerName: 'Alex Example' } });
  });

  it('rejects a wrong passphrase and weak new passphrase', async () => {
    await expect(encryptDossier(createEmptyDossier(), 'too short')).rejects.toThrow(/12 characters/);
    const encrypted = await encryptDossier(createEmptyDossier(), 'long enough passphrase');
    await expect(decryptDossier(encrypted, 'different passphrase')).rejects.toThrow(/did not unlock/);
  });
});
