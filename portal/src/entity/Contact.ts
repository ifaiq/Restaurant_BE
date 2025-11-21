import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  Length,
} from 'class-validator';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty({ message: 'Restaurant name is required' })
  @IsString({ message: 'Restaurant name must be a string' })
  @Length(2, 200, {
    message: 'Restaurant name must be between 2 and 200 characters',
  })
  restaurantName!: string;

  @Column()
  @IsNotEmpty({ message: 'Contact name is required' })
  @IsString({ message: 'Contact name must be a string' })
  @Length(2, 100, {
    message: 'Contact name must be between 2 and 100 characters',
  })
  contactName!: string;

  @Column()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(10, 20, { message: 'Phone must be between 10 and 20 characters' })
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  location?: string;

  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large', 'xlarge'],
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Seating capacity must be a string' })
  seatingCapacity?: 'small' | 'medium' | 'large' | 'xlarge';

  @Column({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'isRead must be a boolean value' })
  isRead?: boolean;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'isDeleted must be a boolean value' })
  isDeleted?: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
