import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { assetById, canOccupy, initialDoors, sceneColliders, worldRect, type MapBundle, type Point } from '@pixel-office/contracts';

const demoMap = JSON.parse(readFileSync('packages/contracts/data/demo-map.json', 'utf8')) as MapBundle;
const scene = demoMap.scenes.find(item => item.sceneId === 'lobby')!;
const desk = scene.objects.find(item => item.objectId === 'lobby-desk-a')!;
const asset = assetById(demoMap, desk.assetId);
const tabletop = worldRect(asset.colliders[0]!, desk.position, asset.worldScale);
const center = { x: tabletop.x + tabletop.width / 2, y: tabletop.y + tabletop.height / 2 };

async function startAt(page: Page, point: Point) {
  expect(canOccupy(demoMap, scene, point, sceneColliders(demoMap, scene, initialDoors(demoMap)))).toBe(true);
  const query = new URLSearchParams({ debug: 'colliders', x: String(point.x), y: String(point.y) });
  await page.goto(`/?${query}`);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
}

async function drive(page: Page, control: 'keyboard' | 'joystick', vector: Point) {
  if (control === 'keyboard') {
    const keys = [vector.x > 0 ? 'd' : vector.x < 0 ? 'a' : '', vector.y > 0 ? 's' : vector.y < 0 ? 'w' : ''].filter(Boolean);
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(600);
    for (const key of keys) await page.keyboard.up(key);
    return;
  }
  await page.locator('#joystick').scrollIntoViewIfNeeded();
  const bounds = await page.locator('#joystick').boundingBox();
  if (!bounds) throw new Error('Joystick invisible');
  const magnitude = Math.hypot(vector.x, vector.y);
  const radius = bounds.width * 0.3;
  const point = { x: bounds.x + bounds.width / 2 + vector.x / magnitude * radius,
    y: bounds.y + bounds.height / 2 + vector.y / magnitude * radius, id: 1 };
  if ((await page.context().browser()?.browserType().name()) === 'chromium' && (await page.evaluate(() => matchMedia('(pointer: coarse)').matches))) {
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await page.waitForTimeout(600);
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [point] });
    await client.detach();
  } else {
    await page.mouse.move(point.x, point.y); await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.up();
  }
}

async function feet(page: Page): Promise<Point> {
  const canvas = page.locator('#world');
  return { x: Number(await canvas.getAttribute('data-x')), y: Number(await canvas.getAttribute('data-y')) };
}

for (const control of ['keyboard', 'joystick'] as const) {
  test(`V2-RF-007 — escritorio bloquea tablero desde todos los lados con ${control}`, async ({ page }, info) => {
    test.skip(control === 'keyboard' && info.project.name === 'mobile', 'Teclado de escritorio.');
    const cases = [
      { name: 'detrás', start: { x: center.x, y: tabletop.y - 16 }, vector: { x: 0, y: 1 } },
      { name: 'delante', start: { x: center.x, y: tabletop.y + tabletop.height + 22 }, vector: { x: 0, y: -1 } },
      { name: 'izquierda', start: { x: tabletop.x - 22, y: center.y }, vector: { x: 1, y: 0 } },
      { name: 'derecha', start: { x: tabletop.x + tabletop.width + 15, y: center.y }, vector: { x: -1, y: 0 } },
      { name: 'diagonal posterior', start: { x: tabletop.x - 22, y: tabletop.y - 20 }, vector: { x: 1, y: 1 } },
      { name: 'diagonal anterior', start: { x: tabletop.x + tabletop.width + 22, y: tabletop.y + tabletop.height + 20 }, vector: { x: -1, y: -1 } }
    ];
    for (const attempt of cases) {
      await startAt(page, attempt.start);
      await drive(page, control, attempt.vector);
      const result = await feet(page);
      expect(canOccupy(demoMap, scene, result, [tabletop]), `${control}: ${attempt.name}`).toBe(true);
      if (attempt.name === 'detrás') {
        expect(result.y).toBeLessThanOrEqual(tabletop.y + 1);
        expect(result.y).toBeGreaterThan(tabletop.y - 4);
        if (control === 'keyboard') await page.screenshot({ path: 'test-results/desk-colliders.png' });
      }
      if (attempt.name === 'delante') expect(result.y).toBeGreaterThanOrEqual(tabletop.y + tabletop.height + 5);
      if (attempt.name === 'izquierda') expect(result.x).toBeLessThanOrEqual(tabletop.x - 5);
      if (attempt.name === 'derecha') expect(result.x).toBeGreaterThanOrEqual(tabletop.x + tabletop.width + 5);
    }
  });
}

const shelf = scene.objects.find(item => item.assetId === 'bookshelf')!;
const shelfAsset = assetById(demoMap, shelf.assetId);
const shelfBase = worldRect(shelfAsset.colliders[0]!, shelf.position, shelfAsset.worldScale);
for (const control of ['keyboard', 'joystick'] as const) {
  test(`V2-RF-007/009 — biblioteca conserva base estrecha con ${control}`, async ({ page }, info) => {
    test.skip(control === 'keyboard' && info.project.name === 'mobile', 'Teclado de escritorio.');
    await startAt(page, { x: shelf.position.x, y: shelfBase.y - 16 });
    await drive(page, control, { x: 0, y: 1 });
    const rear = await feet(page);
    expect(rear.y).toBeGreaterThan(shelfBase.y - 4);
    expect(rear.y).toBeLessThanOrEqual(shelfBase.y + 1);
    await startAt(page, { x: shelf.position.x, y: shelfBase.y + shelfBase.height + 20 });
    await drive(page, control, { x: 0, y: -1 });
    const front = await feet(page);
    expect(front.y).toBeGreaterThanOrEqual(shelfBase.y + shelfBase.height + 5);
  });
}
