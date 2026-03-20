import { IProspectRepo } from 'src/repos/prospect.repo';
import { IAIService } from 'src/services/ai/ai.service';
import { HttpError } from 'src/api/errors/HttpError';

type Params = {
  prospectId: string;
  organizationId: string;
  prospectRepo: IProspectRepo;
  aiService: IAIService;
};

export async function getProspectScoreByIdAndOrganizationId({ aiService, organizationId, prospectId, prospectRepo }: Params) {
  const prospect = await prospectRepo.getByIdAndOrganizationId(prospectId, organizationId);

  if (!prospect) {
    throw new HttpError(404, 'Prospect not found');
  }

  const prompt = `
You are a sales intelligence AI. Analyze this prospect and calculate a SALES READINESS SCORE (1-10).

PROSPECT DATA:
- Name: ${prospect.firstName || 'unknown'} ${prospect.lastName || 'unknown'}
- Email: ${prospect.email || 'none'}
- Phone: ${prospect.phone || 'none'}
- Job Title: ${prospect.title || 'unknown'}
- Department: ${prospect.department || 'unknown'}
- Company ID: ${prospect.companyId ? 'linked' : 'not linked'}
- LinkedIn: ${prospect.linkedinUrl || 'none'}
- Salary: ${prospect.salary !== null ? '$' + prospect.salary : 'unknown'}
- Domain: ${prospect.domain || 'unknown'}

SCORING CRITERIA:
- Contact quality (email + phone = high value)
- Decision maker potential (title, department)
- Research ability (LinkedIn, company link)
- Budget indicator (salary info)

Return JSON with your analysis:
{
  "score": number (1-10),
  "reason": "brief explanation of the score",
  "strengths": ["list", "of", "strengths"],
  "weaknesses": ["what", "is", "missing"]
}
`;

  const response = await aiService.callAI<{
    score: number;
    reason: string;
    strengths: string[];
    weaknesses: string[];
  }>(prompt);

  return {
    score: Math.round(response.score),
    reason: response.reason,
    strengths: response.strengths || [],
    weaknesses: response.weaknesses || []
  };
}
