import { getOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { getOrganizationRepo } from 'src/repos/organization.repo';
import { OrganizationInviteEntity } from 'src/services/typeorm/entities/OrganizationInviteEntity';
import {
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('OrganizationInviteRepo', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  async function createOrg() {
    const repo = getOrganizationRepo(queryRunner.manager);
    return repo.create({ name: 'Test Org' });
  }

  it('should create organization invite', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    const result = await repo.createInvite({
      email: 'test@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'test-token',
      status: InviteStatus.PENDING
    });

    expect(result.id).toBeDefined();
    expect(result.organizationId).toBe(org.id);

    const fromDb = await queryRunner.manager
      .getRepository(OrganizationInviteEntity)
      .findOneBy({ id: result.id });

    expect(fromDb?.organizationId).toBe(org.id);
  });

  it('should throw error on invalid data', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);

    await expect(
      repo.createInvite({
        email: undefined as any,
        organizationId: undefined as any,
        expiresAt: undefined as any,
        token: undefined as any,
        status: undefined as any
      })
    ).rejects.toThrow('Failed to create organization invite');
  });

  it('should update status by id', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    const created = await repo.createInvite({
      email: 'upd@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'token-upd',
      status: InviteStatus.PENDING
    });

    const updated = await repo.updateStatusById(created.id, InviteStatus.ACCEPTED);

    expect(updated.status).toBe(InviteStatus.ACCEPTED);

    const fromDb = await queryRunner.manager
      .getRepository(OrganizationInviteEntity)
      .findOneByOrFail({ id: created.id });

    expect(fromDb.status).toBe(InviteStatus.ACCEPTED);
  });

  it('should not update status if not PENDING', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    const created = await repo.createInvite({
      email: 'upd2@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'token-upd2',
      status: InviteStatus.PENDING
    });

    await repo.updateStatusById(created.id, InviteStatus.ACCEPTED);

    await expect(
      repo.updateStatusById(created.id, InviteStatus.DECLINED_BY_ADMIN)
    ).rejects.toThrow(`Failed to update organization invite with id ${created.id}`);
  });

  it('should get valid pending by token', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    const valid = await repo.createInvite({
      email: 'valid@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 't-valid',
      status: InviteStatus.PENDING
    });

    await repo.createInvite({
      email: 'expired@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() - 1000),
      token: 't-expired',
      status: InviteStatus.PENDING
    });

    const found = await repo.getValidPendingByToken('t-valid');

    expect(found.id).toBe(valid.id);
  });

  it('should get invite by id and organizationId', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    const created = await repo.createInvite({
      email: 'byid@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'token-byid',
      status: InviteStatus.PENDING
    });

    const found = await repo.getByIdAndOrganizationId(created.id, org.id);

    expect(found.id).toBe(created.id);
    expect(found.organizationId).toBe(org.id);
  });

  it('should get invites by organizationId', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org = await createOrg();

    await repo.createInvite({
      email: 'a1@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'token-a1',
      status: InviteStatus.PENDING
    });

    await repo.createInvite({
      email: 'a2@test.com',
      organizationId: org.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 'token-a2',
      status: InviteStatus.PENDING
    });

    const invites = await repo.getByOrganizationId(org.id);

    expect(invites).toHaveLength(2);
    expect(invites.every(i => i.organizationId === org.id)).toBe(true);
  });

  it('should get invites by email', async () => {
    const repo = getOrganizationInviteRepo(queryRunner.manager);
    const org1 = await getOrganizationRepo(queryRunner.manager).create({ name: 'Org 1' });
    const org2 = await getOrganizationRepo(queryRunner.manager).create({ name: 'Org 2' });

    await repo.createInvite({
      email: 'same@test.com',
      organizationId: org1.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 't1',
      status: InviteStatus.PENDING
    });

    await repo.createInvite({
      email: 'same@test.com',
      organizationId: org2.id,
      expiresAt: new Date(Date.now() + 3600000),
      token: 't2',
      status: InviteStatus.PENDING
    });

    const invites = await repo.getByEmail('same@test.com');

    expect(invites).toHaveLength(2);
    expect(invites.every(i => i.email === 'same@test.com')).toBe(true);
  });
});
