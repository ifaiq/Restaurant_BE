import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Menu } from './Menu';
import { User } from './User';
import { Tenant } from './Tenant';

@Entity()
export class MenuModifier {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Menu, (item) => item.modifiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuItemId' })
  @IsNotEmpty({ message: 'Menu item is required' })
  menu!: Menu;

  @Column()
  @IsNotEmpty({ message: 'Modifier name is required' })
  @IsString({ message: 'Modifier name must be a string' })
  @MaxLength(100, { message: 'Modifier name must not exceed 100 characters' })
  name!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price?: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenantId!: Tenant;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description!: string;

  @Column({ default: true })
  @IsOptional()
  isActive?: boolean;

  @Column({ default: false })
  @IsOptional()
  isRequired?: boolean;

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
}
