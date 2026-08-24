// Shared TypeScript interfaces for AdminReactiveResume feature

export interface Resume {
  id: string;
  name: string;
  slug: string;
  visibility: string;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  company: string;
  position: string;
  stage: string;
  date: string;
  createdAt: string;
}

export interface AgentThread {
  id: string;
  aiProviderId?: string;
  sourceResumeId?: string;
  archived?: boolean;
  createdAt: string;
}

export interface AiProvider {
  id: string;
  label: string;
  model: string;
  baseURL?: string;
  createdAt?: string;
}

export interface ResumeVersion {
  id: string;
  id_?: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalysisResult {
  score?: number;
  rating?: string;
  feedback?: string;
  suggestions?: string[];
  tips?: string[];
}
