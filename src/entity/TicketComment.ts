import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Tenant } from './Tenant';
import { Ticket } from './Ticket';

@Entity()
export class TicketComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.responses, {
    onDelete: 'CASCADE',
  })
  ticket!: Ticket;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
