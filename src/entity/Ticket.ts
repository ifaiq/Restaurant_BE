import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Tenant } from './Tenant';
import { TicketComment } from './TicketComment';

enum TicketPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

enum TicketStatus {
  SOLVED = 'solved',
  PENDING = 'pending',
  CLOSED = 'closed',
  IN_PROGRESS = 'in-progress',
}
@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  subject!: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.NORMAL,
  })
  priority?: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status?: TicketStatus;

  @Column('text')
  description!: string;

  @OneToMany(
    () => TicketComment,
    (response: { ticket: any }) => response.ticket,
    {
      cascade: true,
    },
  )
  responses?: TicketComment[];

  @Column('jsonb', { nullable: true })
  custom_fields?: { id: string; value: any }[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
