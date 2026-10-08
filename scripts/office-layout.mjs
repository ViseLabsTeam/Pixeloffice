// Editable layout for the fixed 1920 × 1080 office. Units in position are
// background pixels; pivot and collider use source PNG pixels.
// The pivot is the point of the source image placed at position. Scale converts
// every source offset to background pixels.
const rect = (x, y, width, height) => ({ shape: 'rect', x, y, width, height });
export const avatarFootCollider = rect(-15, -12, 30, 12);
// Two background pixels of extra clearance on the screen-down (-Y control) edge.
const frontClearance = 2;
// Desk colliders begin one front-leg length behind the back edge of the tabletop
// and end at the front-leg tips. The avatar's foot box then stops with its waist
// approximately at the front edge of the tabletop.
const westDesk = { top: 34, front: 554, legTip: 662, left: 94, right: 442, pivot: { x: 277, y: 662 } };
const southDesk = { top: 216, front: 554, legTip: 674, left: 158, right: 838, pivot: { x: 158, y: 674 } };
const westChair = { seatBack: 70, seatFront: 100, legTip: 140, left: 28, right: 107 };
const southChair = { seatBack: 60, seatFront: 105, legTip: 142, left: 22, right: 111 };

export const furniture = [
  {
    id: 'west-chair', source: 'furniture/chair/SILLA X.png',
    position: { x: 258, y: 657 }, scale: 0.9, pivot: { x: 74, y: 140 },
    collider: [rect(westChair.left, westChair.seatBack + westChair.legTip - westChair.seatFront,
      westChair.right - westChair.left, westChair.seatFront - westChair.seatBack)],
    // Behind the seat's base, the chair covers the avatar. In front it stays below.
    // One map pixel includes feet exactly touching the rear collider edge.
    depth: { axis: 'y', offset: westChair.seatBack + westChair.legTip - westChair.seatFront - 140 + 1 / 0.9,
      behindSide: 'negative' }, renderOrder: 10
  },
  {
    id: 'west-desk', source: 'furniture/table/escritorio x.png',
    position: { x: 305.7, y: 706.8 }, scale: 0.3, pivot: westDesk.pivot,
    collider: [rect(westDesk.left, westDesk.top + westDesk.legTip - westDesk.front,
      westDesk.right - westDesk.left, westDesk.front - westDesk.top)],
    // The front is below the desk and at the chair on its left. Behind it, the
    // avatar's feet are north of the front edge and past the left collision side.
    depth: { axis: 'y', offset: westDesk.front - westDesk.pivot.y, behindSide: 'negative',
      secondary: { axis: 'x', offset: westDesk.left - westDesk.pivot.x + avatarFootCollider.x / 0.3,
        behindSide: 'positive' } }, renderOrder: 20
  },
  {
    id: 'east-desk-left', source: 'furniture/table/escritorio -y.png',
    position: { x: 1143, y: 886 }, scale: 0.28, pivot: southDesk.pivot,
    collider: [rect(southDesk.left, southDesk.top + southDesk.legTip - southDesk.front,
      southDesk.right - southDesk.left, southDesk.front - southDesk.top)],
    depth: { axis: 'y', offset: southDesk.front - southDesk.pivot.y, behindSide: 'negative' }, renderOrder: 20
  },
  {
    id: 'east-chair-left', source: 'furniture/chair/SILLA Y.png',
    position: { x: 1241, y: 930 }, scale: 1, pivot: { x: 66, y: 150 },
    collider: [rect(southChair.left, southChair.seatBack + southChair.legTip - southChair.seatFront,
      southChair.right - southChair.left, southChair.seatFront - southChair.seatBack)],
    depth: { axis: 'y', offset: southChair.seatFront - 150, behindSide: 'negative' }, renderOrder: 30
  },
  {
    id: 'east-desk-right', source: 'furniture/table/escritorio -y.png',
    position: { x: 1482, y: 886 }, scale: 0.28, pivot: southDesk.pivot,
    collider: [rect(southDesk.left, southDesk.top + southDesk.legTip - southDesk.front,
      southDesk.right - southDesk.left, southDesk.front - southDesk.top)],
    depth: { axis: 'y', offset: southDesk.front - southDesk.pivot.y, behindSide: 'negative' }, renderOrder: 20
  },
  {
    id: 'east-chair-right', source: 'furniture/chair/SILLA Y.png',
    position: { x: 1580, y: 930 }, scale: 1, pivot: { x: 66, y: 150 },
    collider: [rect(southChair.left, southChair.seatBack + southChair.legTip - southChair.seatFront,
      southChair.right - southChair.left, southChair.seatFront - southChair.seatBack)],
    depth: { axis: 'y', offset: southChair.seatFront - 150, behindSide: 'negative' }, renderOrder: 30
  },
  {
    id: 'south-plant', source: 'furniture/PLANTASL.png',
    position: { x: 1028.5, y: 1008 }, scale: 0.16, pivot: { x: 453, y: 724 },
    // Only the pot touches the floor; foliage is visual, not a collider.
    collider: [rect(310, 550, 300, 174 + frontClearance / 0.16)],
    depth: { axis: 'y', offset: -75, behindSide: 'negative' }, renderOrder: 10
  }
];

// Furniture painted into SIN MUEBLESL.png remains fixed. The north wall and
// these footprints prevent access to the narrow gap behind wall furniture.
export const fixedColliders = [
  ['north-wall', 115, 0, 1694, 283 + frontClearance], ['west-border', 0, 0, 116, 1080],
  ['east-border', 1807, 0, 113, 1080], ['south-border', 115, 1015, 1694, 65],
  ['upper-divider', 668, 0, 56, 494 + frontClearance],
  ['lower-divider-west', 668, 730, 58, 285 + frontClearance],
  ['lower-divider-east', 918, 730, 58, 285 + frontClearance],
  ['west-cabinet-base', 120, 283, 256, 80 + frontClearance],
  ['fridge-base', 566, 283, 102, 48 + frontClearance],
  ['center-bookshelf-base', 724, 283, 127, 107 + frontClearance],
  // Connect the board's legs and panel footprint to the north wall: no rear passage.
  ['board-footprint', 1642, 283, 160, 159]
].map(([colliderId, x, y, width, height]) => ({ colliderId, area: rect(x, y, width, height) }));

export const interactions = [
  { hotspotId:'board',kind:'board',label:'Cambiar estado del pizarrón',area:rect(1632,444,174,94) },
  { hotspotId:'west-workstation',kind:'computer',label:'Escritorio lateral: accesos pendientes',area:rect(162,720,216,62) },
  { hotspotId:'east-workstation-left',kind:'computer',label:'Escritorio izquierdo: accesos pendientes',area:rect(1118,891,246,87) },
  { hotspotId:'east-workstation-right',kind:'computer',label:'Escritorio derecho: accesos pendientes',area:rect(1457,891,246,87) }
];
export const windows = [rect(324,191,156,43),rect(904,191,156,43),rect(1547,191,157,43)];
export const boardSurface = rect(1667,241,116,143);
export const boardCorners = [{x:1668,y:246},{x:1782,y:299},{x:1782,y:380},{x:1668,y:326}];
