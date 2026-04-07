import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventSourceEnum } from 'src/types/enums/EventSourceEnum';

@Entity('TrackingEvent')
export class TrackingEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  eventType: EventTypeEnum;

  @Column({ type: 'varchar' })
  userEmail: string;

  @ManyToOne(() => OrganizationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ type: 'varchar', nullable: true })
  resourceType: EventResourceTypeEnum;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', nullable: true })
  source: EventSourceEnum;

  @Column({ type: 'varchar', nullable: true })
  sourceName: string;

  @CreateDateColumn()
  createdAt: Date;
}
