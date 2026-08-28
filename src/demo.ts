import type { DossierData, DossierEntry } from './types';

export const DEMO_PASSPHRASE = 'sample dossier only 2026';

function entry(id: string, title: string, category: DossierEntry['category'], institution: string, locator: string, contactId: string, renewalDate: string, instructions: string): DossierEntry {
  return { id, title, category, institution, locator, reference: `REF-${id.toUpperCase()}`, contactId, renewalDate, instructions, reviewedAt: '2026-08-15', createdAt: '2026-02-15T09:00:00.000Z', updatedAt: '2026-08-15T09:00:00.000Z' };
}

export function createDemoDossier(): DossierData {
  return {
    version: 1,
    profile: {
      ownerName: 'Asha Mehta',
      jurisdiction: 'Karnataka, India',
      executorInstructions: 'Call Mira first. Find the red estate folder before contacting the lawyer. Do not close accounts until the lawyer advises you.',
      dossierLocation: 'Sealed envelope in the study safe; copy held by Rao Legal',
      reviewMonths: 6,
    },
    entries: [
      entry('bank', 'Primary bank accounts', 'Banking', 'Sahyadri Bank', 'Password manager item “Sahyadri”; statements in study safe', 'mira', '2027-02-15', 'Ask the branch estate desk for its bereavement checklist.'),
      entry('life', 'Term life insurance policy', 'Insurance', 'Harbour Life', 'Red estate folder, insurance divider', 'neel', '2027-04-30', 'Call the adviser with the policy reference.'),
      entry('health', 'Family health insurance', 'Insurance', 'Northstar Health', 'Hall cupboard, medical file', 'mira', '2027-01-31', 'Use the member reference on the cover sheet.'),
      entry('will', 'Signed will', 'Legal', 'Rao Legal', 'Original held by Rao Legal; copy in study safe', 'rao', '', 'Contact the lawyer before moving or marking the copy.'),
      entry('home', 'Home ownership papers', 'Property', 'Kaveri Housing Society', 'Study safe, property folder', 'mira', '', 'The society secretary has the nomination record.'),
      entry('tax', 'Recent tax returns', 'Tax', 'Mehta & Sen', 'Laptop Documents folder, Tax/Filed', 'neel', '2027-07-31', 'The accountant keeps signed filing acknowledgements.'),
      entry('care', 'Advance care instructions', 'Health', 'Family physician', 'Hall cupboard, medical file', 'mira', '', 'Give a copy to the treating hospital if requested.'),
      entry('vault', 'Password manager account', 'Online account', 'Password manager', 'Sealed access instructions with Rao Legal', 'rao', '', 'Follow the provider’s emergency-access process. Credentials are not included.'),
      entry('phone', 'Mobile phone account', 'Utilities', 'City Mobile', 'Password manager item “City Mobile”', 'mira', '2027-03-01', 'Keep the number active until account recovery is complete.'),
      entry('identity', 'Identity documents', 'Other', 'Government-issued records', 'Study safe, blue identity folder', 'mira', '', 'Use copies unless an office asks for the original.'),
    ],
    contacts: [
      { id: 'mira', name: 'Mira Mehta', role: 'Sister and executor', phone: '+91 80 5550 0142', email: 'mira@example.test', notes: 'First family call.' },
      { id: 'rao', name: 'Anita Rao', role: 'Estate lawyer', phone: '+91 80 5550 0188', email: 'anita.rao@example.test', notes: 'Holds the signed will and sealed instructions.' },
      { id: 'neel', name: 'Neel Shah', role: 'Financial adviser', phone: '+91 80 5550 0196', email: 'neel@example.test', notes: 'Knows the insurance and tax contacts.' },
    ],
    reviews: [
      { id: 'review-aug', date: '2026-08-15', note: 'Scheduled dossier review completed', entryCount: 10 },
      { id: 'drill-feb', date: '2026-02-15', note: 'Three-record location drill passed', entryCount: 9 },
    ],
    createdAt: '2025-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  };
}
