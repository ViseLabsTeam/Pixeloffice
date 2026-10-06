import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { assetById, canOccupy, initialDoors, objectRect, sceneColliders, type MapBundle, type Point } from '@pixel-office/contracts';

const map=JSON.parse(readFileSync('packages/contracts/data/demo-map.json','utf8')) as MapBundle;
const scene=map.scenes[0]!;
const all=sceneColliders(map,scene,initialDoors(map));
const desk=scene.objects.find(item=>item.objectId==='west-desk')!;
const deskAsset=assetById(map,desk.assetId);
const table=objectRect(deskAsset.colliders[0]!,deskAsset,desk.position);
const bookshelf=scene.colliders.find(item=>item.colliderId==='center-bookshelf-base')!.area;
const feet=async(page:Page):Promise<Point>=>({x:Number(await page.locator('#world').getAttribute('data-x')),y:Number(await page.locator('#world').getAttribute('data-y'))});

async function startAt(page:Page,point:Point){
  expect(canOccupy(map,scene,point,all)).toBe(true);
  await page.goto(`/?debug=colliders&x=${point.x}&y=${point.y}`);
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
}
async function drive(page:Page,control:'keyboard'|'joystick',vector:Point){
  if(control==='keyboard'){
    const keys=[vector.x>0?'d':vector.x<0?'a':'',vector.y>0?'s':vector.y<0?'w':''].filter(Boolean);
    for(const key of keys)await page.keyboard.down(key);
    await page.waitForTimeout(700);
    for(const key of keys)await page.keyboard.up(key);
    return;
  }
  const zone=page.locator('#joystick');await zone.scrollIntoViewIfNeeded();
  const bounds=await zone.boundingBox();if(!bounds)throw new Error('Joystick invisible');
  const magnitude=Math.hypot(vector.x,vector.y),radius=bounds.width*.3;
  const point={x:bounds.x+bounds.width/2+vector.x/magnitude*radius,
    y:bounds.y+bounds.height/2+vector.y/magnitude*radius,id:1};
  if(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches)){
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    await page.waitForTimeout(700);
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point]});
    await client.detach();
  }else{
    await page.mouse.move(point.x,point.y);await page.mouse.down();await page.waitForTimeout(700);await page.mouse.up();
  }
}

for(const control of ['keyboard','joystick'] as const){
  test(`oficina mixta: tablero desde cinco ángulos con ${control}`,async({page},info)=>{
    test.skip(control==='keyboard'&&info.project.name==='mobile','Teclado de escritorio');
    const attempts=[
      {name:'atrás',start:{x:320,y:470},vector:{x:0,y:1}},
      {name:'delante',start:{x:320,y:750},vector:{x:0,y:-1}},
      {name:'izquierda',start:{x:180,y:580},vector:{x:1,y:0}},
      {name:'derecha',start:{x:430,y:580},vector:{x:-1,y:0}},
      {name:'diagonal',start:{x:195,y:475},vector:{x:1,y:1}}
    ];
    for(const attempt of attempts){
      await startAt(page,attempt.start);await drive(page,control,attempt.vector);
      const result=await feet(page);
      expect(canOccupy(map,scene,result,all),`${attempt.name}: ${JSON.stringify(result)}`).toBe(true);
      expect(canOccupy(map,scene,result,[table]),attempt.name).toBe(true);
      if(attempt.name==='atrás')expect(result.y).toBeLessThanOrEqual(table.y+1);
      if(attempt.name==='delante')expect(result.y).toBeGreaterThanOrEqual(table.y+table.height+11);
      if(attempt.name==='izquierda')expect(result.x).toBeLessThanOrEqual(table.x-15);
      if(attempt.name==='derecha')expect(result.x).toBeGreaterThanOrEqual(table.x+table.width+15);
    }
    if(control==='keyboard'&&info.project.name==='desktop')await page.screenshot({path:'test-results/office-v5-colliders.png'});
  });
  test(`oficina mixta: biblioteca integrada con ${control}`,async({page},info)=>{
    test.skip(control==='keyboard'&&info.project.name==='mobile','Teclado de escritorio');
    await startAt(page,{x:780,y:450});await drive(page,control,{x:0,y:-1});
    expect((await feet(page)).y).toBeGreaterThanOrEqual(bookshelf.y+bookshelf.height+12);
  });
}
