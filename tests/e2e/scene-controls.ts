import { type Page } from '@playwright/test';
import { type Point } from '@pixel-office/contracts';

export async function dragScene(page:Page,vector:Point,milliseconds:number){
  const bounds=await page.locator('#world').boundingBox();
  if(!bounds)throw new Error('Escenario invisible');
  const origin={x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2,id:1};
  const magnitude=Math.hypot(vector.x,vector.y);
  const target={x:origin.x+vector.x/magnitude*64,y:origin.y+vector.y/magnitude*64,id:1};
  if(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches)){
    const client=await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[origin]});
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[target]});
    await page.waitForTimeout(milliseconds);
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await client.detach();
  }else{
    await page.mouse.move(origin.x,origin.y);await page.mouse.down();
    await page.mouse.move(target.x,target.y);await page.waitForTimeout(milliseconds);await page.mouse.up();
  }
}

export async function tapScene(page:Page){
  const canvas=page.locator('#world');
  if(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches))await canvas.tap();
  else await canvas.click();
}

export async function sceneSignature(page:Page,area:{x:number;y:number;width:number;height:number}){
  return page.locator('#world').evaluate((node,area)=>{
    const canvas=node as HTMLCanvasElement,scale=Number(canvas.dataset.worldScale);
    const x=(area.x-Number(canvas.dataset.cameraX))*scale,y=(area.y-Number(canvas.dataset.cameraY))*scale;
    const pixels=canvas.getContext('2d')!.getImageData(Math.floor(x),Math.floor(y),Math.max(1,Math.ceil(area.width*scale)),Math.max(1,Math.ceil(area.height*scale))).data;
    return pixels.reduce((hash,value)=>(Math.imul(hash,31)+value)>>>0,0);
  },area);
}
