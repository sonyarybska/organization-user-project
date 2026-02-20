import { z } from 'zod';
import { parse } from 'tldts';
import { normalizeDomain } from 'src/api/helpers/normalizeDomain';
import { normalizeLinkedinUrl } from 'src/api/helpers/normalizeLinkedinUrl';
import { normalizePhoneNumber } from 'src/api/helpers/normalizePhoneNumber';

const domainSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (val) => {
      const parsed = parse(val.toLowerCase());
      return Boolean(parsed.domain || parsed.isIp);
    },
    {
      message: 'Invalid domain'
    }
  )
  .transform((val) => normalizeDomain(val));

const phoneSchema = z
  .string()
  .trim()
  .min(1)
  .transform((val) => normalizePhoneNumber(val))
  .refine((val) => val !== null, {
    message: 'Invalid phone number'
  });

const linkedinSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return lower.includes('linkedin.com');
    },
    {
      message: 'Must be a LinkedIn URL'
    }
  )
  .transform((val) => normalizeLinkedinUrl(val));

export const CreateProspectReqSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  companyId: z.uuid(),
  domain: domainSchema.nullish(),
  phone: phoneSchema.nullish(),
  salary: z.number().positive().nullish(),
  department: z.string().trim().min(1).nullish(),
  linkedinUrl: linkedinSchema.nullish(),
  title: z.string().trim().min(1).nullish()
});

export type CreateProspectReq = z.infer<typeof CreateProspectReqSchema>
