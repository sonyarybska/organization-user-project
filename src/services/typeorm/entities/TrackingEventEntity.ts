import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { OrganizationEntity } from './OrganizationEntity';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';

@Entity('TrackingEvent')
export class TrackingEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  eventType: EventTypeEnum;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => OrganizationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ type: 'varchar', nullable: true })
  resourceType: EventResourceTypeEnum;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
