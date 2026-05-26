import React from 'react';
import { TileType } from '../types';
import { Box, Key, DoorClosed, Lock, UserRound, GraduationCap, Ghost, DoorOpen, ArrowUpSquare, ArrowDownSquare, Utensils, Armchair, BookOpen, Bath, FolderOpen, Bed, Music, Shield, Eye, Flame, LockOpen, Smile } from 'lucide-react';

interface TileProps {
  type: TileType;
  isHighlighted?: boolean;
}

export const Tile: React.FC<TileProps> = ({ type, isHighlighted }) => {
  const baseClasses = "w-full h-full flex items-center justify-center transition-colors duration-200 relative";
  
  const getStyle = () => {
    switch (type) {
      case 'WALL':
        return "bg-slate-800 border-slate-700 border-2";
      case 'FLOOR':
        return "bg-slate-900/50 border border-slate-800/30";
      case 'DOOR':
        return "bg-amber-900/40 border-2 border-amber-800";
      case 'WARDROBE':
        return "bg-emerald-950 border-2 border-emerald-900";
      case 'KEY':
        return "bg-slate-900/50";
      case 'PUZZLE':
        return "bg-slate-900/50";
      case 'EXIT':
        return "bg-indigo-950 border-2 border-indigo-900 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]";
      case 'STAIRS_UP':
      case 'STAIRS_DOWN':
        return "bg-slate-700 border-2 border-slate-600";
      case 'PLATE':
        return "bg-amber-950/40 border border-amber-900/30";
      case 'CHAIR':
        return "bg-slate-800/80 border border-slate-700";
      case 'DESK':
        return "bg-amber-950/60 border-2 border-amber-900";
      case 'BATHTUB':
        return "bg-sky-950 border-2 border-sky-900 shadow-[inset_px_4px_12px_rgba(14,165,233,0.15)]";
      case 'SHELF':
        return "bg-stone-800 border border-stone-700";
      case 'BED':
        return "bg-indigo-950/60 border-t-4 border-indigo-900";
      case 'PIANO':
        return "bg-stone-900 border-2 border-slate-700 shadow-md";
      case 'SAFE':
        return "bg-amber-900/30 border-2 border-amber-700";
      case 'WALL_SECRET':
        return "bg-stone-700/80 border-2 border-stone-600 shadow-[inset_0_0_10px_black]";
      case 'CANDLE':
        return "bg-orange-950/40 border border-orange-900/30";
      case 'JAIL':
        return "bg-slate-950 border-x-4 border-slate-800";
      case 'NPC':
        return "bg-slate-900 border-2 border-indigo-900";
      case 'COLUMN':
        return "bg-gradient-to-b from-stone-600 to-stone-850 border-x-4 border-t-2 border-b-4 border-stone-900 shadow-lg relative";
      case 'HOLE':
        return "bg-black border-2 border-slate-950 shadow-[inset_0_0_15px_black] flex items-center justify-center";
      default:
        return "bg-slate-900";
    }
  };

  return (
    <div className={`${baseClasses} ${getStyle()} ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`} id={`tile-${type.toLowerCase()}`}>
      {type === 'WARDROBE' && <Box className="text-emerald-500 opacity-60" size={24} />}
      {type === 'KEY' && <Key className="text-yellow-500 animate-bounce" size={24} />}
      {type === 'DOOR' && <DoorClosed className="text-amber-500" size={24} />}
      {type === 'PUZZLE' && <Lock className="text-slate-500" size={24} />}
      {type === 'EXIT' && <DoorOpen className="text-indigo-400 font-bold" size={24} />}
      {type === 'STAIRS_UP' && <ArrowUpSquare className="text-slate-400" size={24} />}
      {type === 'STAIRS_DOWN' && <ArrowDownSquare className="text-slate-400" size={24} />}
      {type === 'PLATE' && <Utensils className="text-amber-300 opacity-80" size={20} />}
      {type === 'CHAIR' && <Armchair className="text-amber-400 opacity-80" size={20} />}
      {type === 'DESK' && <BookOpen className="text-stone-300 opacity-90" size={20} />}
      {type === 'BATHTUB' && <Bath className="text-sky-300" size={22} />}
      {type === 'SHELF' && <FolderOpen className="text-amber-600 opacity-70" size={20} />}
      {type === 'BED' && <Bed className="text-cyan-500 opacity-80" size={22} />}
      {type === 'PIANO' && <Music className="text-amber-200 opacity-90 animate-pulse" size={20} />}
      {type === 'SAFE' && <Shield className="text-amber-500" size={20} />}
      {type === 'WALL_SECRET' && <Eye className="text-orange-400 opacity-70 animate-pulse" size={20} />}
      {type === 'CANDLE' && <Flame className="text-red-500 animate-bounce" size={20} />}
      {type === 'JAIL' && <LockOpen className="text-slate-400" size={20} />}
      {type === 'NPC' && <Smile className="text-indigo-400" size={22} />}
      {type === 'COLUMN' && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-stone-700/50 border-x border-stone-850 flex flex-col justify-around py-1">
          <div className="h-0.5 w-full bg-stone-900/30" />
          <div className="h-0.5 w-full bg-stone-900/30" />
          <div className="h-0.5 w-full bg-stone-900/30" />
        </div>
      )}
      {type === 'HOLE' && (
        <div className="w-9 h-9 rounded-full bg-neutral-980 border border-red-950/50 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_12px_rgba(0,0,0,1)]">
          <div className="absolute inset-0.5 rounded-full bg-gradient-radial from-transparent to-red-950/20" />
          <div className="w-4 h-4 rounded-full bg-black opacity-80 border border-neutral-900" />
        </div>
      )}
      
      {/* Texture noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
    </div>
  );
};
