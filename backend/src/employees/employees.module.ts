import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IdentityModule } from '../identity/identity.module';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [AuthModule, IdentityModule],
  controllers: [EmployeesController],
})
export class EmployeesModule {}