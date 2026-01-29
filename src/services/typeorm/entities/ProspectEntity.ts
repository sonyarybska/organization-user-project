import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { OrganizationEntity } from './OrganizationEntity';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { CompanyEntity } from './CompanyEntity';

@Index(['email', 'organizationId'], { unique: true })
@Entity('Prospect')
export class ProspectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  salary: number;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  title: string;

  @ManyToOne(() => UserEntity, (user) => user.prospects, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.prospects,
    {
      onDelete: 'CASCADE'
    }
  )
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ nullable: true })
  companyId: string;
  
  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type:'varchar' })
  source: SourceTypeEnum;
}
