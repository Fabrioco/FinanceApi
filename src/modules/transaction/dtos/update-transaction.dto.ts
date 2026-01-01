import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TransactionType } from '../entity/transaction.entity';

export class UpdateTransactionDto {
  @ApiProperty({ example: 'Salary for June', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 2500.75, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Value must be a number' })
  @IsPositive({ message: 'Value must be greater than zero' })
  value?: number;

  @ApiProperty({ example: 'income', enum: TransactionType, required: false })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'Type must be INCOME or EXPENSE',
  })
  type?: TransactionType;

  @ApiProperty({ example: 'Salary', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: '2025-12-24', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be YYYY-MM-DD' })
  date?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Only for fixed transactions',
  })
  @IsOptional()
  @IsNumber()
  originId?: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Index of the installment (starts at 1)',
  })
  @IsOptional()
  @IsNumber()
  installmentIndex?: number;

  @ApiProperty({
    example: 12,
    required: false,
    description: 'Total number of installments',
  })
  @IsOptional()
  @IsNumber()
  installmentTotal?: number;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Parent transaction id (installment group)',
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
