export const CATEGORIES = ['Banking', 'Insurance', 'Legal', 'Property', 'Health', 'Tax', 'Utilities', 'Online account', 'Other'] as const;
export type Category = typeof CATEGORIES[number];

export interface DossierEntry {
  id: string;
  title: string;
  category: Category;
  institution: string;
  locator: string;
  reference: string;
  contactId: string;
  renewalDate: string;
  instructions: string;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
}

export interface ReviewEvent {
  id: string;
  date: string;
  note: string;
  entryCount: number;
}

export interface DossierData {
  version: 1;
  profile: {
    ownerName: string;
    jurisdiction: string;
    executorInstructions: string;
    dossierLocation: string;
    reviewMonths: number;
  };
  entries: DossierEntry[];
  contacts: TrustedContact[];
  reviews: ReviewEvent[];
  createdAt: string;
  updatedAt: string;
}

export function createEmptyDossier(): DossierData {
  const now = new Date().toISOString();
  return {
    version: 1,
    profile: { ownerName: '', jurisdiction: '', executorInstructions: '', dossierLocation: '', reviewMonths: 6 },
    entries: [], contacts: [], reviews: [], createdAt: now, updatedAt: now,
  };
}

export function isDossierData(value: unknown): value is DossierData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DossierData>;
  return candidate.version === 1 && Array.isArray(candidate.entries) && Array.isArray(candidate.contacts) &&
    Array.isArray(candidate.reviews) && !!candidate.profile && typeof candidate.profile === 'object';
}
