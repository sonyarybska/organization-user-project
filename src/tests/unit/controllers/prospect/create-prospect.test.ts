import { createProspect } from 'src/controllers/prospect/create-prospect';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { mockSqsService } from 'src/tests/mocks/services/sqs.service.mock';
import { DBError } from 'src/types/errors/DBError';
import { TEST_USER_IDS, TEST_ORG_IDS, TEST_TRACKING_CONTEXT } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('createProspect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful creation', () => {
    it('persists prospect and returns id', async () => {
      const testProspect = createTestProspect();
      mockProspectRepo.create.mockResolvedValue(testProspect);
      mockSqsService.sendMessageToQueue.mockResolvedValue();

      const result = await createProspect({
        data: testProspect,
        prospectRepo: mockProspectRepo,
        userId: TEST_USER_IDS.FIRST,
        organizationId: TEST_ORG_IDS.FIRST,
        trackingContext: TEST_TRACKING_CONTEXT,
        trackingService: trackingServiceMock
      });

      expect(mockProspectRepo.create).toHaveBeenCalledWith(testProspect);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: TEST_USER_IDS.FIRST,
          organizationId: TEST_ORG_IDS.FIRST,
          resourceId: testProspect.id
        })
      );
      expect(result).toEqual({ id: testProspect.id });
    });
  });

  describe('on creation failure', () => {
    it('propagates database error', async () => {
      const testProspect = createTestProspect();
      const dbError = new DBError('Unique constraint violation');
      mockProspectRepo.create.mockRejectedValue(dbError);

      await expect(
        createProspect({
          data: testProspect,
          prospectRepo: mockProspectRepo,
          userId: TEST_USER_IDS.FIRST,
          organizationId: TEST_ORG_IDS.FIRST,
          trackingContext: TEST_TRACKING_CONTEXT,
          trackingService: trackingServiceMock
        })
      ).rejects.toThrow('Unique constraint violation');
    });
  });
});
