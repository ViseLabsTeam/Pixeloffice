import { expect, test, type Page } from '@playwright/test';
const x = async(page:Page)=>Number(await page.locator('#world').getAttribute('data-x'));
async function hold(page:Page,key:string,milliseconds:number) {
  await page.keyboard.down(key); await page.waitForTimeout(milliseconds); await page.keyboard.up(key);
}
test('RF-007/008/010 — recorrido real, puertas y 50 cruces',async({page},info)=>{
  test.skip(info.project.name==='mobile','Recorrido de teclado de escritorio; joystick en prueba separada.');
  const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await hold(page,'d',4900);
  expect(await x(page)).toBeLessThanOrEqual(610);
  await expect(page.locator('#hint')).toContainText('Abrir puerta');
  for(let index=0;index<50;index++) {
    const lobby=await page.locator('#world').getAttribute('data-scene')==='lobby';
    if((await page.locator('#hint').textContent())?.startsWith('Abrir')) await page.getByRole('button',{name:'Interactuar'}).click();
    await hold(page,lobby?'d':'a',500);
    await expect(page.locator('#world')).toHaveAttribute('data-scene',lobby?'studio':'lobby');
  }
  expect(errors).toEqual([]);
});
test('RF-009/015/048 — foco, cuatro vistas, joystick y cancelación',async({page},info)=>{
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  for(const [key,direction] of [['w','up'],['s','down'],['a','left'],['d','right']]) {
    await hold(page,key!,100); await expect(page.locator('#world')).toHaveAttribute('data-direction',direction!);
  }
  await page.evaluate(()=>{
    const input=document.createElement('input'); input.id='focus-test'; input.setAttribute('aria-label','Prueba de foco'); document.body.append(input); input.focus();
  });
  const before=await x(page); await hold(page,'d',150); expect(await x(page)).toBe(before);
  await page.evaluate(()=>document.getElementById('focus-test')?.remove());
  await page.locator('#world').focus();
  await page.keyboard.down('d'); await page.waitForTimeout(80); await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(100); const stopped=await x(page); await page.waitForTimeout(120); expect(await x(page)).toBe(stopped); await page.keyboard.up('d');
  const zone=page.locator('#joystick'); const bounds=await zone.boundingBox(); if(!bounds) throw new Error('Joystick invisible');
  const start=await x(page);
  await zone.evaluate(node=>node.addEventListener('pointerdown',event=>{node.dataset.pointer=String((event as PointerEvent).pointerId);},{once:true}));
  await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height/2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await zone.dispatchEvent('pointercancel',{pointerId:Number(await zone.getAttribute('data-pointer')),pointerType:'mouse'});
  await page.mouse.up();
  await page.waitForTimeout(100); const cancelled=await x(page); expect(cancelled).toBeGreaterThan(start);
  await page.waitForTimeout(150); expect(await x(page)).toBe(cancelled);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/${info.project.name}-office.png`,fullPage:true});
});

test('RF-048 — dos contactos táctiles permiten moverse y abrir una puerta',async({page},info)=>{
  test.skip(info.project.name!=='mobile','Escenario táctil de emulación móvil.');
  const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await hold(page,'d',4500);
  await expect(page.locator('#hint')).toContainText('Abrir puerta');
  const stick=await page.locator('#joystick').boundingBox();
  const button=await page.locator('#action').boundingBox();
  if(!stick||!button) throw new Error('Controles táctiles ausentes');
  const client=await page.context().newCDPSession(page);
  const first={x:stick.x+stick.width*.8,y:stick.y+stick.height/2,id:1};
  const second={x:button.x+button.width/2,y:button.y+button.height/2,id:2};
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});
  // CDP touchEnd identifies contacts to release, not contacts to retain.
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[second]});
  await expect(page.locator('#world')).toHaveAttribute('data-scene','studio');
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await client.detach(); expect(errors).toEqual([]);
});
