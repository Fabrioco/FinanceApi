import { ApiProperty } from '@nestjs/swagger';
import { Theme, UserPlan } from '../entity/user.entity';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: UserPlan.FREE })
  plan: string;

  @ApiProperty({ example: Theme.SYSTEM })
  theme: string;

  @ApiProperty({ example: true })
  biometricEnabled: boolean;
}
