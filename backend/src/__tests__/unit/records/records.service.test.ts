import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordsService } from '../../../modules/records/records.service.refactored';
import { IRecordsRepository } from '../../../modules/records/records.repository.interface';

describe('RecordsService', () => {
  let service: RecordsService;
  let mockRepository: IRecordsRepository;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockRepository = {
      createTranscript: vi.fn(),
      listTranscripts: vi.fn(),
      getByStudentId: vi.fn(),
    };
    service = new RecordsService(mockRepository);
  });

  it('should list transcripts for tenant', async () => {
    const transcripts = [
      {
        id: 'tr1',
        tenantId,
        studentId: 's1',
        generatedAt: new Date(),
        gpa: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.listTranscripts).mockResolvedValue(transcripts);

    const result = await service.listTranscripts(tenantId);

    expect(mockRepository.listTranscripts).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(transcripts);
  });

  it('should generate transcript', async () => {
    vi.mocked(mockRepository.createTranscript).mockResolvedValue({
      id: 'tr1',
      tenantId,
      studentId: 's1',
      generatedAt: new Date(),
      gpa: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.generateTranscript(tenantId, {
      studentId: 's1',
    });

    expect(mockRepository.createTranscript).toHaveBeenCalledWith(tenantId, {
      studentId: 's1',
    });
    expect(result).toMatchObject({ studentId: 's1' });
  });

  it('should get transcripts by student id', async () => {
    const transcripts = [
      {
        id: 'tr1',
        tenantId,
        studentId: 's1',
        generatedAt: new Date(),
        gpa: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.getByStudentId).mockResolvedValue(transcripts);

    const result = await service.getTranscriptsByStudent(tenantId, 's1');

    expect(mockRepository.getByStudentId).toHaveBeenCalledWith(tenantId, 's1');
    expect(result).toEqual(transcripts);
  });
});
