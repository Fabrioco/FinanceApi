import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  // =====================
  // CAMPOS BASE
  // =====================

  @ApiProperty({ example: 'Salary' })
  @IsString()
  title: string;

  @ApiProperty({ example: 2500.75 })
  @IsNumber()
  @Min(0.01)
  value: number;

  @ApiProperty({ example: 'income', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  category: string;

  @ApiProperty({ example: '2025-10-15' })
  @IsDateString()
  date: string;

  // =====================
  // FIXA
  // =====================

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  /**
   * Usado apenas quando for
   * uma ocorrência específica da fixa
   */
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  originId?: number;

  /**
   * YYYY-MM
   */
  @ApiProperty({ example: '2025-10' })
  @IsOptional()
  @IsString()
  startMonth?: string;

  /**
   * YYYY-MM ou null
   */
  @ApiProperty({ example: '2025-10' })
  @IsOptional()
  @IsString()
  endMonth?: string | null;

  // =====================
  // PARCELAMENTO
  // =====================

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isInstallment?: boolean;

  /**
   * TOTAL de parcelas
   * (somente na criação)
   */
  @ApiProperty({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  installmentTotal?: number;

  /**
   * Índice da parcela
   * (uso interno / edição)
   */
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  installmentIndex?: number;

  /**
   * ID da transação pai
   * (parcelas já criadas)
   */
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
