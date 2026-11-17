import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IdentityModule } from '../identity/identity.module';
import { RolesGuard } from './auth.decorator';
import { SESSION_TTL_SECONDS } from './auth.constants';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    IdentityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: SESSION_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, RolesGuard],
  // diekspor supaya module lain bisa memakai @Auth() (guard butuh JwtService dan IdentityClient)
  exports: [IdentityModule, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}