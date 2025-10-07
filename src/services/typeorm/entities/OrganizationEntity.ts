import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserOrganizationEntity } from './UserOrganizationEntity';
import { ProspectEntity } from './ProspectEntity';
import { CsvImportRecordEntity } from './CsvImportRecordEntity';

@Entity('Organization')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
  
  @OneToMany(() => UserOrganizationEntity, (user) => user.organization)
  userOrganizations: UserOrganizationEntity[];

  @OneToMany(() => ProspectEntity, (prospect) => prospect.organization)
  prospects: ProspectEntity[];

  @OneToMany(() => CsvImportRecordEntity, (csv) => csv.organization)
  csvImports: CsvImportRecordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
