import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TestTypesService } from '../test-types/test-types.service';

@Injectable()
export class AuthService {
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
    await this.testTypesService.initializeDefaultsForUser(user._id.toString());

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
    );
    await this.storeRefreshHash(user._id.toString(), tokens.refreshToken);
    return {
      ...tokens,
      user: this.toAuthUser(user),
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      return;
    }

    if (payload.type === 'refresh') {
      await this.usersService.updateRefreshToken(payload.sub, null);
    }
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
    return {
      ...tokens,
      user: this.toAuthUser(user),
    };
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
    return {
      ...tokens,
      user: this.toAuthUser(user),
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toAuthUser(user);
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

  private toAuthUser(user: UserDocument) {
    return {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    };
  }
}
