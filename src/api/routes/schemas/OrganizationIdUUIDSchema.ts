import z from 'zod';

export const OrganizationIdUUIDSchema = z.object({
  organizationId: z.uuid()
});
