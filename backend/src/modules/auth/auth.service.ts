import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleSlug, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto
} from '../../common/dto';
import { AuthUser } from '../../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditLogsService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const userCount = await this.prisma.user.count();
    const roleSlug = userCount === 0 ? RoleSlug.SUPER_ADMIN : dto.role ?? RoleSlug.BUYER;
    if (roleSlug === RoleSlug.SUPER_ADMIN && userCount > 0) {
      throw new BadRequestException('Không thể đăng ký Super Admin công khai');
    }

    const role = await this.prisma.role.findUniqueOrThrow({ where: { slug: roleSlug } });
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        cooperativeId: dto.cooperativeId,
        roles: {
          create: {
            roleId: role.id
          }
        }
      },
      include: this.includeRoles()
    });

    await this.audit.record({
      action: 'auth.register',
      entity: 'User',
      entityId: user.id,
      cooperativeId: user.cooperativeId
    });

    const tokens = await this.issueTokens(user);
    return { user: this.serializeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: this.includeRoles()
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đang bị khóa hoặc chưa hoạt động');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await this.audit.record({
      user: this.toAuthUser(user),
      action: 'auth.login',
      entity: 'User',
      entityId: user.id,
      cooperativeId: user.cooperativeId
    });

    const tokens = await this.issueTokens(user);
    return { user: this.serializeUser(user), ...tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefresh(dto.refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: this.includeRoles()
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const ok = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!ok) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const tokens = await this.issueTokens(user);
    return { user: this.serializeUser(user), ...tokens };
  }

  async logout(user: AuthUser) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null }
    });
    await this.audit.record({ user, action: 'auth.logout', entity: 'User', entityId: user.id });
    return { loggedOut: true };
  }

  async me(user: AuthUser) {
    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: this.includeRoles()
    });
    if (!found) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return this.serializeUser(found);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) {
      return { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.' };
    }

    const token = nanoid(32);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: await bcrypt.hash(token, 12),
        resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });

    return {
      message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.',
      devToken: process.env.NODE_ENV === 'production' ? undefined : token
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.resetTokenHash || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const ok = await bcrypt.compare(dto.token, user.resetTokenHash);
    if (!ok) {
      throw new BadRequestException('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, 12),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        refreshTokenHash: null
      }
    });

    return { reset: true };
  }

  async changePassword(user: AuthUser, dto: ChangePasswordDto) {
    const found = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!found) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    const ok = await bcrypt.compare(dto.currentPassword, found.passwordHash);
    if (!ok) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
        refreshTokenHash: null
      }
    });
    await this.audit.record({ user, action: 'auth.change_password', entity: 'User', entityId: user.id });
    return { changed: true };
  }

  async issueTokens(user: User & { roles: { role: { slug: RoleSlug; permissions: unknown } }[] }) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((item) => item.role.slug)
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'replace-with-a-long-access-secret',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as never
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'replace-with-a-long-refresh-secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as never
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, 12)
      }
    });
    return { accessToken, refreshToken };
  }

  serializeUser(user: User & { roles: { role: { slug: RoleSlug; permissions: unknown; name?: string } }[] }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      cooperativeId: user.cooperativeId,
      roles: user.roles.map((item) => item.role.slug),
      permissions: user.roles.flatMap((item) => item.role.permissions as string[]),
      createdAt: user.createdAt
    };
  }

  private includeRoles() {
    return {
      roles: {
        include: {
          role: true
        }
      }
    } as const;
  }

  private toAuthUser(user: User & { roles: { role: { slug: RoleSlug; permissions: unknown } }[] }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      cooperativeId: user.cooperativeId,
      roles: user.roles.map((item) => item.role.slug),
      permissions: user.roles.flatMap((item) => item.role.permissions as string[])
    };
  }

  private async verifyRefresh(refreshToken: string) {
    try {
      return await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'replace-with-a-long-refresh-secret'
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
