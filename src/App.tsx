/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Skull, Play, Info, Home, RefreshCcw } from 'lucide-react';
import { GameState, Position, TILE_SIZE, RoomData, GRID_WIDTH, GRID_HEIGHT, TileType } from './types';
import { getRooms, LEVEL_PATTERNS, getClassicRooms } from './constants';
import { Character } from './components/Character';
import { Tile } from './components/Tile';
import { HUD } from './components/HUD';
import { WalkthroughModal } from './components/WalkthroughModal';

const ONI_TYPES: ('NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT')[] = ['NORMAL', 'FUWATTY', 'BLOCK', 'GIANT'];

const getOniName = (type: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT') => {
  switch (type) {
    case 'NORMAL': return '通常青鬼';
    case 'FUWATTY': return 'フワッティー';
    case 'BLOCK': return 'スクワット鬼';
    case 'GIANT': return '巨頭鬼';
    default: return '通常青鬼';
  }
};

const getSpawnSpeech = (type: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT') => {
  const speeches = {
    NORMAL: ['...トモダチ...', '...ニゲアアアア...', '...ココニイルノカ...'],
    FUWATTY: ['キシャアアア！', 'ハヤクハヤク！', 'ニガサナイ！！'],
    BLOCK: ['1...2...フンッ！', '筋肉スクワット！', '負荷ガ足リナイ！'],
    GIANT: ['...オオキナ...アタマ...', '...マテ...', '...トナリニイル...']
  };
  const arr = speeches[type] || ['......'];
  return arr[Math.floor(Math.random() * arr.length)];
};

const INITIAL_STATE: GameState = {
  playerPos: { x: 5, y: 7 },
  aoOniPos: null,
  currentRoom: 'mansion_1f_entrance',
  inventory: [],
  isHiding: false,
  status: 'START',
  message: '静まり返った洋館。ここから出なければ。',
  moveCount: 0,
  isLocked: false,
  friendsSaved: 0,
  gameMode: 'CLASSIC',
  eventFlags: {},
  oniType: 'NORMAL',
  oniSpeech: '',
  pendingOniSpawn: null,
};

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [rooms, setRooms] = useState<Record<string, RoomData>>({});
  const [isShaking, setIsShaking] = useState(false);
  const [activeSafe, setActiveSafe] = useState<{ roomId: string; code: string; rewardItem: string; title?: string } | null>(null);
  const [safeInputCode, setSafeInputCode] = useState<string>('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerScare = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const handleSubmitSafePin = () => {
    if (!activeSafe) return;
    if (safeInputCode === activeSafe.code) {
      const item = activeSafe.rewardItem;
      setState(prev => ({
        ...prev,
        inventory: [...prev.inventory, item],
        message: `「${activeSafe.title || '金庫'}」が開いた！中に隠されていた「${item}」を手に入れた！`,
        moveCount: prev.moveCount + 1,
        eventFlags: {
          ...prev.eventFlags,
          [activeSafe.roomId + '_safe_unlocked']: true
        }
      }));
      setActiveSafe(null);
      setSafeInputCode('');
    } else {
      setState(prev => ({
        ...prev,
        message: '暗証番号が間違っている……。ロックが解除されない！'
      }));
      setSafeInputCode('');
    }
  };

  const saveGame = useCallback(() => {
    const saveData = {
      state,
      rooms,
      timestamp: Date.now()
    };
    localStorage.setItem('ao_oni_save', JSON.stringify(saveData));
    setState(prev => ({ ...prev, message: '進捗を保存した。' }));
  }, [state, rooms]);

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem('ao_oni_save');
    if (saved) {
      try {
        const { state: savedState, rooms: savedRooms } = JSON.parse(saved);
        setRooms(savedRooms);
        setState({ ...savedState, isLocked: false }); // Ensure not locked on load
      } catch (e) {
        setState(prev => ({ ...prev, message: 'データの読み込みに失敗した。' }));
      }
    } else {
      setState(prev => ({ ...prev, message: '保存されたデータがない。' }));
    }
  }, []);

  const handleStartGame = (mode: 'CLASSIC' | 'RANDOM') => {
    if (mode === 'CLASSIC') {
      setRooms(getClassicRooms());
      setState({
        playerPos: { x: 5, y: 7 },
        aoOniPos: null,
        currentRoom: 'mansion_1f_entrance',
        inventory: [],
        isHiding: false,
        status: 'PLAYING',
        message: '【本館攻略シナリオ】洋館から脱出せよ。まずは1Fの上の隙間から「本館1F・廊下」を通り、奥のリビングを調べて皿を探そう。',
        moveCount: 0,
        isLocked: false,
        friendsSaved: 0,
        gameMode: 'CLASSIC',
        eventFlags: {
          hiddenLit: false,
          jailLit: false,
          pianoWiped: false,
          childChairMoved: false,
          basementChairMoved: false,
          tatamiWallpaperPeeled: false,
          secretDoorOpened: false,
          mikaScream: false,
          mikaChase: false,
          escapedMikaChase: false,
        }
      });
    } else {
      const patternIndex = Math.floor(Math.random() * LEVEL_PATTERNS.length);
      setRooms(getRooms(patternIndex));
      setState({
        playerPos: { x: 5, y: 7 },
        aoOniPos: null,
        currentRoom: 'annex_1f_entrance',
        inventory: [],
        isHiding: false,
        status: 'PLAYING',
        message: '【ランダム別館脱出】どこかに隠された銀の鍵を探し出し、出口へ急げ。',
        moveCount: 0,
        isLocked: false,
        friendsSaved: 0,
        gameMode: 'RANDOM',
        eventFlags: {}
      });
    }
  };

  // Initialize rooms on start or reset
  useEffect(() => {
    if (state.status === 'START') {
      if (state.gameMode === 'CLASSIC') {
        setRooms(getClassicRooms());
      } else {
        const patternIndex = Math.floor(Math.random() * LEVEL_PATTERNS.length);
        setRooms(getRooms(patternIndex));
      }
    }
  }, [state.status, state.gameMode]);

  const getRoom = (id: string) => rooms[id];

  const getDoorsInRoom = useCallback((room: RoomData) => {
    const doorTiles: Position[] = [];
    room.layout.forEach((row, y) => {
      row.forEach((t, x) => {
        if (t.type === 'DOOR' || t.type === 'STAIRS_UP' || t.type === 'STAIRS_DOWN') {
          doorTiles.push({ x, y });
        }
      });
    });
    return doorTiles;
  }, []);

  const handleInteraction = (pos: Position, room: RoomData) => {
    const tile = room.layout[pos.y][pos.x];
    
    // Auto synthesis trigger checking on action step
    const triggerSynthesis = (inv: string[]) => {
      let updated = [...inv];
      let msg = '';
      
      // 1. Detergent + Handkerchief
      if (updated.includes('洗剤') && updated.includes('ハンカチ') && !updated.includes('洗剤の付いたハンカチ')) {
        updated = updated.filter(x => x !== '洗剤' && x !== 'ハンカチ');
        updated.push('洗剤の付いたハンカチ');
        msg = '【アイテム合成】「洗剤」を「ハンカチ」にしみこませ、「洗剤の付いたハンカチ」を手に入れた！これでピアノを綺麗に拭き取れそうだ！';
      }
      // 2. Lighter Fluid + Lighter
      else if (updated.includes('ライター') && updated.includes('ライターオイル') && !updated.includes('ライター (燃料入り)')) {
        updated = updated.filter(x => x !== 'ライターオイル');
        updated = updated.filter(x => x !== 'ライター');
        updated.push('ライター (燃料入り)');
        msg = '【アイテム合成】ライターに「ライターオイル」を注入し、「ライター (燃料入り)」を完成させた！これで暗闇を照らせるぞ！';
      }
      // 3. Phillips Screwdriver + Minus Screwdriver Bit
      else if (updated.includes('＋ドライバー') && updated.includes('－ドライバーの芯') && !updated.includes('精密ドライバー')) {
        updated = updated.filter(x => x !== '＋ドライバー' && x !== '－ドライバーの芯');
        updated.push('精密ドライバー');
        msg = '【アイテム合成】＋ドライバーの先端に「－ドライバーの芯」を取り付け、「精密ドライバー」を組み立てた！これで両タイプの特殊ネジに対応できる！';
      }
      
      return { updated, msg };
    };

    if (tile.type === 'KEY') {
      const keyName = tile.itemId || '銀の鍵';
      setState(prev => {
        const afterGet = [...prev.inventory, keyName];
        const synth = triggerSynthesis(afterGet);
        const finalInv = synth.msg ? synth.updated : afterGet;
        return {
          ...prev,
          inventory: finalInv,
          message: synth.msg ? synth.msg : `「${keyName}」を手に入れた！`,
          moveCount: prev.moveCount + 1
        };
      });
      
      setRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        const newRoom = { ...room };
        newRoom.layout = [...room.layout];
        newRoom.layout[pos.y] = [...room.layout[pos.y]];
        newRoom.layout[pos.y][pos.x] = { ...tile, type: 'FLOOR' };
        newRooms[newRoom.id] = newRoom;
        return newRooms;
      });
      return true;
    }

    if (tile.type === 'PLATE') {
      if (state.inventory.includes('皿の破片')) {
        setState(prev => ({ ...prev, message: '綺麗な皿の破片を回収したあとのテーブルだ。' }));
        return true;
      }
      if (tile.itemId !== 'examined_once') {
        setRooms(prevRooms => {
          const newRooms = { ...prevRooms };
          const newRoom = { ...room };
          newRoom.layout = [...room.layout];
          newRoom.layout[pos.y] = [...room.layout[pos.y]];
          newRoom.layout[pos.y][pos.x] = { ...tile, itemId: 'examined_once' };
          newRooms[newRoom.id] = newRoom;
          return newRooms;
        });
        setState(prev => ({
          ...prev,
          message: 'テーブルの上に綺麗な皿が置いてある。皿をもう一度調べてみよう。',
          moveCount: prev.moveCount + 1
        }));
        return true;
      } else {
        setRooms(prevRooms => {
          const newRooms = { ...prevRooms };
          const newRoom = { ...room };
          newRoom.layout = [...room.layout];
          newRoom.layout[pos.y] = [...room.layout[pos.y]];
          newRoom.layout[pos.y][pos.x] = { ...tile, type: 'FLOOR' };
          newRooms[newRoom.id] = newRoom;
          return newRooms;
        });
        setState(prev => {
          const nextInv = [...prev.inventory, '皿の破片'];
          const synth = triggerSynthesis(nextInv);
          return {
            ...prev,
            inventory: synth.msg ? synth.updated : nextInv,
            message: synth.msg ? synth.msg : '皿を強く叩いた！『皿の破片』を手に入れた！これで畳壁などの隙間にアプローチできそうだ。',
            moveCount: prev.moveCount + 1
          };
        });
        return true;
      }
    }

    if (tile.type === 'CHAIR') {
      if (room.id === 'mansion_2f_bedroom') {
        const targetY = pos.y + 1;
        if (targetY < GRID_HEIGHT - 1 && room.layout[targetY][pos.x].type === 'FLOOR') {
          setRooms(prevRooms => {
            const newRooms = { ...prevRooms };
            const newRoom = { ...room };
            newRoom.layout = [...room.layout];
            newRoom.layout[pos.y] = [...room.layout[pos.y]];
            newRoom.layout[targetY] = [...room.layout[targetY]];
            newRoom.layout[targetY][pos.x] = { ...tile }; 
            
            const libraryKeyTile = {
              type: 'KEY' as TileType,
              id: Math.random().toString(36).substr(2, 9),
              itemId: '図書室の鍵'
            };
            newRoom.layout[pos.y][pos.x] = libraryKeyTile;
            newRooms[newRoom.id] = newRoom;
            return newRooms;
          });
          setState(prev => ({
            ...prev,
            message: '重い椅子を引きずって動かした！ 畳の隙間に「図書室の鍵」を発見した！',
            moveCount: prev.moveCount + 1
          }));
          return true;
        }
      } 
      else if (room.id === 'mansion_2f_child_room') {
        const targetX = 3;
        const targetY = 3;
        if (room.layout[targetY][targetX].type === 'FLOOR') {
          setRooms(prevRooms => {
            const newRooms = { ...prevRooms };
            const newRoom = { ...room };
            newRoom.layout = [...room.layout];
            newRoom.layout[pos.y] = [...room.layout[pos.y]];
            newRoom.layout[targetY] = [...room.layout[targetY]];
            newRoom.layout[targetY][targetX] = { ...tile }; 
            newRoom.layout[pos.y][pos.x] = { type: 'FLOOR', id: Math.random().toString(36).substr(2, 9) };
            newRooms[newRoom.id] = newRoom;
            return newRooms;
          });
          setState(prev => ({
            ...prev,
            eventFlags: { ...prev.eventFlags, childChairMoved: true },
            message: '椅子を引きずり、おもちゃ棚の真下（足台）へ移動させた！これで棚の上に手が届くぞ。',
            moveCount: prev.moveCount + 1
          }));
          return true;
        }
      } 
      else if (room.id === 'mansion_bf_left') {
        const isFirstMove = !state.eventFlags?.basementFirstMoved;
        if (isFirstMove) {
          const targetY = 5;
          if (room.layout[targetY][pos.x].type === 'FLOOR') {
            setRooms(prevRooms => {
              const newRooms = { ...prevRooms };
              const newRoom = { ...room };
              newRoom.layout = [...room.layout];
              newRoom.layout[pos.y] = [...room.layout[pos.y]];
              newRoom.layout[targetY] = [...room.layout[targetY]];
              newRoom.layout[targetY][pos.x] = { ...tile };
              
              const minusBitTile = {
                type: 'KEY' as TileType,
                id: Math.random().toString(36).substr(2, 9),
                itemId: '－ドライバーの芯'
              };
              newRoom.layout[pos.y][pos.x] = minusBitTile;
              newRooms[newRoom.id] = newRoom;
              return newRooms;
            });
            setState(prev => {
              const nextInv = [...prev.inventory]; // checked in trigger
              return {
                ...prev,
                eventFlags: { ...prev.eventFlags, basementFirstMoved: true },
                message: '椅子をごろりと横に動かした！ 窪みの中から「－ドライバーの芯」を発見した！',
                moveCount: prev.moveCount + 1
              };
            });
            return true;
          }
        } else if (!state.eventFlags?.basementChairMoved) {
          const targetX = 8;
          const targetY = 3;
          if (room.layout[targetY][targetX].type === 'FLOOR') {
            setRooms(prevRooms => {
              const newRooms = { ...prevRooms };
              const newRoom = { ...room };
              newRoom.layout = [...room.layout];
              newRoom.layout[pos.y] = [...room.layout[pos.y]];
              newRoom.layout[targetY] = [...room.layout[targetY]];
              newRoom.layout[targetY][targetX] = { ...tile };
              newRoom.layout[pos.y][pos.x] = { type: 'FLOOR', id: Math.random().toString(36).substr(2, 9) };
              newRooms[newRoom.id] = newRoom;
              return newRooms;
            });
            setState(prev => ({
              ...prev,
              eventFlags: { ...prev.eventFlags, basementChairMoved: true },
              message: '椅子をさらに引きずり、輝く高所の棚の真下（踏み台）へと設置した！',
              moveCount: prev.moveCount + 1
            }));
            return true;
          }
        }
      }
      setState(prev => ({ ...prev, message: 'この椅子はこれ以上動かせない。' }));
      return true;
    }

    if (tile.type === 'DESK') {
      if (state.inventory.includes('寝室の鍵')) {
        setState(prev => ({ ...prev, message: '古い本が並んでいる机だ。' }));
        return true;
      }
      setRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        const newRoom = { ...room };
        newRoom.layout = [...room.layout];
        newRoom.layout[pos.y] = [...room.layout[pos.y]];
        newRoom.layout[pos.y][pos.x] = { ...tile, type: 'FLOOR' };
        newRooms[newRoom.id] = newRoom;
        return newRooms;
      });
      setState(prev => ({
        ...prev,
        inventory: [...prev.inventory, '寝室の鍵'],
        aoOniPos: { x: 10, y: 5 }, 
        status: 'CHASE',
        message: '本をどかして「寝室の鍵」を入手した！ その瞬間、扉の向こうに青い影が現れた！！',
        moveCount: prev.moveCount + 1
      }));
      triggerScare();
      return true;
    }

    if (tile.type === 'BATHTUB') {
      if (state.inventory.includes('＋ドライバー')) {
        setState(prev => ({ ...prev, message: '浴槽は空っぽだ。' }));
        return true;
      }
      setRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        const newRoom = { ...room };
        newRoom.layout = [...room.layout];
        newRoom.layout[pos.y] = [...room.layout[pos.y]];
        newRoom.layout[pos.y][pos.x] = { ...tile, type: 'FLOOR' };
        newRooms[newRoom.id] = newRoom;
        return newRooms;
      });
      setState(prev => {
        const nextInv = [...prev.inventory, '＋ドライバー'];
        const synth = triggerSynthesis(nextInv);
        const finalInv = synth.msg ? synth.updated : nextInv;
        const willScare = Math.random() > 0.4;
        
        return {
          ...prev,
          inventory: finalInv,
          moveCount: prev.moveCount + 1,
          status: willScare ? 'CHASE' : prev.status,
          aoOniPos: willScare ? { x: 5, y: 1 } : prev.aoOniPos,
          message: willScare 
            ? '浴槽の栓を抜いた……底から「＋ドライバー」を発見！ 次の瞬間、背後の窓から青鬼が飛び込んできた！！'
            : '浴槽の栓を抜いた……水が引き、底から「＋ドライバー」を発見した！'
        };
      });
      triggerScare();
      return true;
    }

    if (tile.type === 'SHELF') {
      if (room.id === 'mansion_1f_washroom') {
        if (state.inventory.includes('洗剤') || state.inventory.includes('洗剤の付いたハンカチ')) {
          setState(prev => ({ ...prev, message: '掃除用品が綺麗に並ぶ洗面台の棚だ。' }));
          return true;
        }
        setState(prev => {
          const nextInv = [...prev.inventory, '洗剤'];
          const synth = triggerSynthesis(nextInv);
          return {
            ...prev,
            inventory: synth.msg ? synth.updated : nextInv,
            message: synth.msg ? synth.msg : '洗面台の薬品棚から強力な「洗剤」を入手した！',
            moveCount: prev.moveCount + 1
          };
        });
        return true;
      }
      else if (room.id === 'mansion_2f_child_room') {
        if (state.inventory.includes('ライターオイル') || state.inventory.includes('ライター (燃料入り)')) {
          setState(prev => ({ ...prev, message: '子供部屋の高い棚だ。' }));
          return true;
        }
        if (state.eventFlags?.childChairMoved) {
          setState(prev => {
            const nextInv = [...prev.inventory, 'ライターオイル'];
            const synth = triggerSynthesis(nextInv);
            return {
              ...prev,
              inventory: synth.msg ? synth.updated : nextInv,
              message: synth.msg ? synth.msg : '台にした椅子の上に乗って手を伸ばし、棚から「ライターオイル」を入手した！',
              moveCount: prev.moveCount + 1
            };
          });
        } else {
          setState(prev => ({
            ...prev,
            message: '棚が高すぎて背が届かない……。何か、足がかりになる物が部屋にあれば調べられそうだ。'
          }));
        }
        return true;
      }
      else if (room.id === 'mansion_bf_left') {
        if (state.inventory.includes('地下牢の鍵')) {
          setState(prev => ({ ...prev, message: '埃の被った棚だ。' }));
          return true;
        }
        if (state.eventFlags?.basementChairMoved) {
          setState(prev => ({
            ...prev,
            inventory: [...prev.inventory, '地下牢の鍵'],
            message: '設置した椅子に乗って手を伸ばし、高所棚の隙間から「地下牢の鍵」を掴みとった！',
            moveCount: prev.moveCount + 1
          }));
        } else {
          setState(prev => ({
            ...prev,
            message: '棚の上がキラリと光っている。しかし、高すぎて到底手が届かない……。何か足場になる物があれば。'
          }));
        }
        return true;
      }
      else if (room.id === 'mansion_1f_barred') {
        if (state.inventory.includes('地下室の鍵')) {
          setState(prev => ({ ...prev, message: '鉄格子部屋のキャビネット棚だ。' }));
          return true;
        }
        setState(prev => ({
          ...prev,
          inventory: [...prev.inventory, '地下室の鍵'],
          message: '棚の引き出しから「地下室の鍵」を入手した！これで1F廊下の一番北にある地下階段室の扉を開けられる。',
          moveCount: prev.moveCount + 1
        }));
        return true;
      }
    }

    if (tile.type === 'BED') {
      if (room.id === 'mansion_3f_bedroom') {
        if (state.eventFlags?.bedMoved) {
          setState(prev => ({ ...prev, message: '動かしたベッドだ。下からぽっかりと床の抜け穴（2Fピアノ室へ直通）が見える。' }));
          return true;
        }
        setRooms(prevRooms => {
          const newRooms = { ...prevRooms };
          const newRoom = { ...room };
          newRoom.layout = [...room.layout];
          newRoom.layout[3] = [...room.layout[3]];
          newRoom.layout[3][2] = { ...tile }; // moves bed to the left
          newRoom.layout[3][3] = {
            type: 'STAIRS_DOWN',
            id: Math.random().toString(36).substr(2, 9),
            targetRoom: 'mansion_2f_piano_room'
          };
          newRooms[newRoom.id] = newRoom;
          return newRooms;
        });
        setState(prev => ({
          ...prev,
          eventFlags: { ...prev.eventFlags, bedMoved: true },
          message: '重いベッドを力任せに左へ押し動かした！ 畳の下から暗い「床の抜け穴（落ちると2Fピアノ室）」が現れた！',
          moveCount: prev.moveCount + 1
        }));
        return true;
      }
    }

    if (tile.type === 'PIANO') {
      if (state.eventFlags?.pianoWiped) {
        setState(prev => ({ ...prev, message: '血がキレイに拭き取られた鍵盤には、血のないはっきりした文字で『９４１』の暗号が焼き付けられている。' }));
        return true;
      }
      if (state.inventory.includes('洗剤の付いたハンカチ')) {
        setState(prev => ({
          ...prev,
          eventFlags: { ...prev.eventFlags, pianoWiped: true },
          status: 'CHASE',
          aoOniPos: { x: 1, y: 5 }, 
          message: '「洗剤の付いたハンカチ」でべったりこびりついた血を力をいれてゴシゴシと拭いた！ 磨かれた鍵盤から『９４１』の青文字が浮かび上がった！ その瞬間、地獄のような咆哮が響く！青鬼だ！！',
          moveCount: prev.moveCount + 1
        }));
        triggerScare();
      } else {
        setState(prev => ({
          ...prev,
          message: 'グランドピアノだ。鍵盤に何か暗号が書かれているようだが、赤黒い血汚れがひどく読み取れない。頑固な血痕を落とす「洗剤」と「ハンカチ」があれば……'
        }));
      }
      return true;
    }

    if (tile.type === 'WARDROBE' && room.id === 'mansion_2f_piano_room') {
      if (state.eventFlags?.pianoWardrobeMoved) {
        setState(prev => ({ ...prev, message: 'どかしたタンスだ。' }));
        return true;
      }
      setRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        const newRoom = { ...room };
        newRoom.layout = [...room.layout];
        newRoom.layout[2] = [...room.layout[2]];
        newRoom.layout[2][8] = { ...tile }; // move wardrobe left
        newRoom.layout[2][9] = {
          type: 'SAFE',
          id: Math.random().toString(36).substr(2, 9),
        };
        newRooms[newRoom.id] = newRoom;
        return newRooms;
      });
      setState(prev => ({
        ...prev,
        eventFlags: { ...prev.eventFlags, pianoWardrobeMoved: true },
        message: '壁際の大きなタンスを横に力いっぱい引きずった！ 背後から頑丈な鉄扉の「金庫」が露出した！',
        moveCount: prev.moveCount + 1
      }));
      return true;
    }

    if (tile.type === 'SAFE') {
      if (room.id === 'mansion_2f_piano_room') {
        if (state.inventory.includes('子供部屋の鍵') || state.eventFlags?.piano_safe_unlocked) {
          setState(prev => ({ ...prev, message: '金庫は既に空だ。' }));
          return true;
        }
        if (!state.eventFlags?.pianoWiped) {
          setState(prev => ({ ...prev, message: '電子ロック式の金庫だ。4桁の暗証番号が必要だが、何もヒントがない。' }));
          return true;
        }
        setActiveSafe({
          roomId: room.id,
          code: '1416', // layout rotation of 941
          rewardItem: '子供部屋の鍵',
          title: 'ピアノ室の金庫'
        });
        setSafeInputCode('');
        setState(prev => ({ ...prev, message: '金庫のロックパネルだ。暗証番号を入力してください。（ヒント: ピアノで読み取った 9, 4, 1 の数字を電卓の『1～9』の逆キー位置に対応させる……）' }));
        return true;
      }
      else if (room.id === 'mansion_bf_right') {
        if (state.inventory.includes('別館の鍵') || state.eventFlags?.mansion_bf_right_safe_unlocked) {
          setState(prev => ({ ...prev, message: '地下金庫は開いている。' }));
          return true;
        }
        if (!state.inventory.includes('精密ドライバー')) {
          setState(prev => ({ ...prev, message: '金庫のダイヤル操作部に頑丈な防犯鉄板がネジ留めされており、素手では回せない。＋と－ネジ両方を外せる「精密ドライバー(合成)」が必要だ。' }));
          return true;
        }
        if (!state.eventFlags?.readJailBlueCode) {
          setState(prev => ({ ...prev, message: '精密ドライバーでネジをすべて回し、防犯鉄蓋を取り外した！ が、中に現れた4桁のシリンダーコードの番号がわからない……。' }));
          return true;
        }
        setActiveSafe({
          roomId: room.id,
          code: '5376', // blue jail writing
          rewardItem: '別館の鍵',
          title: '地下奥部屋の金庫'
        });
        setSafeInputCode('');
        setState(prev => ({ ...prev, message: '鉄蓋を外し、内部テンキーを露出させた。暗証番号を入力してください。（ヒント: 地下牢獄で格子越しに浮かびあがっていた青いペンキの数値）' }));
        return true;
      }
    }

    if (tile.type === 'WARDROBE' && room.id === 'mansion_bf_right') {
      if (state.eventFlags?.basementWardrobePushed) {
        setState(prev => ({ ...prev, message: 'クローゼット式の重い物置だ。' }));
        return true;
      }
      setRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        const newRoom = { ...room };
        newRoom.layout = [...room.layout];
        newRoom.layout[1] = [...room.layout[1]];
        newRoom.layout[1][4] = { type: 'FLOOR', id: Math.random().toString(36).substr(2, 9) };
        newRoom.layout[1][7] = { type: 'FLOOR', id: Math.random().toString(36).substr(2, 9) };
        newRoom.layout[1][5] = {
          type: 'SAFE',
          id: Math.random().toString(36).substr(2, 9)
        };
        newRooms[newRoom.id] = newRoom;
        return newRooms;
      });
      setState(prev => ({
        ...prev,
        eventFlags: { ...prev.eventFlags, basementWardrobePushed: true },
        message: '地下の壁に並んでいた大きなクローゼットタンスを引き倒してどかした！奥のレンガ壁の凹みから、鉄板で覆われた「地下隠し金庫」を視認した！',
        moveCount: prev.moveCount + 1
      }));
      return true;
    }

    if (tile.type === 'WALL_SECRET') {
      if (state.eventFlags?.secretDoorOpened) {
        return true; 
      }
      if (!state.eventFlags?.tatamiWallpaperPeeled) {
        if (state.inventory.includes('皿の破片')) {
          setState(prev => ({
            ...prev,
            eventFlags: { ...prev.eventFlags, tatamiWallpaperPeeled: true },
            message: '「皿の破片」の鋭利なエッジを当てて、畳の部屋の変色した壁紙をゴリゴリと削り落とした！下から鍵穴のついた「ドアノブのない隠し鉄扉」が出現した！',
            moveCount: prev.moveCount + 1
          }));
        } else {
          setState(prev => ({
            ...prev,
            message: '畳の部屋の壁に、かすかにカッター等で切られたような切れ込みが入った壁紙がある……。これを鋭く剥がすことの出来る『硬い破片プレート』があれば剥がせそうだ。'
          }));
        }
        return true;
      } else {
        if (state.inventory.includes('ドアノブ')) {
          setRooms(prevRooms => {
            const newRooms = { ...prevRooms };
            const newRoom = { ...room };
            newRoom.layout = [...room.layout];
            newRoom.layout[pos.y] = [...room.layout[pos.y]];
            newRoom.layout[pos.y][pos.x] = {
              type: 'DOOR',
              id: Math.random().toString(36).substr(2, 9),
              targetRoom: 'mansion_1f_hidden_room'
            };
            newRooms[newRoom.id] = newRoom;
            return newRooms;
          });
          setState(prev => ({
            ...prev,
            inventory: prev.inventory.filter(i => i !== 'ドアノブ'),
            eventFlags: { ...prev.eventFlags, secretDoorOpened: true },
            message: '「ドアノブ」をシリンダーネジ穴にがっちりと噛み合わせてネジ回した！重いギギギという音がして、奥の隠し部屋（地下牢）への分厚い壁扉がオープンした！',
            moveCount: prev.moveCount + 1
          }));
        } else {
          setState(prev => ({
            ...prev,
            message: '壁紙は削り取ったが、ドアノブが抜けているので開けられない。丸型のネジ式「ドアノブ」を取っ手代わりに差し込めば開きそうだ。'
          }));
        }
        return true;
      }
    }

    if (tile.type === 'CANDLE') {
      const isHidden = room.id === 'mansion_1f_hidden_room';
      const isJail = room.id === 'mansion_bf_jail';
      const isLit = isHidden ? state.eventFlags?.hiddenLit : state.eventFlags?.jailLit;
      
      if (isLit) {
        setState(prev => ({ ...prev, message: 'キャンドルはメラメラと強々しく燃え。周囲を煌々と照らしている。' }));
        return true;
      }
      
      if (state.inventory.includes('ライター (燃料入り)')) {
        setState(prev => ({
          ...prev,
          eventFlags: {
            ...prev.eventFlags,
            hiddenLit: isHidden ? true : prev.eventFlags?.hiddenLit,
            jailLit: isJail ? true : prev.eventFlags?.jailLit,
          },
          message: '燃料を補充した「ライター」にホイールをこすり当て火を灯し、巨大ろうそくに点火した！ 溢れんばかりの火炎光線が室内に満ち、漆黒の極みだった部屋が一気に明るく可視化された！！',
          moveCount: prev.moveCount + 1
        }));
        triggerScare();
      } else if (state.inventory.includes('ライター')) {
        setState(prev => ({
          ...prev,
          message: 'ライターを持ってきたが、中身の燃料ガスオイルが全く空のため、火花がカチカチ散るだけで点火できない！ 注入できる「ライターオイル」が必要だ。'
        }));
      } else {
        setState(prev => ({
          ...prev,
          message: '巨大な赤色のろうそくが据えられている。これに火を点けられれば部屋が明るくなりそうだが、点火するための「ライター」を所持していない。'
        }));
      }
      return true;
    }

    if (tile.type === 'JAIL') {
      if (room.id === 'mansion_1f_barred') {
        if (state.status === 'CHASE') {
          setState(prev => ({
            ...prev,
            eventFlags: { ...prev.eventFlags, isBarsClosed: true },
            status: 'HIDDEN',
            isHiding: true, 
            message: 'バタン！！！鉄格子の超頑丈な門扉を内側からカギ閉めした！！ これで外のモンスターも指一本触れるまい。奴が去るのを静かに息を引き取って待とう...',
            moveCount: prev.moveCount + 1
          }));
        } else {
          setState(prev => ({ ...prev, message: '超鉄鉱石の頑丈な格子だ。いつでも閉じ込めることが可能だ。' }));
        }
        return true;
      }
      else if (room.id === 'mansion_bf_jail') {
        if (state.eventFlags?.readJailBlueCode) {
          setState(prev => ({ ...prev, message: '地下格子の奥壁を振り返った……そこには不気味なブルーの血塗料で『５３７６』とペイントされている。' }));
          return true;
        }
        if (!state.eventFlags?.jailLit) {
          setState(prev => ({ ...prev, message: '鉄格子の奥の房は極寒の深いつむぎ闇だ。暗すぎて何も見当がつかない。' }));
          return true;
        }
        setState(prev => ({
          ...prev,
          eventFlags: { ...prev.eventFlags, readJailBlueCode: true },
          message: '格子の隙間から首をすぼめて奥のレンガ壁を覗いた！ 異様な蛍光カラーのブルー顔料で大きく書き残された数値を読み解いた……『５３７６』。これが最後のダイヤルコードだ！',
          moveCount: prev.moveCount + 1
        }));
        return true;
      }
    }

    if (tile.type === 'NPC') {
      if (room.id === 'mansion_3f_end_room') {
        setState(prev => ({
          ...prev,
          message: '卓郎：「ひひひ、ひろし！！よかった、やっぱり無事だったんだな！ 頼む、本館3Fのこの奥の頑丈な鍵穴無しの扉に「丸型ネジ式ドアノブ」がくっついてたんだが、錆びた頑固なネジボルトで完全に固定されてて取り外せない。先端を回してボルトを緩める『＋ドライバー』などの工具があれば外せるんだが……！」',
          eventFlags: { ...prev.eventFlags, spokeToTakuro: true }
        }));
        return true;
      }
    }

    if (tile.type === 'DOOR' && room.id === 'mansion_3f_end_room' && tile.targetRoom === 'mansion_3f_knob_trap') {
      if (state.inventory.includes('ドアノブ')) {
        setState(prev => ({ ...prev, message: 'ドアノブは既にドライバーを使って頑錆ボルトを外し、回収済みだ。' }));
        return true;
      }
      if (state.inventory.includes('＋ドライバー') || state.inventory.includes('精密ドライバー')) {
        setState(prev => ({
          ...prev,
          inventory: [...prev.inventory, 'ドアノブ'],
          message: '「＋ドライバー」を固着シリンダーネジ穴に差し当て、力を振り絞って回した！金属軋み音がしてボルトがゆるみ、ガタガタと「ドアノブ」を外してピッキング回収した！',
          moveCount: prev.moveCount + 1
        }));
      } else {
        setState(prev => ({
          ...prev,
          message: '扉のシリンダー部からさびた長いボルトががっちりと固定されている。工具なしでは回らない。ボルトを回すための「＋ドライバー」が必要だ。'
        }));
      }
      return true;
    }

    if ((tile.type === 'DOOR' || tile.type === 'STAIRS_UP' || tile.type === 'STAIRS_DOWN') && tile.targetRoom) {
      if (tile.requiredKey && !state.inventory.includes(tile.requiredKey)) {
        if (tile.requiredKey === '別館の鍵') {
          setState(prev => ({ ...prev, message: '本館玄関の超重量マホガニー大扉は完全に施錠されている。「別館の鍵」を手に入れ、本階へ持ってこなければ一生ここから逃げることはできない！' }));
        } else {
          setState(prev => ({ ...prev, message: `鍵（${tile.requiredKey}）がないため、ロックがかかっているようだ。` }));
        }
        return false;
      }

      // Special Mika scream event trigger during basement stairs transition
      if (tile.targetRoom === 'mansion_bf_hall' && state.inventory.includes('地下室の鍵')) {
        if (!state.eventFlags?.mikaScream) {
          setState(prev => ({
            ...prev,
            eventFlags: { ...prev.eventFlags, mikaScream: true },
            message: '「キィアアアアアッ！！！！」 突如、2Fの彼方から美香（みか）の死を予感させる断末魔に近い悲鳴が吹き荒れた！！ ２F子供部屋で奴に襲われてるのか！？急いで救出しに向かわなければ、怖くてこのまま地下階段を降りるなど不可能だ！！',
          }));
          triggerScare();
          return false;
        } else if (!state.eventFlags?.escapedMikaChase) {
          setState(prev => ({
            ...prev,
            message: '美香のことが気がかりで、足が竦んでしまい地下へ降りることはできない！ 2F子供部屋に確認に行かなければ！'
          }));
          return false;
        }
      }
      
      const nextRoom = rooms[tile.targetRoom];
      if (!nextRoom) {
        setState(prev => ({ ...prev, message: 'この先は閉ざされているようだ。' }));
        return false;
      }

      setState(prev => ({ ...prev, isLocked: true }));
      
      setTimeout(() => {
        setState(prev => {
          let newAoOniPos = null;
          let newStatus = prev.status;
          let pendingSpawn = null;
          let selectedOniType = prev.oniType || 'NORMAL';

          // Check if entering 2F Children room during Mika's scream questline to trigger the Mika Chase
          let customTriggerMsg = `${nextRoom.name}へ移動した。`;
          let customFlags = prev.eventFlags ? { ...prev.eventFlags } : {};

          if (tile.targetRoom === 'mansion_2f_child_room' && prev.eventFlags?.mikaScream && !prev.eventFlags?.mikaChase) {
            newStatus = 'CHASE';
            newAoOniPos = { x: 3, y: 1 }; // Spawn near the shelf!
            selectedOniType = 'NORMAL';
            customFlags.mikaChase = true;
            customFlags.escapedMikaChase = true; // allow basement access once they escape this
            customTriggerMsg = '子供部屋に入ると、怯え果て、変わり果てた美香がそこに床崩れしていた……。その次の瞬間！！背後のクローゼットから巨大なブルーベリー色の異形の影（青鬼）がキシャアアと咆哮して襲いかかってきた！！！今すぐ逃げてタンスに隠れろ！！！';
          }
          else if (prev.status === 'CHASE' || Math.random() > 0.85) {
            // Find door pointing back to the room player just exited
            let spawnPos = null;
            const doorTiles = getDoorsInRoom(nextRoom);
            
            nextRoom.layout.forEach((row, y) => {
              row.forEach((t, x) => {
                if ((t.type === 'DOOR' || t.type === 'STAIRS_UP' || t.type === 'STAIRS_DOWN') && t.targetRoom === prev.currentRoom) {
                  spawnPos = { x, y };
                }
              });
            });

            if (!spawnPos) {
              const nearDoors = doorTiles.filter(d => 
                (Math.abs(d.x - nextRoom.spawnPoint.x) + Math.abs(d.y - nextRoom.spawnPoint.y)) <= 12
              );
              const candidates = nearDoors.length > 0 ? nearDoors : doorTiles;
              spawnPos = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : { x: 1, y: 1 };
            }

            const chosenOni = ONI_TYPES[Math.floor(Math.random() * ONI_TYPES.length)];

            pendingSpawn = {
              spawnPos,
              oniType: chosenOni,
              targetRoom: tile.targetRoom!
            };

            newStatus = 'PLAYING';
            newAoOniPos = null;
            customTriggerMsg = `${nextRoom.name}へ移動した。後ろの扉から不穏な足音が響き始めた……（【${getOniName(chosenOni)}】が3〜5秒後に出現する！）`;
          }

          return {
            ...prev,
            currentRoom: tile.targetRoom!,
            playerPos: nextRoom.spawnPoint,
            aoOniPos: newAoOniPos,
            status: newStatus,
            oniType: selectedOniType,
            oniSpeech: '',
            pendingOniSpawn: pendingSpawn,
            isLocked: false,
            message: customTriggerMsg,
            moveCount: prev.moveCount + 1,
            eventFlags: customFlags
          };
        });
      }, 300);
      return false;
    }

    if (tile.type === 'WARDROBE') {
      setState(prev => ({
        ...prev,
        status: 'HIDDEN',
        isHiding: true,
        message: 'タンスの薄暗い隙間に滑り込み、ドアをバチリと閉め、息を殺して隠れた……。',
        moveCount: prev.moveCount + 1
      }));
      return true;
    }

    if (tile.type === 'EXIT') {
      if (tile.requiredKey && !state.inventory.includes(tile.requiredKey)) {
        if (state.gameMode === 'CLASSIC') {
          setState(prev => ({ ...prev, message: '玄関の非常大扉はロックされている。「別館の鍵」がなければ外すことができない！' }));
        } else {
          setState(prev => ({ ...prev, message: '脱出ゲートだ！だが、強固なロックキー（銀の鍵）で施錠されている。' }));
        }
        return false;
      }
      setState(prev => ({ ...prev, status: 'WIN', message: '洋館の重い扉をこじ開け、ついに外の森へと逃げ伸びた！生還おめでとう！！' }));
      return false;
    }

    return true;
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    setState(prev => {
      if (prev.isLocked || prev.status === 'GAME_OVER' || prev.status === 'WIN') return prev;

      const newX = prev.playerPos.x + dx;
      const newY = prev.playerPos.y + dy;

      if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) return prev;

      const room = getRoom(prev.currentRoom);
      const tile = room.layout[newY][newX];

      // Handle exiting from wardrobe
      if (prev.status === 'HIDDEN') {
        if (tile.type === 'WALL') return prev;
        return {
          ...prev,
          playerPos: { x: newX, y: newY },
          status: prev.aoOniPos ? 'CHASE' : 'PLAYING',
          isHiding: false,
          message: 'タンスから出た。',
          moveCount: prev.moveCount + 1
        };
      }

      if (tile.type === 'WALL') return prev;

      const canMove = handleInteraction({ x: newX, y: newY }, room);
      
      if (!canMove) return prev;

      return {
        ...prev,
        playerPos: { x: newX, y: newY },
        moveCount: prev.moveCount + 1
      };
    });
  }, [state.status, state.isLocked, state.currentRoom, state.inventory]);

  // Listen to pending Oni spawn triggers (3 to 5 seconds delay)
  useEffect(() => {
    if (!state.pendingOniSpawn) return;
    
    // Clear trigger if player exits the target room early
    if (state.currentRoom !== state.pendingOniSpawn.targetRoom) {
      setState(prev => ({ ...prev, pendingOniSpawn: null }));
      return;
    }

    const delayMs = 3000 + Math.random() * 2000; // 3 to 5 seconds
    const timer = setTimeout(() => {
      setState(prev => {
        if (!prev.pendingOniSpawn || prev.currentRoom !== prev.pendingOniSpawn.targetRoom) {
          return prev;
        }

        triggerScare();
        const spawnType = prev.pendingOniSpawn.oniType;
        return {
          ...prev,
          status: 'CHASE',
          aoOniPos: prev.pendingOniSpawn.spawnPos,
          oniType: spawnType,
          oniSpeech: getSpawnSpeech(spawnType),
          pendingOniSpawn: null,
          message: `！？ 背後から突如、${getOniName(spawnType)}が現れた！！！`
        };
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [state.pendingOniSpawn, state.currentRoom, triggerScare]);

  // Ao Oni AI & Chasing Movement Cycle
  useEffect(() => {
    if (state.status === 'START' || state.status === 'GAME_OVER' || state.status === 'WIN') return;

    // Trigger random chase while in the same room (8% chance per shift if moveCount is significant)
    if (state.moveCount > 5 && state.status !== 'CHASE' && state.status !== 'HIDDEN' && !state.aoOniPos && !state.pendingOniSpawn) {
       if (Math.random() > 0.92) {
          const room = getRoom(state.currentRoom);
          const doorTiles = room ? getDoorsInRoom(room) : [];
          const nearDoors = doorTiles.filter(d => 
            (Math.abs(d.x - state.playerPos.x) + Math.abs(d.y - state.playerPos.y)) <= 12
          );
          const candidates = nearDoors.length > 0 ? nearDoors : doorTiles;

          const spawnPos = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : { x: 1, y: 1 };

          const selectedType = ONI_TYPES[Math.floor(Math.random() * ONI_TYPES.length)];

          setState(prev => ({ 
            ...prev, 
            status: 'CHASE', 
            aoOniPos: spawnPos, 
            oniType: selectedType,
            oniSpeech: getSpawnSpeech(selectedType),
            message: `！？ 暗闇の中から突如として【${getOniName(selectedType)}】が目の前に現れた！` 
          }));
          triggerScare();
       }
    }

    if (state.status === 'CHASE' && state.aoOniPos) {
      // Dynamic Speed calculation based on escape progression!
      const progressionCount = state.inventory.filter(item => 
        ['図書室の鍵', '子供部屋の鍵', '洗剤の付いたハンカチ', 'ライター (燃料入り)', '精密ドライバー', '別館の鍵', '＋ドライバー'].includes(item)
      ).length;

      // Base speed gets faster (interval decreases) with progression
      // Base interval ranges from 450ms down to 180ms
      const baseInterval = Math.max(180, 450 - progressionCount * 45);

      // Speed modification based on the Oni variant properties!
      let speedFactor = 1.0;
      if (state.oniType === 'FUWATTY') {
        speedFactor = 0.70; // Fuwatty moves 30% faster!
      } else if (state.oniType === 'GIANT') {
        speedFactor = 1.25; // Giant Head is slower due to heavy gravity
      }

      const activeInterval = baseInterval * speedFactor;

      const interval = setInterval(() => {
        setState(prev => {
          if (!prev.aoOniPos) return prev;
          if (prev.status === 'HIDDEN') return prev;

          const dx = prev.playerPos.x - prev.aoOniPos.x;
          const dy = prev.playerPos.y - prev.aoOniPos.y;
          
          // Trigger shake if very close
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist === 1 && Math.random() > 0.7) {
            triggerScare();
          }

          // Periodic speech bubble generation
          let speech = prev.oniSpeech;
          if (Math.random() > 0.65) {
            speech = getSpawnSpeech(prev.oniType || 'NORMAL');
          } else if (Math.random() > 0.85) {
            speech = ''; // occasional silence
          }
          
          let moveX = 0;
          let moveY = 0;

          // Decide primary and secondary directions based on distance
          const primaryX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
          const primaryY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

          const room = getRoom(prev.currentRoom);
          
          // Try to move in the direction of the larger gap first
          if (Math.abs(dx) >= Math.abs(dy)) {
            if (primaryX !== 0 && room.layout[prev.aoOniPos.y][prev.aoOniPos.x + primaryX].type !== 'WALL') {
              moveX = primaryX;
            } else if (primaryY !== 0 && room.layout[prev.aoOniPos.y + primaryY][prev.aoOniPos.x].type !== 'WALL') {
              moveY = primaryY;
            }
          } else {
            if (primaryY !== 0 && room.layout[prev.aoOniPos.y + primaryY][prev.aoOniPos.x].type !== 'WALL') {
              moveY = primaryY;
            } else if (primaryX !== 0 && room.layout[prev.aoOniPos.y][prev.aoOniPos.x + primaryX].type !== 'WALL') {
              moveX = primaryX;
            }
          }

          const nextX = prev.aoOniPos.x + moveX;
          const nextY = prev.aoOniPos.y + moveY;

          // Check for collision with player
          if (nextX === prev.playerPos.x && nextY === prev.playerPos.y) {
            return { ...prev, status: 'GAME_OVER', message: '青鬼に捕まった...' };
          }

          return {
            ...prev,
            aoOniPos: { x: nextX, y: nextY },
            oniSpeech: speech
          };
        });
      }, activeInterval); 
      return () => clearInterval(interval);
    }
  }, [state.status, state.moveCount, state.aoOniPos, state.inventory, state.oniType, state.pendingOniSpawn, triggerScare]);

  // Legacy Ai Disabled (replaced with progressive cycle above)
  useEffect(() => {
    if (true) return; // Disabled legacy execution
    if (state.status === 'START' || state.status === 'GAME_OVER' || state.status === 'WIN') return;

    // Trigger chase more frequently
    if (state.moveCount > 5 && state.status !== 'CHASE' && state.status !== 'HIDDEN' && !state.aoOniPos) {
       if (Math.random() > 0.90) {
         const room = getRoom(state.currentRoom);
         const doorTiles = room ? getDoorsInRoom(room) : [];
         // Prioritize doors within 12 tiles of player
         const nearDoors = doorTiles.filter(d => 
           (Math.abs(d.x - state.playerPos.x) + Math.abs(d.y - state.playerPos.y)) <= 12
         );
         const candidates = nearDoors.length > 0 ? nearDoors : doorTiles;

         const spawnPos = candidates.length > 0 
           ? candidates[Math.floor(Math.random() * candidates.length)]
           : { x: 1, y: 1 };

         setState(prev => ({ 
           ...prev, 
           status: 'CHASE', 
           aoOniPos: spawnPos, 
           message: '！？ 何かが現れた！' 
         }));
         triggerScare();
       }
    }

    if (state.status === 'CHASE' && state.aoOniPos) {
      const interval = setInterval(() => {
        setState(prev => {
          if (!prev.aoOniPos) return prev;
          if (prev.status === 'HIDDEN') return prev;

          const dx = prev.playerPos.x - prev.aoOniPos.x;
          const dy = prev.playerPos.y - prev.aoOniPos.y;
          
          // Trigger shake if very close
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist === 1 && Math.random() > 0.7) {
            triggerScare();
          }
          
          let moveX = 0;
          let moveY = 0;

          // Decide primary and secondary directions based on distance
          const primaryX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
          const primaryY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;

          const room = getRoom(prev.currentRoom);
          
          // Try to move in the direction of the larger gap first
          if (Math.abs(dx) >= Math.abs(dy)) {
            if (primaryX !== 0 && room.layout[prev.aoOniPos.y][prev.aoOniPos.x + primaryX].type !== 'WALL') {
              moveX = primaryX;
            } else if (primaryY !== 0 && room.layout[prev.aoOniPos.y + primaryY][prev.aoOniPos.x].type !== 'WALL') {
              moveY = primaryY;
            }
          } else {
            if (primaryY !== 0 && room.layout[prev.aoOniPos.y + primaryY][prev.aoOniPos.x].type !== 'WALL') {
              moveY = primaryY;
            } else if (primaryX !== 0 && room.layout[prev.aoOniPos.y][prev.aoOniPos.x + primaryX].type !== 'WALL') {
              moveX = primaryX;
            }
          }

          const nextX = prev.aoOniPos.x + moveX;
          const nextY = prev.aoOniPos.y + moveY;

          // Check for collision with player
          if (nextX === prev.playerPos.x && nextY === prev.playerPos.y) {
            return { ...prev, status: 'GAME_OVER', message: '青鬼に捕まった...' };
          }

          return {
            ...prev,
            aoOniPos: { x: nextX, y: nextY }
          };
        });
      }, 400); 
      return () => clearInterval(interval);
    }
  }, [state.status, state.moveCount, state.aoOniPos]);

  // Ao Oni cabinet inspect & leaving logic
  useEffect(() => {
    if (state.status === 'HIDDEN' && state.aoOniPos) {
      // 5% chance of cabinet discovery (fatal ending)
      const isFatal = Math.random() < 0.05;

      if (isFatal) {
        // Cabinet doors get violently burst open after 1.8s!
        const timeout = setTimeout(() => {
          triggerScare();
          setState(prev => ({
            ...prev,
            status: 'GAME_OVER',
            oniSpeech: 'みーつけた……',
            message: `！？ 最悪の事態だ！${getOniName(prev.oniType || 'NORMAL')}にタンスの隠れ場所を見破られ、扉をバチリと開けられて捕まってしまった！！！`
          }));
        }, 1800);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setState(prev => ({
            ...prev,
            aoOniPos: null,
            status: 'PLAYING',
            oniSpeech: '',
            message: '息を潜めていると、やがてドアの向こう側の足音が遠のいていった……。'
          }));
        }, 3500);
        return () => clearTimeout(timeout);
      }
    }
  }, [state.status, state.aoOniPos, triggerScare]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w': movePlayer(0, -1); break;
        case 'ArrowDown':
        case 's': movePlayer(0, 1); break;
        case 'ArrowLeft':
        case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight':
        case 'd': movePlayer(1, 0); break;
        case ' ': // Interaction if needed, but movement handles it mostly
          if (state.status === 'START') setState(prev => ({ ...prev, status: 'PLAYING' }));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, state.status]);

  if (state.status === 'START') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-serif overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-4xl px-6 relative z-20"
        >
          <div className="relative inline-block select-none">
             <h1 className="text-8xl font-bold tracking-tighter text-blue-950 opacity-40 absolute -top-4 -left-4 blur-xl">青鬼</h1>
             <h1 className="text-8xl font-extrabold tracking-tighter text-white relative z-10 select-none">AO ONI</h1>
             <div className="flex justify-center mt-2 space-x-1">
                {[...Array(5)].map((_, i) => <div key={i} className="w-12 h-1 bg-blue-900/50" />)}
             </div>
          </div>
          
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
            不気味な噂の絶えない、郊外に建つ謎の洋館。<br/>
            脱出を目指すひろしを、不気味なブルーベリー色の影が追う。
          </p>

          <div className="text-slate-200 text-sm font-semibold tracking-wider uppercase mt-4">探索シナリオを選択してください</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
            
            {/* CLASSIC MODE CARD */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartGame('CLASSIC')}
              className="flex flex-col items-start text-left p-6 bg-slate-900/60 border-2 border-indigo-900 hover:border-blue-500 rounded-xl cursor-pointer transition-colors duration-300 relative overflow-hidden group shadow-[0_4px_20px_rgba(30,27,75,0.4)]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-300" />
              <div className="flex items-center gap-2 mb-2 font-bold text-lg text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                本館攻略シナリオ
              </div>
              <p className="text-slate-400 text-xs leading-relaxed flex-1">
                原作の攻略フロー「本館1階〜2階」を再現した本格謎解きモード。リビングの綺麗な皿、客室の重い椅子の謎、図書室の机の秘密の連鎖を解き、＋ドライバーを手に入れて洋館から脱出せよ！
              </p>
              <span className="mt-4 px-3 py-1 bg-indigo-950 text-indigo-300 text-[10px] font-mono rounded">
                難易度: NORMAL / ストーリー
              </span>
            </motion.div>

            {/* RANDOM MODE CARD */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartGame('RANDOM')}
              className="flex flex-col items-start text-left p-6 bg-slate-900/60 border-2 border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer transition-colors duration-300 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-all duration-300" />
              <div className="flex items-center gap-2 mb-2 font-bold text-lg text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                ランダム別館脱出
              </div>
              <p className="text-slate-400 text-xs leading-relaxed flex-1">
                別館の部屋の配置、出口や鍵の隠し場所が新しく生成されるサバイバル。銀の鍵を探し出し、最速で脱出を目指すハイスピードゲーム。
              </p>
              <span className="mt-4 px-3 py-1 bg-slate-950 text-emerald-400 text-[10px] font-mono rounded">
                難易度: HARD / パターン
              </span>
            </motion.div>

          </div>

          <div className="flex justify-center gap-6 text-slate-600 text-xs font-mono pt-4 select-none">
            <span className="flex items-center gap-1"><Info size={12} /> WASDで移動</span>
            <span className="flex items-center gap-1"><Info size={12} /> タンスに隠れる（隣接して移動）</span>
          </div>
        </motion.div>
        
        {/* Ambient background shadow */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.92)_100%)] z-10" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden select-none">
      <div className={`flex-1 flex flex-col items-center justify-center p-8 relative ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* Flash Effect */}
        <AnimatePresence>
          {isShaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[150] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Game Container */}
        <div 
          className="relative rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900" 
          style={{ width: GRID_WIDTH * TILE_SIZE, height: GRID_HEIGHT * TILE_SIZE }}
          id="game-viewport"
        >
          {/* Room Rendering with Dark Circle Light Field */}
          <div className="grid grid-cols-12 w-full h-full">
            {getRoom(state.currentRoom).layout.map((row, y) => 
               row.map((tile, x) => {
                 const isDarkRoom = (state.currentRoom === 'mansion_1f_hidden_room' && !state.eventFlags?.hiddenLit) ||
                                    (state.currentRoom === 'mansion_bf_jail' && !state.eventFlags?.jailLit);
                 const dist = Math.abs(x - state.playerPos.x) + Math.abs(y - state.playerPos.y);
                 const isVisible = !isDarkRoom || dist <= 1;
                 return (
                   <div 
                     key={`${x}-${y}`}
                     className={`transition-all duration-300 ${!isVisible ? 'brightness-5 grayscale opacity-10 pointer-events-none' : ''}`}
                   >
                     <Tile type={tile.type} />
                   </div>
                 );
               })
            )}
          </div>

          {/* Character Layer */}
          <div className="absolute inset-0 pointer-events-none">
              {/* Player */}
              <motion.div
                animate={{ 
                    x: state.playerPos.x * TILE_SIZE + (TILE_SIZE - 40) / 2, 
                    y: state.playerPos.y * TILE_SIZE + (TILE_SIZE - 40) / 2 
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="absolute z-20"
              >
                <Character type="PLAYER" isHiding={state.status === 'HIDDEN'} />
              </motion.div>

              {/* Ao Oni */}
              {state.aoOniPos && (
                <motion.div
                  animate={{ 
                      x: state.aoOniPos.x * TILE_SIZE + (TILE_SIZE - 40) / 2, 
                      y: state.aoOniPos.y * TILE_SIZE + (TILE_SIZE - 40) / 2 
                  }}
                  transition={{ type: 'tween', duration: 0.5 }}
                  className="absolute z-30"
                >
                  <Character 
                    type="AO_ONI" 
                    isActive={state.status === 'CHASE'} 
                    oniType={state.oniType || 'NORMAL'} 
                    speech={state.oniSpeech} 
                  />
                </motion.div>
              )}
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-40" />

          {/* Safe Passcode Input Overlay Portal */}
          <AnimatePresence>
            {activeSafe && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-[110] p-4 pointer-events-auto"
              >
                 <div className="bg-slate-900 border-[3px] border-indigo-900 rounded-2xl p-5 w-60 shadow-[0_0_35px_rgba(30,27,75,0.8)] text-center text-white space-y-3">
                    <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase">{activeSafe.title || 'SECURITY LOCK'}</div>
                    <div className="bg-black/80 p-3 rounded-lg border border-indigo-950 font-mono text-3xl tracking-widest text-emerald-400 h-14 flex items-center justify-center shadow-inner">
                      {safeInputCode || '----'}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button 
                          key={num} 
                          onClick={() => {
                            if (safeInputCode.length < 4) setSafeInputCode(p => p + num);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 active:bg-slate-950 py-1 text-lg font-bold rounded border border-slate-700 transition-colors cursor-pointer select-none"
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={() => setSafeInputCode('')}
                        className="bg-red-950/40 text-red-500 hover:bg-red-900/50 py-1 text-xs font-bold rounded border border-red-950/70 transition-colors cursor-pointer select-none"
                      >
                        CLR
                      </button>
                      <button 
                        onClick={() => {
                          if (safeInputCode.length < 4) setSafeInputCode(p => p + '0');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 active:bg-slate-950 py-1 text-lg font-bold rounded border border-slate-700 transition-colors cursor-pointer select-none"
                      >
                        0
                      </button>
                      <button 
                        onClick={handleSubmitSafePin}
                        className="bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60 py-1 text-xs font-bold rounded border border-emerald-950 transition-colors cursor-pointer select-none animate-pulse"
                      >
                        OK
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveSafe(null);
                        setSafeInputCode('');
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-350 underline pt-1 cursor-pointer"
                    >
                      閉じる
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Transition Flash */}
          <AnimatePresence>
            {state.isLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-[100]"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Message Area */}
        <div className="mt-8 text-center max-w-lg">
           <p className="text-xl font-medium text-slate-400 italic">
             {state.message}
           </p>
        </div>

        {/* Ending Screen Overlays */}
        <AnimatePresence>
          {state.status === 'GAME_OVER' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center z-[200] text-center p-8"
            >
              <Skull className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" size={80} />
              <h2 className="text-6xl font-bold text-white mb-4 tracking-tighter">GAME OVER</h2>
              <p className="text-red-200 text-xl mb-12 max-w-md">あなたは青鬼に連れ去られた...</p>
              <button 
                onClick={() => setState(INITIAL_STATE)}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-red-200 transition-colors"
              >
                <RefreshCcw size={20} />
                もう一度挑戦する
              </button>
            </motion.div>
          )}

          {state.status === 'WIN' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-blue-950/90 backdrop-blur-md flex flex-col items-center justify-center z-[200] text-center p-8"
            >
              <Home className="text-blue-400 mb-6" size={80} />
              <h2 className="text-6xl font-bold text-white mb-4 tracking-tighter">ESCAPE SUCCESS</h2>
              <p className="text-blue-200 text-xl mb-12 max-w-md">あなたは洋館から生還した！</p>
              <button 
                onClick={() => setState(INITIAL_STATE)}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-blue-200 transition-colors"
              >
                <RefreshCcw size={20} />
                最初からプレイする
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Walkthrough Specification Guide Overlay Modal */}
        <WalkthroughModal isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} state={state} />
      </div>

      {/* Side HUD */}
      <HUD state={state} onSave={saveGame} onLoad={loadGame} onToggleWalkthrough={() => setShowWalkthrough(p => !p)} roomName={rooms[state.currentRoom]?.name} />
      
      {/* Global CSS for some effects */}
      <style>{`
        @keyframes jitter {
          0% { transform: translate(0,0); }
          25% { transform: translate(1px,-1px); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, 1px); }
          100% { transform: translate(0,0); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, -2px); }
          20%, 40%, 60%, 80% { transform: translate(4px, 2px); }
        }
        .animate-jitter {
          animation: jitter 0.1s infinite;
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
