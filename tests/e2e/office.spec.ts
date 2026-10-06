import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { type MapBundle } from '@pixel-office/contracts';

const map=JSON.parse(readFileSync('packages/contracts/data/demo-map.json','utf8')) as MapBundle;
const x=async(page:Page)=>Number(await page.locator('#world').getAttribute('data-x'));
async function hold(page:Page,key:string,milliseconds:number){
  await page.keyboard.down(key);await page.waitForTimeout(milliseconds);await page.keyboard.up(key);
}
test('oficina completa, cuatro direcciones y escala al cambiar viewport',async({page},info)=>{
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#world')).toHaveAttribute('data-scene','office');
  for(const [key,direction] of [['w','up'],['s','down'],['a','left'],['d','right']]){
    await hold(page,key!,110);await expect(page.locator('#world')).toHaveAttribute('data-direction',direction!);
  }
  const size=await page.locator('#world').evaluate(canvas=>{
    const element=canvas as HTMLCanvasElement;
    return {ratio:element.getBoundingClientRect().width/element.getBoundingClientRect().height,width:element.width,height:element.height};
  });
  expect(size.ratio).toBeCloseTo(16/9,1);
  expect(size.width).toBeGreaterThan(0);expect(size.height).toBeGreaterThan(0);
  if(info.project.name==='desktop'){
    await page.setViewportSize({width:1100,height:800});
    await expect.poll(async()=>page.locator('#world').evaluate(element=>(element as HTMLCanvasElement).width)).not.toBe(size.width);
    await page.screenshot({path:'test-results/office-v5-desktop.png',fullPage:true});
  }else await page.screenshot({path:'test-results/office-v5-mobile.png',fullPage:true});
});
test('pizarrón limpio y sucio mediante interacción',async({page})=>{
  await page.goto('/?debug=colliders&x=1692&y=480');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#world')).toHaveAttribute('data-board','clean');
  await expect(page.locator('#hint')).toContainText('Cambiar pizarrón');
  await page.getByRole('button',{name:'Interactuar'}).click();
  await expect(page.locator('#world')).toHaveAttribute('data-board','dirty');
  await page.keyboard.press('e');
  await expect(page.locator('#world')).toHaveAttribute('data-board','clean');
});
test('joystick mueve y se detiene al soltarlo',async({page})=>{
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  const zone=page.locator('#joystick');await zone.scrollIntoViewIfNeeded();
  const bounds=await zone.boundingBox();if(!bounds)throw new Error('Joystick invisible');
  const start=await x(page);
  const point={x:bounds.x+bounds.width*.8,y:bounds.y+bounds.height/2,id:1};
  if(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches)){
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    await page.waitForTimeout(250);
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point]});
    await client.detach();
  }else{
    await page.mouse.move(point.x,point.y);await page.mouse.down();await page.waitForTimeout(250);await page.mouse.up();
  }
  expect(await x(page)).toBeGreaterThan(start);
  await page.waitForTimeout(150);const stopped=await x(page);
  await page.waitForTimeout(150);expect(await x(page)).toBe(stopped);
});
test('el avatar se dibuja encima de la pared del fondo al acercarse',async({page})=>{
  const pixel=async()=>page.locator('#world').evaluate(canvas=>{
    const image=canvas as HTMLCanvasElement;
    const x=Math.round(1100*image.width/1920),y=Math.round(250*image.height/1080);
    return [...image.getContext('2d')!.getImageData(x,y,1,1).data];
  });
  await page.goto('/?debug=colliders&x=1100&y=600');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  const wallAlone=await pixel();
  await page.goto('/?debug=colliders&x=1100&y=300');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  expect(await pixel()).not.toEqual(wallAlone);
});
test('el escritorio separado permanece opaco delante del avatar',async({page})=>{
  const pixel=async()=>page.locator('#world').evaluate(canvas=>{
    const image=canvas as HTMLCanvasElement;
    const x=Math.round(320*image.width/1920),y=Math.round(525*image.height/1080);
    return [...image.getContext('2d')!.getImageData(x,y,1,1).data];
  });
  await page.goto('/?debug=colliders&x=948&y=600');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  const deskAlone=await pixel();
  await page.goto('/?debug=colliders&x=320&y=550');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  expect(await pixel()).toEqual(deskAlone);
});
test('el tren cambia de cuadro dentro de las ventanas',async({page})=>{
  test.skip(map.scenes[0]!.trainFrames.length<2,'Falta el GIF oficial del tren en los assets recibidos.');
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  const sample=async()=>page.locator('#world').evaluate(canvas=>{
    const context=(canvas as HTMLCanvasElement).getContext('2d')!;
    const bounds=(canvas as HTMLCanvasElement).getBoundingClientRect();
    return [...context.getImageData(Math.round(396*bounds.width/1920),Math.round(210*bounds.height/1080),1,1).data];
  });
  const first=await sample();await page.waitForTimeout(600);expect(await sample()).not.toEqual(first);
});
