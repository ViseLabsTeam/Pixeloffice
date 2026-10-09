import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { type MapBundle } from '@pixel-office/contracts';
import { dragScene, enterOffice, sceneSignature, tapScene } from './scene-controls';

const map=JSON.parse(readFileSync('packages/contracts/data/demo-map.json','utf8')) as MapBundle;
const x=async(page:Page)=>Number(await page.locator('#world').getAttribute('data-x'));
async function hold(page:Page,key:string,milliseconds:number){
  await page.keyboard.down(key);await page.waitForTimeout(milliseconds);await page.keyboard.up(key);
}
test('oficina a pantalla completa, cuatro direcciones y cámara al redimensionar',async({page},info)=>{
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');await enterOffice(page);
  await expect(page.locator('#world')).toHaveAttribute('data-scene','office');
  for(const [key,direction] of [['w','up'],['s','down'],['a','left'],['d','right']]){
    await hold(page,key!,110);await expect(page.locator('#world')).toHaveAttribute('data-direction',direction!);
  }
  const checkScreen=async()=>{
    const size=await page.locator('#world').evaluate(node=>{
      const canvas=node as HTMLCanvasElement,bounds=canvas.getBoundingClientRect(),scale=Number(canvas.dataset.worldScale);
      return {x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height,viewportWidth:innerWidth,viewportHeight:innerHeight,
        scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
        cameraX:Number(canvas.dataset.cameraX),cameraY:Number(canvas.dataset.cameraY),viewWidth:canvas.width/scale,viewHeight:canvas.height/scale};
    });
    expect(size.x).toBe(0);expect(size.y).toBe(0);
    expect(size.width).toBe(size.viewportWidth);expect(size.height).toBe(size.viewportHeight);
    expect(size.scrollWidth).toBe(size.viewportWidth);expect(size.scrollHeight).toBe(size.viewportHeight);
    expect(size.cameraX).toBeGreaterThanOrEqual(0);expect(size.cameraY).toBeGreaterThanOrEqual(0);
    expect(size.cameraX+size.viewWidth).toBeLessThanOrEqual(1920.001);
    expect(size.cameraY+size.viewHeight).toBeLessThanOrEqual(1080.001);
  };
  await checkScreen();
  await expect(page.locator('header, aside, footer, dialog[open], button:visible:not(#open-settings)')).toHaveCount(0);
  await page.screenshot({path:`test-results/fullscreen-${info.project.name}.png`});
  const bitmapWidth=await page.locator('#world').evaluate(node=>(node as HTMLCanvasElement).width);
  await page.setViewportSize(info.project.name==='desktop'?{width:1100,height:800}:{width:844,height:390});
  await expect.poll(()=>page.locator('#world').evaluate(node=>(node as HTMLCanvasElement).width)).not.toBe(bitmapWidth);
  await checkScreen();
  await page.screenshot({path:`test-results/fullscreen-resized-${info.project.name}.png`});
});
test('pizarrón limpio y sucio mediante interacción',async({page},info)=>{
  await page.goto('/?debug=colliders&x=1692&y=480');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await enterOffice(page);
  await expect(page.locator('#world')).toHaveAttribute('data-board','clean');
  await expect(page.locator('#hint')).toContainText('Dibujar en el pizarrón');
  const panelSignature=()=>sceneSignature(page,{x:1668,y:244,width:110,height:126});
  const clean=await panelSignature();
  await page.keyboard.press('e');
  await expect(page.locator('#world')).toHaveAttribute('data-board','dirty');
  await expect(page.locator('#hint')).toContainText('Borrar el pizarrón');
  await expect.poll(panelSignature).not.toBe(clean);
  await page.screenshot({path:`test-results/board-dirty-${info.project.name}.png`,fullPage:true});
  await page.keyboard.press('e');
  await expect(page.locator('#world')).toHaveAttribute('data-board','clean');
  await expect.poll(panelSignature).toBe(clean);
  await page.screenshot({path:`test-results/board-clean-${info.project.name}.png`,fullPage:true});
  await tapScene(page);
  await expect(page.locator('#world')).toHaveAttribute('data-board','dirty');
  await tapScene(page);
  await expect(page.locator('#world')).toHaveAttribute('data-board','clean');
});
test('arrastrar el escenario mueve y se detiene al soltar',async({page})=>{
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');await enterOffice(page);
  const start=await x(page);
  const camera=Number(await page.locator('#world').getAttribute('data-camera-x'));
  await dragScene(page,{x:1,y:0},250);
  expect(await x(page)).toBeGreaterThan(start);
  if(camera>0)expect(Number(await page.locator('#world').getAttribute('data-camera-x'))).toBeGreaterThan(camera);
  await page.waitForTimeout(150);const stopped=await x(page);
  await page.waitForTimeout(150);expect(await x(page)).toBe(stopped);
});
test('el avatar se dibuja encima de la pared del fondo al acercarse',async({page})=>{
  const pixel=()=>sceneSignature(page,{x:1100,y:250,width:1,height:1});
  await page.goto('/?debug=colliders&x=1100&y=600');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await enterOffice(page);
  const wallAlone=await pixel();
  await page.goto('/?debug=colliders&x=1100&y=300');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await enterOffice(page);
  expect(await pixel()).not.toEqual(wallAlone);
});
test('el escritorio separado permanece opaco delante del avatar',async({page})=>{
  const pixel=()=>sceneSignature(page,{x:320,y:525,width:1,height:1});
  await page.goto('/?debug=colliders&x=320&y=750');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await enterOffice(page);
  const deskAlone=await pixel();
  await page.goto('/?debug=colliders&x=320&y=550');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await enterOffice(page);
  expect(await pixel()).toEqual(deskAlone);
});
test('el tren cambia de cuadro dentro de las ventanas',async({page})=>{
  test.skip(map.scenes[0]!.trainFrames.length<2,'Falta el GIF oficial del tren en los assets recibidos.');
  await page.goto('/?debug=colliders&x=1692&y=480');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');await enterOffice(page);
  const sample=()=>sceneSignature(page,{x:1548,y:140,width:155,height:36});
  const first=await sample();await expect.poll(sample,{timeout:5000}).not.toBe(first);
});
