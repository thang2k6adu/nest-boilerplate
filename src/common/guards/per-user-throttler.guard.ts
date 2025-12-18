import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class PerUserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    const user = (req as Request).user;
    if (user) {
      return `user:${user.id}`;
    }
    return (req as Request).ip || 'unknown';
  }
}

