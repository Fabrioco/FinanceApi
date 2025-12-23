import { Currency, Theme, UserPlan } from '../entity/user.entity';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  plan: UserPlan;
  currency: Currency;
  theme: Theme;
  biometricEnabled: boolean;
  picProfile?: string;
  isVerified: boolean;
  createdAt: Date;
}
