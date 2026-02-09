import { api } from './client';

export interface Transcript {
  id: string;
  tenantId: string;
  studentId: string;
  generatedAt: string;
  gpa?: number | null;
  createdAt: string;
  updatedAt: string;
}

export const recordsApi = {
  listTranscripts: () => api.get<{ data: Transcript[] }>('/records/transcripts'),
  generateTranscript: (data: { studentId: string }) =>
    api.post<{ data: Transcript }>('/records/transcripts', data),
};
