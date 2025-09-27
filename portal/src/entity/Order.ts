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
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Restaurant } from './Restaurant';
import { Table } from './Table';
import { User } from './User';
import { Tenant } from './Tenant';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
}

export interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  specialInstructions?: string;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'Order number is required' })
  @IsString({ message: 'Order number must be a string' })
  @MaxLength(50, { message: 'Order number must not exceed 50 characters' })
  orderNumber!: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  @IsNotEmpty({ message: 'Restaurant is required' })
  restaurant!: Restaurant;

  @ManyToOne(() => Table, { nullable: true })
  @JoinColumn({ name: 'tableId' })
  @IsOptional()
  table?: Table;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  paymentStatus?: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod?: PaymentMethod;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Subtotal must be a number' })
  @IsPositive({ message: 'Subtotal must be a positive number' })
  subtotal?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Tax amount must be a number' })
  @IsPositive({ message: 'Tax amount must be a positive number' })
  taxAmount?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Tip amount must be a number' })
  @IsPositive({ message: 'Tip amount must be a positive number' })
  tipAmount?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Discount amount must be a number' })
  @IsPositive({ message: 'Discount amount must be a positive number' })
  discountAmount?: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be a positive number' })
  totalAmount?: number;

  @Column({ type: 'jsonb' })
  @IsNotEmpty({ message: 'Order items are required' })
  @IsArray({ message: 'Order items must be an array' })
  @ValidateNested({ each: true })
  items!: OrderItem[];

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Special instructions must be a string' })
  @MaxLength(1000, {
    message: 'Special instructions must not exceed 1000 characters',
  })
  specialInstructions?: string;

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
