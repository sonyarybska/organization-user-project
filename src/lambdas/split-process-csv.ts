/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getProspectRepo } from 'src/repos/prospect.repo';
import { getCompanyRepo } from 'src/repos/company.repo';
import { getCsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { getTypeOrmTransactionService } from 'src/services/typeorm/typeorm-transaction.service';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { normalizeDomain, normalizeLinkedinUrl, normalizePhoneNumber } from 'src/api/helpers/normalization';
import { ImportCsvProspect } from 'src/api/routes/organizations/prospects/csv-import-records/schemas/ImportCsvProspectSchema';
import { getAIService } from 'src/services/ai/ai.service';
import { IAIService } from 'src/types/interfaces/AIService';

interface ProcessCsvRowMessage {
  importRecordId: string;
  row: Partial<ImportCsvProspect>;
  isDuplicate: boolean;
}

async function calculateProspectScore(aiService: IAIService, prospect: Record<string, any>): Promise<number> {
  const prompt = `
You are a sales intelligence AI. Analyze this prospect and calculate a SALES READINESS SCORE (0-10).

PROSPECT DATA:
- Name: ${prospect.firstName || 'unknown'} ${prospect.lastName || 'unknown'}
- Email: ${prospect.email || 'none'}
- Phone: ${prospect.phone || 'none'}
- Job Title: ${prospect.title || 'unknown'}
- Department: ${prospect.department || 'unknown'}
- Company: ${prospect.companyId ? 'linked' : 'not linked'}
- LinkedIn: ${prospect.linkedinUrl || 'none'}
- Salary: ${prospect.salary != null ? '$' + prospect.salary : 'unknown'}
- Domain: ${prospect.domain || 'unknown'}

SCORING CRITERIA:
- Contact quality (email + phone = high value)
- Decision maker potential (title, department)
- Research ability (LinkedIn, company link)
- Budget indicator (salary info)

Return JSON: { "score": number }
`;

  const response = await aiService.callAI<{ score: number }>(prompt, {
    model: 'llama-3.3-70b-versatile',
    maxTokens: 100,
    temperature: 0.3
  });

  return Math.max(0, Math.min(10, Math.round(response.score)));
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!event.Records.length) {
    return;
  }

  const db = await getDb({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    dbName: process.env.PGDATABASE,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD
  });

  const transactionService = getTypeOrmTransactionService(db);

  const prospectRepo = getProspectRepo(db);
  const companyRepo = getCompanyRepo(db);
  const importRepo = getCsvImportRecordRepo(db);
  const aiService = getAIService({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  for (const record of event.Records) {
    const { importRecordId, row, isDuplicate } = JSON.parse(record.body) as ProcessCsvRowMessage;

    try {
      if (!importRecordId || !row) {
        throw new Error('Missing required fields in the message');
      }
      const { status } = await importRepo.getById(importRecordId);

      if (status !== CsvImportStatusEnum.BUSY) {
        console.log(`Skipping processing for importRecordId ${importRecordId} with status ${status}`);
        continue;
      }
      if (isDuplicate) {
        console.log('Duplicate email found in database, skipping:', row.email);
        await importRepo.incrementSkippedRows(importRecordId);
        continue;
      }

      const emailExists = await prospectRepo.existsByEmailAndOrganizationId(row.email!.toLowerCase(), row.organizationId!);

      if (emailExists) {
        console.log('Duplicate email found in database, skipping:', row.email);
        await importRepo.incrementSkippedRows(importRecordId);
        continue;
      }

      await transactionService.run(async (connection) => {
        const prospectRepoTx = prospectRepo.reconnect(connection);
        const companyRepoTx = companyRepo.reconnect(connection);
        const importRepoTx = importRepo.reconnect(connection);

        const { companyName, companyAddress, companyLinkedinUrl, ...prospectData } = row;

        const normalizedDomain = normalizeDomain(prospectData.domain!);
        const normalizedCompanyLinkedinUrl = normalizeLinkedinUrl(companyLinkedinUrl);

        const company = await companyRepoTx.upsert({
          domain: normalizedDomain,
          source: SourceTypeEnum.CSV_IMPORT,
          linkedinUrl: normalizedCompanyLinkedinUrl,
          name: companyName,
          address: companyAddress,
          organizationId: prospectData.organizationId!
        });

        const normalizedProspectLinkedinUrl = normalizeLinkedinUrl(prospectData.linkedinUrl);
        const normalizedPhone = normalizePhoneNumber(prospectData.phone);

        const prospectToCreate = {
          ...prospectData,
          linkedinUrl: normalizedProspectLinkedinUrl,
          phone: normalizedPhone,
          companyId: company.id,
          source: SourceTypeEnum.CSV_IMPORT
        };

        let score = 0;
        try {
          score = await calculateProspectScore(aiService, prospectToCreate);
        } catch (err) {
          console.log('Failed to get AI score, defaulting to 0:', err);
        }

        await prospectRepoTx.create({ ...prospectToCreate, score });

        await importRepoTx.incrementProcessedRows(importRecordId);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await importRepo.handleImportError(importRecordId, errorMessage);

      console.log('Error processing row for importRecordId', importRecordId, ':', errorMessage);
    } finally {
      const isDone = await importRepo.checkIfDone(importRecordId);

      if (isDone) {
        await importRepo.update(importRecordId, {
          status: CsvImportStatusEnum.DONE
        });
      }
    }
  }
};
