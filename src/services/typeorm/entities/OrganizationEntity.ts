import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Check } from 'typeorm';
import { UserOrganizationEntity } from './UserOrganizationEntity';
import { ProspectEntity } from './ProspectEntity';
import { CsvImportRecordEntity } from './CsvImportRecordEntity';

@Entity('Organization')
@Check('OrganizationMonthlyImportLimitPositive', '"monthlyImportLimit" >= 0')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'int', default: 1000 })
  monthlyImportLimit: number;

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
