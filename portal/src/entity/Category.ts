import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  Unique,
  Index,
} from 'typeorm';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Restaurant } from './Restaurant';
import { Tenant } from './Tenant';
import { User } from './User';

@Entity()
@Unique(['restaurantId', 'name'])
@Index(['restaurantId', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name!: string;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurantId!: Restaurant;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: Tenant;

  @Column({ default: false })
  @IsBoolean({ message: 'isDeleted must be a boolean value' })
  isDeleted?: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deletedBy' })
  @IsOptional()
  deletedBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  @IsOptional()
  createdBy?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  @IsOptional()
  updatedBy?: User;
}
