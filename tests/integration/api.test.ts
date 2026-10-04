import { afterEach, describe, expect, it } from 'vitest';
import Ajv from 'ajv';
import { doorSetSchema, validateMap } from '@pixel-office/contracts';
import { buildApp } from '../../apps/api/src/app';
const applications:ReturnType<typeof buildApp>[]=[];
afterEach(async()=>{await Promise.all(applications.splice(0).map(app=>app.close()));});
describe('V2-RNF-006 — API inicial y contratos (cobertura parcial)',()=>{
  it('sirve salud y únicamente el mapa público validado',async()=>{
    const app=buildApp(); applications.push(app);
    expect((await app.inject('/healthz')).json()).toMatchObject({status:'ok',stage:'I1'});
    const response=await app.inject('/maps/demo-v1/manifest'); expect(response.statusCode).toBe(200);
    expect(validateMap(response.json()).scenes).toHaveLength(2);
    expect((await app.inject('/maps/unknown-map/manifest')).statusCode).toBe(404);
    expect((await app.inject('/maps/INVALID/manifest')).statusCode).toBe(400);
    expect((await app.inject({method:'POST',url:'/media/token',payload:{role:'ADMIN'}})).statusCode).toBe(404);
  });
  it('rechaza versiones, revisión inválida y rol inyectado en comandos',()=>{
    const validate=new Ajv().compile(doorSetSchema);
    const valid={protocolVersion:1,type:'DOOR_SET',sessionId:'session',epoch:1,requestId:'request',expectedRevision:0,payload:{doorId:'door',open:true}};
    expect(validate(valid)).toBe(true);
    expect(validate({...valid,protocolVersion:2})).toBe(false);
    expect(validate({...valid,role:'ADMIN'})).toBe(false);
    expect(validate({...valid,expectedRevision:-1})).toBe(false);
  });
});
