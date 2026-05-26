import React from 'react';
import { motion } from 'motion/react';

interface CharacterProps {
  type: 'PLAYER' | 'AO_ONI';
  isHiding?: boolean;
  isActive?: boolean;
  oniType?: 'NORMAL' | 'FUWATTY' | 'BLOCK' | 'GIANT';
  speech?: string;
  humanType?: 'HIROSHI' | 'TAKURO' | 'TAKESHI' | 'MIKA';
}

export const Character: React.FC<CharacterProps> = ({ type, isHiding, isActive, oniType = 'NORMAL', speech, humanType }) => {
  if (isHiding && type === 'PLAYER') return null;

  const isPlayer = type === 'PLAYER';

  if (!isPlayer) {
    // Eerily shake or bounce more depending on the variant type
    const bounceY = oniType === 'FUWATTY' ? [0, -1, 0, 1, 0] : [0, -2, 0];
    const bounceScale = oniType === 'BLOCK' ? [1, 1.08, 0.95, 1.02, 1] : [1, 1.02, 1];
    const animDuration = oniType === 'FUWATTY' ? 0.2 : (oniType === 'GIANT' ? 0.6 : 0.4);

    return (
      <motion.div
        layoutId={type}
        className={`relative flex flex-col items-center justify-center ${isActive ? 'animate-jitter' : ''}`}
        style={{ width: 44, height: 50 }}
        animate={{
          y: bounceY,
          scale: bounceScale,
        }}
        transition={{
          duration: animDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Creepy Periodical Speech Bubble */}
        {speech && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-red-500 border border-red-900/80 px-2 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.5)] whitespace-nowrap z-[120] animate-bounce">
            {speech}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-950 border-r border-b border-red-900/80 rotate-45" />
          </div>
        )}

        {/* VARIANT 1: NORMAL BLUEBERRY ONI */}
        {oniType === 'NORMAL' && (
          <>
            {/* Huge Head (Blueberry color) */}
            <div className="w-11 h-12 bg-indigo-700 rounded-[45%_45%_35%_35%] border-2 border-indigo-900 relative z-20 overflow-hidden shadow-2xl">
              {/* Asymmetrical Creepy Eyes */}
              <div className="absolute top-3 left-0 w-full flex justify-around items-center px-1">
                {/* Left Eye: Bulging */}
                <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-500 relative flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-white/60 rounded-full blur-[1px]" />
                   <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full scale-110" />
                </div>
                {/* Right Eye: Smaller, different shape */}
                <div className="w-2.5 h-3 bg-black rounded-[40%_60%_50%_50%] border border-slate-600 relative mt-1">
                   <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Nose - slightly hooked */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-3.5 bg-indigo-900/40 rounded-[30%_30%_50%_50%] border-b border-indigo-950/20" />
              
              {/* Mouth with Fangs detail */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/60 rounded-full flex justify-around items-start pt-0.5 px-1 overflow-hidden">
                 <div className="w-1 h-2 bg-white/80 clip-path-triangle rotate-12" />
                 <div className="w-1 h-1.5 bg-white/80 clip-path-triangle -rotate-12 mt-0.5" />
                 <div className="w-1 h-2 bg-white/80 clip-path-triangle" />
              </div>
              
              {/* Skin texture/shading */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
            
            {/* Tiny Purple Body - emphasizing the giant head ratio */}
            <div className="w-5 h-5 bg-indigo-800 rounded-b-lg border-x-2 border-b-2 border-indigo-950 -mt-2.5 z-10 relative">
               {/* Tiny Arms */}
               <div className="absolute top-1 -left-2 w-2 h-3 bg-indigo-800 rounded-full -rotate-45 border border-indigo-950" />
               <div className="absolute top-1 -right-2 w-2 h-3 bg-indigo-800 rounded-full rotate-45 border border-indigo-950" />
            </div>
          </>
        )}

        {/* VARIANT 2: FUWATTY (フワッティー) - Flat blocky sliding horror */}
        {oniType === 'FUWATTY' && (
          <div className="w-12 h-12 bg-indigo-600 rounded-xl border-[3px] border-indigo-900 relative z-20 overflow-hidden shadow-2xl flex flex-col justify-between p-1">
            {/* Staring red/yellow maddening eyes */}
            <div className="flex justify-between items-center px-1 mt-1.5">
              <div className="w-3.5 h-3.5 bg-red-650 rounded-full border border-black flex items-center justify-center animate-ping duration-1000">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </div>
              <div className="w-3.5 h-3.5 bg-red-650 rounded-full border border-black flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </div>
            </div>

            {/* Jagged creepy teeth mouth */}
            <div className="w-10 h-4 bg-black/90 rounded-md border border-neutral-900/60 flex items-center justify-around overflow-hidden mb-1">
              <div className="w-1.5 h-2.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-2 bg-white rounded-b-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-b-sm" />
              <div className="w-1.5 h-2.5 bg-white rounded-b-sm" />
            </div>
          </div>
        )}

        {/* VARIANT 3: BLOCK (スクワット鬼) - Muscular Oni executing high-intensity squats */}
        {oniType === 'BLOCK' && (
          <>
            {/* Head with thick flexing eyebrows */}
            <div className="w-10 h-10 bg-indigo-800 rounded-lg border-2 border-indigo-950 relative z-20 flex flex-col items-center">
              {/* Thick Unibrow Eyebrow */}
              <div className="w-8 h-1.5 bg-neutral-950 rounded mt-1.5" />
              {/* Angry slanted eyes */}
              <div className="flex justify-around w-full px-1.5 mt-0.5">
                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-600 rounded-full" />
                </div>
                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-600 rounded-full" />
                </div>
              </div>
              {/* Open roaring mouth */}
              <div className="w-4 h-2 bg-red-950 border border-neutral-900 rounded-b mt-1 flex items-center justify-center">
                <div className="w-1.5 h-1 bg-white" />
              </div>
            </div>

            {/* Buff Flexing Arms & Muscular broad body */}
            <div className="w-9 h-4 bg-indigo-900 border-x-2 border-b-2 border-indigo-950 rounded-b-md relative -mt-1.5 z-10 flex justify-between px-0.5">
              {/* Flexing massive biceps */}
              <div className="w-2.5 h-4 bg-indigo-750 border border-indigo-950 rounded-l animate-pulse flex-none -rotate-12 -ml-2" />
              <div className="w-2.5 h-4 bg-indigo-750 border border-indigo-950 rounded-r animate-pulse flex-none rotate-12 -mr-2" />
            </div>
          </>
        )}

        {/* VARIANT 4: GIANT (巨頭鬼) - Extremely oversized head, wobbling slowly */}
        {oniType === 'GIANT' && (
          <>
            {/* Hyper-Oversized Giant head */}
            <div className="w-13 h-13 bg-indigo-800 rounded-[50%_50%_40%_40%] border-[2.5px] border-indigo-950 relative z-20 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              {/* Eyes looking extremely low-spirited or sleepy */}
              <div className="absolute top-4 left-0 w-full flex justify-around px-2">
                <div className="w-4 h-2 bg-black rounded-t-full relative">
                  <div className="absolute bottom-0 left-1 w-1.5 h-1 bg-white rounded-full" />
                </div>
                <div className="w-4 h-2 bg-black rounded-t-full relative">
                  <div className="absolute bottom-0 right-1 w-1.5 h-1 bg-white rounded-full" />
                </div>
              </div>

              {/* Nose */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-900/50 rounded-full" />

              {/* Sad, closed flat mouth */}
              <div className="w-6 h-0.5 bg-neutral-950 absolute bottom-3.5 left-1/2 -translate-x-1/2" />
            </div>

            {/* Completely microscopic dwarf body */}
            <div className="w-3 h-3 bg-indigo-900 border border-indigo-950 rounded-b -mt-1 z-10" />
          </>
        )}
        
        {/* Shadow */}
        <div className="absolute -bottom-1 w-8 h-2 bg-black/40 rounded-full blur-sm -z-10" />
      </motion.div>
    );
  }

  // Determine skin details based on humanType
  const getHumanDetails = () => {
    switch (humanType) {
      case 'HIROSHI':
        return {
          name: 'ひろし',
          jacketColor: 'bg-blue-600 border-blue-400',
          hairColor: 'bg-stone-600',
          headStyle: 'rounded-t-lg',
          hairDetail: <div className="absolute -top-1 left-0 right-0 h-2 bg-stone-700 rounded-t-md" />
        };
      case 'TAKURO':
        return {
          name: 'たくろう',
          jacketColor: 'bg-emerald-600 border-emerald-400',
          hairColor: 'bg-amber-800',
          headStyle: 'rounded-t-xl',
          hairDetail: (
            <div className="absolute -top-1 left-0 right-0 h-2.5 flex justify-between">
              <div className="w-1.5 h-2 bg-amber-800 rounded-tl-md -rotate-12" />
              <div className="w-4 h-2 bg-amber-800 rounded-t-sm" />
              <div className="w-1.5 h-2 bg-amber-800 rounded-tr-md rotate-12" />
            </div>
          )
        };
      case 'TAKESHI':
        return {
          name: 'たけし',
          jacketColor: 'bg-cyan-600 border-cyan-400',
          hairColor: 'bg-yellow-600',
          headStyle: 'rounded-t-[40%_40%_0_0]',
          hairDetail: <div className="absolute -top-1 left-1 right-1 h-3 bg-yellow-500 rounded-tl-lg" />
        };
      case 'MIKA':
        return {
          name: 'みか',
          jacketColor: 'bg-rose-500 border-rose-300',
          hairColor: 'bg-amber-600',
          headStyle: 'rounded-t-2xl',
          hairDetail: (
            <>
              <div className="absolute -top-1.5 left-0.5 right-0.5 h-2 bg-amber-600 rounded-t-lg" />
              {/* Twin tails */}
              <div className="absolute -left-1 top-2 w-2 h-3.5 bg-amber-600 rounded-l-full border-l border-amber-800" />
              <div className="absolute -right-1 top-2 w-2 h-3.5 bg-amber-600 rounded-r-full border-r border-amber-800" />
            </>
          )
        };
      default:
        return {
          name: 'ひろし',
          jacketColor: 'bg-blue-600 border-blue-400',
          hairColor: 'bg-stone-600',
          headStyle: 'rounded-t-lg',
          hairDetail: <div className="absolute -top-1 left-0 right-0 h-2 bg-stone-700 rounded-t-md" />
        };
    }
  };

  const human = getHumanDetails();

  return (
    <motion.div
      layoutId={type}
      className={`relative flex items-center justify-center ${humanType === 'TAKESHI' ? 'animate-[shake_0.15s_infinite_alternate]' : ''}`}
      style={{ width: 40, height: 40 }}
      initial={false}
      animate={{
        scale: type === 'AO_ONI' ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: type === 'AO_ONI' ? Infinity : 0,
      }}
    >
      {/* Name tag */}
      <div className="absolute -top-4 px-1 rounded bg-slate-900/95 border border-slate-800 text-[8px] font-mono leading-none py-0.5 text-slate-350 shadow-md whitespace-nowrap z-30 select-none scale-90 pointer-events-none">
        {human.name}
      </div>

      {speech && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-blue-400 border border-blue-900/80 px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.3)] whitespace-nowrap z-[120] animate-bounce">
          {speech}
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-950 border-r border-b border-blue-900/80 rotate-45" />
        </div>
      )}

      {/* Body */}
      <div 
        className={`w-full h-full rounded-md shadow-lg border-2 flex flex-col justify-end relative overflow-hidden ${
          isPlayer ? human.jacketColor : 'bg-indigo-900 border-indigo-700'
        }`}
        id={isPlayer ? `${human.name}-body` : "ao-oni-body"}
      >
        {/* Head containing hair */}
        <div className={`absolute top-0 inset-x-0 h-5 bg-orange-100 ${human.headStyle}`}>
          {human.hairDetail}
          {/* Eyes inside head */}
          <div className="absolute top-2 w-full flex justify-around px-2">
            <div className={`w-1 h-1 rounded-full ${humanType === 'TAKESHI' ? 'bg-red-650' : 'bg-black'}`} />
            <div className={`w-1 h-1 rounded-full ${humanType === 'TAKESHI' ? 'bg-red-650' : 'bg-black'}`} />
          </div>
          {/* Mouth */}
          <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-neutral-900 ${
            humanType === 'TAKESHI' ? 'w-2 h-1 bg-neutral-950 border border-neutral-700/50' : 'w-1.5'
          }`} />
        </div>

        {/* Shirt Collar / Outerwear accent */}
        <div className="w-full h-4 relative flex justify-center">
          <div className="w-2 h-1 bg-orange-100 rounded-b-sm border-x border-slate-900/20" />
        </div>
      </div>
      
      {/* Shadow */}
      <div className="absolute -bottom-1 w-full h-2 bg-black/30 rounded-full blur-sm -z-10" />
    </motion.div>
  );
};
