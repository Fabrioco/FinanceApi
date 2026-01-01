import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../entity/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Salary' })
  title: string;

  @ApiProperty({ example: 2500.75 })
  value: number;

  @ApiProperty({ example: 'income', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ example: 'Salary' })
  category: string;

  @ApiProperty({ example: '2023-10-15' })
  date: Date;

  @ApiProperty({ example: true })
  isFixed: boolean;

  @ApiProperty({ example: true })
  isInstallment: boolean;

  @ApiProperty({ example: 1 })
  originId?: number;

  @ApiProperty({ example: 1 })
  installmentIndex?: number;

  @ApiProperty({ example: 3 })
  installmentTotal?: number;

  @ApiProperty({ example: 1 })
  parentId?: number;

  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'user@example.com',
      phone: '11912345678',
      plan: 'free',
      currency: 'BRL',
      theme: 'system',
      biometricEnabled: true,
      picProfile: 'https://example.com/profile.jpg',
      isVerified: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    plan: string;
    currency: string;
    theme: string;
    biometricEnabled: boolean;
    picProfile: string;
    isVerified: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({ example: 1 })
  userId: number;
}
