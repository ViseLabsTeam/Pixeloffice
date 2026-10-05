import { describe, expect, it } from 'vitest';
import { demoMap } from '@pixel-office/contracts/demo';
import { assetById, canCloseDoor, canOccupy, facing, initialDoors, move, normalizeInput, occlusionTarget, overlaps, sceneColliders, spriteRect, validateMap, worldRect, type Point, type Rect } from '@pixel-office/contracts';
import { LocalWorld } from '../../apps/web/src/engine/world';

const scene = demoMap.scenes[0]!;
const rect = (x: number,y: number,width: number,height: number): Rect => ({shape:'rect',x,y,width,height});
describe('V2-RF-006/007/010 — movimiento y apoyo (cobertura parcial)',() => {
  it('iguala distancia diagonal/horizontal sin perder intensidad analógica',() => {
    const start = {x:80,y:240};
    const horizontal = move(demoMap,scene,start,{x:1,y:0},0.1,[]);
    const diagonal = move(demoMap,scene,start,{x:1,y:1},0.1,[]);
    expect(Math.hypot(diagonal.x-start.x,diagonal.y-start.y)).toBeCloseTo(horizontal.x-start.x);
    expect(move(demoMap,scene,start,{x:0.25,y:0},0.1,[]).x-start.x).toBeCloseTo(3);
  });
  it('produce la misma distancia a 30 y 60 Hz',() => {
    const simulate = (hz:number) => {
      let position = {x:80,y:240};
      for(let tick=0;tick<hz;tick++) position=move(demoMap,scene,position,{x:1,y:0},1/hz,[]);
      return position.x;
    };
    expect(simulate(30)).toBeCloseTo(simulate(60));
  });
  it('frena ante una pared fina, desliza y limita saltos por lag',() => {
    const obstacle=rect(100,100,1,200);
    const result=move(demoMap,scene,{x:90,y:150},{x:1,y:1},100,[obstacle]);
    expect(result.x).toBeLessThanOrEqual(94); expect(result.y).toBeGreaterThan(150);
    expect(canOccupy(demoMap,scene,result,[obstacle])).toBe(true);
    expect(move(demoMap,scene,{x:80,y:240},{x:1,y:0},100,[]).x).toBe(92);
  });
  it('ignora inputs no finitos y conserva dirección válida en diagonal',() => {
    expect(normalizeInput({x:NaN,y:1})).toEqual({x:0,y:0});
    expect(facing({x:1,y:1},'right')).toBe('right');
    expect(facing({x:1,y:1},'left')).toBe('down');
    expect(facing({x:0,y:0},'up')).toBe('up');
  });
  it('aplica escala al collider local, sin usar el tamaño CSS',() => {
    expect(worldRect(rect(-5,-10,10,10),{x:100,y:200},2)).toEqual(rect(90,180,20,20));
  });
});
describe('V2-RF-005/007/009 — geometría independiente de apariencia (cobertura parcial)',() => {
  it('mantiene sólidos puerta cerrada y muebles',() => {
    const doors=initialDoors(demoMap);
    const closed=sceneColliders(demoMap,scene,doors);
    expect(canOccupy(demoMap,scene,{x:624,y:240},closed)).toBe(false);
    doors['lobby-door']=true;
    expect(canOccupy(demoMap,scene,{x:624,y:240},sceneColliders(demoMap,scene,doors))).toBe(true);
    expect(canOccupy(demoMap,scene,{x:440,y:214},closed)).toBe(false);
    expect(canCloseDoor(demoMap,scene.doors[0]!,[{x:624,y:240}])).toBe(false);
  });
  it('atenúa sólo máscaras delante del avatar y gradualmente al aproximarse',() => {
    const mask=rect(0,0,20,30); const avatar=rect(10,10,10,20);
    expect(occlusionTarget(mask,avatar,true,16)).toBe(0.1);
    expect(occlusionTarget(mask,avatar,false,16)).toBe(1);
    expect(occlusionTarget(mask,rect(28,10,10,20),true,16)).toBeCloseTo(0.55);
    expect(occlusionTarget(mask,rect(50,10,10,20),true,16)).toBe(1);
  });
  it('valida spawns, IDs, versiones y referencias',() => {
    expect(validateMap(structuredClone(demoMap)).scenes).toHaveLength(2);
    const blocked=structuredClone(demoMap); blocked.scenes[0]!.spawnPoints.entry={x:440,y:214,direction:'up'};
    expect(()=>validateMap(blocked)).toThrow('Spawn bloqueado');
    const invalid=structuredClone(demoMap); invalid.scenes[0]!.portals[0]!.destinationSceneId='missing';
    expect(()=>validateMap(invalid)).toThrow('Destino inexistente');
    const duplicate=structuredClone(demoMap); duplicate.assets.push(duplicate.assets[0]!);
    expect(()=>validateMap(duplicate)).toThrow('IDs duplicados');
    expect(()=>validateMap({...demoMap,schemaVersion:2})).toThrow('Manifest inválido');
  });
});
describe('V2-RF-007/009 — tablero completo y pasillo posterior',() => {
  const expectedTabletops:Record<string,Rect> = {
    'desk-negative-x':rect(130,29,350,516),
    'desk-positive-x':rect(94,35,348,515),
    'desk-negative-y':rect(158,215,675,340),
    'desk-positive-y':rect(50,164,685,340)
  };
  const travel=(start:Point,input:Point,collider:Rect) => {
    let position=start;
    for(let tick=0;tick<100;tick++) {
      position=move(demoMap,scene,position,input,1/30,[collider]);
      expect(canOccupy(demoMap,scene,position,[collider])).toBe(true);
    }
    return position;
  };
  for(const sceneItem of demoMap.scenes) for(const object of sceneItem.objects.filter(item=>item.assetId.startsWith('desk-'))) {
    it(`${object.assetId}: bloquea tablero desde atrás, delante, ambos lados y diagonales`,() => {
      const asset=assetById(demoMap,object.assetId);
      const local=asset.colliders[0]!;
      const expected=expectedTabletops[object.assetId]!;
      expect(local).toEqual(rect(expected.x-asset.pivot.x,expected.y-asset.pivot.y,expected.width,expected.height));
      const collider=worldRect(local,object.position,asset.worldScale);
      const sprite=spriteRect(demoMap,object.assetId,object.position);
      expect(collider.height).toBeLessThan(sprite.height);
      expect(collider.y+collider.height).toBeLessThan(sprite.y+sprite.height);
      const center={x:collider.x+collider.width/2,y:collider.y+collider.height/2};
      const rear=travel({x:center.x,y:collider.y-12},{x:0,y:1},collider);
      expect(rear.y).toBeLessThanOrEqual(collider.y);
      expect(rear.y).toBeGreaterThan(collider.y-4);
      const front=travel({x:center.x,y:collider.y+collider.height+18},{x:0,y:-1},collider);
      expect(front.y).toBeGreaterThanOrEqual(collider.y+collider.height+6);
      expect(front.y).toBeLessThan(collider.y+collider.height+10);
      const left=travel({x:collider.x-18,y:center.y},{x:1,y:0},collider);
      expect(left.x).toBeLessThanOrEqual(collider.x-6);
      const right=travel({x:collider.x+collider.width+18,y:center.y},{x:-1,y:0},collider);
      expect(right.x).toBeGreaterThanOrEqual(collider.x+collider.width+6);
      travel({x:collider.x-18,y:collider.y-18},{x:1,y:1},collider);
      travel({x:collider.x+collider.width+18,y:collider.y-18},{x:-0.5,y:0.5},collider);
      travel({x:collider.x-18,y:collider.y+collider.height+18},{x:0.5,y:-0.5},collider);
      const behind={x:center.x,y:collider.y-2};
      expect(canOccupy(demoMap,scene,behind,[collider])).toBe(true);
      expect(overlaps(worldRect(asset.occlusionMask!,object.position,asset.worldScale),spriteRect(demoMap,demoMap.avatar.views.down,behind))).toBe(true);
      expect(occlusionTarget(worldRect(asset.occlusionMask!,object.position,asset.worldScale),spriteRect(demoMap,demoMap.avatar.views.down,behind),true,asset.occlusionApproachMargin*asset.worldScale)).toBe(0.1);
      const across=travel({x:collider.x-22,y:behind.y},{x:0.5,y:0},collider);
      expect(across.x).toBeGreaterThan(collider.x+collider.width+20);
      expect(across.y).toBe(behind.y);
    });
  }
  it('conserva la base estrecha y la oclusión alta de la biblioteca',() => {
    const shelf=assetById(demoMap,'bookshelf');
    expect(shelf.colliders).toEqual([rect(-38,-12,76,12)]);
    expect(shelf.occlusionMask).toEqual(rect(-40,-96,80,84));
    const object=scene.objects.find(item=>item.assetId==='bookshelf')!;
    const collider=worldRect(shelf.colliders[0]!,object.position,shelf.worldScale);
    expect(canOccupy(demoMap,scene,{x:object.position.x,y:collider.y-2},[collider])).toBe(true);
    expect(occlusionTarget(worldRect(shelf.occlusionMask!,object.position,shelf.worldScale),spriteRect(demoMap,demoMap.avatar.views.down,{x:object.position.x,y:collider.y-2}),true,16)).toBe(0.1);
  });
});
describe('V2-RF-005/008 — transición atómica local (cobertura parcial)',() => {
  function atPortal() {
    const world=new LocalWorld(demoMap); world.position={x:620,y:240}; world.doors['lobby-door']=true;
    return world;
  }
  it('conserva origen y posición si la carga falla; no reintenta en bucle',async () => {
    const world=atPortal();
    await expect(world.transition(async()=>{throw new Error('falló la carga');},1000)).rejects.toThrow('falló la carga');
    expect(world.scene.sceneId).toBe('lobby'); expect(world.position).toEqual({x:620,y:240});
    expect(await world.transition(async()=>{},2000)).toBe(false);
    world.position={x:592,y:240}; await world.transition(async()=>{},2100);
    world.position={x:620,y:240}; expect(await world.transition(async()=>{},2200)).toBe(true);
  });
  it('mantiene origen durante carga y cancela al destruir',async () => {
    const world=atPortal(); let resolve!:()=>void;
    const pending=world.transition(()=>new Promise<void>(done=>{resolve=done;}),1000);
    expect(world.scene.sceneId).toBe('lobby');
    expect(world.step({x:1,y:0},0.1)).toBe(false);
    expect(await world.transition(async()=>{},1001)).toBe(false);
    world.destroy(); resolve(); expect(await pending).toBe(false); expect(world.scene.sceneId).toBe('lobby');
  });
  it('no cruza una puerta cerrada ni acepta spawn ocupado',async () => {
    const world=atPortal(); world.doors['lobby-door']=false;
    expect(await world.transition(async()=>{},1000)).toBe(false);
    const invalid=structuredClone(demoMap); invalid.scenes[1]!.spawnPoints.portal={x:440,y:214,direction:'up'};
    const other=new LocalWorld(invalid); other.position={x:620,y:240}; other.doors['lobby-door']=true;
    await expect(other.transition(async()=>{},1000)).rejects.toThrow('Entrada bloqueada');
  });
  it('realiza 50 cruces sin duplicar puertas ni permitir rebote inmediato',async () => {
    const world=atPortal();
    for(let index=0;index<50;index++) {
      const lobby=world.scene.sceneId==='lobby';
      world.position={x:lobby?620:20,y:240}; world.doors[lobby?'lobby-door':'studio-door']=true;
      expect(await world.transition(async()=>{},1000+index*1000)).toBe(true);
      expect(world.scene.sceneId).toBe(lobby?'studio':'lobby');
      expect(await world.transition(async()=>{},1001+index*1000)).toBe(false);
    }
    expect(Object.keys(world.doors)).toHaveLength(2);
  });
});
