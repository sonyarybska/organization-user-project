/* eslint-disable no-param-reassign */

import { FastifyRequest } from 'fastify';

export async function trackingContextHook(request: FastifyRequest): Promise<void> {
  const ipAddress = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip || null;

  const userAgent = request.headers['user-agent'] || null;

  request.trackingContext = {
    ipAddress,
    userAgent
  };
}
