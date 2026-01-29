import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity';

@Index(['domain', 'organizationId'], { unique: true })
@Entity('Company')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  domain: string;

  @Column({ type:'varchar' })
  source: SourceTypeEnum;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
