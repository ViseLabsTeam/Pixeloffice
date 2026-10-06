import { describe, expect, it } from 'vitest';
import { demoMap } from '@pixel-office/contracts/demo';
import { assetById, canOccupy, facing, initialDoors, isBehindObject, move, normalizeInput, objectRect, overlaps, sceneColliders, validateMap, worldRect, type Point } from '@pixel-office/contracts';
import { LocalWorld } from '../../apps/web/src/engine/world';

const scene=demoMap.scenes[0]!;
const colliders=sceneColliders(demoMap,scene,initialDoors(demoMap));
const area=(id:string)=>scene.colliders.find(item=>item.colliderId===id)!.area;

describe('oficina mixta: coordenadas y circulación',()=>{
  it('usa la composición original y permite el spawn',()=>{
    expect(scene.logicalSize).toEqual({width:1920,height:1080});
    expect(scene.background.assetId).toBe('office-background');
    expect(demoMap.scenes).toHaveLength(1);
    expect(canOccupy(demoMap,scene,scene.spawnPoints.entry!,colliders)).toBe(true);
    expect(validateMap(structuredClone(demoMap)).mapVersion).toBe('demo-v5');
  });
  it('bloquea bordes, paredes y tabiques, pero deja sus aberturas',()=>{
    for(const point of [{x:50,y:600},{x:1850,y:600},{x:600,y:150},{x:600,y:1050},
      {x:695,y:350},{x:695,y:900},{x:950,y:900}])expect(canOccupy(demoMap,scene,point,colliders)).toBe(false);
    for(const point of [{x:635,y:600},{x:755,y:600},{x:880,y:680},{x:1020,y:780},
      {x:780,y:840},{x:480,y:840},{x:1680,y:600}])expect(canOccupy(demoMap,scene,point,colliders)).toBe(true);
  });
  it('bloquea el fondo detrás de la biblioteca y toda la superficie del escritorio separado',()=>{
    const bookshelf=area('center-bookshelf-base');
    expect(bookshelf.y).toBe(283);
    expect(bookshelf.height).toBe(109);
    expect(canOccupy(demoMap,scene,{x:780,y:335},colliders)).toBe(false);
    expect(canOccupy(demoMap,scene,{x:780,y:420},colliders)).toBe(true);
    for(const id of ['west-desk']){
      const item=scene.objects.find(object=>object.objectId===id)!;
      const asset=assetById(demoMap,item.assetId);
      const table=objectRect(asset.colliders[0]!,asset,item.position);
      expect(table.y+table.height).toBeCloseTo(706.8);
      expect(table.width).toBeGreaterThan(80);
      expect(table.height).toBeGreaterThan(70);
      expect(canOccupy(demoMap,scene,{x:table.x+table.width/2,y:table.y+table.height/2},colliders)).toBe(false);
      const starts:[Point,Point][]=[
        [{x:table.x+table.width/2,y:table.y-20},{x:0,y:1}],
        [{x:table.x+table.width/2,y:table.y+table.height+20},{x:0,y:-1}],
        [{x:table.x-30,y:table.y+table.height/2},{x:1,y:0}],
        [{x:table.x+table.width+30,y:table.y+table.height/2},{x:-1,y:0}],
        [{x:table.x-30,y:table.y-30},{x:1,y:1}]
      ];
      for(const [start,input] of starts){
        let position=start;
        for(let tick=0;tick<60;tick++)position=move(demoMap,scene,position,input,1/30,[table]);
        expect(overlaps(worldRect(demoMap.avatar.footCollider,position),table)).toBe(false);
      }
    }
    const plant=scene.objects.find(object=>object.objectId==='south-plant')!;
    const plantAsset=assetById(demoMap,plant.assetId);
    expect(plantAsset.colliders[0]!.height).toBeLessThan(plantAsset.sourceRect.height/2);
    const desk=scene.objects.find(object=>object.objectId==='west-desk')!;
    const deskAsset=assetById(demoMap,desk.assetId);
    expect(isBehindObject(deskAsset,desk.position,{x:390,y:600})).toBe(true);
    expect(isBehindObject(deskAsset,desk.position,{x:210,y:600})).toBe(false);
    expect(isBehindObject(deskAsset,desk.position,{x:320,y:540})).toBe(true);
    expect(isBehindObject(deskAsset,desk.position,{x:320,y:690})).toBe(false);
  });
  it('mantiene los pies fuera de silla y maceta por los cuatro lados y diagonales',()=>{
    for(const id of ['west-chair','south-plant']){
      const object=scene.objects.find(item=>item.objectId===id)!;
      const asset=assetById(demoMap,object.assetId);
      const solid=objectRect(asset.colliders[0]!,asset,object.position);
      expect(solid.height).toBeCloseTo(id==='west-chair'?65:29.84);
      const center={x:solid.x+solid.width/2,y:solid.y+solid.height/2};
      for(const [start,input] of [
        [{x:center.x,y:solid.y-30},{x:0,y:1}],
        [{x:center.x,y:solid.y+solid.height+30},{x:0,y:-1}],
        [{x:solid.x-30,y:center.y},{x:1,y:0}],
        [{x:solid.x+solid.width+30,y:center.y},{x:-1,y:0}],
        [{x:solid.x-30,y:solid.y-30},{x:1,y:1}],
        [{x:solid.x+solid.width+30,y:solid.y+solid.height+30},{x:-1,y:-1}]
      ] as [Point,Point][]){
        let position=start;
        for(let tick=0;tick<60;tick++)position=move(demoMap,scene,position,input,1/30,[solid]);
        expect(overlaps(worldRect(demoMap.avatar.footCollider,position),solid),id).toBe(false);
      }
    }
  });
  it('alcanza las zonas de interacción por los pasillos',()=>{
    const start=scene.spawnPoints.entry!;
    const step=10;
    const key=(x:number,y:number)=>`${x},${y}`;
    const queue:Point[]=[{x:start.x,y:start.y}];
    const visited=new Set([key(start.x,start.y)]);
    for(let index=0;index<queue.length;index++){
      const current=queue[index]!;
      for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]] as [number,number][]){
        const next={x:current.x+dx,y:current.y+dy};
        const id=key(next.x,next.y);
        if(!visited.has(id)&&canOccupy(demoMap,scene,next,colliders)){visited.add(id);queue.push(next);}
      }
    }
    for(const hotspot of scene.interactions){
      expect(queue.some(point=>point.x>=hotspot.area.x&&point.x<=hotspot.area.x+hotspot.area.width&&point.y>=hotspot.area.y&&point.y<=hotspot.area.y+hotspot.area.height),hotspot.hotspotId).toBe(true);
    }
  });
  it('mantiene dirección, intensidad analógica y estado local del pizarrón',()=>{
    expect(normalizeInput({x:0.25,y:0})).toEqual({x:0.25,y:0});
    expect(facing({x:-1,y:0},'down')).toBe('left');
    const world=new LocalWorld(demoMap);
    expect(world.activateInteraction()).toBeUndefined();
    world.position={x:1692,y:480};
    expect(world.activateInteraction()).toBe('Pizarrón marcado.');
    expect(world.boardDirty).toBe(true);
    expect(world.activateInteraction()).toBe('Pizarrón limpio.');
    expect(world.boardDirty).toBe(false);
  });
});
