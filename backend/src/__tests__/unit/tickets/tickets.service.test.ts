import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService } from '../../../modules/tickets/tickets.service.refactored';
import type { ITicketsRepository } from '../../../modules/tickets/tickets.repository.interface';

describe('TicketsService', () => {
  let service: TicketsService;
  let repo: ITicketsRepository;
  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(() => {
    repo = {
      createTicket: vi.fn(),
      findLastTicketForUser: vi.fn(),
    };
    service = new TicketsService(repo);
  });

  it('creates ticket when payload is valid and no recent ticket', async () => {
    vi.mocked(repo.findLastTicketForUser).mockResolvedValue(null);
    vi.mocked(repo.createTicket).mockResolvedValue({
      id: 't1',
      tenantId,
      subject: 'Valid subject',
      description: 'Valid description content',
      status: 'NEW',
      createdById: userId,
      createdAt: new Date(),
    });

    const result = await service.createTicket(tenantId, userId, {
      subject: '  Valid subject  ',
      description: '  Valid description content  ',
    });

    expect(repo.findLastTicketForUser).toHaveBeenCalledWith(userId);
    expect(repo.createTicket).toHaveBeenCalledWith(tenantId, userId, {
      subject: 'Valid subject',
      description: 'Valid description content',
    });
    expect(result.subject).toBe('Valid subject');
  });

  it('rejects too short subject or description', async () => {
    await expect(
      service.createTicket(tenantId, userId, {
        subject: 'shrt',
        description: 'long enough description',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      service.createTicket(tenantId, userId, {
        subject: 'Valid subject',
        description: 'short',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('enforces cooldown per user', async () => {
    const now = new Date();
    vi.setSystemTime(now);

    vi.mocked(repo.findLastTicketForUser).mockResolvedValue({
      id: 't1',
      tenantId,
      subject: 'Old',
      description: 'Old description',
      status: 'NEW',
      createdById: userId,
      createdAt: new Date(now.getTime() - 30 * 1000), // 30 seconds ago
    });

    await expect(
      service.createTicket(tenantId, userId, {
        subject: 'Valid subject',
        description: 'Valid description content',
      }),
    ).rejects.toMatchObject({ statusCode: 429 });
  });
});

