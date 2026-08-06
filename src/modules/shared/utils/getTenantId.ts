import {Request} from 'express';

export function getTenantId(req: Request) {
  if (!req.session.user) {
    throw new Error('No session');
  }

  return req.session.user.tenantId;
}
