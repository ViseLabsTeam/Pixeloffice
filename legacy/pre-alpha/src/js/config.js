export const TILE_SIZE = 32;
export const SYNC_INTERVALS = { local: 80, peer: 100, stalePlayer: 6000 };
export const EXTERNAL_LINKS = {
  documents: 'https://docs.google.com',
  drive: 'https://drive.google.com'
};
export const TILES = Object.freeze({
  WALL: 0, OFFICE_FLOOR: 1, MEETING_FLOOR: 2, COMMON_FLOOR: 3,
  BREAK_FLOOR: 4, SERVER_FLOOR: 5, DESK: 6, CHAIR: 7, ARCADE: 8,
  SERVER_RACK: 9, PLANT: 10, DOOR_CLOSED: 11, DOOR_OPEN: 12
});
export const ASSET_PATHS = Object.freeze({
  pc: 'assets/images/furniture/retro-computer.png',
  plant: 'assets/images/furniture/plant.png',
  arcade: 'assets/images/furniture/arcade-machine.png',
  parquet: 'assets/images/floors/parquet.jpg'
});
