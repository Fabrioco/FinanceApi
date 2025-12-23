import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'John Doe', required: true })
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: 'user@example.com', required: true })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: '11912345678', required: false })
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(11, { message: 'Phone must be at most 11 characters long' })
  @IsOptional()
  phone: string;

  @ApiProperty({ example: '12345678', required: true })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
