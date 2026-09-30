import { buildApp } from './app';
const app = buildApp(true);
const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
for (const signal of ['SIGINT','SIGTERM']) process.once(signal,() => { void app.close(); });
try { await app.listen({ port, host:process.env.HOST ?? '127.0.0.1' }); }
catch (error) { app.log.error(error); process.exitCode = 1; }
