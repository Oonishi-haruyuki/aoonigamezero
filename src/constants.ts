import { TileType, Tile, RoomData, Position } from './types';

const t = (type: TileType, target?: string): Tile => ({
  type,
  id: Math.random().toString(36).substr(2, 9),
  targetRoom: target,
});

const generateEmptyLayout = (w: number, h: number) => {
  return Array(h).fill(null).map(() => Array(w).fill(null).map(() => t('FLOOR')));
};

const createRoom = (id: string, name: string, spawn: Position, setup: (layout: Tile[][]) => void): RoomData => {
  const layout = generateEmptyLayout(12, 10);
  // Add borders
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 12; x++) {
      if (x === 0 || x === 11 || y === 0 || y === 9) {
        layout[y][x] = t('WALL');
      }
    }
  }
  setup(layout);
  return { id, name, layout, spawnPoint: spawn };
};

export interface LevelConfig {
  keyRoom: string;
  keyPos: Position;
  lockedDoorRoom: string;
  lockedDoorPos: Position;
  exitRoom: string;
  exitPos: Position;
}

export const LEVEL_PATTERNS: LevelConfig[] = [
  { keyRoom: 'annex_1f_left', keyPos: { x: 2, y: 2 }, lockedDoorRoom: 'annex_1f_hall_b', lockedDoorPos: { x: 5, y: 9 }, exitRoom: 'annex_1f_inner_right', exitPos: { x: 10, y: 1 } },
  { keyRoom: 'annex_1f_inner_left', keyPos: { x: 5, y: 5 }, lockedDoorRoom: 'annex_1f_entrance', lockedDoorPos: { x: 5, y: 0 }, exitRoom: 'annex_1f_inner_right', exitPos: { x: 10, y: 1 } },
  { keyRoom: 'annex_b1_hall', keyPos: { x: 2, y: 2 }, lockedDoorRoom: 'annex_1f_entrance', lockedDoorPos: { x: 11, y: 5 }, exitRoom: 'annex_2f_hall', exitPos: { x: 1, y: 1 } },
  { keyRoom: 'annex_2f_hall', keyPos: { x: 5, y: 5 }, lockedDoorRoom: 'annex_1f_hall_b', lockedDoorPos: { x: 0, y: 5 }, exitRoom: 'annex_b1_hall', exitPos: { x: 1, y: 1 } },
  { keyRoom: 'annex_1f_left', keyPos: { x: 8, y: 8 }, lockedDoorRoom: 'annex_1f_stairs', lockedDoorPos: { x: 10, y: 1 }, exitRoom: 'annex_2f_hall', exitPos: { x: 1, y: 1 } },
  { keyRoom: 'annex_1f_inner_right', keyPos: { x: 5, y: 5 }, lockedDoorRoom: 'annex_b1_stairs', lockedDoorPos: { x: 0, y: 5 }, exitRoom: 'annex_b1_hall', exitPos: { x: 5, y: 5 } },
  { keyRoom: 'annex_b1_hall', keyPos: { x: 9, y: 1 }, lockedDoorRoom: 'annex_1f_hall_a', lockedDoorPos: { x: 0, y: 5 }, exitRoom: 'annex_1f_inner_left', exitPos: { x: 1, y: 1 } },
  { keyRoom: 'annex_1f_entrance', keyPos: { x: 1, y: 1 }, lockedDoorRoom: 'annex_1f_left', lockedDoorPos: { x: 11, y: 5 }, exitRoom: 'annex_b1_hall', exitPos: { x: 1, y: 8 } },
  { keyRoom: 'annex_2f_hall', keyPos: { x: 1, y: 1 }, lockedDoorRoom: 'annex_1f_inner_right', lockedDoorPos: { x: 0, y: 5 }, exitRoom: 'annex_1f_left', exitPos: { x: 1, y: 1 } },
  { keyRoom: 'annex_1f_stairs', keyPos: { x: 5, y: 5 }, lockedDoorRoom: 'annex_1f_inner_left', lockedDoorPos: { x: 11, y: 5 }, exitRoom: 'annex_b1_hall', exitPos: { x: 9, y: 8 } },
];

export const getRooms = (patternIndex: number): Record<string, RoomData> => {
  const config = LEVEL_PATTERNS[patternIndex % LEVEL_PATTERNS.length];
  
  const rooms: Record<string, RoomData> = {
    annex_1f_entrance: createRoom('annex_1f_entrance', '第1別館 1F・玄関', { x: 5, y: 7 }, (l) => {
      l[0][5] = t('DOOR', 'annex_1f_hall_b');
      l[5][0] = t('DOOR', 'annex_1f_left');
      l[5][11] = t('DOOR', 'annex_1f_hall_a');
      l[1][2] = t('WARDROBE');
    }),

    annex_1f_left: createRoom('annex_1f_left', '第1別館 1F・左の部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'annex_1f_entrance');
      l[1][1] = t('WARDROBE');
    }),

    annex_1f_hall_a: createRoom('annex_1f_hall_a', '第1別館 1F・廊下A', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'annex_1f_entrance');
      l[5][11] = t('DOOR', 'annex_1f_stairs');
      l[3][8] = t('WARDROBE');
      l[9][8] = t('STAIRS_DOWN', 'annex_b1_stairs');
    }),

    annex_1f_stairs: createRoom('annex_1f_stairs', '第1別館 1F・階段室', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'annex_1f_hall_a');
      l[9][5] = t('DOOR', 'annex_1f_hall_a');
      l[1][10] = t('STAIRS_UP', 'annex_2f_hall');
    }),

    annex_1f_hall_b: createRoom('annex_1f_hall_b', '第1別館 1F・廊下B', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'annex_1f_entrance');
      l[5][2] = t('DOOR', 'annex_1f_inner_left');
      l[5][9] = t('DOOR', 'annex_1f_inner_right');
    }),

    annex_1f_inner_left: createRoom('annex_1f_inner_left', '第1別館 1F・奥左の部屋', { x: 9, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'annex_1f_hall_b');
      l[2][2] = t('WARDROBE');
    }),

    annex_1f_inner_right: createRoom('annex_1f_inner_right', '第1別館 1F・奥右の部屋', { x: 2, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'annex_1f_hall_b');
    }),

    annex_b1_stairs: createRoom('annex_b1_stairs', '第1別館 B1F・階段室', { x: 8, y: 1 }, (l) => {
      l[0][8] = t('STAIRS_UP', 'annex_1f_hall_a');
      l[5][0] = t('DOOR', 'annex_b1_hall');
    }),

    annex_b1_hall: createRoom('annex_b1_hall', '第1別館 B1F・廊下', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'annex_b1_stairs');
    }),

    annex_2f_hall: createRoom('annex_2f_hall', '第1別館 2F・廊下', { x: 10, y: 8 }, (l) => {
      l[9][10] = t('STAIRS_DOWN', 'annex_1f_stairs');
    })
  };

  // APPLY CONFIG
  const keyRoom = rooms[config.keyRoom];
  if (keyRoom) keyRoom.layout[config.keyPos.y][config.keyPos.x] = t('KEY');

  const lockedRoom = rooms[config.lockedDoorRoom];
  if (lockedRoom) {
    const tile = lockedRoom.layout[config.lockedDoorPos.y][config.lockedDoorPos.x];
    tile.requiredKey = '銀の鍵';
  }

  const exitRoom = rooms[config.exitRoom];
  if (exitRoom) {
    const tile = t('EXIT');
    tile.requiredKey = '銀の鍵';
    exitRoom.layout[config.exitPos.y][config.exitPos.x] = tile;
  }

  return rooms;
};

export const getClassicRooms = (): Record<string, RoomData> => {
  const rooms: Record<string, RoomData> = {
    mansion_1f_entrance: createRoom('mansion_1f_entrance', '本館1F・玄関', { x: 5, y: 7 }, (l) => {
      l[0][5] = t('DOOR', 'mansion_1f_north_hall'); // To North Hall
      l[5][0] = t('DOOR', 'mansion_1f_library');    // Left door to Library (図書室)
      l[5][0].requiredKey = '図書室の鍵';
      l[5][11] = t('DOOR', 'mansion_1f_bathroom');   // Right door to Bathroom (風呂場)
      l[1][1] = t('STAIRS_UP', 'mansion_2f_hall');   // Stairs up to 2F
      l[1][2] = t('WARDROBE');                       // Wardrobe to hide
      
      // Escape exit at the bottom
      const exitTile = t('EXIT');
      exitTile.requiredKey = '別館の鍵';            // Needs Annex Key (別館の鍵) to escape under new rules!
      l[9][5] = exitTile;
    }),

    mansion_1f_north_hall: createRoom('mansion_1f_north_hall', '本館1F・廊下', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_entrance');   // Door back to Entrance Hall
      l[0][5] = t('DOOR', 'mansion_1f_living_room'); // To Living Room
      l[5][0] = t('DOOR', 'mansion_1f_washroom');   // To washroom (Detergent) Warning: detergent inside!
      
      l[5][11] = t('DOOR', 'mansion_1f_tatami');     // To Tatami room
      l[5][11].requiredKey = '地下室の鍵';           // This is unlocked with basement/jail keys eventually
      
      l[1][9] = t('STAIRS_DOWN', 'mansion_bf_hall'); // Stairs to Basement
      l[1][9].requiredKey = '地下室の鍵'; // Needs basement key!
    }),

    mansion_1f_living_room: createRoom('mansion_1f_living_room', '本館1F・リビング', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_north_hall');
      l[3][5] = t('PLATE');                         // Table plate
      l[1][2] = t('WARDROBE');
    }),

    mansion_1f_washroom: createRoom('mansion_1f_washroom', '本館1F・洗面所', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_1f_north_hall');
      l[2][4] = t('SHELF');                         // Washroom shelf inside
    }),

    mansion_1f_library: createRoom('mansion_1f_library', '本館1F・図書室', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_1f_entrance');
      l[4][4] = t('DESK');                         // Library desk with book
      l[1][2] = t('WARDROBE');
    }),

    mansion_1f_bathroom: createRoom('mansion_1f_bathroom', '本館1F・風呂場', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_1f_entrance');
      l[3][6] = t('BATHTUB');                      // Bathtub filled with water
      l[1][2] = t('WARDROBE');
    }),

    mansion_1f_tatami: createRoom('mansion_1f_tatami', '本館1F・畳の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_1f_north_hall');
      l[5][11] = t('DOOR', 'mansion_1f_tatami_fusuma'); // Fusuma doorway where Ao Oni jumps out!
      l[1][5] = t('WALL_SECRET');                  // Peeling wallpaper
    }),

    mansion_1f_hidden_room: createRoom('mansion_1f_hidden_room', '本館1F・隠し部屋', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_tatami');
      l[5][5] = t('CANDLE');                      // Pitch black room candle
      l[1][2] = t('WARDROBE');                      // This wardrobe can block door/move!
    }),

    mansion_1f_barred: createRoom('mansion_1f_barred', '本館1F・格子戸の間', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_hidden_room');
      l[4][5] = t('JAIL');                        // Grid lock bars door
      l[2][5] = t('SHELF');                       // Cabinet containing Basement key (地下室の鍵)
    }),

    mansion_2f_hall: createRoom('mansion_2f_hall', '本館2F・廊下', { x: 2, y: 2 }, (l) => {
      l[1][1] = t('STAIRS_DOWN', 'mansion_1f_entrance');
      l[1][10] = t('STAIRS_UP', 'mansion_3f_hall');
      
      l[1][2] = t('DOOR', 'mansion_2f_bedroom');
      l[1][2].requiredKey = '寝室の鍵';
      
      l[1][9] = t('DOOR', 'mansion_2f_right_room');
      l[5][0] = t('DOOR', 'mansion_2f_child_room');
      l[5][0].requiredKey = '子供部屋の鍵';
      
      l[5][11] = t('DOOR', 'mansion_2f_piano_room');
      l[7][8] = t('WARDROBE');
    }),

    mansion_2f_bedroom: createRoom('mansion_2f_bedroom', '本館2F・客室', { x: 2, y: 8 }, (l) => {
      l[9][2] = t('DOOR', 'mansion_2f_hall');
      l[3][5] = t('CHAIR');                        // Moveable chair -> figure 図書室の鍵 under it
      l[1][8] = t('WARDROBE');
    }),

    mansion_2f_right_room: createRoom('mansion_2f_right_room', '本館2F・右客室', { x: 9, y: 8 }, (l) => {
      l[9][9] = t('DOOR', 'mansion_2f_hall');
      l[4][5] = t('KEY');                          // Handkerchief (ハンカチ) on floor
      l[4][5].itemId = 'ハンカチ';
      l[1][2] = t('WARDROBE');
    }),

    mansion_2f_child_room: createRoom('mansion_2f_child_room', '本館2F・子供部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_2f_hall');
      l[4][3] = t('CHAIR');                        // Chair needing movement to shelf
      l[2][3] = t('SHELF');                        // High shelf containing Lighter Fluid
      l[1][8] = t('WARDROBE');
    }),

    mansion_2f_piano_room: createRoom('mansion_2f_piano_room', '本館2F・ピアノ室', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_2f_hall');
      l[4][5] = t('PIANO');                        // Blood stained piano keys
      l[1][9] = t('WARDROBE');                     // Move to reveal safe under it
      l[1][1] = t('STAIRS_UP', 'mansion_3f_bedroom'); // Secret floor drop coordinates
    }),

    mansion_3f_hall: createRoom('mansion_3f_hall', '本館3F・廊下', { x: 10, y: 2 }, (l) => {
      l[1][10] = t('STAIRS_DOWN', 'mansion_2f_hall');
      l[2][1] = t('DOOR', 'mansion_3f_bedroom');
      l[2][9] = t('DOOR', 'mansion_3f_end_room');
    }),

    mansion_3f_bedroom: createRoom('mansion_3f_bedroom', '本館3F・寝室', { x: 2, y: 8 }, (l) => {
      l[9][2] = t('DOOR', 'mansion_3f_hall');
      l[3][3] = t('BED');                          // Moveable bed on the left
      l[1][8] = t('WARDROBE');
    }),

    mansion_3f_end_room: createRoom('mansion_3f_end_room', '本館3F・奥の部屋', { x: 9, y: 8 }, (l) => {
      l[9][9] = t('DOOR', 'mansion_3f_hall');
      l[5][5] = t('NPC');                          // Friends NPC (Takuro)
      l[1][5] = t('DOOR', 'mansion_3f_knob_trap'); // Locked handle door -> unscrew with driver for Door Knob!
    }),

    mansion_bf_hall: createRoom('mansion_bf_hall', '本館B1F・廊下', { x: 9, y: 2 }, (l) => {
      l[1][9] = t('STAIRS_UP', 'mansion_1f_north_hall');
      l[5][0] = t('DOOR', 'mansion_bf_left');
      l[5][11] = t('DOOR', 'mansion_bf_right');
    }),

    mansion_bf_left: createRoom('mansion_bf_left', '本館B1F・左の部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_bf_hall');
      l[4][4] = t('CHAIR');                        // Move chair for Minus Screwdriver Bit
      l[2][8] = t('SHELF');                        // High cabinet holding Jail Key
    }),

    mansion_bf_right: createRoom('mansion_bf_right', '本館B1F・右の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_bf_hall');
      l[5][11] = t('DOOR', 'mansion_bf_jail');
      l[5][11].requiredKey = '地下牢の鍵';
      l[1][4] = t('WARDROBE');                     // Wardrobe Left (need left-right sequence)
      l[1][7] = t('WARDROBE');                     // Wardrobe Right (need left-right sequence)
    }),

    mansion_bf_jail: createRoom('mansion_bf_jail', '本館B1F・地下牢', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_bf_right');
      l[4][5] = t('JAIL');                         // Cell bars
      l[1][5] = t('CANDLE');                       // Candle in dark cell space
    })
  };
  return rooms;
};

export const ROOMS = getRooms(0);
