import { describe, expect, it } from 'vitest';
import { demoMap } from '@pixel-office/contracts/demo';
import { canOccupy, facing, initialDoors, move, normalizeInput, overlaps, sceneColliders, validateMap, worldRect, type Point } from '@pixel-office/contracts';
import { LocalWorld } from '../../apps/web/src/engine/world';

const scene=demoMap.scenes[0]!;
const colliders=sceneColliders(demoMap,scene,initialDoors(demoMap));
const area=(id:string)=>scene.colliders.find(item=>item.colliderId===id)!.area;

describe('oficina compuesta: coordenadas y circulación',()=>{
  it('usa la composición original y permite el spawn',()=>{
    expect(scene.logicalSize).toEqual({width:1600,height:900});
    expect(scene.background.assetId).toBe('office-composite');
    expect(demoMap.scenes).toHaveLength(1);
    expect(canOccupy(demoMap,scene,scene.spawnPoints.entry!,colliders)).toBe(true);
    expect(validateMap(structuredClone(demoMap)).mapVersion).toBe('demo-v4');
  });
  it('bloquea bordes, paredes y tabiques, pero deja sus aberturas',()=>{
    for(const point of [{x:50,y:500},{x:1550,y:500},{x:500,y:150},{x:500,y:870},
      {x:580,y:350},{x:580,y:750},{x:790,y:750}])expect(canOccupy(demoMap,scene,point,colliders)).toBe(false);
    for(const point of [{x:530,y:500},{x:630,y:500},{x:735,y:570},{x:850,y:650},
      {x:650,y:700},{x:400,y:700},{x:1400,y:500}])expect(canOccupy(demoMap,scene,point,colliders)).toBe(true);
  });
  it('mantiene la base angosta de la biblioteca y bloquea todos los tableros',()=>{
    const bookshelf=area('center-bookshelf-base');
    expect(bookshelf.height).toBe(21);
    expect(canOccupy(demoMap,scene,{x:650,y:287},colliders)).toBe(true);
    expect(canOccupy(demoMap,scene,{x:650,y:312},colliders)).toBe(false);
    for(const id of ['west-desk-tabletop','computer-west-tabletop','computer-east-tabletop']){
      const table=area(id);
      expect(table.width).toBeGreaterThan(80);
      expect(table.height).toBeGreaterThan(70);
      expect(canOccupy(demoMap,scene,{x:table.x+table.width/2,y:table.y+table.height/2},colliders)).toBe(false);
      const starts:[Point,Point][]=[
        [{x:table.x+table.width/2,y:table.y-20},{x:0,y:1}],
        [{x:table.x+table.width/2,y:table.y+table.height+20},{x:0,y:-1}],
        [{x:table.x-25,y:table.y+table.height/2},{x:1,y:0}],
        [{x:table.x+table.width+25,y:table.y+table.height/2},{x:-1,y:0}],
        [{x:table.x-25,y:table.y-25},{x:1,y:1}]
      ];
      for(const [start,input] of starts){
        let position=start;
        for(let tick=0;tick<60;tick++)position=move(demoMap,scene,position,input,1/30,[table]);
        expect(overlaps(worldRect(demoMap.avatar.footCollider,position),table)).toBe(false);
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
    world.position={x:1410,y:400};
    expect(world.activateInteraction()).toBe('Pizarrón marcado.');
    expect(world.boardDirty).toBe(true);
    expect(world.activateInteraction()).toBe('Pizarrón limpio.');
    expect(world.boardDirty).toBe(false);
  });
});
