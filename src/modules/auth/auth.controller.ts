import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginRequestDto } from './dtos/login-request.dto';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dtos/register-request.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<any> {
    return this.service.login(dto);
  }

  @Post('register')
  @ApiBody({ type: RegisterRequestDto })
  @ApiOkResponse({ description: 'User registered successfully' })
  @ApiUnauthorizedResponse({ description: 'Email already exists' })
  async register(@Body() dto: RegisterRequestDto): Promise<any> {
    return this.service.register(dto);
  }
}
