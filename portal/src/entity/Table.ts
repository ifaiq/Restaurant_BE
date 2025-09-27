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
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Restaurant } from './Restaurant';
import { User } from './User';
import { Tenant } from './Tenant';

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
  CLEANING = 'CLEANING',
}

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty({ message: 'Table number is required' })
  @IsString({ message: 'Table number must be a string' })
  @MaxLength(20, { message: 'Table number must not exceed 20 characters' })
  tableNumber!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Table name must be a string' })
  @MaxLength(100, { message: 'Table name must not exceed 100 characters' })
  tableName?: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  @IsNotEmpty({ message: 'Restaurant is required' })
  restaurant!: Restaurant;

  @Column({ type: 'enum', enum: TableStatus, default: TableStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(TableStatus, { message: 'Invalid table status' })
  status?: TableStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Seating capacity must be a number' })
  @IsPositive({ message: 'Seating capacity must be a positive number' })
  seatingCapacity?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'QR code must be a string' })
  @MaxLength(500, { message: 'QR code must not exceed 500 characters' })
  qrCode?: string;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'isDeleted must be a boolean value' })
  isDeleted?: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  @IsNotEmpty({ message: 'Tenant ID is required' })
  tenantId!: Tenant;

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
