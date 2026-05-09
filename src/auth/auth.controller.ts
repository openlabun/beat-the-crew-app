import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 201, description: 'Login successful. Returns a JWT access token' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}