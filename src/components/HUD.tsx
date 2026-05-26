import React from 'react';
import { Package, Ghost as GhostIcon, Map as MapIcon, Key, Save, Download, BookOpen } from 'lucide-react';
import { GameState } from '../types';

interface HUDProps {
  state: GameState;
  onSave: () => void;
  onLoad: () => void;
  onToggleWalkthrough: () => void;
  roomName?: string;
}

export const HUD: React.FC<HUDProps> = ({ state, onSave, onLoad, onToggleWalkthrough, roomName }) => {
  return (
    <div className="flex flex-col gap-4 w-64 p-4 bg-slate-950 border-l border-slate-800 h-full">
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">Location</h2>
        <div className="flex items-center gap-2 text-slate-200">
          <MapIcon size={16} />
          <span className="font-medium">{roomName || state.currentRoom}</span>
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <button 
          onClick={onToggleWalkthrough}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 hover:text-indigo-200 rounded border border-indigo-900/50 text-xs font-semibold tracking-wider transition-all shadow-[0_0_15px_rgba(30,27,75,0.3)] animate-pulse hover:animate-none"
        >
          <BookOpen size={14} />
          洋館攻略仕様書
        </button>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-900">
        <div className="space-y-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">Inventory</h2>
            <div className="flex flex-wrap gap-2">
                {state.inventory.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">空っぽ</span>
                ) : (
                    state.inventory.map((item, i) => (
                        <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-2">
                            <Key size={14} className="text-yellow-500" />
                            <span className="text-xs text-slate-300">{item}</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-900">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">Status</h2>
            <div className={`p-3 rounded-lg border flex items-center gap-3 transition-colors duration-500 ${
                state.status === 'CHASE' ? 'bg-red-950/20 border-red-900 text-red-500' : 
                state.status === 'HIDDEN' ? 'bg-blue-950/20 border-blue-900 text-blue-500' :
                'bg-slate-900/20 border-slate-800 text-slate-400'
            }`}>
                {state.status === 'CHASE' && <GhostIcon className="animate-pulse" />}
                <span className="text-sm font-bold tracking-wider">
                    {state.status === 'CHASE' ? '逃げろ！' : 
                     state.status === 'HIDDEN' ? '隠れている...' : 
                     '探索中'}
                </span>
            </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-900">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">System</h2>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onSave}
            disabled={state.status === 'GAME_OVER' || state.status === 'WIN' || state.status === 'START'}
            className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded border border-slate-800 text-[10px] text-slate-300 transition-colors"
          >
            <Save size={12} />
            保存
          </button>
          <button 
            onClick={onLoad}
            className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-[10px] text-slate-300 transition-colors"
          >
            <Download size={12} />
            読込
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
          {state.message}
        </p>
      </div>
    </div>
  );
};
