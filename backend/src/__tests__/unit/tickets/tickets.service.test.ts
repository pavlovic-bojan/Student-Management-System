import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService } from '../../../modules/tickets/tickets.service.refactored';
import type { ITicketsRepository } from '../../../modules/tickets/tickets.repository.interface';
import type { TicketListItem } from '../../../modules/tickets/tickets.model';

describe('TicketsService', () => {
  let service: TicketsService;
  let repo: ITicketsRepository;
  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(() => {
    repo = {
      createTicket: vi.fn(),
      findLastTicketForUser: vi.fn(),
      listTicketsForTenant: vi.fn(),
      updateTicket: vi.fn(),
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
      page: 'Dashboard',
      steps: 'Steps...',
      expectedActual: 'Expected vs actual...',
      status: 'NEW',
      createdById: userId,
      createdAt: new Date(),
    });

    const result = await service.createTicket(tenantId, userId, {
      subject: '  Valid subject  ',
      description: '  Valid description content  ',
      page: 'Dashboard',
      steps: 'Steps...',
      expectedActual: 'Expected vs actual...',
    });

    expect(repo.findLastTicketForUser).toHaveBeenCalledWith(userId);
    expect(repo.createTicket).toHaveBeenCalledWith(tenantId, userId, {
      subject: 'Valid subject',
      description: 'Valid description content',
      page: 'Dashboard',
      steps: 'Steps...',
      expectedActual: 'Expected vs actual...',
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

  it('lists tickets with filters by delegating to repo', async () => {
    const list: TicketListItem[] = [
      {
        id: 't1',
        subject: 'Bug 1',
        status: 'NEW',
        isPriority: false,
        createdAt: new Date(),
        tenantId,
        tenantName: 'Tenant',
        reporterName: 'User',
        reporterEmail: 'u@example.com',
      },
    ];
    vi.mocked(repo.listTicketsForTenant).mockResolvedValue(list);

    const result = await service.listTickets(tenantId, { status: 'NEW', priorityOnly: true });

    expect(repo.listTicketsForTenant).toHaveBeenCalledWith(tenantId, {
      status: 'NEW',
      priorityOnly: true,
    }, undefined);
    expect(result).toBe(list);
  });

  it('updateTicket rejects when nothing to update', async () => {
    await expect(service.updateTicket(tenantId, 't1', {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('updateTicket rejects invalid status', async () => {
    await expect(
      // @ts-expect-error invalid status for test
      service.updateTicket(tenantId, 't1', { status: 'INVALID' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('updateTicket delegates to repo when payload is valid', async () => {
    const ticket = {
      id: 't1',
      tenantId,
      subject: 'Bug',
      description: 'Desc',
      status: 'IN_PROGRESS' as const,
      isPriority: true,
      createdById: userId,
      createdAt: new Date(),
    };
    vi.mocked(repo.updateTicket).mockResolvedValue(ticket);

    const result = await service.updateTicket(tenantId, 't1', {
      status: 'IN_PROGRESS',
      isPriority: true,
    });

    expect(repo.updateTicket).toHaveBeenCalledWith(tenantId, 't1', {
      status: 'IN_PROGRESS',
      isPriority: true,
    });
    expect(result).toBe(ticket);
  });
});

