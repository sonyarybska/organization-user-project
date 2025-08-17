import z from 'zod';

export const IdUUIDSchema = z.object({
  id: z.uuid()
});

export const OrganizationIdSchema = z.object({
  organizationId: z.uuid()
});
