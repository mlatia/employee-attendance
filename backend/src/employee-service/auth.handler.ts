import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IDENTITY_PATTERNS, LoginPayload, SessionPayload } from '../common/identity.contract';
import { InternalGuard } from '../common/internal.guard';
import type { Envelope, ServiceCall } from '../common/rpc';
import { IdentityService } from './identity.service';

@Controller()
@UseGuards(InternalGuard)
export class AuthHandler {
  constructor(private readonly identity: IdentityService) {}

  @MessagePattern(IDENTITY_PATTERNS.login)
  login(@Payload() { data }: ServiceCall<LoginPayload>) {
    return this.identity.login(data);
  }

  @MessagePattern(IDENTITY_PATTERNS.session)
  session(@Payload() { data }: ServiceCall<SessionPayload>) {
    return this.identity.session(data);
  }

  @MessagePattern(IDENTITY_PATTERNS.revoke)
  revoke(@Payload() { actor }: Envelope) {
    return this.identity.revoke(actor.id); // hanya sesi milik aktor sendiri
  }
}