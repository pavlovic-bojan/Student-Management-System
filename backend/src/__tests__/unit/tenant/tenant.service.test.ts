import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from '../../../modules/tenant/tenant.service.refactored';
import { ITenantRepository } from '../../../modules/tenant/tenant.repository.interface';

describe('TenantService', () => {
  let service: TenantService;
  let mockRepository: ITenantRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByCode: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };
    service = new TenantService(mockRepository);
  });

  it('should list tenants from repository', async () => {
    const tenants = [
      {
        id: 't1',
        name: 'Tenant 1',
        code: 'T1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(mockRepository.list).mockResolvedValue(tenants);

    const result = await service.listTenants();

    expect(mockRepository.list).toHaveBeenCalled();
    expect(result).toEqual(tenants);
  });

  it('should get tenant by id from repository', async () => {
    const tenant = {
      id: 't1',
      name: 'Tenant 1',
      code: 'T1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(tenant);

    const result = await service.getTenantById('t1');

    expect(mockRepository.findById).toHaveBeenCalledWith('t1');
    expect(result).toEqual(tenant);
  });

  it('should return null when tenant not found by id', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await service.getTenantById('missing');

    expect(result).toBeNull();
  });

  it('should create tenant via use case', async () => {
    vi.mocked(mockRepository.findByCode).mockResolvedValue(null);
    vi.mocked(mockRepository.create).mockResolvedValue({
      id: 't1',
      name: 'New Tenant',
      code: 'NT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createTenant({ name: 'New Tenant', code: 'NT' });

    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'New Tenant',
      code: 'NT',
    });
    expect(result).toMatchObject({ name: 'New Tenant', code: 'NT' });
  });

  it('should update tenant and return updated', async () => {
    const updated = {
      id: 't1',
      name: 'Updated Name',
      code: 'T1',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.findById).mockResolvedValue({
      id: 't1',
      name: 'Tenant 1',
      code: 'T1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(mockRepository.findByCode).mockResolvedValue(null);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await service.updateTenant('t1', { name: 'Updated Name', isActive: false });

    expect(mockRepository.update).toHaveBeenCalledWith('t1', { name: 'Updated Name', isActive: false });
    expect(result).toEqual(updated);
  });

  it('should throw 404 when updating non-existent tenant', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    await expect(service.updateTenant('missing', { name: 'X' })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Tenant not found',
    });
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should throw 409 when updating tenant code to existing code', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({
      id: 't1',
      name: 'Tenant 1',
      code: 'T1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(mockRepository.findByCode).mockResolvedValue({
      id: 't2',
      name: 'Other',
      code: 'TAKEN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.updateTenant('t1', { code: 'TAKEN' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Tenant code already exists',
    });
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should allow updating code when it stays same (same tenant)', async () => {
    const tenant = {
      id: 't1',
      name: 'Tenant 1',
      code: 'T1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(tenant);
    vi.mocked(mockRepository.findByCode).mockResolvedValue(tenant);
    vi.mocked(mockRepository.update).mockResolvedValue({ ...tenant, name: 'New Name' });

    const result = await service.updateTenant('t1', { name: 'New Name', code: 'T1' });

    expect(mockRepository.update).toHaveBeenCalledWith('t1', { name: 'New Name', code: 'T1' });
    expect(result.name).toBe('New Name');
  });
});
