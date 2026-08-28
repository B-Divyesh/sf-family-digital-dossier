import { describe, expect, it } from 'vitest';
import { findDossierCredentialRisks, looksLikeCredential } from '../../src/safety';
import { createEmptyDossier } from '../../src/types';

describe('no-credential safety boundary', () => {
  it.each([
    'password=DemoSecret_42!',
    'PIN: 839201',
    'recovery code is ABCD-EFGH-IJKL',
    'DemoSecret_42!',
    'sk-live_abcdefghijklmnop',
    '4111 1111 1111 1111',
  ])('rejects credential-like input: %s', (value) => {
    expect(looksLikeCredential(value)).toBe(true);
  });

  it.each([
    'Password manager → Banking folder',
    'Blue safe, top shelf',
    'Call the lawyer before closing accounts',
    'Policy-1234',
    'Complete this locator; do not add a password or secret.',
  ])('allows useful locator language: %s', (value) => {
    expect(looksLikeCredential(value)).toBe(false);
  });

  it('finds credential-like content in a restored dossier before it can be imported or exported', () => {
    const dossier = createEmptyDossier();
    dossier.entries.push({
      id: 'record-1', title: 'Life insurance', category: 'Insurance', institution: '',
      locator: 'password=DemoSecret_42!', reference: '', contactId: '', renewalDate: '', instructions: '',
      reviewedAt: '', createdAt: dossier.createdAt, updatedAt: dossier.updatedAt,
    });
    expect(findDossierCredentialRisks(dossier)).toEqual([
      { field: 'entry:record-1:locator', label: 'Life insurance — location' },
    ]);
  });
});
