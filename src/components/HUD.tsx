import React from 'react';
import { Package, Ghost as GhostIcon, Map as MapIcon, Key, Save, Download, BookOpen } from 'lucide-react';
import { GameState } from '../types';

interface HUDProps {
  state: GameState;
  onSave: () => void;
  onLoad: () => void;
  onToggleWalkthrough: () => void;
  roomName?: string;
  debugMode?: boolean;
  onToggleDebug?: () => void;
  onReturnToTitle?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onSave, onLoad, onToggleWalkthrough, roomName, debugMode = false, onToggleDebug, onReturnToTitle }) => {
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
        {state.gameMode === 'ONI_POV' ? (
          <>
            {/* Hunt Targets list inside ONI_POV */}
            <div className="space-y-1">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Hunt Targets</h2>
              <div className="flex flex-col gap-1.5 pt-1">
                {state.oniPovTargets?.map((t, idx) => (
                  <div key={idx} className={`p-1.5 rounded border text-xs flex items-center justify-between transition-colors ${
                    t.isCaught 
                      ? 'bg-purple-950/20 border-purple-900/40 text-purple-400 opacity-60 line-through' 
                      : t.isHiding 
                        ? 'bg-slate-900 border-slate-850 text-slate-500' 
                        : 'bg-rose-950/20 border-rose-900/30 text-rose-400 font-bold shadow-[0_0_10px_rgba(244,63,94,0.05)]'
                  }`}>
                    <span className="flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${t.isCaught ? 'bg-purple-500' : t.isHiding ? 'bg-slate-755 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
                      {t.name}
                    </span>
                    <span className="text-[9px] font-mono tracking-wide flex-shrink-0">
                      {t.isCaught ? '捕獲済' : t.isHiding ? 'クローゼット' : '逃走中'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spooky Timer Countdown */}
            <div className="space-y-1 pt-4 border-t border-slate-900">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-600 font-bold">Time Limit</h2>
              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center font-mono transition-colors duration-500 ${
                (state.oniPovTimeLeft || 0) <= 20 
                  ? 'bg-red-950/50 border-red-500 text-red-500 animate-pulse text-lg shadow-[0_0_15px_rgba(239,68,68,0.25)] font-bold' 
                  : 'bg-purple-950/30 border-purple-900/60 text-purple-400 text-lg font-bold'
              }`}>
                <span>{state.oniPovTimeLeft} sec left</span>
              </div>
            </div>

            {/* Hunt Action Logs */}
            <div className="space-y-1 pt-4 border-t border-slate-900 flex flex-col flex-1 min-h-[140px]">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold text-slate-400">ハントログ</h2>
              <div className="flex-1 bg-slate-950 border border-slate-900/60 rounded p-2 overflow-y-auto max-h-[160px] font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                {state.oniPovLogs && state.oniPovLogs.length > 0 ? (
                  [...state.oniPovLogs].reverse().map((log, idx) => (
                    <div key={idx} className="text-slate-300 leading-normal border-b border-slate-900/40 pb-1">
                      <span className="text-purple-400 mr-1 font-bold">▶</span> {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 italic">獲物の気配を探っています...</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Standard Inventory */}
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

            {/* Standard Status threat */}
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
          </>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-900">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">System</h2>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onSave}
            disabled={state.status === 'GAME_OVER' || state.status === 'WIN' || state.status === 'START' || state.gameMode === 'ONI_POV'}
            className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded border border-slate-800 text-[10px] text-slate-300 transition-colors"
            id="hud-save-btn"
          >
            <Save size={12} />
            保存
          </button>
          <button 
            onClick={onLoad}
            disabled={state.gameMode === 'ONI_POV'}
            className="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded border border-slate-800 text-[10px] text-slate-300 transition-colors"
            id="hud-load-btn"
          >
            <Download size={12} />
            読込
          </button>
        </div>
        {state.gameMode === 'ONI_POV' && onReturnToTitle && (
          <button 
            onClick={onReturnToTitle}
            className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900 hover:border-purple-500 text-[10px] font-bold text-purple-300 rounded transition-colors"
            id="hud-back-title-btn"
          >
            タイトルに戻る
          </button>
        )}
      </div>

      {onToggleDebug && (
        <div className="space-y-2 pt-4 border-t border-slate-900">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center justify-between">
            <span>Debug Options</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-500 border border-amber-900 animate-pulse">DEV</span>
          </h2>
          <button 
            onClick={onToggleDebug}
            className={`w-full flex items-center justify-between p-2 rounded border text-xs font-bold transition-all cursor-pointer ${
              debugMode
                ? 'bg-amber-950/40 border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-350 hover:border-slate-800'
            }`}
          >
            <span>最短パスの可視化</span>
            <span className="text-[10px] uppercase">{debugMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      )}

      <div className="mt-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
          {state.message}
        </p>
      </div>
    </div>
  );
};
