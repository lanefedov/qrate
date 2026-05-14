import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const REFRESH_TOKEN_COOKIE = 'qrate_refresh_token';

type SameSiteOption = 'lax' | 'strict' | 'none';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered, access token returned' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshToken(cookieHeader);
    const tokens = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Refresh cookie cleared' })
  async logout(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getOptionalRefreshToken(cookieHeader);
    await this.authService.logout(refreshToken);
    this.clearRefreshCookie(res);
    return { success: true };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.configService.get<boolean>('cookieSecure') ?? false,
      sameSite: this.configService.get<SameSiteOption>('cookieSameSite') ?? 'lax',
      domain: this.configService.get<string | undefined>('cookieDomain'),
      path: '/auth',
      maxAge: this.configService.get<number>('refreshCookieMaxAgeMs'),
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.configService.get<boolean>('cookieSecure') ?? false,
      sameSite: this.configService.get<SameSiteOption>('cookieSameSite') ?? 'lax',
      domain: this.configService.get<string | undefined>('cookieDomain'),
      path: '/auth',
    });
  }

  private getRefreshToken(cookieHeader: string | undefined): string {
    const refreshToken = this.getOptionalRefreshToken(cookieHeader);
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    return refreshToken;
  }

  private getOptionalRefreshToken(cookieHeader: string | undefined): string | undefined {
    if (!cookieHeader) {
      return undefined;
    }

    return cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${REFRESH_TOKEN_COOKIE}=`))
      ?.slice(REFRESH_TOKEN_COOKIE.length + 1);
  }
}
