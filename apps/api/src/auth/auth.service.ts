import {
  Injectable,
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TestTypesService } from '../test-types/test-types.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly testTypesService: TestTypesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
    });
    this.initializeTestTypesInBackground(user._id.toString());

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
    );
    await this.storeRefreshHash(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
    );
    await this.storeRefreshHash(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const hashMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!hashMatches) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
    );
    await this.storeRefreshHash(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, type: 'access' },
        { expiresIn: this.configService.get<string>('jwtExpiration') },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: 'refresh' },
        { expiresIn: this.configService.get<string>('jwtRefreshExpiration') },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  private initializeTestTypesInBackground(userId: string): void {
    void this.testTypesService.initializeDefaultsForUser(userId).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize default test types for user ${userId}: ${message}`,
      );
    });
  }
}
