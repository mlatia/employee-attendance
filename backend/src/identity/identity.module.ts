import { Module } from '@nestjs/common';
import { IDENTITY_SERVICE } from '../common/identity.contract';
import { tcpClient } from '../common/tranport';
import { IdentityClient } from './identity.client';

@Module({
  imports: [tcpClient(IDENTITY_SERVICE, 'IDENTITY_HOST', 'IDENTITY_PORT', 3001)],
  providers: [IdentityClient],
  exports: [IdentityClient],
})
export class IdentityModule {}