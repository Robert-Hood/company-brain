/** Mirrors API-SHAPES.md. The UI knows nothing about the corpus beyond this. */

export type Department = 'gtm' | 'product' | 'engineering' | 'ga' | 'ops';
export type Sensitivity = 'public' | 'internal' | 'phi-restricted';
export type Confidence = 'high' | 'medium' | 'low';

export type DocMeta = {
  id: string;
  title: string;
  department: Department;
  source: string;
  owner: string;
  updated: string;
  sensitivity: Sensitivity;
};

export type Doc = DocMeta & { body: string };

export type User = {
  id: number;
  name: string;
  role: string;
  expertise: string[];
};

export type CorrectionApplied = {
  id: number;
  citationId: string;
  question: string;
  answer: string;
  author: string;
  authorRole: string;
  weight: number;
  totalWeight: number;
  overridesDocId: string | null;
  createdAt: string;
};

export type AskResponse = {
  answer: string;
  citations: string[];
  confidence: Confidence;
  payer: string | null;
  citedDocs: DocMeta[];
  correctionsApplied: CorrectionApplied[];
  sources: DocMeta[];
  autoSelected: boolean;
  loggedAsGap: boolean;
  parseFailed: boolean;
};

export type CorrectResponse = {
  entry: {
    id: number;
    question: string;
    answer: string;
    sources: string[];
    authorId: number;
    author: string;
    authorRole: string;
    weight: number;
    overridesDocId: string | null;
    createdAt: string;
  };
  weight: number;
  matchedDepartment: string | null;
  weightReason: string;
  toast: string;
};

export type KnowledgeEntry = {
  id: number;
  question: string;
  answer: string;
  sources: string[];
  weight: number;
  overridesDocId: string | null;
  createdAt: string;
  author: string;
  authorRole: string;
};

export type Gap = {
  id: number;
  question: string;
  payer: string | null;
  confidence: string;
  createdAt: string;
  askedBy: string;
};

export type PayerCount = { payer: string; count: number };
