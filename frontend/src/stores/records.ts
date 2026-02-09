import { defineStore } from 'pinia';
import { ref } from 'vue';
import { recordsApi, type Transcript } from '@/api/records.api';
import { useAuthStore } from '@/stores/auth';

export const useRecordsStore = defineStore('records', () => {
  const auth = useAuthStore();
  const transcripts = ref<Transcript[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTranscripts() {
    if (!auth.tenantId) {
      transcripts.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data } = await recordsApi.listTranscripts();
      transcripts.value = data.data ?? [];
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to load transcripts';
      transcripts.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function generateTranscript(studentId: string) {
    if (!auth.tenantId) throw new Error('No tenant selected');
    loading.value = true;
    error.value = null;
    try {
      const { data } = await recordsApi.generateTranscript({ studentId });
      transcripts.value = [data.data, ...transcripts.value];
      return data.data;
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Failed to generate transcript';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearRecords() {
    transcripts.value = [];
    error.value = null;
  }

  return {
    transcripts,
    loading,
    error,
    fetchTranscripts,
    generateTranscript,
    clearRecords,
  };
});
