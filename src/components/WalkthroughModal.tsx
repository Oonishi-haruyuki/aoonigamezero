import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ListTodo, Wrench, Cpu, CheckCircle2, Circle, Key, ToggleLeft, HelpCircle } from 'lucide-react';
import { GameState } from '../types';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose, state }) => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'synthesis' | 'flags'>('walkthrough');

  // Verify custom triggers/progress points based on current player state
  const hasItem = (name: string) => state.inventory.some(i => i.includes(name));
  
  // Real-time checkpoints based on player's session state
  const checkpoints = [
    {
      id: 1,
      label: 'リビングで皿の破片を入手する',
      description: 'リビングの食器棚から「皿」を手に入れ、叩き割って「皿の破片」を入手します。',
      isCompleted: hasItem('皿の破片') || hasItem('畳壁を破った') || state.eventFlags?.畳壁を破った === true || state.eventFlags?.['mansion_1f_entrance_safe_unlocked'] === true,
    },
    {
      id: 2,
      label: '洗面所で洗剤を入手する',
      description: '洗面所の棚を調べると「洗剤」が手に入ります。',
      isCompleted: hasItem('洗剤'),
    },
    {
      id: 3,
      label: '2F寝室で図書室の鍵を入手する',
      description: '2F西寝室の「重い車輪付き椅子」を南に引きずり、畳の隙間を調べます。',
      isCompleted: hasItem('図書室の鍵') || state.eventFlags?.図書室開錠 === true,
    },
    {
      id: 4,
      label: '3F寝室のベッドを動かして抜け道を開ける',
      description: '3F寝室の重いベッドを左に押しやり、2Fピアノ室直結の抜け穴階段を露出させます。',
      isCompleted: state.eventFlags?.bedMoved === true,
    },
    {
      id: 5,
      label: '洗面所の浴槽から「＋ドライバー」を回収する',
      description: '洗面所の浴槽の栓を抜いて水を出し、「＋ドライバー」を獲得します。',
      isCompleted: hasItem('＋ドライバー') || hasItem('精密ドライバー'),
    },
    {
      id: 6,
      label: '3F最奥客室で「ドアノブ」を回収する',
      description: '＋ドライバーを所持して3F客室奥の固定扉にインタラクトし、ドアノブを外して入手します。',
      isCompleted: hasItem('ドアノブ') || state.eventFlags?.['mansion_1f_hidden_room_unlocked'] === true,
    },
    {
      id: 7,
      label: '洗剤付ハンカチの作成 ＆ ピアノ室パズルの解鍵',
      description: '図書室の本棚奥で「ハンカチ」を入手すると血が拭き取れます。ピアノを拭き、ダイヤル金庫に「1416」を入力します。',
      isCompleted: state.eventFlags?.pianoCleaned === true || hasItem('子供部屋の鍵') || state.eventFlags?.['mansion_2f_piano_room_safe_unlocked'] === true,
    },
    {
      id: 8,
      label: '燃料入りライターの作成 ＆ 暗闇の点灯',
      description: '2F子供部屋で「ライターオイル」と「ライター」を揃えて入手し自動合成。1F隠し部屋のろうそくに点火します。',
      isCompleted: state.eventFlags?.hiddenLit === true,
    },
    {
      id: 9,
      label: '精密ドライバーの完成 ＆ 地下金庫開錠',
      description: '地下物置で芯を獲得。２つを合体させて精密ドライバーにし、地下金庫に「5376」を打ち込み別館の鍵を入手します。',
      isCompleted: hasItem('別館の鍵'),
    },
    {
      id: 10,
      label: 'エントランスから外へ脱出する',
      description: '手に入れた「別館の鍵」を使用し、エントランスの大扉を開錠。外の森へと生還します！',
      isCompleted: state.status === 'WIN',
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4 text-white"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-slate-900 border-[2px] border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto flex flex-col relative shadow-[0_0_50px_rgba(30,27,75,0.6)]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-slate-850 hover:bg-slate-800 duration-200 p-2 rounded-full border border-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 bg-indigo-950/80 rounded-xl border border-indigo-900 text-indigo-400">
                <BookOpen size={24} />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  洋館攻略仕様書（In-Game Specs & Guide）
                </h2>
                <p className="text-xs text-slate-400">システム状態連動型・完全脱出コード設計検証パネル</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 mb-6 gap-2">
              <button
                onClick={() => setActiveTab('walkthrough')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-[2px] transition-all ${
                  activeTab === 'walkthrough' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ListTodo size={14} />
                脱出ルート進行状況
              </button>
              <button
                onClick={() => setActiveTab('synthesis')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-[2px] transition-all ${
                  activeTab === 'synthesis' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Wrench size={14} />
                合成・パズル数理仕様
              </button>
              <button
                onClick={() => setActiveTab('flags')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-[2px] transition-all ${
                  activeTab === 'flags' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Cpu size={14} />
                ライブ内部検証フラグ
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {activeTab === 'walkthrough' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-xs text-slate-300 leading-relaxed">
                    <strong>💡 攻略の手引き:</strong> 洋館から出るための手順を10ステップでまとめています。あなたのプレイヤーイベント・インベントリと同期して自動的にチェックマーク「✓」が切り替わります。
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {checkpoints.map(cp => (
                      <div 
                        key={cp.id}
                        className={`p-4 rounded-xl border transition-all ${
                          cp.isCompleted 
                            ? 'bg-emerald-950/10 border-emerald-900/60 text-slate-200' 
                            : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="pt-0.5">
                            {cp.isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-400" />
                            ) : (
                              <Circle size={18} className="text-slate-600 animate-pulse" />
                            )}
                          </span>
                          <div className="space-y-1">
                            <h4 className={`text-sm font-bold ${cp.isCompleted ? 'text-emerald-300' : 'text-slate-300'}`}>
                              ステップ {cp.id}: {cp.label}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {cp.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'synthesis' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item 1 */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-bold text-indigo-400 tracking-wider font-mono">RECIPE 01</div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Wrench size={14} />
                        洗剤の付いたハンカチ
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        浴室から手に入れる<strong>「洗剤」</strong>と、鍵のかかった書庫(図書室)から手に入れた<strong>「ハンカチ」</strong>が手荷物にて出会うと自動合成されます。ピアノの盤面血をふき取る唯一の手段です。
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-bold text-indigo-400 tracking-wider font-mono">RECIPE 02</div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Wrench size={14} />
                        ライター（燃料入り）
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        子供部屋高所の高い棚から入手した<strong>「ライターオイル」</strong>、ならびに避難している部屋の暖炉付近などから見つけた<strong>「ライター」</strong>が自動合成します。暗黒空間に明かり（CANDLE）を吹き込みます。
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-bold text-indigo-400 tracking-wider font-mono">RECIPE 03</div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Wrench size={14} />
                        精密ドライバー
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        元々所持、または浴槽から得た<strong>「＋ドライバー」</strong>と、地下の奥まったガラクタ部屋（左物置）から回収した細長い<strong>「－ドライバーの芯」</strong>を合体させ、ネジ蓋を取り外せる極小ネジ回転工具にします。
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <HelpCircle size={16} />
                      金庫・ダイヤル解読システム数理（Cipher Logics）
                    </h4>
                    <div className="space-y-2 text-xs leading-relaxed text-slate-400">
                      <div>
                        <strong>1. ピアノ室金庫パズル (計算式: 暗記数値との反転対比)</strong>
                        <p className="pl-3 mt-1 text-[11px]">
                          ピアノの血文字をハンカチで拭うと暗号<strong>「９４１」</strong>が目に入ります。「電卓の盤面対角キーを反転したもの」を当てはめるため、<strong>「1416」</strong>が合格コードになります。(9の対抗=1、4の対向=4、1の対向=6)
                        </p>
                      </div>
                      <div className="h-[1px] bg-slate-900 my-2" />
                      <div>
                        <strong>2. 地下牢壁面の青い血文字 (Jail 暗証番号)</strong>
                        <p className="pl-3 mt-1 text-[11px]">
                          点火用ライターを燃料化させ、地下牢(Jail)へと潜ります。右上のろうそくに点火すると、鉄格子奥のコンクリート壁に血で殴り書きされたダイレクトナンバー<strong>「５３７６」</strong>が浮かび上がり、右金庫室のロックを解除できます。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'flags' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5 font-mono mb-2">
                      System Event Variables (EventFlags Logger)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {/* Event flag checklist */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">c_mode (クラシックゲーム)</span>
                        <span className="font-semibold text-emerald-400 uppercase">Classic [ACTIVE]</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">mikaScream (美香の叫び声)</span>
                        <span className={state.eventFlags?.mikaScream ? "text-emerald-400" : "text-amber-500/80"}>
                          {state.eventFlags?.mikaScream ? "■ TRUE (叫び検知済)" : "□ FALSE (未踏)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">mikaChase (青鬼襲来イベント)</span>
                        <span className={state.eventFlags?.mikaChase ? "text-emerald-400" : "text-amber-500/80"}>
                          {state.eventFlags?.mikaChase ? "■ TRUE (襲来トリガー)" : "□ FALSE (通常)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">bedMoved (ベッド転位)</span>
                        <span className={state.eventFlags?.bedMoved ? "text-emerald-400" : "text-amber-500/80"}>
                          {state.eventFlags?.bedMoved ? "■ TRUE (1F-2F穴開通)" : "□ FALSE (閉鎖中)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">hiddenLit (本館裏廊下ライター常点灯)</span>
                        <span className={state.eventFlags?.hiddenLit ? "text-emerald-400" : "text-amber-500/80"}>
                          {state.eventFlags?.hiddenLit ? "■ TRUE (点灯済)" : "□ FALSE (暗闇状態)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-slate-400">jailLit (地下牢獄ライター点灯)</span>
                        <span className={state.eventFlags?.jailLit ? "text-emerald-400" : "text-amber-500/80"}>
                          {state.eventFlags?.jailLit ? "■ TRUE (点灯済)" : "□ FALSE (暗闇状態)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-950/10 border border-indigo-900/40 rounded-xl space-y-3">
                    <h5 className="text-sm font-bold text-indigo-300">🎮 ゲームプレイ診断 (Play Diagnostic)</h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      このパネルはゲームの進行に合わせて自動的に反応。謎解きが詰まった際、どのイベントが立っているか（`eventFlags`）と、手持ち在庫（`inventory`）を対比させることで、次のステップが手にとるように分かるよう、すべてTypeScript型のリアクティブフローで結線されています。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>DESIGN BUILD: S-LEVEL VERIFIED</span>
              <span>洋館を脱出して生還せよ。</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
