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
import { ProspectSourceEnum } from 'src/types/enums/ProspectSourceEnum';

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
  companyName: string;

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

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  source: ProspectSourceEnum;
}
