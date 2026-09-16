import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto
} from '../../common/dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser } from '../../common/types';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.withCookies(response, this.auth.register(dto));
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.withCookies(response, this.auth.login(dto));
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.withCookies(response, this.auth.refresh(dto, request.cookies?.refresh_token));
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @Post('logout')
  async logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) response: Response) {
    const options = this.cookieOptions();
    response.clearCookie('access_token', options);
    response.clearCookie('refresh_token', options);
    return this.auth.logout(user);
  }

  @Public()
  @HttpCode(200)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @HttpCode(200)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user);
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @Post('change-password')
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user, dto);
  }

  private async withCookies(response: Response, resultPromise: Promise<unknown>) {
    const result = (await resultPromise) as { accessToken?: string; refreshToken?: string };
    const options = this.cookieOptions();
    if (result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        ...options,
        maxAge: 1000 * 60 * 15
      });
    }
    if (result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        ...options,
        maxAge: 1000 * 60 * 60 * 24 * 30
      });
    }
    return result;
  }

  private cookieOptions() {
    const domain = process.env.AUTH_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.htxonline.vn' : undefined);
    return {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
      secure: process.env.NODE_ENV === 'production',
      ...(domain ? { domain } : {})
    };
  }
}
