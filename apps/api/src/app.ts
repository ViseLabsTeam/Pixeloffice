import Fastify from 'fastify';
import { demoMap } from '@pixel-office/contracts/demo';

export function buildApp(logger = false) {
  const app = Fastify({ logger, bodyLimit: 64 * 1024 });
  app.get('/healthz',async () => ({ status:'ok', stage:'I1', protocolVersion:1 }));
  // Only the public demonstration is exposed. Tenant maps require I2 authorization.
  app.get<{ Params: { version: string } }>('/maps/:version/manifest',{
    schema: { params: { type:'object', additionalProperties:false, required:['version'], properties:{ version:{ type:'string', pattern:'^[a-z0-9-]{1,128}$' } } } }
  },async (request,reply) => {
    if (request.params.version !== demoMap.mapVersion) return reply.code(404).send({ code:'MAP_NOT_FOUND' });
    reply.header('Cache-Control','no-cache');
    return demoMap;
  });
  return app;
}
