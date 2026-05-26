
export type TileType = 'FLOOR' | 'WALL' | 'DOOR' | 'WARDROBE' | 'KEY' | 'PUZZLE' | 'EXIT' | 'STAIRS_UP' | 'STAIRS_DOWN' | 'PLATE' | 'CHAIR' | 'DESK' | 'BATHTUB' | 'SHELF' | 'BED' | 'PIANO' | 'SAFE' | 'WALL_SECRET' | 'CANDLE' | 'JAIL' | 'NPC';

export interface Tile {
  type: TileType;
  id: string;
  targetRoom?: string; // For doors
  requiredKey?: string; // For locked doors
  itemId?: string; // For items on floor
}

export interface Position {
  x: number;
  y: number;
}

export interface RoomData {
  id: string;
  name: string;
  layout: Tile[][];
  spawnPoint: Position;
}

export interface GameState {
  playerPos: Position;
  aoOniPos: Position | null;
  currentRoom: string;
  inventory: string[];
  isHiding: boolean;
  status: 'START' | 'PLAYING' | 'CHASE' | 'HIDDEN' | 'GAME_OVER' | 'WIN' | 'ENDING';
  message: string;
  moveCount: number;
  isLocked: boolean; // UI lock during transitions
  friendsSaved: number;
  gameMode: 'CLASSIC' | 'RANDOM';
  eventFlags?: Record<string, boolean>; // Persistent event triggers
  oniType?: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT';
  oniSpeech?: string;
  pendingOniSpawn?: {
    spawnPos: Position;
    oniType: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT';
    targetRoom: string;
  } | null;
}

export const TILE_SIZE = 48;
export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 10;
