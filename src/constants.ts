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
      
      // Support 4 grand entrance pillars (柱)
      l[3][3] = t('COLUMN');
      l[3][8] = t('COLUMN');
      l[6][3] = t('COLUMN');
      l[6][8] = t('COLUMN');

      // More furniture (家具)
      l[1][9] = t('SHELF');
      l[1][10] = t('SHELF');
      
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

      // Add a branching winding wall creating a dead end (行き止まり) on the left side!
      l[7][2] = t('WALL');
      l[7][3] = t('WALL');
      l[7][4] = t('WALL');
      
      // Column pillars (柱) as obstacles to weave around during a chase
      l[3][2] = t('COLUMN');
      l[3][9] = t('COLUMN');

      // Extra furniture decoration (家具)
      l[1][4] = t('SHELF');
    }),

    mansion_1f_living_room: createRoom('mansion_1f_living_room', '本館1F・リビング', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_north_hall');
      l[3][5] = t('PLATE');                         // Table plate
      l[3][4] = t('CHAIR');                         // Chairs around dining table
      l[3][6] = t('CHAIR');
      l[1][2] = t('WARDROBE');
      l[1][10] = t('WARDROBE');                     // Second wardrobe
      l[1][9] = t('COLUMN');                        // Structural element pillar
    }),

    mansion_1f_washroom: createRoom('mansion_1f_washroom', '本館1F・洗面所', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_1f_north_hall');
      l[2][4] = t('SHELF');                         // Washroom shelf inside
      l[2][3] = t('SHELF');                         // Extra cabinet (家具)
      l[1][1] = t('COLUMN');                        // Column inside washroom
      
      // Pitfall trap (落とし穴) dropping to B1F Left storage room!
      l[5][2] = t('HOLE', 'mansion_bf_left');
    }),

    mansion_1f_library: createRoom('mansion_1f_library', '本館1F・図書室', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_1f_entrance');
      l[4][4] = t('DESK');                         // Library desk with book
      l[4][3] = t('CHAIR');                        // Reading chair
      l[4][5] = t('CHAIR');                        // Reading chair
      l[1][2] = t('WARDROBE');
      l[1][9] = t('COLUMN');                       // Support column
    }),

    mansion_1f_bathroom: createRoom('mansion_1f_bathroom', '本館1F・風呂場', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_1f_entrance');
      l[3][6] = t('BATHTUB');                      // Bathtub filled with water
      l[1][2] = t('WARDROBE');
      l[1][9] = t('WARDROBE');                     // Extra hide corner
      l[1][1] = t('COLUMN');                       // Bath pillar
    }),

    mansion_1f_tatami: createRoom('mansion_1f_tatami', '本館1F・畳の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_1f_north_hall');
      l[5][11] = t('DOOR', 'mansion_1f_tatami_fusuma'); // Fusuma doorway where Ao Oni jumps out!
      l[1][5] = t('WALL_SECRET');                  // Peeling wallpaper
      
      // Room dividers forming a traditional dead end corner
      l[3][3] = t('WALL');
      l[4][3] = t('WALL');
      l[2][2] = t('COLUMN');
      l[4][5] = t('CHAIR');
      l[4][6] = t('PLATE');                        // Tea table plate
    }),

    mansion_1f_hidden_room: createRoom('mansion_1f_hidden_room', '本館1F・隠し部屋', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_tatami');
      l[5][5] = t('CANDLE');                      // Pitch black room candle
      l[1][2] = t('WARDROBE');                      // This wardrobe can block door/move!
      l[1][9] = t('COLUMN');                        // Ancient structural pillar
    }),

    mansion_1f_barred: createRoom('mansion_1f_barred', '本館1F・格子戸の間', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'mansion_1f_hidden_room');
      l[4][5] = t('JAIL');                        // Grid lock bars door
      l[2][5] = t('SHELF');                       // Cabinet containing Basement key (地下室の鍵)
      l[1][1] = t('COLUMN');
      l[1][10] = t('COLUMN');
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

      // Splitting wall layout to form a central dead end nook at (y=7..9, x=1..2)
      l[7][3] = t('WALL');
      l[8][3] = t('WALL');
      l[9][3] = t('WALL');

      // Grand pillars (柱) as obstacles
      l[3][10] = t('COLUMN');
      l[6][6] = t('COLUMN');

      // Cluttering corridors with drawers (家具)
      l[7][10] = t('SHELF');
      l[4][1] = t('SHELF');
    }),

    mansion_2f_bedroom: createRoom('mansion_2f_bedroom', '本館2F・客室', { x: 2, y: 8 }, (l) => {
      l[9][2] = t('DOOR', 'mansion_2f_hall');
      l[3][5] = t('CHAIR');                        // Moveable chair -> figure 図書室の鍵 under it
      l[1][8] = t('WARDROBE');
      
      // Extra details (家具 & 柱)
      l[1][1] = t('COLUMN');
      l[1][9] = t('COLUMN');
      l[5][2] = t('SHELF');
    }),

    mansion_2f_right_room: createRoom('mansion_2f_right_room', '本館2F・右客室', { x: 9, y: 8 }, (l) => {
      l[9][9] = t('DOOR', 'mansion_2f_hall');
      l[4][5] = t('KEY');                          // Handkerchief (ハンカチ) on floor
      l[4][5].itemId = 'ハンカチ';
      l[1][2] = t('WARDROBE');

      // Pitfall trap (落とし穴) dropping to 1F Bathroom!
      l[4][2] = t('HOLE', 'mansion_1f_bathroom');

      // Elements (柱 & 家具)
      l[1][9] = t('COLUMN');
      l[7][2] = t('SHELF');
    }),

    mansion_2f_child_room: createRoom('mansion_2f_child_room', '本館2F・子供部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_2f_hall');
      l[4][3] = t('CHAIR');                        // Chair needing movement to shelf
      l[2][3] = t('SHELF');                        // High shelf containing Lighter Fluid
      l[1][8] = t('WARDROBE');

      // Cluttered interior elements (家具 & 柱 & 落とし穴)
      l[2][1] = t('COLUMN');
      l[7][2] = t('SHELF');
      
      // Pitfall trap (落とし穴) dropping to 1F Library
      l[7][5] = t('HOLE', 'mansion_1f_library');
    }),

    mansion_2f_piano_room: createRoom('mansion_2f_piano_room', '本館2F・ピアノ室', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_2f_hall');
      l[4][5] = t('PIANO');                        // Blood stained piano keys
      l[1][9] = t('WARDROBE');                     // Move to reveal safe under it
      l[1][1] = t('STAIRS_UP', 'mansion_3f_bedroom'); // Secret floor drop coordinates
      l[1][10] = t('COLUMN');
    }),

    mansion_3f_hall: createRoom('mansion_3f_hall', '本館3F・廊下', { x: 10, y: 2 }, (l) => {
      l[1][10] = t('STAIRS_DOWN', 'mansion_2f_hall');
      l[2][1] = t('DOOR', 'mansion_3f_bedroom');
      l[2][9] = t('DOOR', 'mansion_3f_end_room');

      // Outer winding partition forming high-stakes maze bends and a dead end (y=7, x=8..10)
      l[4][2] = t('WALL');
      l[4][3] = t('WALL');
      l[4][4] = t('WALL');
      l[4][5] = t('WALL');
      l[5][5] = t('WALL');
      l[6][5] = t('WALL');
      l[7][5] = t('WALL');

      l[6][7] = t('WALL');
      l[6][8] = t('WALL');
      l[6][9] = t('WALL');
      l[6][10] = t('WALL');

      // Pillars (柱) & Drawers (家具)
      l[3][2] = t('COLUMN');
      l[7][7] = t('COLUMN');
      l[8][2] = t('SHELF');
    }),

    mansion_3f_bedroom: createRoom('mansion_3f_bedroom', '本館3F・寝室', { x: 2, y: 8 }, (l) => {
      l[9][2] = t('DOOR', 'mansion_3f_hall');
      l[3][3] = t('BED');                          // Moveable bed on the left
      l[1][8] = t('WARDROBE');

      // Extra scenery additions (家具 & 柱 & 落とし穴)
      l[1][1] = t('COLUMN');
      l[1][5] = t('SHELF');
      
      // Static pitfall hole (落とし穴) dropping to 2F Guest Bedroom!
      l[7][8] = t('HOLE', 'mansion_2f_bedroom');
    }),

    mansion_3f_end_room: createRoom('mansion_3f_end_room', '本館3F・奥の部屋', { x: 9, y: 8 }, (l) => {
      l[9][9] = t('DOOR', 'mansion_3f_hall');
      l[5][5] = t('NPC');                          // Friends NPC (Takuro)
      l[1][5] = t('DOOR', 'mansion_3f_knob_trap'); // Locked handle door -> unscrew with driver for Door Knob!
      l[1][1] = t('COLUMN');
      l[1][10] = t('COLUMN');
      l[3][2] = t('SHELF');
    }),

    mansion_bf_hall: createRoom('mansion_bf_hall', '本館B1F・廊下', { x: 9, y: 2 }, (l) => {
      l[1][9] = t('STAIRS_UP', 'mansion_1f_north_hall');
      l[5][0] = t('DOOR', 'mansion_bf_left');
      l[5][11] = t('DOOR', 'mansion_bf_right');

      // rugged stone partitions forming winding loops and a dead end lock at (y=7..8, x=1..2)
      l[3][3] = t('WALL');
      l[3][4] = t('WALL');
      l[3][5] = t('WALL');
      l[4][5] = t('WALL');
      l[5][5] = t('WALL');

      l[6][3] = t('WALL');
      l[7][3] = t('WALL');
      l[8][3] = t('WALL');

      // Medieval pillars (柱)
      l[2][2] = t('COLUMN');
      l[2][9] = t('COLUMN');
      l[7][9] = t('COLUMN');

      // Dungeon lockers (家具)
      l[7][1] = t('SHELF');
    }),

    mansion_bf_left: createRoom('mansion_bf_left', '本館B1F・左の部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'mansion_bf_hall');
      l[4][4] = t('CHAIR');                        // Move chair for Minus Screwdriver Bit
      l[2][8] = t('SHELF');                        // High cabinet holding Jail Key
      
      l[1][1] = t('COLUMN');
      l[7][8] = t('SHELF');
    }),

    mansion_bf_right: createRoom('mansion_bf_right', '本館B1F・右の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_bf_hall');
      l[5][11] = t('DOOR', 'mansion_bf_jail');
      l[5][11].requiredKey = '地下牢の鍵';
      l[1][4] = t('WARDROBE');                     // Wardrobe Left (need left-right sequence)
      l[1][7] = t('WARDROBE');                     // Wardrobe Right (need left-right sequence)
      
      l[1][1] = t('COLUMN');
      l[7][2] = t('SHELF');
    }),

    mansion_bf_jail: createRoom('mansion_bf_jail', '本館B1F・地下牢', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'mansion_bf_right');
      l[4][5] = t('JAIL');                         // Cell bars
      l[1][5] = t('CANDLE');                       // Candle in dark cell space

      l[1][2] = t('COLUMN');
      l[1][9] = t('COLUMN');
    }),

    // --- CLASSIC ANNEX (別館) ROOMS ---
    classic_annex_1f_entrance: createRoom('classic_annex_1f_entrance', '別館1F・玄関', { x: 5, y: 7 }, (l) => {
      l[0][5] = t('DOOR', 'classic_annex_1f_corridor');
      l[5][0] = t('DOOR', 'classic_annex_1f_left');
      l[5][11] = t('DOOR', 'classic_annex_1f_drop_room');
      l[1][1] = t('WARDROBE');
      l[3][3] = t('COLUMN');
      l[3][8] = t('COLUMN');
      // Return door to mansion
      l[9][5] = t('DOOR', 'mansion_1f_entrance');
    }),

    classic_annex_1f_corridor: createRoom('classic_annex_1f_corridor', '別館1F・廊下', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_1f_entrance');
      l[5][0] = t('DOOR', 'classic_annex_1f_doll_left');
      l[5][11] = t('DOOR', 'classic_annex_1f_doll_right');
      l[1][1] = t('STAIRS_UP', 'classic_annex_2f_corridor');
      l[7][8] = t('WARDROBE');
    }),

    classic_annex_1f_left: createRoom('classic_annex_1f_left', '別館1F・左の部屋(暗室)', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_1f_entrance');
      l[9][5] = t('DOOR', 'classic_annex_1f_statue');
      l[1][5] = t('CANDLE'); // Represent oil candle holder
      l[4][5] = t('NPC');    // Takeshi
    }),

    classic_annex_1f_statue: createRoom('classic_annex_1f_statue', '別館1F・銅像破砕の間', { x: 5, y: 1 }, (l) => {
      l[0][5] = t('DOOR', 'classic_annex_1f_left');
      l[4][5] = t('DESK'); // Statue object
    }),

    classic_annex_1f_doll_left: createRoom('classic_annex_1f_doll_left', '別館1F・左の人形部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_1f_corridor');
      l[4][3] = t('SHELF'); // Dolls pile
      l[2][2] = t('PUZZLE'); // Headless doll puzzle / safe
      l[3][2] = t('COLUMN');
      l[7][9] = t('COLUMN');
    }),

    classic_annex_1f_doll_right: createRoom('classic_annex_1f_doll_right', '別館1F・右の人形部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_1f_corridor');
      l[6][9] = t('SHELF'); // Defaced doll pile
      l[2][8] = t('COLUMN');
      l[7][2] = t('COLUMN');
      l[4][1] = t('PLATE'); // Light Switch
      l[8][9] = t('DOOR', 'classic_annex_2_1f_corridor'); // Hidden Backdoor
      l[8][9].requiredKey = '裏口の鍵';
    }),

    classic_annex_2f_corridor: createRoom('classic_annex_2f_corridor', '別館2F・廊下', { x: 1, y: 2 }, (l) => {
      l[1][1] = t('STAIRS_DOWN', 'classic_annex_1f_corridor');
      l[1][10] = t('STAIRS_UP', 'classic_annex_3f_corridor');
      l[5][0] = t('DOOR', 'classic_annex_2f_left');
      l[5][11] = t('DOOR', 'classic_annex_2f_right');
    }),

    classic_annex_2f_left: createRoom('classic_annex_2f_left', '別館2F・左の部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_2f_corridor');
      l[3][5] = t('SHELF'); // Desktop desk lamp / stand containing Light Bulb
    }),

    classic_annex_2f_right: createRoom('classic_annex_2f_right', '別館2F・右の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_2f_corridor');
      l[1][5] = t('CANDLE'); // Fireplace representation
      l[1][2] = t('WARDROBE');
    }),

    classic_annex_3f_corridor: createRoom('classic_annex_3f_corridor', '別館3F・廊下', { x: 10, y: 2 }, (l) => {
      l[1][10] = t('STAIRS_DOWN', 'classic_annex_2f_corridor');
      l[5][0] = t('DOOR', 'classic_annex_3f_left');
      l[5][11] = t('DOOR', 'classic_annex_3f_right');
    }),

    classic_annex_3f_left: createRoom('classic_annex_3f_left', '別館3F・左下の部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_3f_corridor');
      l[1][5] = t('WALL_SECRET'); // Wall wallpaper section peeling to reveal 290
    }),

    classic_annex_3f_right: createRoom('classic_annex_3f_right', '別館3F・右下の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_3f_corridor');
      l[4][5] = t('CHAIR'); // Box pushing
      l[4][8] = t('PLATE'); // Recess tile to lock box
    }),

    classic_annex_1f_drop_room: createRoom('classic_annex_1f_drop_room', '別館1F・右の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_1f_entrance');
      l[5][5] = t('HOLE', 'classic_annex_bf_corridor'); // Drops to B1 corridor
    }),

    classic_annex_bf_corridor: createRoom('classic_annex_bf_corridor', '別館B1F・廊下', { x: 5, y: 7 }, (l) => {
      l[2][5] = t('DOOR', 'classic_annex_bf_dark');
      l[2][5].requiredKey = '地下室の鍵';
      l[5][0] = t('DOOR', 'classic_annex_bf_bath');
      l[7][8] = t('WARDROBE');
    }),

    classic_annex_bf_dark: createRoom('classic_annex_bf_dark', '別館B1F・地下暗室', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_bf_corridor');
      l[5][0] = t('DOOR', 'classic_annex_bf_breaker');
      l[5][11] = t('DOOR', 'classic_annex_bf_pwd_door');
    }),

    classic_annex_bf_breaker: createRoom('classic_annex_bf_breaker', '別館B1F・ブレーカー室', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_bf_dark');
      l[4][5] = t('CHAIR'); // Breaker electrical wood blocking board
      l[1][5] = t('SHELF'); // Bookcase containing Picture Book
    }),

    classic_annex_bf_pwd_door: createRoom('classic_annex_bf_pwd_door', '別館B1F・暗号ドア室', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_bf_dark');
      l[1][5] = t('DOOR', 'classic_annex_bf_inner'); // Password locked door 1237
      l[1][5].requiredKey = 'しおり配列ロック';
      l[1][4] = t('SAFE'); // Control plate screw cover
      l[7][9] = t('SHELF'); // Heavy shelf to slide
    }),

    classic_annex_bf_inner: createRoom('classic_annex_bf_inner', '別館B1F・奥の部屋(卓郎屋)', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_bf_pwd_door');
      l[5][11] = t('DOOR', 'classic_annex_bf_middle');
      l[1][5] = t('WARDROBE'); // Wardrobe containing Takuro
      l[1][1] = t('DOOR', 'classic_annex_bf_hidden_passage'); // Locked secret passage door
      l[1][1].requiredKey = '隠し扉の鍵';
    }),

    classic_annex_bf_middle: createRoom('classic_annex_bf_middle', '別館B1F・真ん中の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_bf_inner');
      l[5][5] = t('PLATE'); // Warped carpet
    }),

    classic_annex_bf_bath: createRoom('classic_annex_bf_bath', '別館B1F・浴槽室', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_bf_corridor');
      l[1][5] = t('WALL_SECRET'); // Shower curtains
      l[2][5] = t('BATHTUB');     // Bath basin containing Red Key / sliding
    }),

    classic_annex_bf_cell: createRoom('classic_annex_bf_cell', '別館B1F・格子戸の間', { x: 5, y: 8 }, (l) => {
      l[4][5] = t('JAIL'); // Rusted grid lock
      l[2][5] = t('KEY');  // Holds Cell exit Key inside target
      l[2][5].itemId = '格子戸の鍵';
      l[2][2] = t('PUZZLE'); // Color button sequence panel
      l[8][5] = t('STAIRS_UP', 'classic_annex_bf_bath'); // Ladder to return back up to bath
    }),

    classic_annex_bf_hidden_passage: createRoom('classic_annex_bf_hidden_passage', '別館B1F・隠し通路', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_bf_inner');
      l[5][11] = t('DOOR', 'classic_annex_bf_ladder_room');
    }),

    classic_annex_bf_ladder_room: createRoom('classic_annex_bf_ladder_room', '別館B1F・はしごの間', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_bf_hidden_passage');
      l[1][5] = t('STAIRS_UP', 'classic_annex_2_1f_corridor'); // Ladder lead out to backyard (Annex 2)
    }),

    // --- CLASSIC ANNEX 2 (第二別館) ROOMS ---
    classic_annex_2_1f_corridor: createRoom('classic_annex_2_1f_corridor', '第二別館1F・通路', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_1f_doll_right'); // Backdoor entrance from Annex 1 (unlocked by Backdoor Key / 裏口の鍵)
      l[1][1] = t('STAIRS_UP', 'classic_annex_2_2f_corridor');
      l[5][11] = t('DOOR', 'classic_annex_2_1f_altar_room');
      l[5][5] = t('HOLE', 'classic_annex_2_1f_ladder_bottom'); // Hole in floor
    }),

    classic_annex_2_1f_ladder_bottom: createRoom('classic_annex_2_1f_ladder_bottom', '第二別館1F・はしご下の一室', { x: 5, y: 2 }, (l) => {
      l[1][5] = t('STAIRS_UP', 'classic_annex_2_1f_corridor'); // Rope ladder back up
      l[4][5] = t('SHELF'); // Frame holding Blue Piece
    }),

    classic_annex_2_1f_altar_room: createRoom('classic_annex_2_1f_altar_room', '第二別館1F・祭壇の間', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_2_1f_corridor');
      l[1][5] = t('DESK'); // Throne / Altar
      // Buttons representing the chairs
      l[4][2] = t('CHAIR');  // Chair button Left-Back
      l[4][4] = t('CHAIR');  // Chair button Center-Back
      l[4][6] = t('CHAIR');  // Chair button Center-Front
      l[4][8] = t('CHAIR'); // Chair button Right-Front
    }),

    classic_annex_2_2f_corridor: createRoom('classic_annex_2_2f_corridor', '第二別館2F・通路', { x: 1, y: 2 }, (l) => {
      l[1][1] = t('STAIRS_DOWN', 'classic_annex_2_1f_corridor');
      l[5][0] = t('DOOR', 'classic_annex_2_2f_closet_room');
      l[5][6] = t('DOOR', 'classic_annex_2_2f_study'); // Study (requires Study Key / 書斎の鍵)
      l[5][6].requiredKey = '書斎の鍵';
      l[5][11] = t('DOOR', 'classic_annex_2_2f_hidden_room_entrance');
    }),

    classic_annex_2_2f_closet_room: createRoom('classic_annex_2_2f_closet_room', '第二別館2F・一番階段に近い部屋', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_2_2f_corridor');
      l[5][3] = t('HOLE', 'classic_annex_2_1f_dice_pic_room'); // Drops down to 1F dice pic room
      l[2][2] = t('KEY'); // Blue Piece 1 on the floor
      l[2][2].itemId = '青いピース';
    }),

    classic_annex_2_1f_dice_pic_room: createRoom('classic_annex_2_1f_dice_pic_room', '第二別館1F・スライド目の一室', { x: 5, y: 2 }, (l) => {
      l[1][5] = t('DOOR', 'classic_annex_2_1f_corridor');
      l[4][5] = t('PUZZLE'); // Dice Frame / Picture
    }),

    classic_annex_2_2f_hidden_room_entrance: createRoom('classic_annex_2_2f_hidden_room_entrance', '第二別館2F・奥の部屋', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_2_2f_corridor');
      l[1][10] = t('WALL_SECRET'); // Wall slice for secret entrance
    }),

    classic_annex_2_2f_closet_hiding_room: createRoom('classic_annex_2_2f_closet_hiding_room', '第二別館2F・隠しクローゼット部屋', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_2_2f_hidden_room_entrance');
      l[1][5] = t('WARDROBE'); // Wardrobe containing hiding spot
      l[4][5] = t('DESK'); // Desk with Dice
    }),

    classic_annex_2_2f_study: createRoom('classic_annex_2_2f_study', '第二別館2F・書斎', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_2_2f_corridor');
      l[1][5] = t('SHELF'); // Shelf containing too-high Safe
      l[1][7] = t('PLATE'); // 4 screws cover
      l[5][5] = t('CHAIR'); // Movable chair
    }),

    classic_annex_2_bf_corridor: createRoom('classic_annex_2_bf_corridor', '第二別館B1F・通路', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('STAIRS_UP', 'classic_annex_2_1f_altar_room'); // Back to altar stairs
      l[5][0] = t('DOOR', 'classic_annex_2_bf_jail_corridor'); // Jail cell corridor
      l[5][11] = t('DOOR', 'classic_annex_2_bf_dark_room_1'); // Dark room 1
      l[1][5] = t('DOOR', 'classic_annex_2_bf_final_frame_room'); // Top final frame room
      l[1][1] = t('DOOR', 'classic_annex_2_bf_sleeping_room'); // Sleeping Room
    }),

    classic_annex_2_bf_dark_room_1: createRoom('classic_annex_2_bf_dark_room_1', '第二別館B1F・地下暗室1', { x: 1, y: 5 }, (l) => {
      l[5][0] = t('DOOR', 'classic_annex_2_bf_corridor');
      l[4][5] = t('CANDLE'); // Room Candle
    }),

    classic_annex_2_bf_jail_corridor: createRoom('classic_annex_2_bf_jail_corridor', '第二別館B1F・牢屋前通路', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_2_bf_corridor');
      l[4][5] = t('JAIL'); // Jail bars blocking key
      l[1][1] = t('KEY'); // Study Key out of reach
      l[1][1].itemId = '書斎の鍵';
      l[1][5] = t('CANDLE'); // Room Candle
      l[1][10] = t('DOOR', 'classic_annex_2_bf_big_jail'); // Door to big jail
      l[1][10].requiredKey = '別館2の地下室の鍵'; // Required key
    }),

    classic_annex_2_bf_sleeping_room: createRoom('classic_annex_2_bf_sleeping_room', '第二別館B1F・奇妙な寝室', { x: 10, y: 8 }, (l) => {
      l[9][10] = t('DOOR', 'classic_annex_2_bf_corridor');
      // 4 beds representing curtains and shapes
      l[2][2] = t('BED');
      l[2][8] = t('BED');
      l[6][2] = t('BED');
      l[6][8] = t('BED');
    }),

    classic_annex_2_bf_big_jail: createRoom('classic_annex_2_bf_big_jail', '第二別館B1F・大牢獄の広間', { x: 10, y: 5 }, (l) => {
      l[5][11] = t('DOOR', 'classic_annex_2_bf_jail_corridor');
      l[4][5] = t('JAIL'); // Large jail holding many Ao Oni
    }),

    classic_annex_2_bf_final_frame_room: createRoom('classic_annex_2_bf_final_frame_room', '第二別館B1F・紋章額の間', { x: 5, y: 8 }, (l) => {
      l[9][5] = t('DOOR', 'classic_annex_2_bf_corridor');
      l[4][5] = t('PUZZLE'); // Final frame needing 3 Blue Pieces
    }),

    classic_annex_2_escape_room: createRoom('classic_annex_2_escape_room', '第二別館・脱出秘密地下水路', { x: 5, y: 8 }, (l) => {
      l[1][5] = t('EXIT'); // Real final exit gate (no key, escape from Takuro-Oni)
    })
  };
  return rooms;
};

export const ROOMS = getRooms(0);
