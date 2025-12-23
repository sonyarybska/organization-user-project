import { z } from 'zod';

import { ProspectResSchema } from 'src/api/routes/organizations/prospects/schemas/ProspectResSchema';

export const PaginatedProspectsResSchema = z.object({
    prospects: ProspectResSchema.array(),
    count: z.number()
});