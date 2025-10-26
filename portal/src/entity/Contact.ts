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
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name!: string;

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

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @Length(10, 2000, {
    message: 'Message must be between 10 and 2000 characters',
  })
  message!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject?: string;

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
