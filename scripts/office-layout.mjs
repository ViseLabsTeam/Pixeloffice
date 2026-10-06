// Editable layout for the fixed 1920 × 1080 office. Units in position are
// background pixels; pivot and collider use source PNG pixels.
// The pivot is the point of the source image placed at position. Scale converts
// every source offset to background pixels.
const rect = (x, y, width, height) => ({ shape: 'rect', x, y, width, height });
// Two background pixels of extra clearance on the screen-down (-Y control) edge.
const frontClearance = 2;
const monitorDeskClearance = frontClearance + 2;

export const furniture = [
  {
    id: 'west-chair', source: 'furniture/chair/SILLA X.png',
    position: { x: 258, y: 657 }, scale: 0.9, pivot: { x: 74, y: 140 },
    collider: [rect(32, 70, 75, 70 + frontClearance / 0.9)],
    depth: { axis: 'x', offset: 0, behindSide: 'positive' }, renderOrder: 10
  },
  {
    id: 'west-desk', source: 'furniture/table/escritorio x.png',
    position: { x: 305.7, y: 706.8 }, scale: 0.3, pivot: { x: 277, y: 662 },
    // The tabletop occupies the complete 348 × 520 source-pixel surface.
    // Legs below y=554 and the tall monitor are visual only.
    collider: [rect(94, 34, 348, 520 + monitorDeskClearance / 0.3)],
    // The use side is left (chair); the opposite side is right.
    depth: { axis: 'x', offset: 185, behindSide: 'positive',
      secondary: { axis: 'y', offset: -105, behindSide: 'positive' } }, renderOrder: 20
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
  ['board-left-leg', 1642, 378, 36, 38 + frontClearance],
  ['board-right-leg', 1762, 396, 40, 44 + frontClearance],
  ['board-base', 1660, 408, 122, 32 + frontClearance]
].map(([colliderId, x, y, width, height]) => ({ colliderId, area: rect(x, y, width, height) }));

export const interactions = [
  { hotspotId:'board',kind:'board',label:'Cambiar estado del pizarrón',area:rect(1632,444,174,94) },
  { hotspotId:'west-workstation',kind:'computer',label:'Escritorio lateral: accesos pendientes',area:rect(162,696,216,86) }
];
export const windows = [rect(324,191,156,43),rect(904,191,156,43),rect(1547,191,157,43)];
export const boardSurface = rect(1667,241,116,143);
export const boardCorners = [{x:1668,y:246},{x:1782,y:299},{x:1782,y:380},{x:1668,y:326}];
