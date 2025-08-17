import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { Organization } from 'src/types/Organization';
import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { TransactionService } from 'src/types/TypeOrmTransactionService';

export type CreateOrganizationDto = {
  data: Partial<Organization>
  organizationRepo: IOrganizationRepo
  userOrganizationRepo: IUserOrganizationRepo
  transactionService: TransactionService<TypeOrmConnection>
  userId: string
}
