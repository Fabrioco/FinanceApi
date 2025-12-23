import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login-request.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { UserResponseDto } from './dtos/userResponse.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private toUserResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      currency: user.currency,
      theme: user.theme,
      biometricEnabled: user.biometricEnabled,
      picProfile: user.picProfile,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
  async login(dto: LoginRequestDto): Promise<any> {
    const user = await this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();
    if (!user) throw new UnauthorizedException('Credentials are incorrect');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credentials are incorrect');
    }

    user.lastLogin = new Date();
    await this.repo.save(user);

    const payload = { sub: user.id, email: user.email, name: user.name };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
    });
    return { token, user: this.toUserResponse(user) };
  }

  async register(dto: RegisterRequestDto): Promise<any> {
    const user = await this.repo.findOneBy({ email: dto.email });
    if (user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    await this.repo.save(newUser);
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
    });
    return { token, user: this.toUserResponse(newUser) };
  }
}
