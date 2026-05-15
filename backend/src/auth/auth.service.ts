import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly jwtService: JwtService) {}

  login(dto: LoginDto): { accessToken: string } {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (dto.username !== adminUsername || dto.password !== adminPassword) {
      this.logger.warn(`Failed login attempt for user: ${dto.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ role: 'admin' });
    this.logger.log(`User logged in: ${dto.username}`);
    return { accessToken };
  }
}