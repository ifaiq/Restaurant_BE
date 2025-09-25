import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Tenant } from './Tenant';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

interface Permission {
  route: string;
  actions: {
    POST: boolean;
    GET: boolean;
    PUT: boolean;
    DELETE: boolean;
  };
  visible: boolean;
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @OneToMany(() => User, (user) => user.role)
  @IsOptional()
  users?: User[];

  @Column({ type: 'jsonb', default: [] })
  @IsArray()
  permissions?: Array<Permission> = [];

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  @IsObject()
  tenantId!: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
