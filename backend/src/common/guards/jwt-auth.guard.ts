import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RoleSlug, UserStatus } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      cookies?: Record<string, string | undefined>;
      user?: unknown;
    }>();
    const authorization = request.headers.authorization;
    const bearer = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    const token = bearer || request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Thiếu access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'replace-with-a-long-access-secret'
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Tài khoản không hoạt động');
      }

      const roles = user.roles.map((item) => item.role.slug);
      const permissions = user.roles.flatMap((item) => item.role.permissions as string[]);

      request.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        cooperativeId: user.cooperativeId,
        roles: roles.length ? roles : [RoleSlug.BUYER],
        permissions
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn');
    }
  }
}
